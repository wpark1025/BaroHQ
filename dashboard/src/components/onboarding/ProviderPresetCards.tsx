'use client';

import { useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { PROVIDER_PRESETS, type ProviderPreset } from '@/lib/constants';

interface ProviderPresetCardsProps {
  selectedProviders: string[];
  configs: Record<string, Record<string, string>>;
  onToggle: (type: string) => void;
  onConfigChange: (type: string, key: string, value: string) => void;
  onTest?: (type: string) => Promise<boolean>;
}

export default function ProviderPresetCards({
  selectedProviders,
  configs,
  onToggle,
  onConfigChange,
  onTest,
}: ProviderPresetCardsProps) {
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  const handleTest = async (type: string) => {
    if (!onTest) return;
    setTesting(type);
    try {
      const success = await onTest(type);
      setTestResults((prev) => ({ ...prev, [type]: success }));
    } catch {
      setTestResults((prev) => ({ ...prev, [type]: false }));
    }
    setTesting(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {PROVIDER_PRESETS.map((preset: ProviderPreset) => {
        const isSelected = selectedProviders.includes(preset.type);
        const config = configs[preset.type] || {};
        const testResult = testResults[preset.type];

        return (
          <div
            key={preset.type}
            className={`
              rounded-lg border-2 p-4 transition-all cursor-pointer
              ${
                isSelected
                  ? 'border-blue-500 bg-slate-800/80'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }
            `}
            onClick={() => onToggle(preset.type)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{preset.icon}</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {preset.description}
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-600'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

            {isSelected && (
              <div
                className="space-y-2 mt-3 pt-3 border-t border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                {preset.configFields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-slate-400 mb-1 block">
                      {field.label}
                      {field.required && (
                        <span className="text-red-400 ml-0.5">*</span>
                      )}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={config[field.key] || ''}
                      onChange={(e) =>
                        onConfigChange(preset.type, field.key, e.target.value)
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleTest(preset.type)}
                    disabled={testing === preset.type}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-slate-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {testing === preset.type ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                  {testResult === true && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  )}
                  {testResult === false && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-[10px] text-slate-500 font-medium mb-1">
                    Available Models:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {preset.models.map((m) => (
                      <span
                        key={m.tier}
                        className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400"
                      >
                        {m.tier}: {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
