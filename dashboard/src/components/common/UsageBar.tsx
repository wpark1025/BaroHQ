'use client';

import { Zap } from 'lucide-react';

interface UsageBarProps {
  used: number;
  limit: number;
  compact?: boolean;
}

export default function UsageBar({
  used,
  limit,
  compact = true,
}: UsageBarProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const getColor = () => {
    if (percentage >= 90) return { bar: 'bg-red-500', text: 'text-red-400' };
    if (percentage >= 70) return { bar: 'bg-amber-500', text: 'text-amber-400' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const colors = getColor();

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={`${formatNumber(used)} / ${formatNumber(limit)} tokens`}>
        <Zap className={`w-3 h-3 ${colors.text}`} />
        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-500">
          {formatNumber(used)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className={`w-3.5 h-3.5 ${colors.text}`} />
          <span className="text-xs font-medium text-slate-300">
            Token Usage
          </span>
        </div>
        <span className={`text-xs font-bold ${colors.text}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>{formatNumber(used)} tokens used</span>
        <span>{formatNumber(limit)} limit</span>
      </div>
    </div>
  );
}
