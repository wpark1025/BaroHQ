import * as path from 'path';
import * as fsp from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import {
  Approval,
  ApprovalStatus,
  ApprovalContext,
  ApprovalOption,
  PlatformConfig,
  Manager,
} from './types';
import {
  getDataDir,
  getConfigPath,
  readJson,
  writeJsonAtomic,
  ensureDir,
  listFiles,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class ApprovalManager implements Manager {
  private pendingDir: string;
  private resolvedDir: string;
  private broadcast: BroadcastFn | null = null;
  private escalationTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private escalationTimeoutMs = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    const dataDir = getDataDir();
    this.pendingDir = path.join(dataDir, 'approvals', 'pending');
    this.resolvedDir = path.join(dataDir, 'approvals', 'resolved');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await ensureDir(this.pendingDir);
    await ensureDir(this.resolvedDir);

    // Set up escalation timers for existing pending approvals
    const pendingFiles = await listFiles(this.pendingDir);
    for (const f of pendingFiles) {
      if (!f.endsWith('.json')) continue;
      const approval = await readJson<Approval>(path.join(this.pendingDir, f), null as unknown as Approval);
      if (approval && approval.status === ApprovalStatus.Pending) {
        this.scheduleEscalation(approval);
      }
    }

    console.log('[approvals] Approval manager initialized.');
  }

  /**
   * Schedule auto-escalation after 24h.
   */
  private scheduleEscalation(approval: Approval): void {
    const createdAt = new Date(approval.createdAt).getTime();
    const remaining = createdAt + this.escalationTimeoutMs - Date.now();

    if (remaining <= 0) {
      // Already expired
      this.escalate(approval.id).catch((err) =>
        console.error(`[approvals] Escalation error for ${approval.id}:`, err)
      );
      return;
    }

    const timer = setTimeout(() => {
      this.escalationTimers.delete(approval.id);
      this.escalate(approval.id).catch((err) =>
        console.error(`[approvals] Escalation error for ${approval.id}:`, err)
      );
    }, Math.min(remaining, 2147483647)); // Cap at max setTimeout value

    this.escalationTimers.set(approval.id, timer);
  }

  /**
   * Escalate an approval (mark as expired).
   */
  private async escalate(approvalId: string): Promise<void> {
    const filePath = path.join(this.pendingDir, `${approvalId}.json`);
    const approval = await readJson<Approval>(filePath, null as unknown as Approval);
    if (!approval || approval.status !== ApprovalStatus.Pending) return;

    approval.status = ApprovalStatus.Expired;
    approval.resolvedAt = new Date().toISOString();
    approval.escalatedAt = new Date().toISOString();
    approval.comment = 'Auto-escalated: approval timed out after 24h';

    // Move to resolved
    await writeJsonAtomic(path.join(this.resolvedDir, `${approvalId}.json`), approval);
    try {
      await fsp.unlink(filePath);
    } catch {
      // already moved
    }

    if (this.broadcast) {
      this.broadcast('approval_resolved', { approval, escalated: true });
    }

    console.log(`[approvals] Auto-escalated approval ${approvalId}`);
  }

  /**
   * Check if an action requires approval.
   */
  async requiresApproval(action: string): Promise<boolean> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    if (!config.approvals?.enabled) return false;
    return (config.approvals.protectedActions || []).includes(action);
  }

  /**
   * Create an approval request.
   */
  async createApproval(params: {
    action: string;
    description: string;
    requester: string;
    approver?: string;
    context: ApprovalContext;
    options?: ApprovalOption[];
  }): Promise<Approval> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    const now = new Date().toISOString();

    const approval: Approval = {
      id: uuidv4(),
      action: params.action,
      description: params.description,
      requester: params.requester,
      approver: params.approver || config.approvals?.defaultApprover || 'ceo',
      status: ApprovalStatus.Pending,
      context: params.context,
      options: params.options || [
        { label: 'Approve', value: 'approve' },
        { label: 'Reject', value: 'reject', destructive: true },
      ],
      createdAt: now,
      resolvedAt: '',
      resolvedBy: '',
      comment: '',
    };

    await writeJsonAtomic(path.join(this.pendingDir, `${approval.id}.json`), approval);
    this.scheduleEscalation(approval);

    if (this.broadcast) {
      this.broadcast('approval_created', { approval });
    }

    console.log(`[approvals] Created approval: ${approval.action} (${approval.id})`);
    return approval;
  }

  /**
   * Resolve an approval (approve/reject).
   */
  async resolveApproval(
    approvalId: string,
    resolution: 'approve' | 'reject',
    resolvedBy: string,
    comment?: string
  ): Promise<Approval | null> {
    const filePath = path.join(this.pendingDir, `${approvalId}.json`);
    const approval = await readJson<Approval>(filePath, null as unknown as Approval);
    if (!approval) return null;

    approval.status = resolution === 'approve' ? ApprovalStatus.Approved : ApprovalStatus.Rejected;
    approval.resolvedAt = new Date().toISOString();
    approval.resolvedBy = resolvedBy;
    approval.comment = comment || '';

    // Move to resolved
    await writeJsonAtomic(path.join(this.resolvedDir, `${approvalId}.json`), approval);
    try {
      await fsp.unlink(filePath);
    } catch {
      // already moved
    }

    // Cancel escalation timer
    const timer = this.escalationTimers.get(approvalId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(approvalId);
    }

    if (this.broadcast) {
      this.broadcast('approval_resolved', { approval });
    }

    console.log(`[approvals] Resolved approval ${approvalId}: ${resolution}`);
    return approval;
  }

  /**
   * Batch resolve multiple approvals.
   */
  async batchResolve(
    approvalIds: string[],
    resolution: 'approve' | 'reject',
    resolvedBy: string,
    comment?: string
  ): Promise<Approval[]> {
    const results: Approval[] = [];
    for (const id of approvalIds) {
      const result = await this.resolveApproval(id, resolution, resolvedBy, comment);
      if (result) results.push(result);
    }
    return results;
  }

  /**
   * Delegate an approval to another approver.
   */
  async delegateApproval(approvalId: string, newApprover: string): Promise<Approval | null> {
    const filePath = path.join(this.pendingDir, `${approvalId}.json`);
    const approval = await readJson<Approval>(filePath, null as unknown as Approval);
    if (!approval) return null;

    approval.delegatedTo = newApprover;
    approval.approver = newApprover;
    await writeJsonAtomic(filePath, approval);

    if (this.broadcast) {
      this.broadcast('approval_created', { approval, delegated: true });
    }

    return approval;
  }

  /**
   * List pending approvals.
   */
  async listPending(): Promise<Approval[]> {
    const files = await listFiles(this.pendingDir);
    const approvals: Approval[] = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const approval = await readJson<Approval>(path.join(this.pendingDir, f), null as unknown as Approval);
      if (approval) approvals.push(approval);
    }
    return approvals;
  }

  /**
   * List resolved approvals.
   */
  async listResolved(limit = 50): Promise<Approval[]> {
    const files = await listFiles(this.resolvedDir);
    const approvals: Approval[] = [];
    const jsonFiles = files.filter((f) => f.endsWith('.json')).slice(-limit);
    for (const f of jsonFiles) {
      const approval = await readJson<Approval>(path.join(this.resolvedDir, f), null as unknown as Approval);
      if (approval) approvals.push(approval);
    }
    return approvals;
  }

  async shutdown(): Promise<void> {
    for (const timer of this.escalationTimers.values()) {
      clearTimeout(timer);
    }
    this.escalationTimers.clear();
    console.log('[approvals] Approval manager shut down.');
  }
}
