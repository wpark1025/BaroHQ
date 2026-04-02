import { v4 as uuidv4 } from 'uuid';
import {
  Agent,
  AgentConfig,
  AgentStatus,
  Manager,
} from './types';
import {
  getTeamsFile,
  readJson,
  writeJsonAtomic,
} from './persistence';
import { BroadcastFn } from './auditLogger';

interface TeamEntry {
  id: string;
  agents: AgentConfig[];
  [key: string]: unknown;
}

export class ConfigManager implements Manager {
  private teamsFile: string;
  private broadcast: BroadcastFn | null = null;
  // Cache of all agents by team
  private agentsByTeam: Map<string, AgentConfig[]> = new Map();

  constructor() {
    this.teamsFile = getTeamsFile();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await this.loadAll();
    console.log('[config] Config manager initialized.');
  }

  /**
   * Load all teams from data/teams.json and build agent roster.
   */
  async loadAll(): Promise<void> {
    this.agentsByTeam.clear();
    const teams = await readJson<TeamEntry[]>(this.teamsFile, []);
    for (const team of teams) {
      this.agentsByTeam.set(team.id, team.agents || []);
    }
  }

  /**
   * Reload a single team's config from data/teams.json and diff against cached.
   */
  async reloadTeam(teamId: string): Promise<void> {
    const teams = await readJson<TeamEntry[]>(this.teamsFile, []);
    const team = teams.find((t) => t.id === teamId);
    const newAgents = team?.agents || [];
    const oldAgents = this.agentsByTeam.get(teamId) || [];

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

    this.agentsByTeam.set(teamId, newAgents);

    if (added.length > 0 || removed.length > 0 || changed.length > 0) {
      if (this.broadcast) {
        this.broadcast('roster_update', {
          teamDir: teamId,
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
    for (const [teamId, configs] of this.agentsByTeam.entries()) {
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
          teamId,
        });
      }
    }
    return agents;
  }

  /**
   * Get agents for a specific team.
   */
  getTeamAgents(teamId: string): AgentConfig[] {
    return this.agentsByTeam.get(teamId) || [];
  }

  /**
   * Create a new agent in a team.
   */
  async createAgent(teamId: string, data: Partial<AgentConfig>): Promise<AgentConfig> {
    const teams = await readJson<TeamEntry[]>(this.teamsFile, []);
    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }
    if (!team.agents) team.agents = [];

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

    team.agents.push(agent);
    await writeJsonAtomic(this.teamsFile, teams);
    this.agentsByTeam.set(teamId, team.agents);

    if (this.broadcast) {
      this.broadcast('roster_update', {
        teamDir: teamId,
        added: [agent.id],
        removed: [],
        changed: [],
        agents: team.agents,
      });
    }

    return agent;
  }

  /**
   * Update an existing agent in a team.
   */
  async updateAgent(teamId: string, agentId: string, updates: Partial<AgentConfig>): Promise<AgentConfig | null> {
    const teams = await readJson<TeamEntry[]>(this.teamsFile, []);
    const team = teams.find((t) => t.id === teamId);
    if (!team || !team.agents) return null;

    const idx = team.agents.findIndex((a) => a.id === agentId);
    if (idx === -1) return null;

    const agent = { ...team.agents[idx], ...updates, id: agentId };
    team.agents[idx] = agent;

    await writeJsonAtomic(this.teamsFile, teams);
    this.agentsByTeam.set(teamId, team.agents);

    if (this.broadcast) {
      this.broadcast('agent_updated', { teamDir: teamId, agent });
    }

    return agent;
  }

  /**
   * Delete an agent from a team.
   */
  async deleteAgent(teamId: string, agentId: string): Promise<boolean> {
    const teams = await readJson<TeamEntry[]>(this.teamsFile, []);
    const team = teams.find((t) => t.id === teamId);
    if (!team || !team.agents) return false;

    const idx = team.agents.findIndex((a) => a.id === agentId);
    if (idx === -1) return false;

    team.agents.splice(idx, 1);
    await writeJsonAtomic(this.teamsFile, teams);
    this.agentsByTeam.set(teamId, team.agents);

    if (this.broadcast) {
      this.broadcast('agent_deleted', { teamDir: teamId, agentId });
    }

    return true;
  }

  async shutdown(): Promise<void> {
    console.log('[config] Config manager shut down.');
  }
}
