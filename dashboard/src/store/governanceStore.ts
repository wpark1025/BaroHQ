import { create } from 'zustand';
import { GovernanceRule, RuleCategory, EnforcementLevel } from '@/lib/types';

const MOCK_RULES: GovernanceRule[] = [
  {
    id: 'rule-1', name: 'Code Review Required', category: RuleCategory.Coding,
    status: 'active', enforcer: 'agent-lead', enforcerName: 'Lead Engineer',
    version: 3, content: '## Code Review Policy\n\nAll code changes must be reviewed by at least one peer before merging.\n\n### Requirements\n- PR must have at least 1 approval\n- All CI checks must pass\n- No unresolved comments\n- Branch must be up to date with main',
    contentFormat: 'markdown', tags: ['code-quality', 'process'],
    scope: 'global', scopeTeams: [], enforcement: EnforcementLevel.Block,
    history: [
      { version: 1, content: 'All PRs need review.', changedBy: 'admin', changedAt: '2026-01-01T00:00:00Z', changeNote: 'Initial rule' },
      { version: 2, content: 'All code changes must be reviewed...', changedBy: 'admin', changedAt: '2026-02-01T00:00:00Z', changeNote: 'Added CI requirement' },
      { version: 3, content: '## Code Review Policy\n\nAll code changes must be reviewed...', changedBy: 'lead', changedAt: '2026-03-01T00:00:00Z', changeNote: 'Added branch requirement' },
    ],
    createdBy: 'admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'rule-2', name: 'No Hardcoded Secrets', category: RuleCategory.Security,
    status: 'active', enforcer: 'agent-security', enforcerName: 'Security Agent',
    version: 1, content: '## Secret Management\n\nNo API keys, passwords, or tokens may be committed to source control.\n\n### Use\n- Environment variables\n- Secret managers (Vault, AWS Secrets Manager)\n- `.env` files (gitignored)',
    contentFormat: 'markdown', tags: ['security', 'secrets'],
    scope: 'global', scopeTeams: [], enforcement: EnforcementLevel.Block,
    history: [
      { version: 1, content: '## Secret Management...', changedBy: 'admin', changedAt: '2026-01-01T00:00:00Z', changeNote: 'Initial rule' },
    ],
    createdBy: 'admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-3', name: 'Accessibility Standards', category: RuleCategory.Design,
    status: 'active', enforcer: 'agent-design', enforcerName: 'Design Agent',
    version: 2, content: '## WCAG 2.1 AA Compliance\n\nAll UI components must meet WCAG 2.1 AA standards.\n\n- Color contrast ratio >= 4.5:1\n- All images have alt text\n- Keyboard navigable\n- Screen reader compatible',
    contentFormat: 'markdown', tags: ['accessibility', 'design'],
    scope: 'global', scopeTeams: [], enforcement: EnforcementLevel.Warn,
    history: [
      { version: 1, content: 'Follow WCAG 2.1 guidelines.', changedBy: 'design-lead', changedAt: '2026-01-15T00:00:00Z', changeNote: 'Initial' },
      { version: 2, content: '## WCAG 2.1 AA Compliance...', changedBy: 'design-lead', changedAt: '2026-02-20T00:00:00Z', changeNote: 'Expanded requirements' },
    ],
    createdBy: 'design-lead', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'rule-4', name: 'Data Retention Policy', category: RuleCategory.Legal,
    status: 'active', enforcer: 'agent-legal', enforcerName: 'Legal Agent',
    version: 1, content: '## Data Retention\n\nUser data must be deleted within 30 days of account closure.\nLogs retained for 90 days maximum.\nPII must be encrypted at rest.',
    contentFormat: 'markdown', tags: ['legal', 'data', 'privacy'],
    scope: 'global', scopeTeams: [], enforcement: EnforcementLevel.Block,
    history: [
      { version: 1, content: '## Data Retention...', changedBy: 'admin', changedAt: '2026-01-20T00:00:00Z', changeNote: 'Initial rule' },
    ],
    createdBy: 'admin', createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'rule-5', name: 'Deployment Checklist', category: RuleCategory.Process,
    status: 'inactive', enforcer: 'agent-ops', enforcerName: 'Ops Agent',
    version: 1, content: '## Pre-Deployment\n\n- [ ] All tests pass\n- [ ] Staging verified\n- [ ] Rollback plan documented\n- [ ] Monitoring alerts configured',
    contentFormat: 'markdown', tags: ['ops', 'deployment'],
    scope: 'team', scopeTeams: ['team-eng'], enforcement: EnforcementLevel.Warn,
    history: [
      { version: 1, content: '## Pre-Deployment...', changedBy: 'ops-lead', changedAt: '2026-02-10T00:00:00Z', changeNote: 'Initial rule' },
    ],
    createdBy: 'ops-lead', createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
  },
];

interface GovernanceStore {
  rules: GovernanceRule[];
  selectedRuleId: string | null;
  activeCategory: RuleCategory | 'all';
  searchQuery: string;
  setSelectedRule: (id: string | null) => void;
  setActiveCategory: (c: RuleCategory | 'all') => void;
  setSearchQuery: (q: string) => void;
  addRule: (r: GovernanceRule) => void;
  updateRule: (id: string, updates: Partial<GovernanceRule>) => void;
  toggleRule: (id: string) => void;
  getRuleById: (id: string) => GovernanceRule | undefined;
  getFilteredRules: () => GovernanceRule[];
}

export const useGovernanceStore = create<GovernanceStore>((set, get) => ({
  rules: MOCK_RULES,
  selectedRuleId: null,
  activeCategory: 'all',
  searchQuery: '',
  setSelectedRule: (id) => set({ selectedRuleId: id }),
  setActiveCategory: (c) => set({ activeCategory: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  addRule: (r) => set((state) => ({ rules: [...state.rules, r] })),
  updateRule: (id, updates) =>
    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  toggleRule: (id) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
      ),
    })),
  getRuleById: (id) => get().rules.find((r) => r.id === id),
  getFilteredRules: () => {
    const { rules, activeCategory, searchQuery } = get();
    let result = [...rules];
    if (activeCategory !== 'all') result = result.filter((r) => r.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q) || r.content.toLowerCase().includes(q));
    }
    return result;
  },
}));
