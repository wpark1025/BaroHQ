'use client';

import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useBudgetStore } from '@/store/budgetStore';

interface BudgetEntry {
  name: string;
  spent: number;
  limit: number;
}

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
  const budget = useBudgetStore((s) => s.budget);
  const monthlyLimit = budget.monthlyLimit || 0;
  const spent = budget.spent || 0;
  const pct = monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0;

  if (monthlyLimit === 0 && spent === 0 && budget.byProvider.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-200">Budget</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
          <DollarSign className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No budget data yet.</p>
          <p className="text-xs text-slate-600 mt-1">Budget tracking begins once agents start running tasks.</p>
        </div>
      </div>
    );
  }

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
            ${monthlyLimit.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-500">Spent This Month</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${spent.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">{pct.toFixed(0)}% used</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-500">Remaining</span>
          </div>
          <p className="text-xl font-bold text-slate-100">
            ${(monthlyLimit - spent).toLocaleString()}
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
      {budget.byProvider.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-300 mb-3">By Provider</h3>
          <div className="space-y-2.5">
            {budget.byProvider.map((entry) => (
              <BudgetBar key={entry.name} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* By Team */}
      {budget.byTeam.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-bold text-slate-300 mb-3">By Team</h3>
          <div className="space-y-2.5">
            {budget.byTeam.map((entry) => (
              <BudgetBar key={entry.name} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
