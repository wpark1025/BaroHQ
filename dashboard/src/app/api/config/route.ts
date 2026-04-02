import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(process.cwd(), '..');
const CONFIG_PATH = path.join(ROOT, 'config.json');

interface AgentAppearance {
  hair: string;
  shirt: string;
  pants: string;
  skin: string;
}

interface AgentPayload {
  id: string;
  name: string;
  role: string;
  title: string;
  appearance: AgentAppearance;
  providerId?: string;
  modelTier?: string;
  isHuman?: boolean;
  mcpConnections: string[];
  status: string;
}

interface TeamPayload {
  name: string;
  icon: string;
  description: string;
  color: string;
  leader: AgentPayload;
  agents: AgentPayload[];
}

interface ProviderPayload {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  priority: number;
  status: string;
  config: Record<string, unknown>;
  modelMapping: Record<string, string | undefined>;
  pricing: Record<string, unknown>;
  lastHealthCheck: string;
  createdAt: string;
}

interface McpConnectionPayload {
  id: string;
  preset: string;
  name: string;
  description: string;
  status: string;
  transport: string;
  config: Record<string, unknown>;
  tools: { name: string; description: string; enabled: boolean }[];
  scope: string;
  lastHealthCheck: string;
  createdAt: string;
  updatedAt: string;
}

interface GovernanceRulePayload {
  id: string;
  name: string;
  category: string;
  status: string;
  enforcer: string;
  enforcerName: string;
  version: number;
  content: string;
  contentFormat: string;
  tags: string[];
  scope: string;
  scopeTeams: string[];
  enforcement: string | Record<string, unknown>;
  history: unknown[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface OnboardingPayload {
  companyName: string;
  companyIndustry: string;
  companyDescription: string;
  companyLogo: string;
  onboardingComplete: boolean;
  ceo: AgentPayload;
  executives: AgentPayload[];
  team: TeamPayload;
  providers: ProviderPayload[];
  mcpConnections: McpConnectionPayload[];
  governanceRules: GovernanceRulePayload[];
}

function readJson(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJson(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function copyTemplateDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTemplateDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function GET() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OnboardingPayload;
    const now = new Date().toISOString();

    // 1. Update config.json
    const existingConfig = readJson(CONFIG_PATH) as Record<string, unknown> | null;
    const config = existingConfig ?? {};
    (config as Record<string, unknown>)['onboardingComplete'] = true;
    (config as Record<string, unknown>)['ceo'] = {
      name: body.ceo.name,
      appearance: body.ceo.appearance,
    };
    if (body.providers.length > 0) {
      const providers = config['providers'] as Record<string, unknown> | undefined;
      if (providers) {
        providers['defaultProvider'] = body.providers[0].id;
      }
    }
    const teamNumbering = config['teamNumbering'] as Record<string, unknown> | undefined;
    if (teamNumbering) {
      teamNumbering['nextAvailable'] = 2;
    }
    writeJson(CONFIG_PATH, config);

    // 2. Create teams/00_Executive_Office/
    const templateDir = path.join(ROOT, 'teams', '_template');
    const execOfficeDir = path.join(ROOT, 'teams', '00_Executive_Office');
    copyTemplateDir(templateDir, execOfficeDir);

    // Write team.json for Executive Office
    const execTeamJson = {
      name: 'Executive Office',
      icon: 'Crown',
      accent: '#1e40af',
      description: 'C-suite leadership team',
      floor: { width: 800, height: 500 },
      budget: { monthly: null, spent: 0 },
      projects: [],
      channels: ['general'],
      createdAt: now,
      updatedAt: now,
    };
    writeJson(path.join(execOfficeDir, 'team.json'), execTeamJson);

    // Write team-config.json with CEO + enabled executives
    const execAgents: AgentPayload[] = [
      {
        id: body.ceo.id,
        name: body.ceo.name,
        role: body.ceo.role,
        title: body.ceo.title,
        appearance: body.ceo.appearance,
        isHuman: true,
        mcpConnections: [],
        status: 'idle',
      },
      ...body.executives.map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        title: e.title,
        appearance: e.appearance,
        providerId: e.providerId,
        modelTier: e.modelTier,
        mcpConnections: [] as string[],
        status: 'idle',
      })),
    ];
    writeJson(path.join(execOfficeDir, 'team-config.json'), { agents: execAgents });

    // Write state.json with empty agent states
    const execAgentStates: Record<string, { status: string; currentTask: null; position: { x: number; y: number } }> = {};
    execAgents.forEach((a, i) => {
      execAgentStates[a.id] = {
        status: 'idle',
        currentTask: null,
        position: { x: 100 + i * 120, y: 300 },
      };
    });
    writeJson(path.join(execOfficeDir, 'state.json'), {
      agents: execAgentStates,
      lastUpdate: now,
    });

    // Write channels.json
    writeJson(path.join(execOfficeDir, 'messages', 'channels.json'), {
      channels: [
        {
          id: 'general',
          name: 'general',
          type: 'channel',
          members: execAgents.map((a) => a.id),
          createdAt: now,
        },
      ],
      dms: [],
    });

