import {
  Team,
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
  name: string;
  icon: string;
  accent: string;
  description: string;
  floor: number | { width: number; height: number };
  budget: number | { monthly: number | null; spent: number };
  projects: string[];
  channels: string[];
  agents: Record<string, unknown>[];
  createdAt: string | null;
  updatedAt: string | null;
}

export class TeamManager implements Manager {
  private teamsFile: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.teamsFile = getTeamsFile();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[teams] Team manager initialized.');
  }

  private async readTeams(): Promise<TeamEntry[]> {
    return readJson<TeamEntry[]>(this.teamsFile, []);
  }

  private async writeTeams(teams: TeamEntry[]): Promise<void> {
    await writeJsonAtomic(this.teamsFile, teams);
  }

  private toTeam(entry: TeamEntry): Team {
    const { agents, ...rest } = entry;
    return { ...rest, agents: (agents || []).map((a) => (a as { id: string }).id || '') } as Team;
  }

  /**
   * List all teams.
   */
  async listTeams(): Promise<Team[]> {
    const teams = await this.readTeams();
    return teams.map((t) => this.toTeam(t));
  }

  /**
   * Get a single team by id.
   */
  async getTeam(teamId: string): Promise<Team | null> {
    const teams = await this.readTeams();
    const entry = teams.find((t) => t.id === teamId);
    if (!entry) return null;
    return this.toTeam(entry);
  }

  /**
   * Create a new team.
   */
  async createTeam(data: {
    name: string;
    icon?: string;
    accent?: string;
    description?: string;
  }): Promise<{ teamDir: string; team: Team }> {
    const teams = await this.readTeams();
    const now = new Date().toISOString();

    // Generate id from slugified name
    const id = data.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const entry: TeamEntry = {
      id,
      name: data.name,
      icon: data.icon || '',
      accent: data.accent || '#6366f1',
      description: data.description || '',
      floor: { width: 800, height: 500 },
      budget: { monthly: null, spent: 0 },
      projects: [],
      channels: [],
      agents: [],
      createdAt: now,
      updatedAt: now,
    };

    teams.push(entry);
    await this.writeTeams(teams);

    const team = this.toTeam(entry);

    if (this.broadcast) {
      this.broadcast('team_created', { teamDir: id, team });
    }

    console.log(`[teams] Created team: ${id}`);
    return { teamDir: id, team };
  }

  /**
   * Archive a team by removing it from the array.
   */
  async archiveTeam(teamId: string): Promise<boolean> {
    const teams = await this.readTeams();
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx === -1) return false;

    teams.splice(idx, 1);
    await this.writeTeams(teams);

    if (this.broadcast) {
      this.broadcast('team_archived', { teamDir: teamId });
    }

    console.log(`[teams] Archived team: ${teamId}`);
    return true;
  }

  /**
   * Rename a team (updates name in the array).
   */
  async renameTeam(teamId: string, newName: string): Promise<Team | null> {
    const teams = await this.readTeams();
    const entry = teams.find((t) => t.id === teamId);
    if (!entry) return null;

    const oldName = entry.name;
    entry.name = newName;
    entry.updatedAt = new Date().toISOString();
    await this.writeTeams(teams);

    const team = this.toTeam(entry);

    if (this.broadcast) {
      this.broadcast('team_renamed', {
        oldDir: teamId,
        newDir: teamId,
        oldName,
        newName,
        team,
      });
    }

    return team;
  }

  /**
   * Delete a team permanently.
   */
  async deleteTeam(teamId: string): Promise<boolean> {
    const teams = await this.readTeams();
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx === -1) return false;

    teams.splice(idx, 1);
    await this.writeTeams(teams);

    if (this.broadcast) {
      this.broadcast('team_deleted', { teamDir: teamId });
    }

    console.log(`[teams] Deleted team: ${teamId}`);
    return true;
  }

  async shutdown(): Promise<void> {
    console.log('[teams] Team manager shut down.');
  }
}
