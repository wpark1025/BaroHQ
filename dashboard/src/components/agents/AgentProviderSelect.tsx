'use client';

import { ChevronDown } from 'lucide-react';
import { useProviderStore } from '@/store/useProviderStore';
import { PROVIDER_PRESETS } from '@/lib/constants';

interface AgentProviderSelectProps {
  providerId: string;
  modelTier: string;
  onProviderChange: (providerId: string) => void;
  onModelTierChange: (tier: string) => void;
}

export default function AgentProviderSelect({
  providerId,
  modelTier,
  onProviderChange,
  onModelTierChange,
}: AgentProviderSelectProps) {
  const { providers } = useProviderStore();

  const enabledProviders =
    providers.length > 0
      ? providers.filter((p) => p.enabled)
      : PROVIDER_PRESETS.map((p) => ({
          id: p.type,
          name: p.name,
          type: p.type,
          models: p.models,
        }));

  const selectedProvider = PROVIDER_PRESETS.find((p) => p.type === providerId);

  const selectedModel = selectedProvider?.models.find(
    (m) => m.tier === modelTier
  );

  const costEstimate = selectedModel
    ? `~$${((selectedModel.inputCost + selectedModel.outputCost) / 2).toFixed(2)}/1k tokens`
    : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Provider
          </label>
          <div className="relative">
            <select
              value={providerId}
              onChange={(e) => onProviderChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none pr-8"
            >
              <option value="">Select provider...</option>
              {enabledProviders.map((p) => (
                <option key={p.id} value={p.id || p.type}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Model Tier
          </label>
          <div className="flex gap-1.5">
            {['opus', 'sonnet', 'haiku'].map((tier) => (
              <button
                key={tier}
                onClick={() => onModelTierChange(tier)}
                className={`
                  flex-1 px-2 py-2 rounded text-xs font-medium transition-colors text-center
                  ${
                    modelTier === tier
                      ? tier === 'opus'
                        ? 'bg-amber-600 text-white'
                        : tier === 'sonnet'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }
                `}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model info */}
      {selectedProvider && selectedModel && (
        <div className="flex items-center gap-3 text-[11px] text-slate-500 bg-slate-800/50 px-3 py-2 rounded">
          <span>
            Model: <span className="text-slate-400">{selectedModel.name}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Input: <span className="text-slate-400">${selectedModel.inputCost}/1k</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            Output: <span className="text-slate-400">${selectedModel.outputCost}/1k</span>
          </span>
          {costEstimate && (
            <>
              <span className="text-slate-700">|</span>
              <span className="text-amber-500">{costEstimate}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
