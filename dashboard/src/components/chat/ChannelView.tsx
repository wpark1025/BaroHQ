'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Channel, Message } from '@/lib/types';

interface ChannelViewProps {
  channel: Channel;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ChannelView({ channel }: ChannelViewProps) {
  const storeMessages = useChatStore((s) => s.getMessagesForChannel(channel.id));
  const addMessage = useChatStore((s) => s.addMessage);
  const { send, connected } = useWebSocket();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [storeMessages]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId: channel.id,
      author: 'You (CEO)',
      text: input.trim(),
      timestamp: new Date().toISOString(),
      reactions: [],
      thread: [],
    };

    // Add locally
    addMessage(channel.id, newMessage);

    // Send via WebSocket
    if (connected) {
      send({
        type: 'send_message',
        payload: {
          channelId: channel.id,
          text: input.trim(),
        },
      });
    }

    setInput('');
  }, [input, channel.id, addMessage, send, connected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Connection status */}
      <div className={`px-3 py-0.5 text-[9px] ${connected ? 'text-emerald-600' : 'text-red-500'}`}>
        {connected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {storeMessages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[11px] text-slate-600">
              No messages yet in #{channel.name}
            </p>
          </div>
        )}
        {storeMessages.map((msg) => (
          <div key={msg.id} className="flex gap-2 group">
            <div
              className={`w-6 h-6 rounded-sm flex items-center justify-center shrink-0 mt-0.5 ${getAvatarColor(
                msg.author
              )}`}
            >
              <span className="text-[8px] font-bold text-white">
                {getInitials(msg.author)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-bold text-slate-200">
                  {msg.author}
                </span>
                <span className="text-[9px] text-slate-600">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed break-words">
                {msg.text}
              </p>
              {msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {msg.reactions.map((r, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] cursor-pointer hover:bg-slate-700"
                    >
                      {r.emoji} {r.users.length}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channel.name}`}
            className="flex-1 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors disabled:opacity-30"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
