import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Team,
  PlatformConfig,
  Manager,
} from './types';
import {
  getTeamsDir,
  getConfigPath,
  readJson,
  writeJsonAtomic,
  listDirs,
  copyDir,
  moveDir,
  exists,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class TeamManager implements Manager {
  private teamsDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.teamsDir = getTeamsDir();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[teams] Team manager initialized.');
  }

  /**
   * List all teams (excluding _template and 99_Archive).
   */
  async listTeams(): Promise<Team[]> {
    const dirs = await listDirs(this.teamsDir);
    const teams: Team[] = [];

    for (const dir of dirs) {
      if (dir === '_template' || dir === '99_Archive') continue;
      const teamPath = path.join(this.teamsDir, dir, 'team.json');
      const team = await readJson<Team>(teamPath, null as unknown as Team);
      if (team) {
        if (!team.id) team.id = dir;
        teams.push(team);
      }
    }

    return teams;
  }

  /**
   * Get a single team by directory name.
   */
  async getTeam(teamDir: string): Promise<Team | null> {
    const teamPath = path.join(this.teamsDir, teamDir, 'team.json');
    const team = await readJson<Team>(teamPath, null as unknown as Team);
    if (team && !team.id) team.id = teamDir;
    return team;
  }

  /**
   * Create a new team from the _template directory.
   */
  async createTeam(data: {
    name: string;
    icon?: string;
    accent?: string;
    description?: string;
  }): Promise<{ teamDir: string; team: Team }> {
    // Read config for next available number
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    const nextNum = config.teamNumbering?.nextAvailable || 1;
    const paddedNum = String(nextNum).padStart(2, '0');
    const dirName = `${paddedNum}_${data.name.replace(/\s+/g, '_')}`;
    const teamDir = path.join(this.teamsDir, dirName);

    // Copy template
    const templateDir = path.join(this.teamsDir, '_template');
    if (await exists(templateDir)) {
      await copyDir(templateDir, teamDir);
    }

    // Write team.json
    const now = new Date().toISOString();
    const team: Team = {
      id: dirName,
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

    await writeJsonAtomic(path.join(teamDir, 'team.json'), team);

    // Update config with next available number
    if (config.teamNumbering) {
      config.teamNumbering.nextAvailable = nextNum + 1;
      await writeJsonAtomic(getConfigPath(), config);
    }

    if (this.broadcast) {
      this.broadcast('team_created', { teamDir: dirName, team });
    }

    console.log(`[teams] Created team: ${dirName}`);
    return { teamDir: dirName, team };
  }

  /**
   * Archive a team by moving it to 99_Archive/.
   */
  async archiveTeam(teamDir: string): Promise<boolean> {
    const srcPath = path.join(this.teamsDir, teamDir);
    if (!(await exists(srcPath))) return false;

    const archiveDir = path.join(this.teamsDir, '99_Archive');
    const destPath = path.join(archiveDir, teamDir);
    await moveDir(srcPath, destPath);

    if (this.broadcast) {
      this.broadcast('team_archived', { teamDir });
    }

    console.log(`[teams] Archived team: ${teamDir}`);
    return true;
  }

  /**
   * Rename a team (updates team.json and renames directory).
   */
  async renameTeam(teamDir: string, newName: string): Promise<Team | null> {
    const teamPath = path.join(this.teamsDir, teamDir, 'team.json');
    const team = await readJson<Team>(teamPath, null as unknown as Team);
    if (!team) return null;

    const oldName = team.name;
    team.name = newName;
    team.updatedAt = new Date().toISOString();
    await writeJsonAtomic(teamPath, team);

    // Rename directory: extract number prefix
    const match = teamDir.match(/^(\d+)_/);
    if (match) {
      const newDirName = `${match[1]}_${newName.replace(/\s+/g, '_')}`;
      if (newDirName !== teamDir) {
        const srcPath = path.join(this.teamsDir, teamDir);
        const destPath = path.join(this.teamsDir, newDirName);
        await moveDir(srcPath, destPath);
        team.id = newDirName;

        if (this.broadcast) {
          this.broadcast('team_renamed', {
            oldDir: teamDir,
            newDir: newDirName,
            oldName,
            newName,
            team,
          });
        }
        return team;
      }
    }

    if (this.broadcast) {
      this.broadcast('team_renamed', {
        oldDir: teamDir,
        newDir: teamDir,
        oldName,
        newName,
        team,
      });
    }

    return team;
  }

  /**
   * Delete a team permanently. Should require approval first.
   */
  async deleteTeam(teamDir: string): Promise<boolean> {
    const teamPath = path.join(this.teamsDir, teamDir);
    if (!(await exists(teamPath))) return false;

    const fsp = await import('fs/promises');
    await fsp.rm(teamPath, { recursive: true, force: true });

    if (this.broadcast) {
      this.broadcast('team_deleted', { teamDir });
    }

    console.log(`[teams] Deleted team: ${teamDir}`);
    return true;
  }

  async shutdown(): Promise<void> {
    console.log('[teams] Team manager shut down.');
  }
}
