import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  BudgetInfo,
  BudgetAlert,
  BudgetSnapshot,
  PlatformConfig,
  Provider,
  Manager,
} from './types';
import {
  getDataDir,
  getConfigPath,
  readJson,
  writeJsonAtomic,
  ensureDir,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class BudgetManager implements Manager {
  private budgetPath: string;
  private snapshotsDir: string;
  private broadcast: BroadcastFn | null = null;
  private snapshotTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const dataDir = getDataDir();
    this.budgetPath = path.join(dataDir, 'budgets', 'company.json');
    this.snapshotsDir = path.join(dataDir, 'budgets', 'snapshots');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await ensureDir(this.snapshotsDir);

    // Schedule daily snapshots (check every hour)
    this.snapshotTimer = setInterval(() => {
      this.maybeCreateDailySnapshot().catch((err) =>
        console.error('[budget] Snapshot error:', err)
      );
    }, 60 * 60 * 1000);

    console.log('[budget] Budget manager initialized.');
  }

  private async load(): Promise<BudgetInfo> {
    return readJson<BudgetInfo>(this.budgetPath, {
      monthlyLimit: null,
      currentMonth: null,
      spent: 0,
      byProvider: {},
      byTeam: {},
      byProject: {},
      alerts: [],
    });
  }

  private async save(data: BudgetInfo): Promise<void> {
    await writeJsonAtomic(this.budgetPath, data);
  }

  /**
   * Get the current budget info.
   */
  async getBudget(): Promise<BudgetInfo> {
    return this.load();
  }

  /**
   * Update budget settings.
   */
  async updateBudget(updates: Partial<BudgetInfo>): Promise<BudgetInfo> {
    const budget = await this.load();
    const updated: BudgetInfo = { ...budget, ...updates };
    await this.save(updated);

    if (this.broadcast) {
      this.broadcast('budget_updated', { budget: updated });
    }

    return updated;
  }

  /**
   * Record spending.
   */
  async recordSpend(params: {
    amount: number;
    providerId?: string;
    teamId?: string;
    projectId?: string;
    agentId?: string;
  }): Promise<BudgetInfo> {
    const budget = await this.load();

    // Ensure current month
    const currentMonth = new Date().toISOString().substring(0, 7);
    if (budget.currentMonth !== currentMonth) {
      // New month: reset spending
      budget.currentMonth = currentMonth;
      budget.spent = 0;
      budget.byProvider = {};
      budget.byTeam = {};
      budget.byProject = {};
      budget.alerts = [];
    }

    budget.spent += params.amount;

    // Track by provider
    if (params.providerId) {
      const byProvider = budget.byProvider as Record<string, number>;
      byProvider[params.providerId] = (byProvider[params.providerId] || 0) + params.amount;
      budget.byProvider = byProvider;
    }

    // Track by team
    if (params.teamId) {
      const byTeam = budget.byTeam as Record<string, number>;
      byTeam[params.teamId] = (byTeam[params.teamId] || 0) + params.amount;
      budget.byTeam = byTeam;
    }

    // Track by project
    if (params.projectId) {
      const byProject = budget.byProject as Record<string, number>;
      byProject[params.projectId] = (byProject[params.projectId] || 0) + params.amount;
      budget.byProject = byProject;
    }

    await this.save(budget);

    // Check alert thresholds
    await this.checkAlerts(budget);

    return budget;
  }

  /**
   * Check budget alert thresholds.
   */
  private async checkAlerts(budget: BudgetInfo): Promise<void> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    if (!config.budgets?.enabled || !budget.monthlyLimit) return;

    const thresholds = config.budgets.alertThresholds || [0.5, 0.75, 0.9];
    const ratio = budget.spent / budget.monthlyLimit;

    const existingAlertThresholds = new Set(
      (budget.alerts || []).map((a) => a.threshold)
    );

    for (const threshold of thresholds) {
      if (ratio >= threshold && !existingAlertThresholds.has(threshold)) {
        const alert: BudgetAlert = {
          id: uuidv4(),
          type: threshold >= 0.9 ? 'critical' : 'warning',
          message: `Budget usage at ${Math.round(ratio * 100)}% (threshold: ${Math.round(threshold * 100)}%)`,
          threshold,
          current: ratio,
          timestamp: new Date().toISOString(),
        };

        budget.alerts.push(alert);
        await this.save(budget);

        if (this.broadcast) {
          this.broadcast('budget_alert', { alert, budget });
        }

        console.log(`[budget] Alert: ${alert.message}`);
      }
    }

    // Pause on exceed
    if (config.budgets.pauseOnExceed && ratio >= 1.0) {
      if (this.broadcast) {
        this.broadcast('budget_alert', {
          alert: {
            id: uuidv4(),
            type: 'critical',
            message: 'Budget exceeded! Operations paused.',
            threshold: 1.0,
            current: ratio,
            timestamp: new Date().toISOString(),
          },
          budget,
          paused: true,
        });
      }
    }
  }

  /**
   * Check if budget is exceeded.
   */
  async isExceeded(): Promise<boolean> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    if (!config.budgets?.enabled) return false;

    const budget = await this.load();
    if (!budget.monthlyLimit) return false;

    return budget.spent >= budget.monthlyLimit;
  }

  /**
   * Request a budget override (creates an approval).
   */
  async requestOverride(params: {
    requester: string;
    newLimit: number;
    reason: string;
  }): Promise<void> {
    if (this.broadcast) {
      this.broadcast('budget_override_requested', {
        requester: params.requester,
        newLimit: params.newLimit,
        reason: params.reason,
      });
    }
  }

  /**
   * Calculate cost from usage using provider pricing.
   */
  async calculateCost(params: {
    providerId: string;
    modelTier: string;
    inputTokens: number;
    outputTokens: number;
  }): Promise<number> {
    const providersPath = path.join(getDataDir(), 'providers', 'providers.json');
    const providersData = await readJson<{ providers: Provider[] }>(providersPath, { providers: [] });
    const provider = providersData.providers.find((p) => p.id === params.providerId);
    if (!provider) return 0;

    const pricing = provider.pricing as Record<string, { inputPer1M?: number; outputPer1M?: number }>;
    const tierPricing = pricing[params.modelTier] || pricing;

    if (!tierPricing) return 0;

    const inputCost = tierPricing.inputPer1M
      ? (params.inputTokens / 1_000_000) * tierPricing.inputPer1M
      : 0;
    const outputCost = tierPricing.outputPer1M
      ? (params.outputTokens / 1_000_000) * tierPricing.outputPer1M
      : 0;

    return inputCost + outputCost;
  }

  /**
   * Create daily snapshot if not already created today.
   */
  private async maybeCreateDailySnapshot(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const snapshotPath = path.join(this.snapshotsDir, `${today}.json`);

    try {
      const fsp = await import('fs/promises');
      await fsp.access(snapshotPath);
      return; // Already exists
    } catch {
      // Doesn't exist, create it
    }

    const budget = await this.load();
    const snapshot: BudgetSnapshot = {
      date: today,
      spent: budget.spent,
      limit: budget.monthlyLimit,
      byProvider: budget.byProvider as Record<string, number>,
      byTeam: budget.byTeam as Record<string, number>,
      byProject: budget.byProject as Record<string, number>,
    };

    await writeJsonAtomic(snapshotPath, snapshot);
    console.log(`[budget] Daily snapshot created: ${today}`);
  }

  async shutdown(): Promise<void> {
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
    }
    console.log('[budget] Budget manager shut down.');
  }
}