    // Update CLAUDE.md
    const execClaudeMd = `Executive Office. Director:${body.ceo.name}->CEO. Read team.json, state.json, goals/, tasks/. Post to #general. Follow governance/rules/. Check library/.`;
    fs.writeFileSync(path.join(execOfficeDir, 'CLAUDE.md'), execClaudeMd);

    // 3. Create first team directory (01_TeamName)
    if (body.team.name) {
      const sanitizedName = body.team.name.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
      const firstTeamDir = path.join(ROOT, 'teams', `01_${sanitizedName}`);
      copyTemplateDir(templateDir, firstTeamDir);

      const firstTeamJson = {
        name: body.team.name,
        icon: body.team.icon || 'Users',
        accent: body.team.color || '#3b82f6',
        description: body.team.description || '',
        floor: { width: 800, height: 500 },
        budget: { monthly: null, spent: 0 },
        projects: [],
        channels: ['general'],
        createdAt: now,
        updatedAt: now,
      };
      writeJson(path.join(firstTeamDir, 'team.json'), firstTeamJson);

      // Build team agents list: leader + agents
      const teamAgents: AgentPayload[] = [
        {
          id: body.team.leader.id,
          name: body.team.leader.name,
          role: body.team.leader.role,
          title: body.team.leader.title,
          appearance: body.team.leader.appearance,
          providerId: body.team.leader.providerId,
          modelTier: body.team.leader.modelTier,
          mcpConnections: [],
          status: 'idle',
        },
        ...body.team.agents.map((a) => ({
          id: a.id,
          name: a.name,
          role: a.role,
          title: a.title,
          appearance: a.appearance,
          providerId: a.providerId,
          modelTier: a.modelTier,
          mcpConnections: [] as string[],
          status: 'idle',
        })),
      ];
      writeJson(path.join(firstTeamDir, 'team-config.json'), { agents: teamAgents });

      // state.json
      const teamAgentStates: Record<string, { status: string; currentTask: null; position: { x: number; y: number } }> = {};
      teamAgents.forEach((a, i) => {
        teamAgentStates[a.id] = {
          status: 'idle',
          currentTask: null,
          position: { x: 100 + i * 120, y: 300 },
        };
      });
      writeJson(path.join(firstTeamDir, 'state.json'), {
        agents: teamAgentStates,
        lastUpdate: now,
      });

      // channels.json
      writeJson(path.join(firstTeamDir, 'messages', 'channels.json'), {
        channels: [
          {
            id: 'general',
            name: 'general',
            type: 'channel',
            members: teamAgents.map((a) => a.id),
            createdAt: now,
          },
        ],
        dms: [],
      });

      // CLAUDE.md
      const teamClaudeMd = `${body.team.name}. Director:${body.team.leader.name}->CoS->CEO. Read team.json, state.json, goals/, tasks/. Post to #general. Follow governance/rules/. Check library/.`;
      fs.writeFileSync(path.join(firstTeamDir, 'CLAUDE.md'), teamClaudeMd);
    }

    // 4. Write data/company/company.json
    writeJson(path.join(ROOT, 'data', 'company', 'company.json'), {
      name: body.companyName,
      industry: body.companyIndustry,
      description: body.companyDescription,
      logo: body.companyLogo,
      createdAt: now,
    });

    // 5. Write data/company/onboarding-state.json
    writeJson(path.join(ROOT, 'data', 'company', 'onboarding-state.json'), {
      currentStep: 7,
      completedSteps: [1, 2, 3, 4, 5, 6, 7],
      startedAt: now,
      completedAt: now,
    });

    // 6. Update data/providers/providers.json
    if (body.providers.length > 0) {
      const existingProviders = readJson(path.join(ROOT, 'data', 'providers', 'providers.json')) as { providers: ProviderPayload[]; routing: unknown } | null;
      const providersData = existingProviders ?? { providers: [], routing: { strategy: 'priority', fallbackEnabled: true, fallbackTriggers: ['rate_limited', 'down', 'error'], retryAttempts: 2 } };

      // Merge: keep existing providers that aren't being overwritten, add new ones
      const existingIds = new Set((providersData.providers ?? []).map((p: ProviderPayload) => p.id));
      const newProviders = body.providers.filter((p) => !existingIds.has(p.id));
      const updatedProviders = (providersData.providers ?? []).map((existing: ProviderPayload) => {
        const update = body.providers.find((p) => p.id === existing.id);
        return update ? { ...existing, ...update } : existing;
      });
      providersData.providers = [...updatedProviders, ...newProviders];

      writeJson(path.join(ROOT, 'data', 'providers', 'providers.json'), providersData);
    }

    // 7. Update governance rules
    if (body.governanceRules.length > 0) {
      const rulesDir = path.join(ROOT, 'governance', 'rules');
      for (const rule of body.governanceRules) {
        const ruleFile = path.join(rulesDir, `${rule.id}.json`);
        const existing = readJson(ruleFile) as Record<string, unknown> | null;
        if (existing) {
          // Activate the rule
          existing['status'] = rule.status || 'active';
          existing['updatedAt'] = now;
          writeJson(ruleFile, existing);
        } else {
          // New custom rule
          writeJson(ruleFile, {
            ...rule,
            createdAt: rule.createdAt || now,
            updatedAt: now,
          });
        }
      }
    }

    return NextResponse.json({ success: true, timestamp: now });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Config POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
