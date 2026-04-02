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
  getGoalsFile,
  getDataDir,
  readJson,
  writeJsonAtomic,
} from './persistence';
import * as path from 'path';
import { BroadcastFn } from './auditLogger';

export class GoalManager implements Manager {
  private goalsFile: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    this.goalsFile = getGoalsFile();
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[goals] Goal manager initialized.');
  }

  private async readGoals(): Promise<Goal[]> {
    return readJson<Goal[]>(this.goalsFile, []);
  }

  private async writeGoals(goals: Goal[]): Promise<void> {
    await writeJsonAtomic(this.goalsFile, goals);
  }

  /**
   * List all goals for a team.
   */
  async listGoals(teamId: string): Promise<Goal[]> {
    const goals = await this.readGoals();
    return goals.filter((g) => g.team === teamId);
  }

  /**
   * List all goals across all teams.
   */
  async listAllGoals(): Promise<Goal[]> {
    return this.readGoals();
  }

  /**
   * Get a single goal.
   */
  async getGoal(_teamId: string, goalId: string): Promise<Goal | null> {
    const goals = await this.readGoals();
    return goals.find((g) => g.id === goalId) || null;
  }

  /**
   * Create a new goal.
   */
  async createGoal(teamId: string, input: Partial<Goal>): Promise<Goal> {
    const goals = await this.readGoals();
    const now = new Date().toISOString();

    const goal: Goal = {
      id: input.id || uuidv4(),
      title: input.title || 'New Goal',
      description: input.description || '',
      status: input.status || GoalStatus.NotStarted,
      priority: input.priority || TaskPriority.Medium,
      owner: input.owner || '',
      team: teamId,
      project: input.project || '',
      teams: input.teams || [teamId],
      linkedTasks: input.linkedTasks || [],
      taskProgress: 0,
      children: input.children || [],
      comments: input.comments || [],
      progress: input.progress || 0,
      createdAt: now,
      updatedAt: now,
    };

    goals.push(goal);
    await this.writeGoals(goals);

    if (this.broadcast) {
      this.broadcast('goal_created', { teamDir: teamId, goal });
    }

    return goal;
  }

  /**
   * Update a goal.
   */
  async updateGoal(teamId: string, goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    const goals = await this.readGoals();
    const idx = goals.findIndex((g) => g.id === goalId);
    if (idx === -1) return null;

    const updated: Goal = {
      ...goals[idx],
      ...updates,
      id: goalId,
      team: teamId,
      updatedAt: new Date().toISOString(),
    };

    goals[idx] = updated;
    await this.writeGoals(goals);

    if (this.broadcast) {
      this.broadcast('goal_updated', { teamDir: teamId, goal: updated });
    }

    return updated;
  }

  /**
   * Delete a goal.
   */
  async deleteGoal(teamId: string, goalId: string): Promise<boolean> {
    const goals = await this.readGoals();
    const idx = goals.findIndex((g) => g.id === goalId);
    if (idx === -1) return false;

    goals.splice(idx, 1);

    // Remove from parent's children
    for (const g of goals) {
      if (g.children.includes(goalId)) {
        g.children = g.children.filter((c) => c !== goalId);
      }
    }

    await this.writeGoals(goals);

    if (this.broadcast) {
      this.broadcast('goal_deleted', { teamDir: teamId, goalId });
    }

    return true;
  }

  /**
   * Add a comment to a goal.
   */
  async addComment(teamId: string, goalId: string, comment: Partial<TaskComment>): Promise<Goal | null> {
    const goals = await this.readGoals();
    const goal = goals.find((g) => g.id === goalId);
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
    await this.writeGoals(goals);

    if (this.broadcast) {
      this.broadcast('goal_updated', { teamDir: teamId, goal });
    }

    return goal;
  }

  /**
   * Transition a goal's status.
   */
  async transitionStatus(teamId: string, goalId: string, newStatus: GoalStatus): Promise<Goal | null> {
    return this.updateGoal(teamId, goalId, { status: newStatus });
  }

  /**
   * Recalculate goal progress from linked tasks.
   */
  async recalculateProgress(teamId: string, goalId: string): Promise<Goal | null> {
    const goals = await this.readGoals();
    const goal = goals.find((g) => g.id === goalId);
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
        const child = goals.find((g) => g.id === childId);
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

    return this.updateGoal(teamId, goalId, { progress, taskProgress });
  }

  /**
   * Get cross-team goals (goals associated with multiple teams).
   */
  async getCrossTeamGoals(): Promise<Goal[]> {
    const allGoals = await this.readGoals();
    return allGoals.filter((g) => g.teams && g.teams.length > 1);
  }

  async shutdown(): Promise<void> {
    console.log('[goals] Goal manager shut down.');
  }
}
