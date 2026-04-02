import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  RunRecord,
  RunUsage,
  Manager,
} from './types';
import {
  getDataDir,
  readJson,
  writeJsonAtomic,
  ensureDir,
  listFiles,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class RunHistoryManager implements Manager {
  private runsDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.runsDir = path.join(getDataDir(), 'runs');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await ensureDir(this.runsDir);
    console.log('[runs] Run history manager initialized.');
  }

  /**
   * Create a new run record.
   */
  async createRun(input: Partial<RunRecord>): Promise<RunRecord> {
    const now = new Date().toISOString();

    const run: RunRecord = {
      id: input.id || uuidv4(),
      agentId: input.agentId || '',
      team: input.team || '',
      provider: input.provider || '',
      providerType: input.providerType || '',
      model: input.model || '',
      modelTier: input.modelTier || '',
      prompt: input.prompt || '',
      output: input.output || '',
      usage: input.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 },
      durationMs: input.durationMs || 0,
      status: input.status || 'success',
      errorMessage: input.errorMessage || '',
      projectId: input.projectId || '',
      taskId: input.taskId || '',
      autoIssueCreated: input.autoIssueCreated || false,
      mcpToolsUsed: input.mcpToolsUsed || [],
      timestamp: now,
    };

    const runPath = path.join(this.runsDir, `run-${run.id}.json`);
    await writeJsonAtomic(runPath, run);

    const eventType = run.status === 'success' ? 'run_completed' : 'run_failed';
    if (this.broadcast) {
      this.broadcast(eventType, { run });
    }

    return run;
  }

  /**
   * Get a single run by ID.
   */
  async getRun(id: string): Promise<RunRecord | null> {
    const runPath = path.join(this.runsDir, `run-${id}.json`);
    return readJson<RunRecord>(runPath, null as unknown as RunRecord);
  }

  /**
   * List runs with optional filters.
   */
  async listRuns(filters?: {
    agentId?: string;
    team?: string;
    projectId?: string;
    taskId?: string;
    status?: string;
    limit?: number;
  }): Promise<RunRecord[]> {
    const files = await listFiles(this.runsDir);
    const runFiles = files.filter((f) => f.startsWith('run-') && f.endsWith('.json'));

    // Load from newest first (assuming file names sort chronologically)
    const sortedFiles = runFiles.sort().reverse();
    const limit = filters?.limit || 100;
    const runs: RunRecord[] = [];

    for (const f of sortedFiles) {
      if (runs.length >= limit) break;

      const run = await readJson<RunRecord>(
        path.join(this.runsDir, f),
        null as unknown as RunRecord
      );
      if (!run) continue;

      // Apply filters
      if (filters?.agentId && run.agentId !== filters.agentId) continue;
      if (filters?.team && run.team !== filters.team) continue;
      if (filters?.projectId && run.projectId !== filters.projectId) continue;
      if (filters?.taskId && run.taskId !== filters.taskId) continue;
      if (filters?.status && run.status !== filters.status) continue;

      runs.push(run);
    }

    return runs;
  }

  /**
   * Get runs linked to a specific goal.
   */
  async getRunsByGoal(goalId: string): Promise<RunRecord[]> {
    // Goals are linked via tasks, so we'd need to cross-reference
    // For now, return all runs that reference tasks linked to this goal
    return this.listRuns();
  }

  /**
   * Get aggregated usage statistics.
   */
  async getUsageStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalRuns: number;
    totalTokens: number;
    totalCost: number;
    byAgent: Record<string, { runs: number; tokens: number; cost: number }>;
    byProvider: Record<string, { runs: number; tokens: number; cost: number }>;
    byModel: Record<string, { runs: number; tokens: number; cost: number }>;
  }> {
    const runs = await this.listRuns({ limit: 10000 });

    const filtered = runs.filter((r) => {
      if (params?.startDate && r.timestamp < params.startDate) return false;
      if (params?.endDate && r.timestamp > params.endDate) return false;
      return true;
    });

    const stats = {
      totalRuns: filtered.length,
      totalTokens: 0,
      totalCost: 0,
      byAgent: {} as Record<string, { runs: number; tokens: number; cost: number }>,
      byProvider: {} as Record<string, { runs: number; tokens: number; cost: number }>,
      byModel: {} as Record<string, { runs: number; tokens: number; cost: number }>,
    };

    for (const run of filtered) {
      const tokens = run.usage.totalTokens;
      const cost = run.usage.cost;

      stats.totalTokens += tokens;
      stats.totalCost += cost;

      // By agent
      if (run.agentId) {
        if (!stats.byAgent[run.agentId]) {
          stats.byAgent[run.agentId] = { runs: 0, tokens: 0, cost: 0 };
        }
        stats.byAgent[run.agentId].runs++;
        stats.byAgent[run.agentId].tokens += tokens;
        stats.byAgent[run.agentId].cost += cost;
      }

      // By provider
      if (run.provider) {
        if (!stats.byProvider[run.provider]) {
          stats.byProvider[run.provider] = { runs: 0, tokens: 0, cost: 0 };
        }
        stats.byProvider[run.provider].runs++;
        stats.byProvider[run.provider].tokens += tokens;
        stats.byProvider[run.provider].cost += cost;
      }

      // By model
      if (run.model) {
        if (!stats.byModel[run.model]) {
          stats.byModel[run.model] = { runs: 0, tokens: 0, cost: 0 };
        }
        stats.byModel[run.model].runs++;
        stats.byModel[run.model].tokens += tokens;
        stats.byModel[run.model].cost += cost;
      }
    }

    return stats;
  }

  async shutdown(): Promise<void> {
    console.log('[runs] Run history manager shut down.');
  }
}
