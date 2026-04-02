import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  GovernanceRule,
  GovernanceHistoryEntry,
  Manager,
} from './types';
import {
  getGovernanceDir,
  readJson,
  writeJsonAtomic,
  ensureDir,
  listFiles,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class GovernanceManager implements Manager {
  private rulesDir: string;
  private historyDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    const govDir = getGovernanceDir();
    this.rulesDir = path.join(govDir, 'rules');
    this.historyDir = path.join(govDir, 'history');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await ensureDir(this.rulesDir);
    await ensureDir(this.historyDir);
    console.log('[governance] Governance manager initialized.');
  }

  private rulePath(ruleId: string): string {
    return path.join(this.rulesDir, `${ruleId}.json`);
  }

  /**
   * List all governance rules.
   */
  async listRules(): Promise<GovernanceRule[]> {
    const files = await listFiles(this.rulesDir);
    const rules: GovernanceRule[] = [];

    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const rule = await readJson<GovernanceRule>(
        path.join(this.rulesDir, f),
        null as unknown as GovernanceRule
      );
      if (rule) rules.push(rule);
    }

    return rules;
  }

  /**
   * Get a single rule by ID.
   */
  async getRule(id: string): Promise<GovernanceRule | null> {
    return readJson<GovernanceRule>(this.rulePath(id), null as unknown as GovernanceRule);
  }

  /**
   * Create a new governance rule.
   */
  async createRule(input: Partial<GovernanceRule>): Promise<GovernanceRule> {
    const now = new Date().toISOString();
    const id = input.id || input.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || uuidv4();

    const rule: GovernanceRule = {
      id,
      name: input.name || 'New Rule',
      category: input.category || 'custom',
      status: input.status || 'draft',
      enforcer: input.enforcer || '',
      enforcerName: input.enforcerName || '',
      version: 1,
      content: input.content || '',
      contentFormat: input.contentFormat || 'markdown',
      tags: input.tags || [],
      scope: input.scope || 'global',
      scopeTeams: input.scopeTeams || [],
      enforcement: input.enforcement || { level: 'warn', onViolation: 'warn_and_log' },
      history: [],
      createdBy: input.createdBy || 'system',
      createdAt: now,
      updatedAt: now,
    };

    await writeJsonAtomic(this.rulePath(id), rule);

    if (this.broadcast) {
      this.broadcast('governance_created', { rule });
    }

    console.log(`[governance] Created rule: ${rule.name} (${id})`);
    return rule;
  }

  /**
   * Update a governance rule. Increments version and records diff.
   */
  async updateRule(id: string, updates: Partial<GovernanceRule>, changedBy?: string, changeNote?: string): Promise<GovernanceRule | null> {
    const rule = await this.getRule(id);
    if (!rule) return null;

    const now = new Date().toISOString();

    // Record history entry before updating
    const historyEntry: GovernanceHistoryEntry = {
      version: rule.version,
      content: rule.content,
      changedBy: changedBy || 'system',
      changedAt: now,
      changeNote: changeNote || 'Updated',
    };

    // Compute and store diff in history directory
    if (updates.content && updates.content !== rule.content) {
      const diffRecord = {
        ruleId: id,
        fromVersion: rule.version,
        toVersion: rule.version + 1,
        oldContent: rule.content,
        newContent: updates.content,
        changedBy: changedBy || 'system',
        changedAt: now,
        changeNote: changeNote || 'Content updated',
      };
      const diffPath = path.join(this.historyDir, `${id}-v${rule.version}-to-v${rule.version + 1}.json`);
      await writeJsonAtomic(diffPath, diffRecord);
    }

    const updated: GovernanceRule = {
      ...rule,
      ...updates,
      id,
      version: rule.version + 1,
      history: [...rule.history, historyEntry],
      updatedAt: now,
    };

    await writeJsonAtomic(this.rulePath(id), updated);

    if (this.broadcast) {
      this.broadcast('governance_updated', { rule: updated });
    }

    return updated;
  }

  /**
   * Delete a governance rule.
   */
  async deleteRule(id: string): Promise<boolean> {
    try {
      const fsp = await import('fs/promises');
      await fsp.unlink(this.rulePath(id));
    } catch {
      return false;
    }

    if (this.broadcast) {
      this.broadcast('governance_deleted', { ruleId: id });
    }

    console.log(`[governance] Deleted rule: ${id}`);
    return true;
  }

  /**
   * Toggle a rule active/inactive.
   */
  async toggleRule(id: string): Promise<GovernanceRule | null> {
    const rule = await this.getRule(id);
    if (!rule) return null;

    const newStatus: 'active' | 'inactive' = rule.status === 'active' ? 'inactive' : 'active';

    const updated: GovernanceRule = {
      ...rule,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonAtomic(this.rulePath(id), updated);

    if (this.broadcast) {
      this.broadcast('governance_toggled', { rule: updated });
    }

    return updated;
  }

  /**
   * Rollback a rule to a previous version. Requires approval.
   */
  async rollbackRule(id: string, targetVersion: number): Promise<GovernanceRule | null> {
    const rule = await this.getRule(id);
    if (!rule) return null;

    const historyEntry = rule.history.find((h) => h.version === targetVersion);
    if (!historyEntry) return null;

    const now = new Date().toISOString();

    // Record rollback in history
    const rollbackEntry: GovernanceHistoryEntry = {
      version: rule.version,
      content: rule.content,
      changedBy: 'system',
      changedAt: now,
      changeNote: `Rolled back to version ${targetVersion}`,
    };

    const updated: GovernanceRule = {
      ...rule,
      content: historyEntry.content,
      version: rule.version + 1,
      history: [...rule.history, rollbackEntry],
      updatedAt: now,
    };

    await writeJsonAtomic(this.rulePath(id), updated);

    if (this.broadcast) {
      this.broadcast('governance_rolledback', { rule: updated, fromVersion: rule.version, toVersion: targetVersion });
    }

    console.log(`[governance] Rolled back rule ${id} to version ${targetVersion}`);
    return updated;
  }

  /**
   * Resolve which rules apply to a specific team.
   */
  async resolveRulesForTeam(teamDir: string): Promise<GovernanceRule[]> {
    const allRules = await this.listRules();
    return allRules.filter((rule) => {
      if (rule.status !== 'active') return false;
      if (rule.scope === 'global' || rule.scope === 'all_teams') return true;
      if (rule.scope === 'team' && rule.scopeTeams.includes(teamDir)) return true;
      return false;
    });
  }

  async shutdown(): Promise<void> {
    console.log('[governance] Governance manager shut down.');
  }
}
