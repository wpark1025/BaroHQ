'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useGovernanceStore } from '@/store/useGovernanceStore';
import { GovernancePanel } from '@/components/governance/GovernancePanel';
import { RuleCategoryView } from '@/components/governance/RuleCategoryView';
import { AddRuleModal } from '@/components/governance/AddRuleModal';
import { RuleEditor } from '@/components/governance/RuleEditor';
import { RuleVersionHistory } from '@/components/governance/RuleVersionHistory';
import { RuleCategory } from '@/lib/types';

export default function GovernancePage() {
  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [versionRuleId, setVersionRuleId] = useState<string | null>(null);
  const {
    activeCategory, setActiveCategory, searchQuery, setSearchQuery,
    getFilteredRules, getRuleById,
  } = useGovernanceStore();

  const rules = getFilteredRules();
  const editingRule = editingRuleId ? getRuleById(editingRuleId) : null;
  const versionRule = versionRuleId ? getRuleById(versionRuleId) : null;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Governance</h1>
            <p className="text-sm text-slate-400 mt-1">{rules.length} rule{rules.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAddRule(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
          >
            <Plus size={16} />
            Add Rule
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category tabs */}
        <RuleCategoryView
          activeCategory={activeCategory}
          onCategoryChange={(c) => setActiveCategory(c as RuleCategory | 'all')}
        />

        {/* Rules list */}
        <div className="mt-6">
          <GovernancePanel
            rules={rules}
            onEdit={(id) => setEditingRuleId(id)}
            onViewHistory={(id) => setVersionRuleId(id)}
          />
        </div>
      </div>

      {showAddRule && <AddRuleModal onClose={() => setShowAddRule(false)} />}

      {editingRule && (
        <RuleEditor rule={editingRule} onClose={() => setEditingRuleId(null)} />
      )}

      {versionRule && (
        <RuleVersionHistory rule={versionRule} onClose={() => setVersionRuleId(null)} />
      )}
    </div>
  );
}
