'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChannelSidebar from './ChannelSidebar';
import ChannelView from './ChannelView';
import DirectMessage from './DirectMessage';
import type { Channel } from '@/lib/types';

const DEMO_CHANNELS: Channel[] = [
  { id: 'general', name: 'general', type: 'general', members: [], teamId: '', unread: 2 },
  { id: 'engineering', name: 'engineering', type: 'team', members: [], teamId: 'eng', unread: 5 },
  { id: 'design', name: 'design', type: 'team', members: [], teamId: 'design', unread: 0 },
  { id: 'dm-jordan', name: 'Jordan Blake', type: 'direct', members: ['jordan'], teamId: '', unread: 1 },
  { id: 'dm-riley', name: 'Riley Kim', type: 'direct', members: ['riley'], teamId: '', unread: 0 },
];

export default function ChatPanel() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    DEMO_CHANNELS[0]
  );
  const [showChannelList, setShowChannelList] = useState(true);

  return (
    <div className="w-[260px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-bold text-slate-300">Chat</span>
        </div>
        <button
          onClick={() => setShowChannelList(!showChannelList)}
          className="text-slate-600 hover:text-slate-400 transition-colors"
        >
          {showChannelList ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {showChannelList && (
          <ChannelSidebar
            channels={DEMO_CHANNELS}
            selectedId={selectedChannel?.id ?? ''}
            onSelect={(ch) => {
              setSelectedChannel(ch);
              setShowChannelList(false);
            }}
          />
        )}

        {!showChannelList && selectedChannel && (
          <div className="flex-1 flex flex-col">
            {/* Channel name bar */}
            <button
              onClick={() => setShowChannelList(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 text-left border-b border-slate-800 transition-colors"
            >
              {selectedChannel.type === 'direct' ? '' : '#'}{' '}
              {selectedChannel.name}
            </button>

            {selectedChannel.type === 'direct' ? (
              <DirectMessage channel={selectedChannel} />
            ) : (
              <ChannelView channel={selectedChannel} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
