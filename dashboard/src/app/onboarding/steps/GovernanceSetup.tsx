'use client';

import { useState } from 'react';
import { Shield, Eye, Upload, Check } from 'lucide-react';
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

export default function GovernanceSetup() {
  const { governanceSetup, setGovernanceSetup } = useOnboardingStore();
  const [previewRule, setPreviewRule] = useState<string | null>(null);

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
          customize these later.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RULE_TEMPLATES.map((template) => {
            const isEnabled = enabledIds.includes(template.id);
            const isPreviewing = previewRule === template.id;

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
                      setPreviewRule(isPreviewing ? null : template.id)
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {isPreviewing ? 'Hide Preview' : 'Preview Rules'}
                  </button>
                </div>

                {isPreviewing && (
                  <div className="border-t border-slate-700 p-4 bg-slate-900/50 max-h-48 overflow-y-auto">
                    <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                      {template.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Import Custom */}
        <div className="mt-6 text-center">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 transition-colors">
            <Upload className="w-4 h-4" />
            Import Custom Rules
          </button>
        </div>
      </div>
    </div>
  );
}
