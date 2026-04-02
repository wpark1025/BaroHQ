import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Goal,
  GoalStatus,
  TaskPriority,
  TaskComment,
  Task,
  TaskStatus,
  Manager,
} from './types';
import {
  getTeamsDir,
  getDataDir,
  readJson,
  writeJsonAtomic,
  ensureDir,
  listFiles,
  listDirs,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class GoalManager implements Manager {
  private teamsDir: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.teamsDir = getTeamsDir();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[goals] Goal manager initialized.');
  }

  private goalsDir(teamDir: string): string {
    return path.join(this.teamsDir, teamDir, 'goals');
  }

  private goalPath(teamDir: string, goalId: string): string {
    return path.join(this.goalsDir(teamDir), `${goalId}.json`);
  }

  /**
   * List all goals for a team.
   */
  async listGoals(teamDir: string): Promise<Goal[]> {
    const dir = this.goalsDir(teamDir);
    await ensureDir(dir);
    const files = await listFiles(dir);
    const goals: Goal[] = [];

    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const goal = await readJson<Goal>(path.join(dir, f), null as unknown as Goal);
      if (goal) goals.push(goal);
    }

    return goals;
  }

  /**
   * List all goals across all teams.
   */
  async listAllGoals(): Promise<Goal[]> {
    const dirs = await listDirs(this.teamsDir);
    const allGoals: Goal[] = [];

    for (const dir of dirs) {
      if (dir === '_template' || dir === '99_Archive') continue;
      const goals = await this.listGoals(dir);
      allGoals.push(...goals);
    }

    return allGoals;
  }

  /**
   * Get a single goal.
   */
  async getGoal(teamDir: string, goalId: string): Promise<Goal | null> {
    return readJson<Goal>(this.goalPath(teamDir, goalId), null as unknown as Goal);
  }

  /**
   * Create a new goal.
   */
  async createGoal(teamDir: string, input: Partial<Goal>): Promise<Goal> {
    const dir = this.goalsDir(teamDir);
    await ensureDir(dir);

    const now = new Date().toISOString();
    const goal: Goal = {
      id: input.id || uuidv4(),
      title: input.title || 'New Goal',
      description: input.description || '',
      status: input.status || GoalStatus.NotStarted,
      priority: input.priority || TaskPriority.Medium,
      owner: input.owner || '',
      team: teamDir,
      project: input.project || '',
      teams: input.teams || [teamDir],
      linkedTasks: input.linkedTasks || [],
      taskProgress: 0,
      children: input.children || [],
      comments: input.comments || [],
      progress: input.progress || 0,
      createdAt: now,
      updatedAt: now,
    };

    await writeJsonAtomic(this.goalPath(teamDir, goal.id), goal);

    if (this.broadcast) {
      this.broadcast('goal_created', { teamDir, goal });
    }

    return goal;
  }

  /**
   * Update a goal.
   */
  async updateGoal(teamDir: string, goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    const goalFile = this.goalPath(teamDir, goalId);
    const goal = await readJson<Goal>(goalFile, null as unknown as Goal);
    if (!goal) return null;

    const updated: Goal = {
      ...goal,
      ...updates,
      id: goalId,
      team: teamDir,
      updatedAt: new Date().toISOString(),
    };

    await writeJsonAtomic(goalFile, updated);

    if (this.broadcast) {
      this.broadcast('goal_updated', { teamDir, goal: updated });
    }

    return updated;
  }

  /**
   * Delete a goal.
   */
  async deleteGoal(teamDir: string, goalId: string): Promise<boolean> {
    const goalFile = this.goalPath(teamDir, goalId);
    try {
      const fsp = await import('fs/promises');
      await fsp.unlink(goalFile);
    } catch {
      return false;
    }

    // Remove from parent's children
    const allGoals = await this.listGoals(teamDir);
    for (const g of allGoals) {
      if (g.children.includes(goalId)) {
        g.children = g.children.filter((c) => c !== goalId);
        await writeJsonAtomic(this.goalPath(teamDir, g.id), g);
      }
    }

    if (this.broadcast) {
      this.broadcast('goal_deleted', { teamDir, goalId });
    }

    return true;
  }

  /**
   * Add a comment to a goal.
   */
  async addComment(teamDir: string, goalId: string, comment: Partial<TaskComment>): Promise<Goal | null> {
    const goal = await this.getGoal(teamDir, goalId);
    if (!goal) return null;

    const newComment: TaskComment = {
      id: comment.id || uuidv4(),
      author: comment.author || 'system',
      text: comment.text || '',
      timestamp: comment.timestamp || new Date().toISOString(),
      edited: false,
    };

    goal.comments.push(newComment);
    goal.updatedAt = new Date().toISOString();
    await writeJsonAtomic(this.goalPath(teamDir, goalId), goal);

    if (this.broadcast) {
      this.broadcast('goal_updated', { teamDir, goal });
    }

    return goal;
  }

  /**
   * Transition a goal's status.
   */
  async transitionStatus(teamDir: string, goalId: string, newStatus: GoalStatus): Promise<Goal | null> {
    return this.updateGoal(teamDir, goalId, { status: newStatus });
  }

  /**
   * Recalculate goal progress from linked tasks.
   */
  async recalculateProgress(teamDir: string, goalId: string): Promise<Goal | null> {
    const goal = await this.getGoal(teamDir, goalId);
    if (!goal) return null;

    let taskProgress = 0;
    if (goal.linkedTasks.length > 0) {
      // Load tasks
      const tasksPath = path.join(getDataDir(), 'tasks', 'tasks.json');
      const tasksData = await readJson<{ tasks: Task[] }>(tasksPath, { tasks: [] });
      const linkedTaskObjs = tasksData.tasks.filter((t) => goal.linkedTasks.includes(t.id));

      if (linkedTaskObjs.length > 0) {
        const done = linkedTaskObjs.filter((t) => t.status === TaskStatus.Done).length;
        taskProgress = Math.round((done / linkedTaskObjs.length) * 100);
      }
    }

    // Child progress rollup
    let childProgress = 0;
    if (goal.children.length > 0) {
      let total = 0;
      for (const childId of goal.children) {
        const child = await this.getGoal(teamDir, childId);
        if (child) {
          total += child.progress;
        }
      }
      childProgress = Math.round(total / goal.children.length);
    }

    // Weighted: if there are both tasks and children, average them
    let progress: number;
    if (goal.linkedTasks.length > 0 && goal.children.length > 0) {
      progress = Math.round((taskProgress + childProgress) / 2);
    } else if (goal.children.length > 0) {
      progress = childProgress;
    } else {
      progress = taskProgress;
    }

    return this.updateGoal(teamDir, goalId, { progress, taskProgress });
  }

  /**
   * Get cross-team goals (goals associated with multiple teams).
   */
  async getCrossTeamGoals(): Promise<Goal[]> {
    const allGoals = await this.listAllGoals();
    return allGoals.filter((g) => g.teams && g.teams.length > 1);
  }

  async shutdown(): Promise<void> {
    console.log('[goals] Goal manager shut down.');
  }
}
