'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useGovernanceStore } from '@/store/useGovernanceStore';
import { EnforcementLevel } from '@/lib/types';
import type { GovernanceRule } from '@/lib/types';

interface RuleEditorProps {
  rule: GovernanceRule;
  onClose: () => void;
}

export function RuleEditor({ rule, onClose }: RuleEditorProps) {
  const { updateRule } = useGovernanceStore();
  const [name, setName] = useState(rule.name);
  const [content, setContent] = useState(rule.content);
  const [enforcement, setEnforcement] = useState(rule.enforcement);
  const [changeNote, setChangeNote] = useState('');

  const handleSave = () => {
    const newVersion = rule.version + 1;
    updateRule(rule.id, {
      name,
      content,
      enforcement,
      version: newVersion,
      updatedAt: new Date().toISOString(),
      history: [
        ...rule.history,
        {
          version: newVersion,
          content,
          changedBy: 'user',
          changedAt: new Date().toISOString(),
          changeNote: changeNote || 'Updated rule',
        },
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="font-bold text-slate-100">Edit Rule: {rule.name}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Enforcement Level</label>
            <div className="flex gap-2">
              {Object.values(EnforcementLevel).map((level) => (
                <button
                  key={level}
                  onClick={() => setEnforcement(level)}
                  className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                    enforcement === level
                      ? level === EnforcementLevel.Block
                        ? 'bg-red-600 text-white'
                        : level === EnforcementLevel.Warn
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Content (Markdown) - v{rule.version + 1}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Change Note</label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="What changed in this version?"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">Cancel</button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save v{rule.version + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
