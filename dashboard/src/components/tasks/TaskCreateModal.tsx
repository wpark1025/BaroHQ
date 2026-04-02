'use client';

import { useState } from 'react';
import { X, Bug, BookOpen, CheckSquare, Layers } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { TaskType, TaskStatus, TaskPriority } from '@/lib/types';

interface TaskCreateModalProps {
  onClose: () => void;
}

const TYPE_OPTIONS: { value: TaskType; label: string; icon: React.ReactNode }[] = [
  { value: TaskType.Epic, label: 'Epic', icon: <Layers size={14} className="text-purple-400" /> },
  { value: TaskType.Story, label: 'Story', icon: <BookOpen size={14} className="text-green-400" /> },
  { value: TaskType.Task, label: 'Task', icon: <CheckSquare size={14} className="text-blue-400" /> },
  { value: TaskType.Bug, label: 'Bug', icon: <Bug size={14} className="text-red-400" /> },
  { value: TaskType.Subtask, label: 'Sub-task', icon: <CheckSquare size={12} className="text-slate-400" /> },
];

export function TaskCreateModal({ onClose }: TaskCreateModalProps) {
  const addTask = useProjectStore((s) => s.addTask);
  const projects = useProjectStore((s) => s.projects);
  const sprints = useProjectStore((s) => s.sprints);
  const tasks = useProjectStore((s) => s.tasks);

  const [type, setType] = useState<TaskType>(TaskType.Task);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [parentId, setParentId] = useState('');
  const [assignee, setAssignee] = useState('');
  const [reporter, setReporter] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [labels, setLabels] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [goalId, setGoalId] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    addTask({
      id: `task-${Date.now()}`,
      type,
      title,
      description,
      status: TaskStatus.Backlog,
      priority,
      assignee,
      reporter: reporter || 'current-user',
      team: '',
      project: projectId,
      sprint: sprintId,
      parent: parentId,
      children: [],
      labels: labels ? labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      storyPoints: parseInt(storyPoints) || 0,
      dueDate,
      timeTracking: { estimated: 0, logged: 0 },
      linkedGoal: goalId,
      linkedTasks: [],
      attachments: [],
      comments: [],
      history: [],
      autoCreated: false,
      autoCreatedFrom: '',
      createdBy: 'current-user',
      createdAt: now,
      updatedAt: now,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Create Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                    type === opt.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description (Markdown)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the task in detail. Markdown is supported."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Sprint</label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">No sprint</option>
                {sprints
                  .filter((s) => !projectId || s.project === projectId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Parent task (for subtasks) */}
          {type === TaskType.Subtask && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Parent Task</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select parent...</option>
                {tasks
                  .filter((t) => t.type !== TaskType.Subtask)
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Assignee</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="agent-id"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Reporter</label>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="current-user"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value={TaskPriority.Critical}>Critical</option>
                <option value={TaskPriority.High}>High</option>
                <option value={TaskPriority.Medium}>Medium</option>
                <option value={TaskPriority.Low}>Low</option>
                <option value={TaskPriority.None}>None</option>
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Story Points</label>
              <input
                type="number"
                min="0"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Labels</label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="Comma separated: auth, backend, security"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Link to goal */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Link to Goal</label>
            <input
              type="text"
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              placeholder="goal-id (optional)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded transition-colors"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
