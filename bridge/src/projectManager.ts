import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectMilestone,
  Manager,
} from './types';
import {
  getDataDir,
  getRootDir,
  readJson,
  writeJsonAtomic,
  ensureDir,
} from './persistence';
import { BroadcastFn } from './auditLogger';

interface ProjectsFile {
  projects: Project[];
}

export class ProjectManager implements Manager {
  private projectsPath: string;
  private projectsDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.projectsPath = path.join(getDataDir(), 'projects', 'projects.json');
    this.projectsDir = path.join(getRootDir(), 'projects');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    await ensureDir(path.dirname(this.projectsPath));
    await ensureDir(this.projectsDir);
    console.log('[projects] Project manager initialized.');
  }

  private async load(): Promise<ProjectsFile> {
    return readJson<ProjectsFile>(this.projectsPath, { projects: [] });
  }

  private async save(data: ProjectsFile): Promise<void> {
    await writeJsonAtomic(this.projectsPath, data);
  }

  /**
   * List all projects.
   */
  async listProjects(): Promise<Project[]> {
    const data = await this.load();
    return data.projects;
  }

  /**
   * Get a single project by ID.
   */
  async getProject(id: string): Promise<Project | null> {
    const data = await this.load();
    return data.projects.find((p) => p.id === id) || null;
  }

  /**
   * Create a new project.
   */
  async createProject(input: Partial<Project>): Promise<Project> {
    const data = await this.load();
    const now = new Date().toISOString();
    const slug = input.slug || (input.name || 'project').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const project: Project = {
      id: input.id || uuidv4(),
      slug,
      name: input.name || 'New Project',
      description: input.description || '',
      status: input.status || ProjectStatus.Planning,
      priority: input.priority || ProjectPriority.Medium,
      owner: input.owner || '',
      teams: input.teams || [],
      teamLeads: input.teamLeads || {},
      goals: input.goals || [],
      sprints: input.sprints || [],
      budget: input.budget || 0,
      timeline: input.timeline || { startDate: now, endDate: '', milestones: [] },
      git: input.git || { repo: '', branch: 'main', lastCommit: '' },
      channels: input.channels || [],
      tags: input.tags || [],
      createdBy: input.createdBy || 'system',
      createdAt: now,
      updatedAt: now,
    };

    data.projects.push(project);
    await this.save(data);

    // Create project directory and git init
    const projectDir = path.join(this.projectsDir, slug);
    await ensureDir(projectDir);
    try {
      const { execSync } = await import('child_process');
      execSync('git init', { cwd: projectDir, stdio: 'ignore' });
    } catch {
      // Git init is best-effort
    }

    if (this.broadcast) {
      this.broadcast('project_created', { project });
    }

    console.log(`[projects] Created project: ${project.name} (${project.id})`);
    return project;
  }

  /**
   * Update a project.
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const data = await this.load();
    const idx = data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const project = { ...data.projects[idx], ...updates, id, updatedAt: new Date().toISOString() };
    data.projects[idx] = project;
    await this.save(data);

    if (this.broadcast) {
      this.broadcast('project_updated', { project });
    }

    return project;
  }

  /**
   * Delete a project.
   */
  async deleteProject(id: string): Promise<boolean> {
    const data = await this.load();
    const idx = data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    const project = data.projects[idx];
    data.projects.splice(idx, 1);
    await this.save(data);

    if (this.broadcast) {
      this.broadcast('project_deleted', { projectId: id, project });
    }

    console.log(`[projects] Deleted project: ${project.name} (${id})`);
    return true;
  }

  /**
   * Assign teams to a project.
   */
  async assignTeams(id: string, teamIds: string[], teamLeads?: Record<string, string>): Promise<Project | null> {
    const data = await this.load();
    const idx = data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    data.projects[idx].teams = teamIds;
    if (teamLeads) {
      data.projects[idx].teamLeads = teamLeads;
    }
    data.projects[idx].updatedAt = new Date().toISOString();
    await this.save(data);

    if (this.broadcast) {
      this.broadcast('project_updated', { project: data.projects[idx] });
    }

    return data.projects[idx];
  }

  /**
   * Add a milestone to a project.
   */
  async addMilestone(projectId: string, milestone: Partial<ProjectMilestone>): Promise<Project | null> {
    const data = await this.load();
    const idx = data.projects.findIndex((p) => p.id === projectId);
    if (idx === -1) return null;

    const ms: ProjectMilestone = {
      id: milestone.id || uuidv4(),
      name: milestone.name || 'Milestone',
      date: milestone.date || new Date().toISOString(),
      status: milestone.status || 'pending',
    };

    data.projects[idx].timeline.milestones.push(ms);
    data.projects[idx].updatedAt = new Date().toISOString();
    await this.save(data);

    if (this.broadcast) {
      this.broadcast('project_updated', { project: data.projects[idx] });
    }

    return data.projects[idx];
  }

  /**
   * Transition project status.
   */
  async transitionStatus(id: string, newStatus: ProjectStatus): Promise<Project | null> {
    return this.updateProject(id, { status: newStatus });
  }

  async shutdown(): Promise<void> {
    console.log('[projects] Project manager shut down.');
  }
}
