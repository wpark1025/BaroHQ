'use client';

import { useState } from 'react';
import { Hash, User, Search, Plus } from 'lucide-react';
import type { Channel } from '@/lib/types';

interface ChannelSidebarProps {
  channels: Channel[];
  selectedId: string;
  onSelect: (channel: Channel) => void;
}

export default function ChannelSidebar({
  channels,
  selectedId,
  onSelect,
}: ChannelSidebarProps) {
  const [search, setSearch] = useState('');

  const teamChannels = channels.filter((c) => c.type !== 'direct');
  const dmChannels = channels.filter((c) => c.type === 'direct');

  const filteredTeam = teamChannels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDm = dmChannels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col overflow-y-auto">
      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-2 py-1 bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Channels */}
      <div className="px-2 py-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Channels
          </span>
          <button className="text-slate-600 hover:text-slate-400">
            <Plus className="w-3 h-3" />
          </button>
        </div>
        {filteredTeam.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelect(channel)}
            className={`
              w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-colors
              ${
                selectedId === channel.id
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }
            `}
          >
            <Hash className="w-3 h-3 shrink-0" />
            <span className="text-[11px] truncate flex-1">{channel.name}</span>
            {channel.unread > 0 && (
              <span className="min-w-[16px] h-4 bg-blue-600 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1">
                {channel.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Direct Messages */}
      <div className="px-2 py-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Direct Messages
          </span>
        </div>
        {filteredDm.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelect(channel)}
            className={`
              w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-colors
              ${
                selectedId === channel.id
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }
            `}
          >
            <User className="w-3 h-3 shrink-0" />
            <span className="text-[11px] truncate flex-1">{channel.name}</span>
            {channel.unread > 0 && (
              <span className="min-w-[16px] h-4 bg-blue-600 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1">
                {channel.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
