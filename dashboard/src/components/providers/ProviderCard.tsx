'use client';

import { Zap, Settings, FlaskConical, Power } from 'lucide-react';
import { Provider, ProviderStatus, ProviderType } from '@/lib/types';
import { useProviderStore } from '@/store/providerStore';

const STATUS_DOT: Record<string, string> = {
  [ProviderStatus.Active]: 'bg-green-400',
  [ProviderStatus.Degraded]: 'bg-yellow-400',
  [ProviderStatus.Down]: 'bg-red-400',
  [ProviderStatus.Disabled]: 'bg-slate-500',
};

const STATUS_LABEL: Record<string, string> = {
  [ProviderStatus.Active]: 'Active',
  [ProviderStatus.Degraded]: 'Degraded',
  [ProviderStatus.Down]: 'Down',
  [ProviderStatus.Disabled]: 'Disabled',
};

const TYPE_BADGE: Record<string, string> = {
  [ProviderType.ClaudeCode]: 'bg-purple-500/10 text-purple-400',
  [ProviderType.ClaudeAPI]: 'bg-blue-500/10 text-blue-400',
  [ProviderType.OpenAI]: 'bg-green-500/10 text-green-400',
  [ProviderType.Gemini]: 'bg-cyan-500/10 text-cyan-400',
  [ProviderType.OpenRouter]: 'bg-orange-500/10 text-orange-400',
  [ProviderType.Custom]: 'bg-slate-500/10 text-slate-400',
};

interface ProviderCardProps {
  provider: Provider;
  onTest: () => void;
}

export function ProviderCard({ provider, onTest }: ProviderCardProps) {
  const toggleProvider = useProviderStore((s) => s.toggleProvider);

  const models = Object.entries(provider.modelMapping).filter(([, v]) => v);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-200">{provider.name}</h3>
              <span className={`px-1.5 py-0.5 text-[10px] rounded ${TYPE_BADGE[provider.type]}`}>
                {provider.type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[provider.status]} animate-pulse-dot`} />
              <span className="text-[10px] text-slate-500">{STATUS_LABEL[provider.status]}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleProvider(provider.id)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            provider.enabled ? 'bg-blue-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              provider.enabled ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Model mapping */}
      <div className="mb-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Model Mapping</p>
        <div className="space-y-1">
          {models.map(([tier, model]) => (
            <div key={tier} className="flex items-center justify-between text-xs">
              <span className="text-slate-400 capitalize">{tier}</span>
              <span className="text-slate-300 font-mono text-[11px]">{model}</span>
            </div>
          ))}
          {models.length === 0 && (
            <p className="text-xs text-slate-600">No models configured</p>
          )}
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-[10px] text-slate-500">Pricing (in/out)</p>
          <p className="text-xs text-slate-300">
            ${provider.pricing.inputPer1k}/1k &mdash; ${provider.pricing.outputPer1k}/1k
          </p>
        </div>
        <div className="bg-slate-800/50 rounded p-2">
          <p className="text-[10px] text-slate-500">Priority</p>
          <p className="text-xs text-slate-300">#{provider.priority}</p>
        </div>
      </div>

      {/* Health + actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <span className="text-[10px] text-slate-500">
          Last check: {provider.lastHealthCheck ? new Date(provider.lastHealthCheck).toLocaleString() : 'Never'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onTest}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <FlaskConical size={10} />
            Test
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors">
            <Settings size={10} />
            Configure
          </button>
        </div>
      </div>
    </div>
  );
}
