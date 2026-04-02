'use client';

import { RuleCategory } from '@/lib/types';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '📋' },
  { key: RuleCategory.Coding, label: 'Coding', icon: '💻' },
  { key: RuleCategory.Design, label: 'Design', icon: '🎨' },
  { key: RuleCategory.Legal, label: 'Legal', icon: '⚖️' },
  { key: RuleCategory.Security, label: 'Security', icon: '🔒' },
  { key: RuleCategory.Process, label: 'Process', icon: '📊' },
  { key: RuleCategory.Communication, label: 'Communication', icon: '💬' },
  { key: RuleCategory.Custom, label: 'Custom', icon: '⚙️' },
];

interface RuleCategoryViewProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function RuleCategoryView({ activeCategory, onCategoryChange }: RuleCategoryViewProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onCategoryChange(cat.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeCategory === cat.key
              ? 'bg-slate-800 text-slate-100'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <span className="text-sm">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
