'use client';

import { ProviderType } from '@/lib/types';

const MODEL_OPTIONS: Record<string, string[]> = {
  [ProviderType.ClaudeCode]: ['claude-opus-4-6', 'claude-sonnet-4-20250514', 'claude-haiku-3-5-20241022'],
  [ProviderType.ClaudeAPI]: ['claude-opus-4-6', 'claude-sonnet-4-20250514', 'claude-haiku-3-5-20241022'],
  [ProviderType.OpenAI]: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  [ProviderType.Gemini]: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'],
  [ProviderType.OpenRouter]: ['anthropic/claude-opus-4-6', 'anthropic/claude-sonnet-4-20250514', 'openai/gpt-4o', 'google/gemini-2.5-pro'],
  [ProviderType.Custom]: [],
};

const TIERS = ['high', 'mid', 'low'] as const;

interface ModelMappingEditorProps {
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
  providerType: ProviderType;
}

export function ModelMappingEditor({ mapping, onChange, providerType }: ModelMappingEditorProps) {
  const options = MODEL_OPTIONS[providerType] || [];

  const handleChange = (tier: string, value: string) => {
    onChange({ ...mapping, [tier]: value });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">Model Mapping</label>
      <p className="text-xs text-slate-500 mb-3">
        Map BaroHQ model tiers to provider-specific model identifiers.
      </p>
      <div className="space-y-2">
        {TIERS.map((tier) => (
          <div key={tier} className="flex items-center gap-3">
            <span className="w-16 text-xs text-slate-400 capitalize text-right">{tier}</span>
            <span className="text-slate-600 text-xs">&rarr;</span>
            {options.length > 0 ? (
              <select
                value={mapping[tier] || ''}
                onChange={(e) => handleChange(tier, e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select model...</option>
                {options.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={mapping[tier] || ''}
                onChange={(e) => handleChange(tier, e.target.value)}
                placeholder="model-id"
                className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
