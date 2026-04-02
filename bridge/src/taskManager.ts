import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  TaskHistory,
  TaskComment,
  LinkedTask,
  Sprint,
  SprintStatus,
  PlatformConfig,
  Manager,
} from './types';
import {
  getDataDir,
  getConfigPath,
  readJson,
  writeJsonAtomic,
} from './persistence';
import { BroadcastFn } from './auditLogger';

interface TasksFile {
  tasks: Task[];
  nextId: number;
}

interface SprintsFile {
  sprints: Sprint[];
}

export class TaskManager implements Manager {
  private tasksPath: string;
  private sprintsPath: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    const dataDir = getDataDir();
    this.tasksPath = path.join(dataDir, 'tasks', 'tasks.json');
    this.sprintsPath = path.join(dataDir, 'tasks', 'sprints.json');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[tasks] Task manager initialized.');
  }

  private async loadTasks(): Promise<TasksFile> {
    return readJson<TasksFile>(this.tasksPath, { tasks: [], nextId: 1 });
  }

  private async saveTasks(data: TasksFile): Promise<void> {
    await writeJsonAtomic(this.tasksPath, data);
  }

  private async loadSprints(): Promise<SprintsFile> {
    return readJson<SprintsFile>(this.sprintsPath, { sprints: [] });
  }

  private async saveSprints(data: SprintsFile): Promise<void> {
    await writeJsonAtomic(this.sprintsPath, data);
  }

  /**
   * Generate a task ID using the configured prefix and auto-increment.
   */
  private async generateTaskId(): Promise<{ id: string; nextId: number }> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    const prefix = config.tasks?.issuePrefix || 'BHQ';
    const data = await this.loadTasks();
    const id = `${prefix}-${data.nextId}`;
    return { id, nextId: data.nextId + 1 };
  }

  /**
   * List all tasks, optionally filtered.
   */
  async listTasks(filters?: {
    status?: TaskStatus;
    project?: string;
    team?: string;
    assignee?: string;
    sprint?: string;
  }): Promise<Task[]> {
    const data = await this.loadTasks();
    let tasks = data.tasks;

    if (filters) {
      if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
      if (filters.project) tasks = tasks.filter((t) => t.project === filters.project);
      if (filters.team) tasks = tasks.filter((t) => t.team === filters.team);
      if (filters.assignee) tasks = tasks.filter((t) => t.assignee === filters.assignee);
      if (filters.sprint) tasks = tasks.filter((t) => t.sprint === filters.sprint);
    }

    return tasks;
  }

  /**
   * Get a single task by ID.
   */
  async getTask(id: string): Promise<Task | null> {
    const data = await this.loadTasks();
    return data.tasks.find((t) => t.id === id) || null;
  }

  /**
   * Create a new task.
   */
  async createTask(input: Partial<Task>): Promise<Task> {
    const data = await this.loadTasks();
    const { id, nextId } = await this.generateTaskId();
    const now = new Date().toISOString();

    const task: Task = {
      id,
      type: input.type || TaskType.Task,
      title: input.title || 'New Task',
      description: input.description || '',
      status: input.status || TaskStatus.Backlog,
      priority: input.priority || TaskPriority.Medium,
      assignee: input.assignee || '',
      reporter: input.reporter || '',
      team: input.team || '',
      project: input.project || '',
      sprint: input.sprint || '',
      parent: input.parent || '',
      children: input.children || [],
      labels: input.labels || [],
      storyPoints: input.storyPoints || 0,
      dueDate: input.dueDate || '',
      timeTracking: input.timeTracking || { estimated: 0, logged: 0 },
      linkedGoal: input.linkedGoal || '',
      linkedTasks: input.linkedTasks || [],
      attachments: input.attachments || [],
      comments: input.comments || [],
      history: [],
      autoCreated: input.autoCreated || false,
      autoCreatedFrom: input.autoCreatedFrom || '',
      createdBy: input.createdBy || 'system',
      createdAt: now,
      updatedAt: now,
    };

    data.tasks.push(task);
    data.nextId = nextId;
    await this.saveTasks(data);

    // If task has a parent, add to parent's children
    if (task.parent) {
      const parentIdx = data.tasks.findIndex((t) => t.id === task.parent);
      if (parentIdx !== -1) {
        data.tasks[parentIdx].children.push(task.id);
        data.tasks[parentIdx].updatedAt = now;
        await this.saveTasks(data);
      }
    }

    if (this.broadcast) {
      this.broadcast('task_created', { task });
    }

    return task;
  }

  /**
   * Update a task.
   */
  async updateTask(id: string, updates: Partial<Task>, changedBy?: string): Promise<Task | null> {
    const data = await this.loadTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const old = data.tasks[idx];
    const now = new Date().toISOString();

    // Record history for changed fields
    const historyEntries: TaskHistory[] = [];
    for (const key of Object.keys(updates) as (keyof Task)[]) {
      if (key === 'history' || key === 'updatedAt') continue;
      const oldVal = old[key];
      const newVal = updates[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        historyEntries.push({
          id: uuidv4(),
          field: key,
          oldValue: String(oldVal ?? ''),
          newValue: String(newVal ?? ''),
          changedBy: changedBy || 'system',
          timestamp: now,
        });
      }
    }

    const task: Task = {
      ...old,
      ...updates,
      id,
      history: [...old.history, ...historyEntries],
      updatedAt: now,
    };
    data.tasks[idx] = task;
    await this.saveTasks(data);

    if (this.broadcast) {
      this.broadcast('task_updated', { task });
    }

    return task;
  }

  /**
   * Delete a task.
   */
  async deleteTask(id: string): Promise<boolean> {
    const data = await this.loadTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const task = data.tasks[idx];

    // Remove from parent's children
    if (task.parent) {
      const parentIdx = data.tasks.findIndex((t) => t.id === task.parent);
      if (parentIdx !== -1) {
        data.tasks[parentIdx].children = data.tasks[parentIdx].children.filter((c) => c !== id);
      }
    }

    data.tasks.splice(idx, 1);
    await this.saveTasks(data);

    if (this.broadcast) {
      this.broadcast('task_deleted', { taskId: id });
    }

    return true;
  }

  /**
   * Transition a task's status (Kanban state transition).
   */
  async transitionTask(id: string, newStatus: TaskStatus, changedBy?: string): Promise<Task | null> {
    const task = await this.updateTask(id, { status: newStatus }, changedBy);
    if (task && this.broadcast) {
      this.broadcast('task_transitioned', { task, newStatus });
    }
    return task;
  }

  /**
   * Log time against a task.
   */
  async logTime(id: string, hours: number, changedBy?: string): Promise<Task | null> {
    const data = await this.loadTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const task = data.tasks[idx];
    const newLogged = task.timeTracking.logged + hours;
    return this.updateTask(id, {
      timeTracking: { ...task.timeTracking, logged: newLogged },
    }, changedBy);
  }

  /**
   * Add a linked task (dependency).
   */
  async addLink(id: string, link: LinkedTask): Promise<Task | null> {
    const data = await this.loadTasks();
    const idx = data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const task = data.tasks[idx];
    task.linkedTasks.push(link);

    // Add reciprocal link
    const reciprocal: Record<string, string> = {
      blocks: 'blocked_by',
      blocked_by: 'blocks',
      relates_to: 'relates_to',
      duplicates: 'duplicates',
    };
    const targetIdx = data.tasks.findIndex((t) => t.id === link.taskId);
    if (targetIdx !== -1) {
      data.tasks[targetIdx].linkedTasks.push({
        taskId: id,
        relation: reciprocal[link.relation] as LinkedTask['relation'],
      });
    }

    const now = new Date().toISOString();
    task.updatedAt = now;
    if (targetIdx !== -1) data.tasks[targetIdx].updatedAt = now;
    await this.saveTasks(data);

    if (this.broadcast) {
      this.broadcast('task_updated', { task });
    }

    return task;
  }

  /**
   * Auto-create an issue from an agent failure.
   */
  async autoCreateIssue(params: {
    agentId: string;
    team: string;
    errorMessage: string;
    runId?: string;
  }): Promise<Task> {
    const task = await this.createTask({
      type: TaskType.Issue,
      title: `[Auto] Agent failure: ${params.errorMessage.substring(0, 80)}`,
      description: `Automatically created from agent failure.\n\nAgent: ${params.agentId}\nTeam: ${params.team}\nError: ${params.errorMessage}${params.runId ? `\nRun: ${params.runId}` : ''}`,
      status: TaskStatus.Todo,
      priority: TaskPriority.High,
      team: params.team,
      assignee: params.agentId,
      autoCreated: true,
      autoCreatedFrom: params.runId || params.agentId,
      labels: ['auto-issue', 'agent-failure'],
    });

    // Also record in auto-issues.json
    const autoIssuesPath = path.join(getDataDir(), 'tasks', 'auto-issues.json');
    const autoIssues = await readJson<{ autoIssues: Array<{ taskId: string; agentId: string; team: string; createdAt: string }> }>(
      autoIssuesPath,
      { autoIssues: [] }
    );
    autoIssues.autoIssues.push({
      taskId: task.id,
      agentId: params.agentId,
      team: params.team,
      createdAt: task.createdAt,
    });
    await writeJsonAtomic(autoIssuesPath, autoIssues);

    return task;
  }

  // ===== Sprint Management =====

  /**
   * List all sprints.
   */
  async listSprints(projectId?: string): Promise<Sprint[]> {
    const data = await this.loadSprints();
    if (projectId) {
      return data.sprints.filter((s) => s.project === projectId);
    }
    return data.sprints;
  }

  /**
   * Create a sprint.
   */
  async createSprint(input: Partial<Sprint>): Promise<Sprint> {
    const data = await this.loadSprints();
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    const durationDays = config.tasks?.defaultSprintDurationDays || 14;

    const startDate = input.startDate || new Date().toISOString();
    const endDate = input.endDate || new Date(
      new Date(startDate).getTime() + durationDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const sprint: Sprint = {
      id: input.id || uuidv4(),
      name: input.name || `Sprint ${data.sprints.length + 1}`,
      project: input.project || '',
      status: input.status || SprintStatus.Planning,
      startDate,
      endDate,
      goal: input.goal || '',
      tasks: input.tasks || [],
      velocity: input.velocity || 0,
    };

    data.sprints.push(sprint);
    await this.saveSprints(data);

    if (this.broadcast) {
      this.broadcast('sprint_created', { sprint });
    }

    return sprint;
  }

  /**
   * Update a sprint.
   */
  async updateSprint(id: string, updates: Partial<Sprint>): Promise<Sprint | null> {
    const data = await this.loadSprints();
    const idx = data.sprints.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const sprint = { ...data.sprints[idx], ...updates, id };
    data.sprints[idx] = sprint;
    await this.saveSprints(data);

    if (this.broadcast) {
      this.broadcast('sprint_updated', { sprint });
    }

    return sprint;
  }

  /**
   * Start a sprint.
   */
  async startSprint(id: string): Promise<Sprint | null> {
    const sprint = await this.updateSprint(id, {
      status: SprintStatus.Active,
      startDate: new Date().toISOString(),
    });

    if (sprint && this.broadcast) {
      this.broadcast('sprint_started', { sprint });
    }

    return sprint;
  }

  /**
   * Complete a sprint. Calculate velocity from done story points.
   */
  async completeSprint(id: string): Promise<Sprint | null> {
    const sprintData = await this.loadSprints();
    const sprintIdx = sprintData.sprints.findIndex((s) => s.id === id);
    if (sprintIdx === -1) return null;

    const sprint = sprintData.sprints[sprintIdx];
    const taskData = await this.loadTasks();

    // Calculate velocity: sum story points of done tasks in this sprint
    let velocity = 0;
    for (const taskId of sprint.tasks) {
      const task = taskData.tasks.find((t) => t.id === taskId);
      if (task && task.status === TaskStatus.Done) {
        velocity += task.storyPoints;
      }
    }

    sprint.status = SprintStatus.Completed;
    sprint.velocity = velocity;
    sprintData.sprints[sprintIdx] = sprint;
    await this.saveSprints(sprintData);

    if (this.broadcast) {
      this.broadcast('sprint_completed', { sprint, velocity });
    }

    return sprint;
  }

  /**
   * Resolve dependencies: get blocked tasks that can now move forward.
   */
  async getUnblockedTasks(): Promise<Task[]> {
    const data = await this.loadTasks();
    const doneIds = new Set(
      data.tasks
        .filter((t) => t.status === TaskStatus.Done || t.status === TaskStatus.Cancelled)
        .map((t) => t.id)
    );

    return data.tasks.filter((task) => {
      if (task.status !== TaskStatus.Backlog && task.status !== TaskStatus.Todo) return false;
      const blockers = task.linkedTasks.filter((lt) => lt.relation === 'blocked_by');
      if (blockers.length === 0) return false;
      return blockers.every((b) => doneIds.has(b.taskId));
    });
  }

  async shutdown(): Promise<void> {
    console.log('[tasks] Task manager shut down.');
  }
}
