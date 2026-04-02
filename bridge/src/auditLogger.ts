import * as path from 'path';
import * as fsp from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { AuditEntry, Manager } from './types';
import { getDataDir, ensureDir, appendLine } from './persistence';

export type BroadcastFn = (type: string, payload: Record<string, unknown>) => void;

export class AuditLogger implements Manager {
  private auditDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.auditDir = path.join(getDataDir(), 'audit');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await ensureDir(this.auditDir);
    console.log('[audit] Audit logger initialized.');
  }

  private getLogPath(date?: string): string {
    const d = date || new Date().toISOString().split('T')[0];
    return path.join(this.auditDir, `audit-${d}.jsonl`);
  }

  /**
   * Log an audit entry. Appends to today's JSONL file.
   */
  async log(action: string, actor: string, target: string, details: string): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: uuidv4(),
      action,
      actor,
      target,
      details,
      timestamp: new Date().toISOString(),
    };

    const logPath = this.getLogPath();
    await appendLine(logPath, JSON.stringify(entry));

    if (this.broadcast) {
      this.broadcast('audit_entry', entry as unknown as Record<string, unknown>);
    }

    return entry;
  }

  /**
   * Query audit entries by date range, action type, and/or actor.
   */
  async query(params: {
    startDate?: string;
    endDate?: string;
    action?: string;
    actor?: string;
    limit?: number;
  }): Promise<AuditEntry[]> {
    const { startDate, endDate, action, actor, limit = 500 } = params;
    const results: AuditEntry[] = [];

    // Determine date range
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || end;

    // Generate list of dates to scan
    const dates: string[] = [];
    const current = new Date(start + 'T00:00:00Z');
    const endDt = new Date(end + 'T00:00:00Z');
    while (current <= endDt) {
      dates.push(current.toISOString().split('T')[0]);
      current.setUTCDate(current.getUTCDate() + 1);
    }

    for (const date of dates) {
      const logPath = this.getLogPath(date);
      try {
        const raw = await fsp.readFile(logPath, 'utf-8');
        const lines = raw.trim().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const entry = JSON.parse(line) as AuditEntry;
            if (action && entry.action !== action) continue;
            if (actor && entry.actor !== actor) continue;
            results.push(entry);
            if (results.length >= limit) return results;
          } catch {
            // skip malformed lines
          }
        }
      } catch {
        // file doesn't exist for this date
      }
    }

    return results;
  }

  async shutdown(): Promise<void> {
    console.log('[audit] Audit logger shut down.');
  }
}
