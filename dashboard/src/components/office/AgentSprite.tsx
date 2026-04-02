'use client';

import { useState } from 'react';
import PixelCharacter from './PixelCharacter';
import type { Agent } from '@/lib/types';
import { AgentStatus } from '@/lib/types';

interface AgentSpriteProps {
  agent: Agent;
  onClick?: () => void;
  showLabel?: boolean;
  showBubble?: string;
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  [AgentStatus.Idle]: '#22c55e',
  [AgentStatus.Working]: '#eab308',
  [AgentStatus.Paused]: '#f97316',
  [AgentStatus.Offline]: '#6b7280',
  [AgentStatus.Meeting]: '#8b5cf6',
  [AgentStatus.Break]: '#06b6d4',
};

export default function AgentSprite({
  agent,
  onClick,
  showLabel = true,
  showBubble,
}: AgentSpriteProps) {
  const [hovered, setHovered] = useState(false);
  const isMoving = agent.status === AgentStatus.Working;

  return (
    <div
      className="absolute cursor-pointer group"
      style={{
        left: agent.position.x,
        top: agent.position.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 10,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Speech Bubble */}
      {showBubble && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-speech-bubble">
          <div className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300 whitespace-nowrap max-w-[120px] truncate">
            {showBubble}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700" />
        </div>
      )}

      {/* Hover Tooltip */}
      {hovered && !showBubble && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl min-w-[140px]">
            <p className="text-xs font-bold text-slate-100">{agent.name}</p>
            <p className="text-[10px] text-slate-400">{agent.role}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[agent.status] }}
              />
              <span className="text-[10px] text-slate-500 capitalize">
                {agent.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status Dot */}
      <div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 z-20 animate-pulse-dot"
        style={{ backgroundColor: STATUS_COLORS[agent.status] }}
      />

      {/* Character */}
      <div className={isMoving ? 'animate-pixel-walk' : ''}>
        <PixelCharacter
          appearance={agent.appearance}
          size={36}
          animate={!isMoving}
        />
      </div>

      {/* Name Label */}
      {showLabel && (
        <div className="text-center mt-0.5">
          <span className="text-[9px] font-medium text-slate-400 bg-slate-900/80 px-1 rounded">
            {agent.name.split(' ')[0]}
          </span>
        </div>
      )}
    </div>
  );
}
