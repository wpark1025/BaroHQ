'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { Channel, Message } from '@/lib/types';

interface DirectMessageProps {
  channel: Channel;
}

export default function DirectMessage({ channel }: DirectMessageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'dm-1',
      channelId: channel.id,
      author: channel.name,
      text: 'Hey, I wanted to discuss the authentication module.',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      reactions: [],
      thread: [],
    },
    {
      id: 'dm-2',
      channelId: channel.id,
      author: 'You (CEO)',
      text: 'Sure, what\'s the current status?',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      reactions: [],
      thread: [],
    },
    {
      id: 'dm-3',
      channelId: channel.id,
      author: channel.name,
      text: 'The OAuth flow is implemented. Need to add MFA support next.',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      reactions: [],
      thread: [],
    },
  ]);
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
      id: `dm-${Date.now()}`,
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

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5"
      >
        {messages.map((msg) => {
          const isOwn = msg.author.startsWith('You');
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-2.5 py-1.5 rounded-lg ${
                  isOwn
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <p className="text-[11px] text-slate-300 leading-relaxed break-words">
                  {msg.text}
                </p>
              </div>
              <span className="text-[9px] text-slate-600 mt-0.5 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${channel.name}`}
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
