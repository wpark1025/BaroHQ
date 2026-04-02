'use client';

import { useState, useEffect } from 'react';
import { Pause, Clock } from 'lucide-react';

interface PausedOverlayProps {
  resumeAt: Date;
  reason?: string;
  onDismiss?: () => void;
}

export default function PausedOverlay({
  resumeAt,
  reason = 'Rate limit reached',
  onDismiss,
}: PausedOverlayProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = resumeAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Resuming...');
        onDismiss?.();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [resumeAt, onDismiss]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 bg-amber-600/20 rounded-lg flex items-center justify-center mx-auto">
          <Pause className="w-8 h-8 text-amber-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-200">
            Operations Paused
          </h2>
          <p className="text-sm text-slate-500 mt-1">{reason}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 inline-block">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="text-2xl font-mono font-bold">{timeLeft}</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1">
            until operations resume
          </p>
        </div>

        <p className="text-[11px] text-slate-600">
          Agents will automatically resume when the rate limit resets. Your work
          is saved.
        </p>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
