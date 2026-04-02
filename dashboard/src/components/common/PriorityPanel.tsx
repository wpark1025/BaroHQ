'use client';

import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { useAgentStore } from '@/store/useAgentStore';
import PixelCharacter from '@/components/office/PixelCharacter';
import type { Agent } from '@/lib/types';

interface PriorityPanelProps {
  teamId: string;
}

export default function PriorityPanel({ teamId }: PriorityPanelProps) {
  const { agents, priorities, setPriorities } = useAgentStore();
  const teamAgents = agents.filter((a) => a.teamId === teamId);

  const orderedIds = priorities[teamId] || teamAgents.map((a) => a.id);
  const orderedAgents = orderedIds
    .map((id) => teamAgents.find((a) => a.id === id))
    .filter(Boolean) as Agent[];

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newOrder = [...orderedIds];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, moved);
    setPriorities(teamId, newOrder);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-slate-400 mb-2">
        Priority Queue
      </h3>
      <p className="text-[10px] text-slate-600 mb-3">
        Drag to reorder agent priority. Higher priority agents get tasks first.
      </p>

      <div className="space-y-1">
        {orderedAgents.map((agent, index) => (
          <div
            key={agent.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-2 px-2 py-1.5 bg-slate-900 border rounded-lg cursor-move transition-all
              ${
                dragIndex === index
                  ? 'border-blue-500 bg-blue-500/5 opacity-50'
                  : 'border-slate-800 hover:border-slate-700'
              }
            `}
          >
            <GripVertical className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-[10px] text-slate-600 w-4 text-center font-bold">
              {index + 1}
            </span>
            <PixelCharacter
              appearance={agent.appearance}
              size={20}
              animate={false}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-300 truncate">
                {agent.name}
              </p>
              <p className="text-[9px] text-slate-600">{agent.role}</p>
            </div>
          </div>
        ))}
      </div>

      {orderedAgents.length === 0 && (
        <p className="text-xs text-slate-600 text-center py-4">
          No agents in this team.
        </p>
      )}
    </div>
  );
}
