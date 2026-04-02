import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Agent,
  AgentConfig,
  AgentStatus,
  TeamConfig,
  Manager,
} from './types';
import {
  getTeamsDir,
  readJson,
  writeJsonAtomic,
  listDirs,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class ConfigManager implements Manager {
  private teamsDir: string;
  private broadcast: BroadcastFn | null = null;
  // Cache of all agents by team
  private agentsByTeam: Map<string, AgentConfig[]> = new Map();

  constructor() {
    this.teamsDir = getTeamsDir();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await this.loadAll();
    console.log('[config] Config manager initialized.');
  }

  /**
   * Load all team-config.json files and build agent roster.
   */
  async loadAll(): Promise<void> {
    this.agentsByTeam.clear();
    const dirs = await listDirs(this.teamsDir);
    for (const dir of dirs) {
      if (dir === '_template' || dir === '99_Archive') continue;
      const configPath = path.join(this.teamsDir, dir, 'team-config.json');
      const config = await readJson<TeamConfig>(configPath, { agents: [] });
      this.agentsByTeam.set(dir, config.agents);
    }
  }

  /**
   * Reload a single team's config and diff against cached.
   */
  async reloadTeam(teamDir: string): Promise<void> {
    const configPath = path.join(this.teamsDir, teamDir, 'team-config.json');
    const newConfig = await readJson<TeamConfig>(configPath, { agents: [] });
    const oldAgents = this.agentsByTeam.get(teamDir) || [];
    const newAgents = newConfig.agents;

    // Diff
    const oldIds = new Set(oldAgents.map((a) => a.id));
    const newIds = new Set(newAgents.map((a) => a.id));

    const added = newAgents.filter((a) => !oldIds.has(a.id));
    const removed = oldAgents.filter((a) => !newIds.has(a.id));
    const changed: AgentConfig[] = [];

    for (const agent of newAgents) {
      if (oldIds.has(agent.id)) {
        const old = oldAgents.find((a) => a.id === agent.id);
        if (old && JSON.stringify(old) !== JSON.stringify(agent)) {
          changed.push(agent);
        }
      }
    }

    this.agentsByTeam.set(teamDir, newAgents);

    if (added.length > 0 || removed.length > 0 || changed.length > 0) {
      if (this.broadcast) {
        this.broadcast('roster_update', {
          teamDir,
          added: added.map((a) => a.id),
          removed: removed.map((a) => a.id),
          changed: changed.map((a) => a.id),
          agents: newAgents,
        });
      }
    }
  }

  /**
   * Get all agents across all teams.
   */
  getAllAgents(): Agent[] {
    const agents: Agent[] = [];
    for (const [teamDir, configs] of this.agentsByTeam.entries()) {
      for (const ac of configs) {
        agents.push({
          id: ac.id,
          name: ac.name,
          role: ac.role,
          status: ac.status || AgentStatus.Idle,
          appearance: ac.appearance,
          position: { x: 0, y: 0 },
          providerId: ac.providerId,
          modelTier: ac.modelTier,
          mcpConnections: ac.mcpConnections || [],
          teamId: teamDir,
        });
      }
    }
    return agents;
  }

  /**
   * Get agents for a specific team.
   */
  getTeamAgents(teamDir: string): AgentConfig[] {
    return this.agentsByTeam.get(teamDir) || [];
  }

  /**
   * Create a new agent in a team.
   */
  async createAgent(teamDir: string, data: Partial<AgentConfig>): Promise<AgentConfig> {
    const configPath = path.join(this.teamsDir, teamDir, 'team-config.json');
    const config = await readJson<TeamConfig>(configPath, { agents: [] });

    const agent: AgentConfig = {
      id: data.id || uuidv4(),
      name: data.name || 'New Agent',
      role: data.role || 'assistant',
      title: data.title || '',
      appearance: data.appearance || { hair: '#1e293b', shirt: '#3b82f6', pants: '#1e293b', skin: '#d4a574' },
      providerId: data.providerId || 'claude-code',
      modelTier: data.modelTier || 'sonnet',
      mcpConnections: data.mcpConnections || [],
      status: data.status || AgentStatus.Idle,
    };

    config.agents.push(agent);
    await writeJsonAtomic(configPath, config);
    this.agentsByTeam.set(teamDir, config.agents);

    if (this.broadcast) {
      this.broadcast('roster_update', {
        teamDir,
        added: [agent.id],
        removed: [],
        changed: [],
        agents: config.agents,
      });
    }

    return agent;
  }

  /**
   * Update an existing agent in a team.
   */
  async updateAgent(teamDir: string, agentId: string, updates: Partial<AgentConfig>): Promise<AgentConfig | null> {
    const configPath = path.join(this.teamsDir, teamDir, 'team-config.json');
    const config = await readJson<TeamConfig>(configPath, { agents: [] });

    const idx = config.agents.findIndex((a) => a.id === agentId);
    if (idx === -1) return null;

    const agent = { ...config.agents[idx], ...updates, id: agentId };
    config.agents[idx] = agent;

    await writeJsonAtomic(configPath, config);
    this.agentsByTeam.set(teamDir, config.agents);

    if (this.broadcast) {
      this.broadcast('agent_updated', { teamDir, agent });
    }

    return agent;
  }

  /**
   * Delete an agent from a team.
   */
  async deleteAgent(teamDir: string, agentId: string): Promise<boolean> {
    const configPath = path.join(this.teamsDir, teamDir, 'team-config.json');
    const config = await readJson<TeamConfig>(configPath, { agents: [] });

    const idx = config.agents.findIndex((a) => a.id === agentId);
    if (idx === -1) return false;

    config.agents.splice(idx, 1);
    await writeJsonAtomic(configPath, config);
    this.agentsByTeam.set(teamDir, config.agents);

    if (this.broadcast) {
      this.broadcast('agent_deleted', { teamDir, agentId });
    }

    return true;
  }

  async shutdown(): Promise<void> {
    console.log('[config] Config manager shut down.');
  }
}
