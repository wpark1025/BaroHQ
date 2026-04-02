'use client';

import { useEffect } from 'react';
import { Users, ChevronDown, Sparkles } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import {
  EXECUTIVE_ROLES,
  EXECUTIVE_NAMES,
  EXECUTIVE_PERSONALITIES,
  DEFAULT_APPEARANCE,
  PROVIDER_PRESETS,
} from '@/lib/constants';
import PixelCharacter from '@/components/office/PixelCharacter';

function getRandomName(roleId: string): string {
  const names = EXECUTIVE_NAMES[roleId];
  if (!names || names.length === 0) return '';
  return names[Math.floor(Math.random() * names.length)];
}

function getModelsForProvider(providerId: string) {
  const preset = PROVIDER_PRESETS.find((p) => p.type === providerId);
  if (!preset) return null;
  return preset.models;
}

export default function ExecutiveHiring() {
  const { executives, setExecutives, updateExecutive } = useOnboardingStore();

  useEffect(() => {
    if (executives.length === 0) {
      setExecutives(
        EXECUTIVE_ROLES.map((role) => ({
          id: role.id,
          enabled: role.id === 'cto' || role.id === 'cos',
          name: getRandomName(role.id),
          role: role.role,
          personality: EXECUTIVE_PERSONALITIES[role.id] || '',
          providerId: '',
          modelTier: role.defaultModel,
          appearance: { ...DEFAULT_APPEARANCE },
        }))
      );
    }
  }, [executives.length, setExecutives]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Hire Your C-Suite
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          Toggle on the executives you need. You can always add more later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {executives.map((exec) => {
          const roleInfo = EXECUTIVE_ROLES.find((r) => r.id === exec.id);
          if (!roleInfo) return null;

          const providerModels = getModelsForProvider(exec.providerId);

          return (
            <div
              key={exec.id}
              className={`
                rounded-lg border-2 p-4 transition-all
                ${
                  exec.enabled
                    ? 'border-purple-500/50 bg-slate-800/80'
                    : 'border-slate-700/50 bg-slate-900/30 opacity-60'
                }
              `}
            >
              {/* Header with toggle */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <PixelCharacter
                      appearance={exec.appearance}
                      size={40}
                      animate={exec.enabled}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">
                      {roleInfo.abbrev}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {roleInfo.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateExecutive(exec.id, { enabled: !exec.enabled })
                  }
                  className={`
                    w-10 h-5 rounded-full transition-colors relative
                    ${exec.enabled ? 'bg-purple-600' : 'bg-slate-700'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform
                      ${exec.enabled ? 'translate-x-5' : 'translate-x-0.5'}
                    `}
                  />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                {roleInfo.description}
              </p>

              {/* Recommended model tier label */}
              <div className="flex items-center gap-1 mb-3">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-purple-400">
                  Recommended: {roleInfo.defaultModel}
                </span>
              </div>

              {exec.enabled && (
                <div className="space-y-2 pt-3 border-t border-slate-700">
                  <input
                    type="text"
                    value={exec.name}
                    onChange={(e) =>
                      updateExecutive(exec.id, { name: e.target.value })
                    }
                    placeholder={`${roleInfo.abbrev} Name`}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />

                  <textarea
                    value={exec.personality}
                    onChange={(e) =>
                      updateExecutive(exec.id, { personality: e.target.value })
                    }
                    placeholder="Personality note (optional)"
                    rows={2}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        value={exec.providerId}
                        onChange={(e) =>
                          updateExecutive(exec.id, {
                            providerId: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-purple-500 appearance-none pr-6"
                      >
                        <option value="">Provider</option>
                        {PROVIDER_PRESETS.map((p) => (
                          <option key={p.type} value={p.type}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select
                        value={exec.modelTier}
                        onChange={(e) =>
                          updateExecutive(exec.id, {
                            modelTier: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-purple-500 appearance-none pr-6"
                      >
                        {providerModels ? (
                          providerModels.map((m) => (
                            <option key={m.tier} value={m.tier}>
                              {m.tier.charAt(0).toUpperCase() + m.tier.slice(1)} — {m.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="opus">Opus (High)</option>
                            <option value="sonnet">Sonnet (Mid)</option>
                            <option value="haiku">Haiku (Low)</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
