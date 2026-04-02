import * as path from 'path';
import {
  OnboardingState,
  CompanyInfo,
  AgentConfig,
  AgentStatus,
  PlatformConfig,
  Manager,
} from './types';
import {
  getDataDir,
  getTeamsFile,
  getChannelsFile,
  getConfigPath,
  readJson,
  writeJsonAtomic,
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

    // 1. Build executive agents list
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

    // 2. Write Executive Office team to data/teams.json
    const teamsFile = getTeamsFile();
    const teams = await readJson<unknown[]>(teamsFile, []);

    const execTeam = {
      id: 'executive-office',
      name: 'Executive Office',
      icon: 'crown',
      accent: '#f59e0b',
      description: 'C-suite executives and company leadership',
      floor: { width: 800, height: 500 },
      budget: { monthly: null, spent: 0 },
      projects: [],
      channels: ['general'],
      agents: executives.map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        status: e.status,
        appearance: e.appearance,
        providerId: e.providerId,
        modelTier: e.modelTier,
        mcpConnections: e.mcpConnections,
      })),
      createdAt: now,
      updatedAt: now,
    };

    // Replace existing or append
    const existingIdx = teams.findIndex((t: unknown) => (t as { id: string }).id === 'executive-office');
    if (existingIdx >= 0) {
      teams[existingIdx] = execTeam;
    } else {
      teams.push(execTeam);
    }
    await writeJsonAtomic(teamsFile, teams);

    // 3. Create default general channel in data/channels.json
    const channelsFile = getChannelsFile();
    const channels = await readJson<unknown[]>(channelsFile, []);
    const hasGeneral = channels.some((c: unknown) => (c as { id: string }).id === 'general' && (c as { teamId: string }).teamId === 'executive-office');
    if (!hasGeneral) {
      channels.push({
        id: 'general',
        name: 'general',
        type: 'team',
        members: executives.map((e) => e.id),
        teamId: 'executive-office',
        unread: 0,
      });
      await writeJsonAtomic(channelsFile, channels);
    }

    // 4. Activate selected governance rules
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

    // 5. Update config: mark onboarding complete
    config.onboardingComplete = true;
    await writeJsonAtomic(getConfigPath(), config);

    // 6. Update onboarding state
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
