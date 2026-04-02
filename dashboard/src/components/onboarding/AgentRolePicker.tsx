'use client';

import { Check } from 'lucide-react';

interface RoleOption {
  id: string;
  name: string;
  description: string;
  recommendedTier: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'team_lead',
    name: 'Team Lead',
    description: 'Manages team priorities, delegates tasks, and reviews output.',
    recommendedTier: 'sonnet',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    description: 'Writes code, builds features, and fixes bugs.',
    recommendedTier: 'sonnet',
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Creates UI/UX designs, wireframes, and visual assets.',
    recommendedTier: 'sonnet',
  },
  {
    id: 'qa',
    name: 'QA Analyst',
    description: 'Tests features, writes test cases, and reports issues.',
    recommendedTier: 'haiku',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Gathers information, analyzes data, and produces reports.',
    recommendedTier: 'opus',
  },
  {
    id: 'writer',
    name: 'Technical Writer',
    description: 'Creates documentation, guides, and content.',
    recommendedTier: 'haiku',
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Manages infrastructure, CI/CD, and deployments.',
    recommendedTier: 'sonnet',
  },
  {
    id: 'analyst',
    name: 'Business Analyst',
    description: 'Defines requirements, tracks metrics, and manages scope.',
    recommendedTier: 'sonnet',
  },
];

interface AgentRolePickerProps {
  selectedRole: string;
  onSelect: (roleId: string, roleName: string, recommendedTier: string) => void;
}

export default function AgentRolePicker({
  selectedRole,
  onSelect,
}: AgentRolePickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ROLES.map((role) => {
        const isSelected = selectedRole === role.id;
        return (
          <button
            key={role.id}
            onClick={() => onSelect(role.id, role.name, role.recommendedTier)}
            className={`
              p-3 rounded-lg border-2 text-left transition-all
              ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }
            `}
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-bold text-sm text-slate-100">{role.name}</h4>
              {isSelected && (
                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {role.description}
            </p>
            <div className="mt-2">
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500">
                Recommended: {role.recommendedTier}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
