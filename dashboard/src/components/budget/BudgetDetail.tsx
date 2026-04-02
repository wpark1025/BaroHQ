'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Pause, Play, Shield, PieChart } from 'lucide-react';

interface BudgetBreakdown {
  label: string;
  spent: number;
  limit: number | null;
  color: string;
}

interface BudgetDetailProps {
  level: 'company' | 'project' | 'team' | 'agent';
  name: string;
  spent: number;
  limit: number | null;
  byProvider: Record<string, number>;
  alerts: { threshold: number; triggered: boolean }[];
  isPaused: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onOverride?: () => void;
  breakdown?: BudgetBreakdown[];
}

export default function BudgetDetail({
  level,
  name,
  spent,
  limit,
  byProvider,
  alerts,
  isPaused,
  onPause,
  onResume,
  onOverride,
  breakdown = [],
}: BudgetDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'timeline'>('overview');
  const ratio = limit ? spent / limit : 0;
  const barColor = ratio >= 0.9 ? 'bg-red-500' : ratio >= 0.75 ? 'bg-yellow-500' : ratio >= 0.5 ? 'bg-blue-500' : 'bg-green-500';

  const providerEntries = Object.entries(byProvider).sort((a, b) => b[1] - a[1]);
  const totalProviderSpend = providerEntries.reduce((s, [, v]) => s + v, 0);
  const providerColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-cyan-500'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{name}</h3>
            <p className="text-xs text-slate-500 capitalize">{level} Budget</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
            >
              <Play className="h-4 w-4" /> Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30"
            >
              <Pause className="h-4 w-4" /> Pause
            </button>
          )}
          <button
            onClick={onOverride}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700"
          >
            <Shield className="h-4 w-4" /> Override
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        {(['overview', 'providers', 'timeline'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-100">${spent.toFixed(2)}</p>
                {limit && <p className="text-sm text-slate-400">of ${limit.toFixed(2)} limit</p>}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <span className="text-slate-400">{limit ? `${(ratio * 100).toFixed(1)}%` : 'No limit'}</span>
              </div>
            </div>

            {limit && (
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
              </div>
            )}

            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    alert.triggered ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-800/50 text-slate-500'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {(alert.threshold * 100).toFixed(0)}% threshold
                  {alert.triggered ? ' — triggered' : ''}
                </div>
              ))}
            </div>

            {breakdown.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Breakdown</p>
                {breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-slate-400">${item.spent.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Spend by Provider</p>
            </div>

            <div className="flex h-4 rounded-full overflow-hidden bg-slate-800">
              {providerEntries.map(([provider, amount], i) => (
                <div
                  key={provider}
                  className={`${providerColors[i % providerColors.length]} transition-all`}
                  style={{ width: totalProviderSpend > 0 ? `${(amount / totalProviderSpend) * 100}%` : '0%' }}
                  title={`${provider}: $${amount.toFixed(2)}`}
                />
              ))}
            </div>

            <div className="space-y-2">
              {providerEntries.map(([provider, amount], i) => (
                <div key={provider} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${providerColors[i % providerColors.length]}`} />
                    <span className="text-slate-300">{provider}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-200">${amount.toFixed(2)}</span>
                    {totalProviderSpend > 0 && (
                      <span className="text-slate-500 ml-2 text-xs">
                        ({((amount / totalProviderSpend) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {providerEntries.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No provider usage data yet</p>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <TrendingUp className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">Spend timeline</p>
            <p className="text-xs mt-1">Historical data will populate as agents work</p>
          </div>
        )}
      </div>
    </div>
  );
}
