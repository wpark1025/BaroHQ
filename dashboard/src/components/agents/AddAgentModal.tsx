'use client';

import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import type { AgentAppearance } from '@/lib/types';
import { AgentStatus } from '@/lib/types';
import { useAgentStore } from '@/store/useAgentStore';
import {
  DEFAULT_APPEARANCE,
  HAIR_COLORS,
  SHIRT_COLORS,
  PANTS_COLORS,
  SKIN_COLORS,
} from '@/lib/constants';
import PixelCharacter from '@/components/office/PixelCharacter';
import AgentRolePicker from '@/components/onboarding/AgentRolePicker';
import AgentProviderSelect from './AgentProviderSelect';

interface AddAgentModalProps {
  teamId: string;
  onClose: () => void;
}

function ColorRow({
  label,
  colors,
  selected,
  onChange,
}: {
  label: string;
  colors: string[];
  selected: string;
  onChange: (c: string) => void;
}) {
  return (
    <div>
      <span className="text-[10px] text-slate-500 mb-1 block">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-5 h-5 rounded-sm border ${
              selected === c ? 'border-white scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AddAgentModal({ teamId, onClose }: AddAgentModalProps) {
  const { addAgent } = useAgentStore();
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [appearance, setAppearance] = useState<AgentAppearance>({
    ...DEFAULT_APPEARANCE,
  });
  const [providerId, setProviderId] = useState('');
  const [modelTier, setModelTier] = useState('sonnet');
  const [testing, setTesting] = useState(false);

  const updateAppearance = (key: keyof AgentAppearance, value: string) => {
    setAppearance((prev) => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    setTesting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTesting(false);
  };

  const handleCreate = () => {
    if (!name || !roleId) return;

    addAgent({
      id: `agent-${Date.now()}`,
      name,
      role: roleName || roleId,
      status: AgentStatus.Idle,
      appearance,
      position: { x: 400, y: 400 },
      providerId,
      modelTier,
      mcpConnections: [],
      teamId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100">New Agent</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Preview + Name */}
          <div className="flex items-start gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col items-center">
              <PixelCharacter appearance={appearance} size={64} />
              <p className="text-[10px] text-slate-600 mt-1">Preview</p>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Agent name"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ColorRow
                  label="Hair"
                  colors={HAIR_COLORS}
                  selected={appearance.hair}
                  onChange={(c) => updateAppearance('hair', c)}
                />
                <ColorRow
                  label="Skin"
                  colors={SKIN_COLORS}
                  selected={appearance.skin}
                  onChange={(c) => updateAppearance('skin', c)}
                />
                <ColorRow
                  label="Shirt"
                  colors={SHIRT_COLORS}
                  selected={appearance.shirt}
                  onChange={(c) => updateAppearance('shirt', c)}
                />
                <ColorRow
                  label="Pants"
                  colors={PANTS_COLORS}
                  selected={appearance.pants}
                  onChange={(c) => updateAppearance('pants', c)}
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Role <span className="text-red-400">*</span>
            </label>
            <AgentRolePicker
              selectedRole={roleId}
              onSelect={(id, name, tier) => {
                setRoleId(id);
                setRoleName(name);
                setModelTier(tier);
              }}
            />
          </div>

          {/* Provider & Model */}
          <AgentProviderSelect
            providerId={providerId}
            modelTier={modelTier}
            onProviderChange={setProviderId}
            onModelTierChange={setModelTier}
          />

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={testing || !providerId}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium text-slate-300 transition-colors disabled:opacity-40"
          >
            <Zap className="w-3 h-3" />
            {testing ? 'Testing...' : 'Test Agent'}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name || !roleId}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
