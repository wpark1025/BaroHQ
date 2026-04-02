import { create } from 'zustand';
import type { AgentAppearance, AgentConfig, Provider, McpConnection, GovernanceRule } from '@/lib/types';
import { AgentStatus } from '@/lib/types';
import { DEFAULT_APPEARANCE } from '@/lib/constants';

interface CompanySetupData {
  name: string;
  industry: string;
  description: string;
  logo: string;
}

interface CeoSetupData {
  name: string;
  appearance: AgentAppearance;
}

interface ExecutiveConfig {
  id: string;
  enabled: boolean;
  name: string;
  role: string;
  personality: string;
  providerId: string;
  modelTier: string;
  appearance: AgentAppearance;
}

interface ProviderSetupData {
  providers: Provider[];
}

interface McpSetupData {
  connections: McpConnection[];
}

interface FirstTeamData {
  name: string;
  icon: string;
  description: string;
  color: string;
  leader: AgentConfig;
  agents: AgentConfig[];
}

interface GovernanceSetupData {
  rules: GovernanceRule[];
}

interface OnboardingStore {
  currentStep: number;
  completedSteps: number[];
  companyInfo: CompanySetupData;
  ceoConfig: CeoSetupData;
  executives: ExecutiveConfig[];
  providerSetup: ProviderSetupData;
  mcpSetup: McpSetupData;
  firstTeam: FirstTeamData;
  governanceSetup: GovernanceSetupData;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeStep: (step: number) => void;
  setCompanyInfo: (data: Partial<CompanySetupData>) => void;
  setCeoConfig: (data: Partial<CeoSetupData>) => void;
  setExecutives: (executives: ExecutiveConfig[]) => void;
  updateExecutive: (id: string, updates: Partial<ExecutiveConfig>) => void;
  setProviderSetup: (data: Partial<ProviderSetupData>) => void;
  setMcpSetup: (data: Partial<McpSetupData>) => void;
  setFirstTeam: (data: Partial<FirstTeamData>) => void;
  setGovernanceSetup: (data: Partial<GovernanceSetupData>) => void;
  finishOnboarding: () => Promise<void>;
  isStepComplete: (step: number) => boolean;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  currentStep: 1,
  completedSteps: [],
  companyInfo: {
    name: '',
    industry: '',
    description: '',
    logo: '',
  },
  ceoConfig: {
    name: '',
    appearance: { ...DEFAULT_APPEARANCE },
  },
  executives: [],
  providerSetup: {
    providers: [],
  },
  mcpSetup: {
    connections: [],
  },
  firstTeam: {
    name: '',
    icon: '',
    description: '',
    color: '#3b82f6',
    leader: {
      id: 'team-leader-1',
      name: '',
      role: 'Team Lead',
      title: 'Team Lead',
      appearance: { ...DEFAULT_APPEARANCE },
      providerId: '',
      modelTier: 'sonnet',
      mcpConnections: [],
      status: AgentStatus.Idle,
    },
    agents: [],
  },
  governanceSetup: {
    rules: [],
  },

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 7),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  goToStep: (step) =>
    set({ currentStep: Math.max(1, Math.min(step, 7)) }),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    })),

  setCompanyInfo: (data) =>
    set((state) => ({
      companyInfo: { ...state.companyInfo, ...data },
    })),

  setCeoConfig: (data) =>
    set((state) => ({
      ceoConfig: { ...state.ceoConfig, ...data },
    })),

  setExecutives: (executives) => set({ executives }),

  updateExecutive: (id, updates) =>
    set((state) => ({
      executives: state.executives.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  setProviderSetup: (data) =>
    set((state) => ({
      providerSetup: { ...state.providerSetup, ...data },
    })),

  setMcpSetup: (data) =>
    set((state) => ({
      mcpSetup: { ...state.mcpSetup, ...data },
    })),

  setFirstTeam: (data) =>
    set((state) => ({
      firstTeam: { ...state.firstTeam, ...data },
    })),

  setGovernanceSetup: (data) =>
    set((state) => ({
      governanceSetup: { ...state.governanceSetup, ...data },
    })),

  finishOnboarding: async () => {
    const state = get();
    const config = {
      companyName: state.companyInfo.name,
      companyIndustry: state.companyInfo.industry,
      companyDescription: state.companyInfo.description,
      companyLogo: state.companyInfo.logo,
      onboardingComplete: true,
      ceo: {
        id: 'ceo',
        name: state.ceoConfig.name,
        role: 'CEO',
        title: 'Chief Executive Officer',
        appearance: state.ceoConfig.appearance,
        isHuman: true,
        mcpConnections: [] as string[],
        status: AgentStatus.Idle,
      },
      executives: state.executives
        .filter((e) => e.enabled)
        .map((e) => ({
          id: e.id,
          name: e.name,
          role: e.role,
          title: e.role,
          appearance: e.appearance,
          providerId: e.providerId,
          modelTier: e.modelTier,
          mcpConnections: [] as string[],
          status: AgentStatus.Idle,
        })),
      team: state.firstTeam,
      providers: state.providerSetup.providers,
      mcpConnections: state.mcpSetup.connections,
      governanceRules: state.governanceSetup.rules,
    };

    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        (errBody as { error?: string }).error ?? `Server responded with ${res.status}`
      );
    }
  },

  isStepComplete: (step) => get().completedSteps.includes(step),
}));
