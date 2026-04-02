'use client';

import { useState, useRef, useCallback } from 'react';
import { Shield, Eye, Upload, Check, Plus, X, FileUp, ChevronDown } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { RuleCategory, EnforcementLevel } from '@/lib/types';
import type { GovernanceRule } from '@/lib/types';

const RULE_TEMPLATES: {
  id: string;
  name: string;
  category: RuleCategory;
  icon: string;
  description: string;
  content: string;
}[] = [
  {
    id: 'coding-standards',
    name: 'Coding Standards',
    category: RuleCategory.Coding,
    icon: '💻',
    description:
      'Enforce consistent code style, naming conventions, and best practices across all engineering agents.',
    content: `# Coding Standards

## General
- Use TypeScript strict mode for all projects
- Follow the repository's existing code style
- Write meaningful variable and function names
- Keep functions under 50 lines where possible

## Code Quality
- All public functions must have JSDoc comments
- No \`any\` types unless explicitly justified
- Use early returns to reduce nesting
- Prefer immutable data patterns

## Testing
- Write unit tests for all business logic
- Aim for 80%+ code coverage on new code
- Use descriptive test names that explain the expected behavior

## Git
- Write clear, descriptive commit messages
- Keep commits atomic and focused
- Reference issue numbers in commits`,
  },
  {
    id: 'design-standards',
    name: 'Design Standards',
    category: RuleCategory.Design,
    icon: '🎨',
    description:
      'Maintain consistent UI/UX patterns, component usage, and accessibility standards.',
    content: `# Design Standards

## Visual Consistency
- Follow the established design system tokens
- Use the approved color palette only
- Maintain consistent spacing using 4px/8px grid
- Typography: use approved font families and sizes

## Accessibility
- All interactive elements must be keyboard accessible
- Maintain WCAG 2.1 AA contrast ratios
- Include alt text for all images
- Use semantic HTML elements

## Components
- Prefer existing component library components
- Document new components with usage examples
- Components must support dark and light themes`,
  },
  {
    id: 'legal-checklist',
    name: 'Legal Checklist',
    category: RuleCategory.Legal,
    icon: '⚖️',
    description:
      'Ensure compliance with licensing, data privacy, and regulatory requirements.',
    content: `# Legal Checklist

## Licensing
- Verify license compatibility before adding dependencies
- No GPL-licensed code in proprietary projects
- Maintain NOTICE file for all third-party attributions

## Data Privacy
- Never log personally identifiable information (PII)
- Implement data retention policies
- Honor data deletion requests within 30 days
- Encrypt sensitive data at rest and in transit

## Compliance
- Follow GDPR requirements for EU user data
- Include cookie consent where required
- Maintain audit trail for data access`,
  },
  {
    id: 'security-policy',
    name: 'Security Policy',
    category: RuleCategory.Security,
    icon: '🔒',
    description:
      'Enforce security best practices for code, infrastructure, and data handling.',
    content: `# Security Policy

## Code Security
- Never commit secrets, API keys, or credentials
- Use parameterized queries to prevent SQL injection
- Sanitize all user input
- Implement rate limiting on all API endpoints

## Authentication
- Use strong password hashing (bcrypt/argon2)
- Implement MFA where possible
- Token expiration: access 15min, refresh 7 days
- Rotate secrets on a regular schedule

## Infrastructure
- Keep all dependencies up to date
- Run security audits weekly
- Use least-privilege access for all services
- Enable logging and monitoring for security events`,
  },
];

const CATEGORY_OPTIONS: { value: RuleCategory; label: string }[] = [
  { value: RuleCategory.Coding, label: 'Coding' },
  { value: RuleCategory.Design, label: 'Design' },
  { value: RuleCategory.Legal, label: 'Legal' },
  { value: RuleCategory.Security, label: 'Security' },
  { value: RuleCategory.Process, label: 'Process' },
  { value: RuleCategory.Communication, label: 'Communication' },
  { value: RuleCategory.Custom, label: 'Custom' },
];

