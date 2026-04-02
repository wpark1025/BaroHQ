import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(process.cwd(), '..');

interface TeamsJsonAgent {
  id: string;
  name: string;
  role: string;
  title: string;
  appearance: { hair: string; shirt: string; pants: string; skin: string };
  isHuman?: boolean;
  providerId?: string;
  modelTier?: string;
  mcpConnections: string[];
  status: string;
}

interface TeamsJsonEntry {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  agents: TeamsJsonAgent[];
  channels: string[];
  createdAt: string;
  updatedAt: string;
}

interface AssembledTeam {
  id: string;
  name: string;
  icon: string;
  accent: string;
  description: string;
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

    // Read teams from data/teams.json
    const teamsData = readJson<TeamsJsonEntry[]>(path.join(ROOT, 'data', 'teams.json'));
    const teams: AssembledTeam[] = [];
    const agents: AssembledAgent[] = [];

    if (teamsData && Array.isArray(teamsData)) {
      for (const entry of teamsData) {
        const teamId = entry.id;
        const teamAgentIds = entry.agents.map((a) => a.id);

        teams.push({
          id: teamId,
          name: entry.name,
          icon: entry.icon,
          accent: entry.color,
          description: entry.description,
          channels: entry.channels,
          agents: teamAgentIds,
        });

        // Build agent entries
        for (let i = 0; i < entry.agents.length; i++) {
          const agentConf = entry.agents[i];
          agents.push({
            id: agentConf.id,
            name: agentConf.name,
            role: agentConf.role,
            status: agentConf.status ?? 'idle',
            appearance: agentConf.appearance,
            position: { x: 100 + i * 120, y: 300 },
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
