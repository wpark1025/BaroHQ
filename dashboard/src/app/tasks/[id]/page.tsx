'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { TaskDetail } from '@/components/tasks/TaskDetail';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const task = useProjectStore((s) => s.getTaskById(params.id as string));

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg">Task not found</p>
          <button onClick={() => router.push('/tasks')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
            Back to tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/tasks')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Tasks
        </button>
        <TaskDetail task={task} />
      </div>
    </div>
  );
}
