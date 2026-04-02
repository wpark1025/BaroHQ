'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { Channel, Message } from '@/lib/types';

interface ChannelViewProps {
  channel: Channel;
}

const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    channelId: 'general',
    author: 'Alex Sterling',
    text: 'Good morning team. Sprint planning starts at 10.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reactions: [{ emoji: '👍', users: ['jordan', 'casey'] }],
    thread: [],
  },
  {
    id: '2',
    channelId: 'general',
    author: 'Jordan Blake',
    text: 'I\'ll have the API endpoints ready for review by then.',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    reactions: [],
    thread: [],
  },
  {
    id: '3',
    channelId: 'general',
    author: 'Riley Kim',
    text: 'Design specs are uploaded to the shared drive. Please review.',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    reactions: [{ emoji: '🎨', users: ['alex'] }],
    thread: [],
  },
];

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
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
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

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.map((msg) => (
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
