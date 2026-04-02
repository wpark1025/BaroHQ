'use client';

import { useState } from 'react';
import { Plus, KanbanSquare, List, GanttChart, Zap } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskTimelineView } from '@/components/tasks/TaskTimelineView';
import { SprintPanel } from '@/components/tasks/SprintPanel';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal';

const VIEW_TABS = [
  { key: 'kanban' as const, label: 'Kanban', icon: <KanbanSquare size={14} /> },
  { key: 'list' as const, label: 'List', icon: <List size={14} /> },
  { key: 'timeline' as const, label: 'Timeline', icon: <GanttChart size={14} /> },
  { key: 'sprints' as const, label: 'Sprints', icon: <Zap size={14} /> },
];

export default function TasksPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { activeView, setActiveView, getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Tasks</h1>
            <p className="text-sm text-slate-400 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
          >
            <Plus size={16} />
            Create Task
          </button>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 mb-4">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeView === tab.key
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <TaskFilters />

        {/* Content */}
        <div className="mt-4">
          {activeView === 'kanban' && <TaskBoard />}
          {activeView === 'list' && <TaskListView />}
          {activeView === 'timeline' && <TaskTimelineView />}
          {activeView === 'sprints' && <SprintPanel />}
        </div>
      </div>

      {showCreate && <TaskCreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