export default function GovernanceSetup() {
  const { governanceSetup, setGovernanceSetup } = useOnboardingStore();
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importName, setImportName] = useState('');
  const [importCategory, setImportCategory] = useState<RuleCategory>(RuleCategory.Custom);
  const [importContent, setImportContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enabledIds = governanceSetup.rules.map((r) => r.id);

  const toggleTemplate = (templateId: string) => {
    const template = RULE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    if (enabledIds.includes(templateId)) {
      setGovernanceSetup({
        rules: governanceSetup.rules.filter((r) => r.id !== templateId),
      });
    } else {
      const rule: GovernanceRule = {
        id: template.id,
        name: template.name,
        category: template.category,
        status: 'active',
        enforcer: '',
        enforcerName: '',
        version: 1,
        content: template.content,
        contentFormat: 'markdown',
        tags: [],
        scope: 'global',
        scopeTeams: [],
        enforcement: EnforcementLevel.Warn,
        history: [],
        createdBy: 'onboarding',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGovernanceSetup({
        rules: [...governanceSetup.rules, rule],
      });
    }
  };

  const updateRuleContent = useCallback(
    (ruleId: string, newContent: string) => {
      setGovernanceSetup({
        rules: governanceSetup.rules.map((r) =>
          r.id === ruleId
            ? { ...r, content: newContent, updatedAt: new Date().toISOString() }
            : r
        ),
      });
    },
    [governanceSetup.rules, setGovernanceSetup]
  );

  const handleImportSubmit = () => {
    if (!importName.trim() || !importContent.trim()) return;

    const rule: GovernanceRule = {
      id: `custom-${Date.now()}`,
      name: importName.trim(),
      category: importCategory,
      status: 'active',
      enforcer: '',
      enforcerName: '',
      version: 1,
      content: importContent.trim(),
      contentFormat: 'markdown',
      tags: [],
      scope: 'global',
      scopeTeams: [],
      enforcement: EnforcementLevel.Warn,
      history: [],
      createdBy: 'onboarding',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGovernanceSetup({
      rules: [...governanceSetup.rules, rule],
    });

    setImportName('');
    setImportCategory(RuleCategory.Custom);
    setImportContent('');
    setShowImportModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setImportContent(text);
        // Use the filename (without extension) as the default name
        const nameWithoutExt = file.name.replace(/\.md$/, '').replace(/[-_]/g, ' ');
        if (!importName.trim()) {
          setImportName(nameWithoutExt);
        }
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCustomRule = (ruleId: string) => {
    setGovernanceSetup({
      rules: governanceSetup.rules.filter((r) => r.id !== ruleId),
    });
  };

  // Separate template-based rules from custom-imported rules
  const templateIds = RULE_TEMPLATES.map((t) => t.id);
  const customRules = governanceSetup.rules.filter(
    (r) => !templateIds.includes(r.id)
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Set Up Governance
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          Enable built-in rule templates to guide your AI agents. You can
          expand and edit each rule below.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RULE_TEMPLATES.map((template) => {
            const isEnabled = enabledIds.includes(template.id);
            const isExpanded = expandedRule === template.id;
            const currentRule = governanceSetup.rules.find(
              (r) => r.id === template.id
            );

            return (
              <div
                key={template.id}
                className={`
                  rounded-lg border-2 overflow-hidden transition-all
                  ${
                    isEnabled
                      ? 'border-amber-500/50 bg-slate-800/80'
                      : 'border-slate-700 bg-slate-900/50'
                  }
                `}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{template.icon}</span>
                      <h3 className="font-bold text-sm text-slate-100">
                        {template.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleTemplate(template.id)}
                      className={`
                        w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors
                        ${
                          isEnabled
                            ? 'bg-amber-600 border-amber-600'
                            : 'border-slate-600 hover:border-slate-500'
                        }
                      `}
                    >
                      {isEnabled && <Check className="w-3 h-3 text-white" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {template.description}
                  </p>

                  <button
                    onClick={() =>
                      setExpandedRule(isExpanded ? null : template.id)
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {isExpanded ? 'Collapse' : isEnabled ? 'View & Edit' : 'Preview Rules'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700 p-4 bg-slate-900/50">
                    {isEnabled && currentRule ? (
                      <textarea
                        value={currentRule.content}
                        onChange={(e) =>
                          updateRuleContent(template.id, e.target.value)
                        }
                        className="w-full h-48 bg-slate-950 border border-slate-700 rounded p-3 text-[11px] text-slate-300 font-mono leading-relaxed resize-y focus:outline-none focus:border-amber-500"
                      />
                    ) : (
                      <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                        {template.content}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom imported rules */}
        {customRules.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-300 mb-3">
              Custom Rules
            </h3>
            <div className="space-y-3">
              {customRules.map((rule) => {
                const isExpanded = expandedRule === rule.id;
                return (
                  <div
                    key={rule.id}
                    className="rounded-lg border-2 border-amber-500/50 bg-slate-800/80 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📄</span>
                          <div>
                            <h3 className="font-bold text-sm text-slate-100">
                              {rule.name}
                            </h3>
                            <span className="text-[10px] text-slate-500 capitalize">
                              {rule.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCustomRule(rule.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Remove rule"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          setExpandedRule(isExpanded ? null : rule.id)
                        }
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        {isExpanded ? 'Collapse' : 'View & Edit'}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-slate-700 p-4 bg-slate-900/50">
                        <textarea
                          value={rule.content}
                          onChange={(e) =>
                            updateRuleContent(rule.id, e.target.value)
                          }
                          className="w-full h-48 bg-slate-950 border border-slate-700 rounded p-3 text-[11px] text-slate-300 font-mono leading-relaxed resize-y focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Import Custom */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Custom Rule
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Import Custom Rule
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Rule Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  placeholder="My Custom Rule"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={importCategory}
                    onChange={(e) =>
                      setImportCategory(e.target.value as RuleCategory)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500 appearance-none pr-8"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-400">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <FileUp className="w-3 h-3" />
                    Upload .md file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <textarea
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value)}
                  placeholder="Paste your rule content here (Markdown supported)..."
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-xs text-slate-300 font-mono leading-relaxed resize-y focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-700">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!importName.trim() || !importContent.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
