'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { useProviderStore } from '@/store/providerStore';
import { ProviderType, ProviderStatus } from '@/lib/types';
import { ModelMappingEditor } from '@/components/providers/ModelMappingEditor';

const PRESETS: { type: ProviderType; label: string; baseUrl: string }[] = [
  { type: ProviderType.ClaudeCode, label: 'Claude Code', baseUrl: 'https://api.anthropic.com' },
  { type: ProviderType.ClaudeAPI, label: 'Claude API', baseUrl: 'https://api.anthropic.com' },
  { type: ProviderType.Gemini, label: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com' },
  { type: ProviderType.OpenAI, label: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { type: ProviderType.OpenRouter, label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' },
  { type: ProviderType.Custom, label: 'Custom', baseUrl: '' },
];

interface AddProviderModalProps {
  onClose: () => void;
}

export function AddProviderModal({ onClose }: AddProviderModalProps) {
  const addProvider = useProviderStore((s) => s.addProvider);
  const [selectedPreset, setSelectedPreset] = useState<ProviderType | null>(null);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePresetSelect = (type: ProviderType) => {
    const preset = PRESETS.find((p) => p.type === type)!;
    setSelectedPreset(type);
    setName(preset.label);
    setBaseUrl(preset.baseUrl);
    setTestStatus('idle');
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTestStatus('idle');
    setTimeout(() => {
      setTesting(false);
      setTestStatus(apiKey ? 'success' : 'error');
    }, 1500);
  };

  const handleSubmit = () => {
    if (!name || !selectedPreset) return;
    addProvider({
      id: `prov-${Date.now()}`,
      type: selectedPreset,
      name,
      enabled: true,
      priority: 10,
      status: ProviderStatus.Active,
      config: { apiKey: apiKey ? '***' : undefined, baseUrl },
      modelMapping: mapping,
      pricing: { inputPer1k: 0, outputPer1k: 0, currency: 'USD' },
      lastHealthCheck: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">Add Provider</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Preset selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.type}
                  onClick={() => handlePresetSelect(preset.type)}
                  className={`p-3 rounded border text-sm font-medium transition-colors ${
                    selectedPreset === preset.type
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {selectedPreset && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Base URL</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <ModelMappingEditor
                mapping={mapping}
                onChange={setMapping}
                providerType={selectedPreset}
              />

              {/* Test connection */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-slate-600 text-sm rounded transition-colors disabled:opacity-50"
                >
                  {testing ? <Loader2 size={14} className="animate-spin" /> : null}
                  Test Connection
                </button>
                {testStatus === 'success' && (
                  <span className="flex items-center gap-1 text-xs text-green-400"><Check size={12} /> Connected</span>
                )}
                {testStatus === 'error' && (
                  <span className="text-xs text-red-400">Connection failed — check API key</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!name || !selectedPreset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded transition-colors"
          >
            Add Provider
          </button>
        </div>
      </div>
    </div>
  );
}
