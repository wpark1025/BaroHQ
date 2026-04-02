'use client';

import { useState } from 'react';
import { Cpu, Plug } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import ProviderPresetCards from '@/components/onboarding/ProviderPresetCards';
import { MCP_POPULAR_PRESETS } from '@/lib/constants';

export default function ProviderSetup() {
  const { providerSetup, setProviderSetup, mcpSetup, setMcpSetup } =
    useOnboardingStore();

  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    providerSetup.providers.map((p) => p.type)
  );
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>(
    {}
  );
  const [selectedMcpPresets, setSelectedMcpPresets] = useState<string[]>(
    mcpSetup.connections.map((c) => c.preset)
  );

  const handleToggleProvider = (type: string) => {
    setSelectedProviders((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleConfigChange = (type: string, key: string, value: string) => {
    const newConfigs = {
      ...configs,
      [type]: { ...(configs[type] || {}), [key]: value },
    };
    setConfigs(newConfigs);
    // Persist to store
    setProviderSetup({
      providers: selectedProviders.map((t) => ({
        id: t,
        type: t as never,
        name: t,
        enabled: true,
        priority: 0,
        status: 'active' as never,
        config: newConfigs[t] || {},
        modelMapping: {},
        pricing: { inputPer1k: 0, outputPer1k: 0, currency: 'USD' },
        lastHealthCheck: '',
        createdAt: new Date().toISOString(),
      })),
    });
  };

  const handleTestProvider = async (_type: string): Promise<boolean> => {
    // Simulate a test delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return Math.random() > 0.3;
  };

  const toggleMcpPreset = (presetId: string) => {
    setSelectedMcpPresets((prev) => {
      const next = prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId];
      setMcpSetup({
        connections: next.map((id) => ({
          id,
          preset: id,
          name: id,
          description: '',
          status: 'disconnected' as never,
          transport: 'sse' as const,
          config: {},
          tools: [],
          scope: 'global' as const,
          lastHealthCheck: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      });
      return next;
    });
  };

  return (
    <div className="space-y-10">
      {/* Provider Section */}
      <div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            Configure AI Providers
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Select which AI providers your agents will use. You need at least
            one.
          </p>
        </div>

        <ProviderPresetCards
          selectedProviders={selectedProviders}
          configs={configs}
          onToggle={handleToggleProvider}
          onConfigChange={handleConfigChange}
          onTest={handleTestProvider}
        />
      </div>

      {/* MCP Quick Connect */}
      <div className="pt-8 border-t border-slate-800">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Plug className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-100">
              MCP Quick Connect
            </h3>
          </div>
          <p className="text-slate-400 text-sm">
            Connect popular MCP servers to give agents access to external tools.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
          {MCP_POPULAR_PRESETS.map((preset) => {
            const isSelected = selectedMcpPresets.includes(preset.id);
            return (
              <button
                key={preset.id}
                onClick={() => toggleMcpPreset(preset.id)}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }
                `}
              >
                <span className="text-2xl block mb-1">{preset.icon}</span>
                <span className="text-sm font-bold text-slate-200 block">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
