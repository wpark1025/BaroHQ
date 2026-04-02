'use client';

import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetEntry {
  name: string;
  spent: number;
  limit: number;
}

const DEMO_BUDGET = {
  monthlyLimit: 5000,
  spent: 2847,
  byProvider: [
    { name: 'Claude API', spent: 1420, limit: 2500 },
    { name: 'OpenAI', spent: 890, limit: 1500 },
    { name: 'Gemini', spent: 537, limit: 1000 },
  ] as BudgetEntry[],
  byTeam: [
    { name: 'Engineering', spent: 1890, limit: 3000 },
    { name: 'Design', spent: 620, limit: 1000 },
    { name: 'Executive', spent: 337, limit: 1000 },
  ] as BudgetEntry[],
};

function BudgetBar({ entry }: { entry: BudgetEntry }) {
  const pct = entry.limit > 0 ? (entry.spent / entry.limit) * 100 : 0;
  const color =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-28 truncate">{entry.name}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 w-20 text-right">
        ${entry.spent.toLocaleString()} / ${entry.limit.toLocaleString()}
      </span>
    </div>
  );
}

export function BudgetPanel() {
  const pct = (DEMO_BUDGET.spent / DEMO_BUDGET.monthlyLimit) * 100;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-200">Budget</h2>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-500">Monthly Limit</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${DEMO_BUDGET.monthlyLimit.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-500">Spent This Month</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${DEMO_BUDGET.spent.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">{pct.toFixed(0)}% used</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-500">Remaining</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${(DEMO_BUDGET.monthlyLimit - DEMO_BUDGET.spent).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Monthly Usage</span>
          <span className="text-sm font-bold text-slate-100">{pct.toFixed(0)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* By Provider */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-bold text-slate-300 mb-3">By Provider</h3>
        <div className="space-y-2.5">
          {DEMO_BUDGET.byProvider.map((entry) => (
            <BudgetBar key={entry.name} entry={entry} />
          ))}
        </div>
      </div>

      {/* By Team */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-bold text-slate-300 mb-3">By Team</h3>
        <div className="space-y-2.5">
          {DEMO_BUDGET.byTeam.map((entry) => (
            <BudgetBar key={entry.name} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
