'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  FolderKanban,
  Target,
  ListTodo,
  AlertCircle,
  Users,
  Shield,
  Plug,
  DollarSign,
  FileText,
  BookOpen,
  Crown,
  Plus,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useAgentStore } from '@/store/useAgentStore';

interface ProjectSidebarProps {
  collapsed: boolean;
}

interface TreeNodeProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  indent?: number;
  badge?: number;
  onClick?: () => void;
  children?: React.ReactNode;
}

function TreeNode({
  icon,
  label,
  active,
  indent = 0,
  badge,
  onClick,
  children,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = !!children;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onClick?.();
        }}
        className={`
          w-full flex items-center gap-1.5 px-2 py-1 rounded text-left transition-colors
          ${active ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
        `}
        style={{ paddingLeft: `${8 + indent * 12}px` }}
      >
        {hasChildren && (
          <span className="w-3 shrink-0">
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
          {icon}
        </span>
        <span className="text-[11px] truncate flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="text-[9px] bg-slate-700 text-slate-400 px-1 rounded">
            {badge}
          </span>
        )}
      </button>
      {expanded && children && <div className="ml-0">{children}</div>}
    </div>
  );
}

export default function ProjectSidebar({ collapsed }: ProjectSidebarProps) {
  const router = useRouter();
  const { projects } = useProjectStore();
  const selectedTeam = useAgentStore((s) => s.selectedTeam);

  // Filter projects by selected team if any
  const displayProjects = selectedTeam
    ? projects.filter((p) => p.teams?.includes(selectedTeam))
    : projects;

  if (collapsed) {
    return (
      <div className="w-0 overflow-hidden transition-all duration-200" />
    );
  }

  return (
    <div className="w-[220px] bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto panel-collapse">
      {/* Projects Section */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          Projects
        </span>
        <button
          title="New Project"
          className="text-slate-600 hover:text-slate-400 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="px-1 space-y-0.5">
        {displayProjects.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-[10px] text-slate-600">No projects yet</p>
          </div>
        )}
        {displayProjects.map((project) => (
          <TreeNode
            key={project.id}
            icon={<FolderKanban className="w-3.5 h-3.5 text-blue-400" />}
            label={project.name}
            onClick={() => router.push(`/projects/${project.slug}`)}
          >
            <TreeNode
              icon={<Target className="w-3 h-3 text-amber-400" />}
              label="Goals"
              indent={1}
              badge={project.goals?.length}
              onClick={() => router.push(`/goals?project=${project.id}`)}
            />
            <TreeNode
              icon={<ListTodo className="w-3 h-3 text-emerald-400" />}
              label="Tasks"
              indent={1}
              onClick={() => router.push(`/tasks?project=${project.id}`)}
            />
            <TreeNode
              icon={<AlertCircle className="w-3 h-3 text-red-400" />}
              label="Issues"
              indent={1}
              onClick={() => router.push(`/tasks?project=${project.id}&type=issue`)}
            />
            <TreeNode
              icon={<Users className="w-3 h-3 text-purple-400" />}
              label="Teams"
              indent={1}
              badge={project.teams?.length}
              onClick={() => router.push(`/teams?project=${project.id}`)}
            />
          </TreeNode>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 my-3 h-px bg-slate-800" />

      {/* Manage Section */}
      <div className="px-3 pb-1">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          Manage
        </span>
      </div>

      <div className="px-1 space-y-0.5">
        <TreeNode
          icon={<Shield className="w-3.5 h-3.5 text-amber-400" />}
          label="Governance"
          onClick={() => router.push('/governance')}
        />
        <TreeNode
          icon={<Plug className="w-3.5 h-3.5 text-emerald-400" />}
          label="MCP Connections"
          onClick={() => router.push('/mcp')}
        />
        <TreeNode
          icon={<DollarSign className="w-3.5 h-3.5 text-green-400" />}
          label="Budget"
          onClick={() => router.push('/budget')}
        />
        <TreeNode
          icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}
          label="Audit Log"
          onClick={() => router.push('/audit')}
        />
        <TreeNode
          icon={<BookOpen className="w-3.5 h-3.5 text-cyan-400" />}
          label="Library"
          onClick={() => router.push('/library')}
        />
      </div>

      {/* Footer */}
      <div className="mt-auto p-3 border-t border-slate-800">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900 rounded">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400">Free Plan</p>
            <p className="text-[9px] text-slate-600">5 agents, 1 team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
