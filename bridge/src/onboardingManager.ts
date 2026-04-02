import * as path from 'path';
import {
  OnboardingState,
  CompanyInfo,
  AgentConfig,
  AgentStatus,
  PlatformConfig,
  Provider,
  McpConnection,
  Manager,
} from './types';
import {
  getDataDir,
  getTeamsDir,
  getConfigPath,
  readJson,
  writeJsonAtomic,
  ensureDir,
  copyDir,
  exists,
} from './persistence';
import { BroadcastFn } from './auditLogger';

export class OnboardingManager implements Manager {
  private onboardingPath: string;
  private companyPath: string;
  private broadcast: BroadcastFn | null = null;

  constructor() {
    const dataDir = getDataDir();
    this.onboardingPath = path.join(dataDir, 'company', 'onboarding-state.json');
    this.companyPath = path.join(dataDir, 'company', 'company.json');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    console.log('[onboarding] Onboarding manager initialized.');
  }

  /**
   * Get the current onboarding state.
   */
  async getState(): Promise<OnboardingState> {
    return readJson<OnboardingState>(this.onboardingPath, {
      currentStep: 0,
      completedSteps: [],
      startedAt: null,
      completedAt: null,
    });
  }

  /**
   * Get company info.
   */
  async getCompanyInfo(): Promise<CompanyInfo> {
    return readJson<CompanyInfo>(this.companyPath, {
      name: null,
      industry: null,
      description: null,
      logo: null,
      createdAt: null,
    });
  }

  /**
   * Update onboarding step.
   */
  async completeStep(step: number, data?: Record<string, unknown>): Promise<OnboardingState> {
    const state = await this.getState();
    const now = new Date().toISOString();

    if (!state.startedAt) {
      state.startedAt = now;
    }

    if (!state.completedSteps.includes(step)) {
      state.completedSteps.push(step);
    }
    state.currentStep = step + 1;

    await writeJsonAtomic(this.onboardingPath, state);

    // Handle step-specific data
    if (data) {
      switch (step) {
        case 0: // Company info step
          await this.setupCompany(data);
          break;
        case 1: // CEO setup step
          await this.setupCeo(data);
          break;
        case 2: // Executives setup step
          // Data includes selected executives
          break;
        case 3: // Provider setup step
          // Provider was configured
          break;
        case 4: // MCP setup step
          // MCP connections were configured
          break;
        case 5: // Governance setup step
          // Governance rules were activated
          break;
      }
    }

    if (this.broadcast) {
      this.broadcast('onboarding_step_completed', { step, state, data: data || {} });
    }

    return state;
  }

  /**
   * Set up company info.
   */
  private async setupCompany(data: Record<string, unknown>): Promise<void> {
    const company: CompanyInfo = {
      name: (data.name as string) || null,
      industry: (data.industry as string) || null,
      description: (data.description as string) || null,
      logo: (data.logo as string) || null,
      createdAt: new Date().toISOString(),
    };
    await writeJsonAtomic(this.companyPath, company);
  }

  /**
   * Set up CEO agent.
   */
  private async setupCeo(data: Record<string, unknown>): Promise<void> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    if (config.ceo && data.name) {
      config.ceo.name = data.name as string;
      if (data.appearance) {
        config.ceo.appearance = data.appearance as PlatformConfig['ceo']['appearance'];
      }
      await writeJsonAtomic(getConfigPath(), config);
    }
  }

  /**
   * Complete onboarding and perform initial scaffolding.
   */
  async completeOnboarding(params: {
    executives?: Partial<AgentConfig>[];
    providerId?: string;
    mcpConnectionIds?: string[];
    governanceRuleIds?: string[];
  }): Promise<void> {
    const now = new Date().toISOString();
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);

    // 1. Create 00_Executive_Office team
    const teamsDir = getTeamsDir();
    const execDir = path.join(teamsDir, '00_Executive_Office');

    if (!(await exists(execDir))) {
      const templateDir = path.join(teamsDir, '_template');
      if (await exists(templateDir)) {
        await copyDir(templateDir, execDir);
      } else {
        await ensureDir(execDir);
        await ensureDir(path.join(execDir, 'messages'));
        await ensureDir(path.join(execDir, 'goals'));
        await ensureDir(path.join(execDir, 'tasks'));
      }
    }

    // Write team.json for Executive Office
    const execTeam = {
      id: '00_Executive_Office',
      name: 'Executive Office',
      icon: 'crown',
      accent: '#f59e0b',
      description: 'C-suite executives and company leadership',
      floor: { width: 800, height: 500 },
      budget: { monthly: null, spent: 0 },
      projects: [],
      channels: [],
      agents: [],
      createdAt: now,
      updatedAt: now,
    };
    await writeJsonAtomic(path.join(execDir, 'team.json'), execTeam);

    // 2. Add selected executives to team-config.json
    const executives: AgentConfig[] = [];

    // Always add CEO
    const ceoAgent: AgentConfig = {
      id: 'ceo',
      name: config.ceo?.name || 'CEO',
      role: 'ceo',
      title: 'Chief Executive Officer',
      appearance: config.ceo?.appearance || {
        hair: '#1e293b',
        shirt: '#1e40af',
        pants: '#0f172a',
        skin: '#d4a574',
      },
      providerId: params.providerId || 'claude-code',
      modelTier: 'opus',
      mcpConnections: params.mcpConnectionIds || [],
      status: AgentStatus.Idle,
    };
    executives.push(ceoAgent);

    // Add selected executives
    if (params.executives) {
      for (const exec of params.executives) {
        executives.push({
          id: exec.id || exec.role || 'exec-' + executives.length,
          name: exec.name || 'Executive',
          role: exec.role || 'executive',
          title: exec.title || '',
          appearance: exec.appearance || {
            hair: '#1e293b',
            shirt: '#3b82f6',
            pants: '#1e293b',
            skin: '#d4a574',
          },
          providerId: exec.providerId || params.providerId || 'claude-code',
          modelTier: exec.modelTier || 'sonnet',
          mcpConnections: exec.mcpConnections || params.mcpConnectionIds || [],
          status: AgentStatus.Idle,
        });
      }
    }

    await writeJsonAtomic(path.join(execDir, 'team-config.json'), { agents: executives });

    // 3. Activate selected governance rules
    if (params.governanceRuleIds && params.governanceRuleIds.length > 0) {
      const govDir = path.join(getDataDir(), '..', 'governance', 'rules');
      for (const ruleId of params.governanceRuleIds) {
        const rulePath = path.join(govDir, `${ruleId}.json`);
        const rule = await readJson<Record<string, unknown>>(rulePath, null as unknown as Record<string, unknown>);
        if (rule) {
          rule.status = 'active';
          rule.updatedAt = now;
          await writeJsonAtomic(rulePath, rule);
        }
      }
    }

    // 4. Update config: mark onboarding complete
    config.onboardingComplete = true;
    if (config.teamNumbering) {
      config.teamNumbering.reserved['00'] = 'Executive_Office';
    }
    await writeJsonAtomic(getConfigPath(), config);

    // 5. Update onboarding state
    const state = await this.getState();
    state.completedAt = now;
    await writeJsonAtomic(this.onboardingPath, state);

    if (this.broadcast) {
      this.broadcast('onboarding_completed', {
        state,
        executives: executives.map((e) => e.id),
      });
    }

    console.log('[onboarding] Onboarding completed. Executive Office created with', executives.length, 'agents.');
  }

  async shutdown(): Promise<void> {
    console.log('[onboarding] Onboarding manager shut down.');
  }
}
