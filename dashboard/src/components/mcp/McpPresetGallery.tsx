'use client';

import { useState } from 'react';
import {
  Github, MessageSquare, Ticket, Layers, PenTool,
  BookOpen, Database, ShieldAlert, Server,
} from 'lucide-react';
import { useMcpStore } from '@/store/mcpStore';
import { McpPreset } from '@/lib/types';

const ICON_MAP: Record<string, React.ReactNode> = {
  github: <Github size={20} />,
  'message-square': <MessageSquare size={20} />,
  ticket: <Ticket size={20} />,
  layers: <Layers size={20} />,
  'pen-tool': <PenTool size={20} />,
  'book-open': <BookOpen size={20} />,
  database: <Database size={20} />,
  'shield-alert': <ShieldAlert size={20} />,
};

interface McpPresetGalleryProps {
  onSelect: (preset: McpPreset) => void;
}

export function McpPresetGallery({ onSelect }: McpPresetGalleryProps) {
  const presets = useMcpStore((s) => s.presets);
  const [filterCat, setFilterCat] = useState<string>('all');

  const categories = Array.from(new Set(presets.map((p) => p.category)));
  const filtered = filterCat === 'all' ? presets : presets.filter((p) => p.category === filterCat);

  return (
    <div>
      {/* Category filter */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            filterCat === 'all' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filterCat === cat ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset cards */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500/50 hover:bg-slate-800 transition-all text-left group"
          >
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shrink-0 text-slate-300 group-hover:text-blue-400 transition-colors">
              {ICON_MAP[preset.icon] || <Server size={20} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-slate-200">{preset.name}</h4>
                {preset.popular && (
                  <span className="px-1 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] rounded">Popular</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{preset.description}</p>
              <span className="text-[10px] text-slate-600 mt-1 inline-block">{preset.category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
