'use client';

import { BarChart3 } from 'lucide-react';
import type { UsageData } from '@/lib/types';

interface UsageDetailProps {
  usage: UsageData | null;
}

interface UsageRow {
  name: string;
  tokens: number;
  cost: number;
}

function UsageTable({ title, rows }: { title: string; rows: UsageRow[] }) {
  const maxTokens = Math.max(...rows.map((r) => r.tokens), 1);

  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 mb-2">{title}</h4>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 w-24 truncate">
              {row.name}
            </span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${(row.tokens / maxTokens) * 100}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-500 w-16 text-right">
              {row.tokens >= 1000
                ? `${(row.tokens / 1000).toFixed(1)}k`
                : row.tokens}
            </span>
            <span className="text-[10px] text-emerald-500 w-12 text-right">
              ${row.cost.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsageDetail({ usage }: UsageDetailProps) {
  if (!usage) {
    return (
      <div className="p-6 text-center">
        <BarChart3 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        <p className="text-sm text-slate-600">No usage data available yet.</p>
      </div>
    );
  }

  const agentRows: UsageRow[] = Object.entries(usage.byAgent).map(
    ([name, data]) => ({
      name,
      tokens: data.tokens,
      cost: data.cost,
    })
  );

  const providerRows: UsageRow[] = Object.entries(usage.byProvider).map(
    ([name, data]) => ({
      name,
      tokens: data.tokens,
      cost: data.cost,
    })
  );

  const modelRows: UsageRow[] = Object.entries(usage.byModel).map(
    ([name, data]) => ({
      name,
      tokens: data.tokens,
      cost: data.cost,
    })
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 mb-1">Total Tokens</p>
          <p className="text-lg font-bold text-slate-100">
            {usage.tokens >= 1000000
              ? `${(usage.tokens / 1000000).toFixed(1)}M`
              : `${(usage.tokens / 1000).toFixed(1)}k`}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 mb-1">Total Cost</p>
          <p className="text-lg font-bold text-emerald-400">
            ${usage.cost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Breakdowns */}
      {agentRows.length > 0 && (
        <UsageTable title="By Agent" rows={agentRows} />
      )}
      {providerRows.length > 0 && (
        <UsageTable title="By Provider" rows={providerRows} />
      )}
      {modelRows.length > 0 && (
        <UsageTable title="By Model" rows={modelRows} />
      )}
    </div>
  );
}
