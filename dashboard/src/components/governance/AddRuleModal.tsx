'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useGovernanceStore } from '@/store/useGovernanceStore';
import { RuleCategory, EnforcementLevel } from '@/lib/types';
import type { GovernanceRule } from '@/lib/types';

interface AddRuleModalProps {
  onClose: () => void;
}

export function AddRuleModal({ onClose }: AddRuleModalProps) {
  const { addRule } = useGovernanceStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RuleCategory>(RuleCategory.Coding);
  const [enforcement, setEnforcement] = useState<EnforcementLevel>(EnforcementLevel.Warn);
  const [content, setContent] = useState('');
  const [scope, setScope] = useState<'global' | 'team'>('global');

  const handleSubmit = () => {
    if (!name.trim() || !content.trim()) return;

    const rule: GovernanceRule = {
      id: `rule-${Date.now()}`,
      name: name.trim(),
      category,
      status: 'active',
      enforcer: '',
      enforcerName: '',
      version: 1,
      content: content.trim(),
      contentFormat: 'markdown',
      tags: [],
      scope,
      scopeTeams: [],
      enforcement,
      history: [{
        version: 1,
        content: content.trim(),
        changedBy: 'user',
        changedAt: new Date().toISOString(),
        changeNote: 'Initial version',
      }],
      createdBy: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addRule(rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="font-bold text-slate-100">Add Governance Rule</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Rule Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Code Review Required"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RuleCategory)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {Object.values(RuleCategory).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Enforcement</label>
              <select
                value={enforcement}
                onChange={(e) => setEnforcement(e.target.value as EnforcementLevel)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {Object.values(EnforcementLevel).map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Scope</label>
            <div className="flex gap-2">
              {(['global', 'team'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                    scope === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Rule Content (Markdown) *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="## Rule Title\n\nDescribe the rule..."
              rows={8}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !content.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded transition-colors disabled:opacity-40"
          >
            Add Rule
          </button>
        </div>
      </div>
    </div>
  );
}
