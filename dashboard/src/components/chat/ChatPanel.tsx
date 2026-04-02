'use client';

import { useState, useMemo } from 'react';
import { MessageSquare, X, WifiOff } from 'lucide-react';
import ChannelSidebar from './ChannelSidebar';
import ChannelView from './ChannelView';
import DirectMessage from './DirectMessage';
import { useChatStore } from '@/store/useChatStore';
import { useAgentStore } from '@/store/useAgentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Channel } from '@/lib/types';

export default function ChatPanel() {
  const channels = useChatStore((s) => s.channels);
  const agents = useAgentStore((s) => s.agents);
  const { connected } = useWebSocket();

  // Build channels from store, or generate defaults from agents
  const displayChannels: Channel[] = useMemo(() => {
    if (channels.length > 0) return channels;

    // Generate default channels from current agents
    const defaults: Channel[] = [
      { id: 'general', name: 'general', type: 'general', members: [], teamId: '', unread: 0 },
    ];

    // Add DM channels for each agent
    agents.forEach((agent) => {
      defaults.push({
        id: `dm-${agent.id}`,
        name: agent.name,
        type: 'direct',
        members: [agent.id],
        teamId: '',
        unread: 0,
      });
    });

    return defaults;
  }, [channels, agents]);

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(
    displayChannels[0] ?? null
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

      {/* Offline notice */}
      {!connected && (
        <div className="px-3 py-1.5 bg-amber-900/20 border-b border-amber-800/30 flex items-center gap-1.5">
          <WifiOff className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[9px] text-amber-400">
            Bridge offline — messages stored locally
          </span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {showChannelList && (
          <ChannelSidebar
            channels={displayChannels}
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
