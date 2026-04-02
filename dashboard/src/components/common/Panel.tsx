'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PanelProps {
  title: string;
  badge?: number | string;
  defaultCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Panel({
  title,
  badge,
  defaultCollapsed = false,
  className = '',
  children,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-lg overflow-hidden ${className}`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span className="text-xs font-bold text-slate-300 flex-1 text-left">
          {title}
        </span>
        {badge !== undefined && (
          <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 animate-fade-in">{children}</div>
      )}
    </div>
  );
}
