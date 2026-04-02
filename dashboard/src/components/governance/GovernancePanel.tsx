'use client';

import { Shield, Edit, History, ToggleLeft, ToggleRight } from 'lucide-react';
import type { GovernanceRule } from '@/lib/types';
import { EnforcementLevel, RuleCategory } from '@/lib/types';
import { useGovernanceStore } from '@/store/governanceStore';

const CATEGORY_COLORS: Record<RuleCategory, string> = {
  [RuleCategory.Coding]: 'text-blue-400 bg-blue-500/10',
  [RuleCategory.Design]: 'text-pink-400 bg-pink-500/10',
  [RuleCategory.Legal]: 'text-amber-400 bg-amber-500/10',
  [RuleCategory.Security]: 'text-red-400 bg-red-500/10',
  [RuleCategory.Process]: 'text-emerald-400 bg-emerald-500/10',
  [RuleCategory.Communication]: 'text-cyan-400 bg-cyan-500/10',
  [RuleCategory.Custom]: 'text-slate-400 bg-slate-500/10',
};

const ENFORCEMENT_BADGES: Record<EnforcementLevel, { color: string; label: string }> = {
  [EnforcementLevel.Block]: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Block' },
  [EnforcementLevel.Warn]: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Warn' },
  [EnforcementLevel.Log]: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Log' },
  [EnforcementLevel.Off]: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Off' },
};

interface GovernancePanelProps {
  rules: GovernanceRule[];
  onEdit: (id: string) => void;
  onViewHistory: (id: string) => void;
}

export function GovernancePanel({ rules, onEdit, onViewHistory }: GovernancePanelProps) {
  const { toggleRule } = useGovernanceStore();

  return (
    <div className="space-y-3">
      {rules.map((rule) => {
        const catColor = CATEGORY_COLORS[rule.category] || CATEGORY_COLORS[RuleCategory.Custom];
        const enfBadge = ENFORCEMENT_BADGES[rule.enforcement];
        const isActive = rule.status === 'active';

        return (
          <div
            key={rule.id}
            className={`bg-slate-900 border rounded-lg p-4 transition-all ${
              isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${catColor.split(' ')[0]}`} />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">{rule.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${catColor}`}>
                      {rule.category}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${enfBadge.color}`}>
                      {enfBadge.label}
                    </span>
                    <span className="text-[10px] text-slate-600">v{rule.version}</span>
                    {rule.scope === 'team' && (
                      <span className="text-[10px] text-slate-600 bg-slate-800 px-1 rounded">Team scope</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                    {rule.content.replace(/^#+ /gm, '').substring(0, 120)}...
                  </p>
                  {rule.enforcerName && (
                    <p className="text-[10px] text-slate-600 mt-1">
                      Enforced by: {rule.enforcerName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onViewHistory(rule.id)}
                  title="Version history"
                  className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEdit(rule.id)}
                  title="Edit rule"
                  className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleRule(rule.id)}
                  title={isActive ? 'Deactivate' : 'Activate'}
                  className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {isActive ? (
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {rules.length === 0 && (
        <div className="py-12 text-center">
          <Shield className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No rules found.</p>
        </div>
      )}
    </div>
  );
}
