import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(process.cwd(), '..');

interface TeamJson {
  name: string;
  icon: string;
  accent: string;
  description: string;
  floor: { width: number; height: number };
  budget: { monthly: number | null; spent: number };
  projects: string[];
  channels: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

interface AgentConfigJson {
  id: string;
  name: string;
  role: string;
  title: string;
  appearance: { hair: string; shirt: string; pants: string; skin: string };
  providerId?: string;
  modelTier?: string;
  isHuman?: boolean;
  mcpConnections: string[];
  status: string;
}

interface TeamConfigJson {
  agents: AgentConfigJson[];
}

interface StateJson {
  agents: Record<string, { status: string; currentTask: string | null; position: { x: number; y: number } }>;
  lastUpdate: string | null;
}

interface AssembledTeam {
  id: string;
  dirName: string;
  name: string;
  icon: string;
  accent: string;
  description: string;
  floor: number;
  budget: number;
  projects: string[];
  channels: string[];
  agents: string[];
}

interface AssembledAgent {
  id: string;
  name: string;
  role: string;
  status: string;
  appearance: { hair: string; shirt: string; pants: string; skin: string };
  position: { x: number; y: number };
  providerId: string;
  modelTier: string;
  mcpConnections: string[];
  teamId: string;
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Read config
    const config = readJson<Record<string, unknown>>(path.join(ROOT, 'config.json'));

    // Read providers
    const providersData = readJson<{ providers: unknown[]; routing: unknown }>(
      path.join(ROOT, 'data', 'providers', 'providers.json')
    );

    // Read projects
    const projectsData = readJson<{ projects: unknown[] }>(
      path.join(ROOT, 'data', 'projects', 'projects.json')
    );

    // Read company info
    const companyData = readJson<Record<string, unknown>>(
      path.join(ROOT, 'data', 'company', 'company.json')
    );

    // Read governance rules
    const rulesDir = path.join(ROOT, 'governance', 'rules');
    const rules: unknown[] = [];
    if (fs.existsSync(rulesDir)) {
      const ruleFiles = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.json'));
      for (const file of ruleFiles) {
        const rule = readJson<unknown>(path.join(rulesDir, file));
        if (rule) rules.push(rule);
      }
    }

    // Read all team directories
    const teamsDir = path.join(ROOT, 'teams');
    const teams: AssembledTeam[] = [];
    const agents: AssembledAgent[] = [];

    if (fs.existsSync(teamsDir)) {
      const teamDirs = fs
        .readdirSync(teamsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const dir of teamDirs) {
        const teamDir = path.join(teamsDir, dir.name);
        const teamJson = readJson<TeamJson>(path.join(teamDir, 'team.json'));
        const teamConfig = readJson<TeamConfigJson>(path.join(teamDir, 'team-config.json'));
        const stateJson = readJson<StateJson>(path.join(teamDir, 'state.json'));

        if (!teamJson || !teamConfig) continue;

        const teamId = dir.name;
        const teamAgentIds = teamConfig.agents.map((a) => a.id);

        teams.push({
          id: teamId,
          dirName: dir.name,
          name: teamJson.name,
          icon: teamJson.icon,
          accent: teamJson.accent,
          description: teamJson.description,
          floor: teamJson.floor.width,
          budget: teamJson.budget.spent,
          projects: teamJson.projects,
          channels: teamJson.channels,
          agents: teamAgentIds,
        });

        // Build agent entries
        for (const agentConf of teamConfig.agents) {
          const agentState = stateJson?.agents?.[agentConf.id];
          agents.push({
            id: agentConf.id,
            name: agentConf.name,
            role: agentConf.role,
            status: agentState?.status ?? agentConf.status ?? 'idle',
            appearance: agentConf.appearance,
            position: agentState?.position ?? { x: 200, y: 300 },
            providerId: agentConf.providerId ?? '',
            modelTier: agentConf.modelTier ?? 'sonnet',
            mcpConnections: agentConf.mcpConnections ?? [],
            teamId,
          });
        }
      }
    }

    return NextResponse.json({
      config,
      company: companyData,
      teams,
      agents,
      providers: providersData?.providers ?? [],
      routing: providersData?.routing ?? null,
      projects: projectsData?.projects ?? [],
      governanceRules: rules,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('State GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
