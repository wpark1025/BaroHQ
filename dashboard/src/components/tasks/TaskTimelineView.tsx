'use client';

import { Layers, BookOpen, CheckSquare, Bug } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { TaskType, TaskStatus } from '@/lib/types';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  [TaskType.Epic]: <Layers size={12} className="text-purple-400" />,
  [TaskType.Story]: <BookOpen size={12} className="text-green-400" />,
  [TaskType.Task]: <CheckSquare size={12} className="text-blue-400" />,
  [TaskType.Bug]: <Bug size={12} className="text-red-400" />,
  [TaskType.Subtask]: <CheckSquare size={10} className="text-slate-400" />,
};

const STATUS_BAR_COLOR: Record<string, string> = {
  [TaskStatus.Backlog]: 'bg-slate-600',
  [TaskStatus.Todo]: 'bg-blue-500',
  [TaskStatus.InProgress]: 'bg-yellow-500',
  [TaskStatus.InReview]: 'bg-purple-500',
  [TaskStatus.Done]: 'bg-green-500',
  [TaskStatus.Cancelled]: 'bg-red-500',
};

export function TaskTimelineView() {
  const filteredTasks = useProjectStore((s) => s.getFilteredTasks());

  // Build hierarchy: epics -> stories -> tasks
  const epics = filteredTasks.filter((t) => t.type === TaskType.Epic);
  const stories = filteredTasks.filter((t) => t.type === TaskType.Story);
  const tasks = filteredTasks.filter(
    (t) => t.type === TaskType.Task || t.type === TaskType.Bug || t.type === TaskType.Subtask
  );

  // Determine date range
  const allDates = filteredTasks
    .flatMap((t) => [t.dueDate, t.createdAt.split('T')[0]])
    .filter(Boolean)
    .sort();

  const minDate = allDates[0] || '2026-01-01';
  const maxDate = allDates[allDates.length - 1] || '2026-06-30';
  const start = new Date(minDate);
  const end = new Date(maxDate);
  const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const getBarStyle = (taskStart: string, taskEnd: string) => {
    const s = new Date(taskStart);
    const e = new Date(taskEnd || taskStart);
    const leftPercent = Math.max(0, ((s.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100);
    const widthPercent = Math.max(2, ((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100);
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  // Generate month headers
  const months: { label: string; offset: number }[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);
  while (cursor <= end) {
    const offset = ((cursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100;
    if (offset >= 0) {
      months.push({
        label: cursor.toLocaleString('default', { month: 'short', year: '2-digit' }),
        offset: Math.max(0, offset),
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const renderRow = (task: typeof filteredTasks[0], indent: number) => {
    const taskStart = task.createdAt.split('T')[0];
    const taskEnd = task.dueDate || taskStart;
    const barStyle = getBarStyle(taskStart, taskEnd);

    return (
      <div key={task.id} className="flex items-center border-b border-slate-800/50 hover:bg-slate-800/20">
        {/* Label column */}
        <div className="w-72 shrink-0 px-3 py-2 flex items-center gap-2" style={{ paddingLeft: `${12 + indent * 16}px` }}>
          {TYPE_ICONS[task.type]}
          <span className="text-xs text-slate-400 font-mono shrink-0">{task.id}</span>
          <span className="text-xs text-slate-300 truncate">{task.title}</span>
        </div>
        {/* Timeline bar */}
        <div className="flex-1 h-8 relative">
          <div
            className={`absolute top-1.5 h-5 rounded ${STATUS_BAR_COLOR[task.status]} opacity-80`}
            style={barStyle}
            title={`${task.title} (${taskStart} — ${taskEnd})`}
          >
            <span className="absolute inset-0 flex items-center px-1.5 text-[9px] text-white font-medium truncate">
              {task.title}
            </span>
          </div>
          {/* Dependency line hint */}
          {task.linkedTasks.filter((l) => l.relation === 'blocked_by').length > 0 && (
            <div
              className="absolute top-3.5 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-amber-400"
              style={{ left: barStyle.left }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-slate-800">
        <div className="w-72 shrink-0 px-3 py-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Task</span>
        </div>
        <div className="flex-1 relative h-8">
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-slate-800 px-2 flex items-center"
              style={{ left: `${m.offset}%` }}
            >
              <span className="text-[10px] text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="max-h-[600px] overflow-y-auto">
        {epics.map((epic) => {
          const epicStories = stories.filter((s) => s.parent === epic.id);
          return (
            <div key={epic.id}>
              {renderRow(epic, 0)}
              {epicStories.map((story) => {
                const storyTasks = tasks.filter((t) => t.parent === story.id);
                return (
                  <div key={story.id}>
                    {renderRow(story, 1)}
                    {storyTasks.map((t) => renderRow(t, 2))}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Orphan stories (no parent epic) */}
        {stories.filter((s) => !s.parent || !epics.find((e) => e.id === s.parent)).map((story) => {
          const storyTasks = tasks.filter((t) => t.parent === story.id);
          return (
            <div key={story.id}>
              {renderRow(story, 0)}
              {storyTasks.map((t) => renderRow(t, 1))}
            </div>
          );
        })}

        {/* Orphan tasks */}
        {tasks
          .filter((t) => !t.parent || (!stories.find((s) => s.id === t.parent) && !epics.find((e) => e.id === t.parent)))
          .map((t) => renderRow(t, 0))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-500">No tasks to display</div>
      )}
    </div>
  );
}
