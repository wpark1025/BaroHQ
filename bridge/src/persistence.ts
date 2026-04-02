import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import {
  FullState,
  PlatformConfig,
  CompanyInfo,
  OnboardingState,
  Team,
  Agent,
  AgentAppearance,
  AgentStatus,
  Project,
  Task,
  Sprint,
  Goal,
  Channel,
  Provider,
  McpConnection,
  GovernanceRule,
  Approval,
  BudgetInfo,
  UsageData,
  RunRecord,
  LibraryItem,
  AuditEntry,
  Manager,
} from './types';

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const GOALS_FILE = path.join(DATA_DIR, 'goals.json');
const CHANNELS_FILE = path.join(DATA_DIR, 'channels.json');
const MESSAGES_DIR = path.join(DATA_DIR, 'messages');
const GOVERNANCE_DIR = path.join(ROOT, 'governance');
const LIBRARY_DIR = path.join(ROOT, 'library');
const CONFIG_PATH = path.join(ROOT, 'config.json');

// Debounce timers per file path
const writeTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
const DEBOUNCE_MS = 2000;

export function getRootDir(): string {
  return ROOT;
}
export function getDataDir(): string {
  return DATA_DIR;
}
export function getTeamsFile(): string {
  return TEAMS_FILE;
}
export function getGoalsFile(): string {
  return GOALS_FILE;
}
export function getChannelsFile(): string {
  return CHANNELS_FILE;
}
export function getMessagesDir(): string {
  return MESSAGES_DIR;
}
export function getGovernanceDir(): string {
  return GOVERNANCE_DIR;
}
export function getLibraryDir(): string {
  return LIBRARY_DIR;
}
export function getConfigPath(): string {
  return CONFIG_PATH;
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fsp.mkdir(dirPath, { recursive: true });
}

/**
 * Read a JSON file. Returns the parsed data or the fallback if the file doesn't exist.
 */
export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fsp.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Read a JSON file synchronously. Returns the parsed data or the fallback if the file doesn't exist.
 */
export function readJsonSync<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Write a JSON file atomically: write to .tmp, then rename.
 */
export async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  const tmpPath = filePath + '.tmp';
  const content = JSON.stringify(data, null, 2);
  await fsp.writeFile(tmpPath, content, 'utf-8');
  await fsp.rename(tmpPath, filePath);
}

/**
 * Debounced write: schedule a write 2s from now. If called again before the timer
 * fires, the previous write is cancelled.
 */
export function writeJsonDebounced(filePath: string, data: unknown): void {
  const existing = writeTimers.get(filePath);
  if (existing) {
    clearTimeout(existing);
  }
  const timer = setTimeout(async () => {
    writeTimers.delete(filePath);
    try {
      await writeJsonAtomic(filePath, data);
    } catch (err) {
      console.error(`[persistence] Failed to write ${filePath}:`, err);
    }
  }, DEBOUNCE_MS);
  writeTimers.set(filePath, timer);
}

/**
 * Append a line to a file (for JSONL audit logs).
 */
export async function appendLine(filePath: string, line: string): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await fsp.appendFile(filePath, line + '\n', 'utf-8');
}

/**
 * List directories in a parent directory, returning directory names.
 */
export async function listDirs(parentDir: string): Promise<string[]> {
  try {
    const entries = await fsp.readdir(parentDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * List files in a directory, returning filenames.
 */
export async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Check if a file or directory exists.
 */
export async function exists(p: string): Promise<boolean> {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy a directory recursively.
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Assemble full state for full_state_sync.
 */
export async function assembleFullState(): Promise<FullState> {
  const config = await readJson<PlatformConfig>(CONFIG_PATH, {} as PlatformConfig);
  const company = await readJson<CompanyInfo>(
    path.join(DATA_DIR, 'company', 'company.json'),
    { name: null, industry: null, description: null, logo: null, createdAt: null }
  );
  const onboarding = await readJson<OnboardingState>(
    path.join(DATA_DIR, 'company', 'onboarding-state.json'),
    { currentStep: 0, completedSteps: [], startedAt: null, completedAt: null }
  );

  // Load teams from flat file
  interface TeamFileAgent {
    id: string;
    name: string;
    role: string;
    status: AgentStatus;
    appearance: AgentAppearance;
    providerId: string;
    modelTier: string;
    mcpConnections: string[];
  }
  interface TeamFileEntry {
    id: string;
    name: string;
    icon: string;
    accent: string;
    description: string;
    floor: number | { width: number; height: number };
    budget: number | { monthly: number | null; spent: number };
    projects: string[];
    channels: string[];
    agents: TeamFileAgent[];
    createdAt: string | null;
    updatedAt: string | null;
  }
  const teamsArray = await readJson<TeamFileEntry[]>(TEAMS_FILE, []);
  const teams: Team[] = [];
  const agents: Agent[] = [];

  for (const teamEntry of teamsArray) {
    const { agents: teamAgents, ...teamData } = teamEntry;
    teams.push({ ...teamData, agents: (teamAgents || []).map(a => a.id) } as Team);

    if (teamAgents && Array.isArray(teamAgents)) {
      for (const ag of teamAgents) {
        agents.push({
          id: ag.id,
          name: ag.name,
          role: ag.role,
          status: ag.status || AgentStatus.Idle,
          appearance: ag.appearance,
          position: { x: 0, y: 0 },
          providerId: ag.providerId,
          modelTier: ag.modelTier,
          mcpConnections: ag.mcpConnections || [],
          teamId: teamEntry.id,
        });
      }
    }
  }

  // Channels
  const channels = await readJson<Channel[]>(CHANNELS_FILE, []);

  // Goals
  const goals = await readJson<Goal[]>(GOALS_FILE, []);

  const projectsData = await readJson<{ projects: Project[] }>(
    path.join(DATA_DIR, 'projects', 'projects.json'),
    { projects: [] }
  );
  const tasksData = await readJson<{ tasks: Task[]; nextId: number }>(
    path.join(DATA_DIR, 'tasks', 'tasks.json'),
    { tasks: [], nextId: 1 }
  );
  const sprintsData = await readJson<{ sprints: Sprint[] }>(
    path.join(DATA_DIR, 'tasks', 'sprints.json'),
    { sprints: [] }
  );
  const providersData = await readJson<{ providers: Provider[] }>(
    path.join(DATA_DIR, 'providers', 'providers.json'),
    { providers: [] }
  );
  const mcpData = await readJson<{ connections: McpConnection[] }>(
    path.join(DATA_DIR, 'mcp', 'connections.json'),
    { connections: [] }
  );
  const budget = await readJson<BudgetInfo>(
    path.join(DATA_DIR, 'budgets', 'company.json'),
    { monthlyLimit: null, currentMonth: null, spent: 0, byProvider: {}, byTeam: {}, byProject: {}, alerts: [] }
  );

  // Governance rules
  const govRulesDir = path.join(GOVERNANCE_DIR, 'rules');
  const govFiles = await listFiles(govRulesDir);
  const governanceRules: GovernanceRule[] = [];
  for (const gf of govFiles) {
    if (!gf.endsWith('.json')) continue;
    const rule = await readJson<GovernanceRule>(path.join(govRulesDir, gf), null as unknown as GovernanceRule);
    if (rule) governanceRules.push(rule);
  }

  // Approvals
  const pendingDir = path.join(DATA_DIR, 'approvals', 'pending');
  const resolvedDir = path.join(DATA_DIR, 'approvals', 'resolved');
  const approvals: Approval[] = [];
  for (const dir of [pendingDir, resolvedDir]) {
    const files = await listFiles(dir);
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      const approval = await readJson<Approval>(path.join(dir, f), null as unknown as Approval);
      if (approval) approvals.push(approval);
    }
  }

  // Library
  const libraryIndex = await readJson<{ items: LibraryItem[] }>(
    path.join(LIBRARY_DIR, 'index.json'),
    { items: [] }
  );

  // Recent runs
  const runsDir = path.join(DATA_DIR, 'runs');
  const runFiles = await listFiles(runsDir);
  const runs: RunRecord[] = [];
  // Load last 100 runs
  const recentRunFiles = runFiles.filter((f) => f.endsWith('.json')).slice(-100);
  for (const rf of recentRunFiles) {
    const run = await readJson<RunRecord>(path.join(runsDir, rf), null as unknown as RunRecord);
    if (run) runs.push(run);
  }

  // Recent audit entries (today)
  const today = new Date().toISOString().split('T')[0];
  const auditPath = path.join(DATA_DIR, 'audit', `audit-${today}.jsonl`);
  const audit: AuditEntry[] = [];
  try {
    const raw = await fsp.readFile(auditPath, 'utf-8');
    const lines = raw.trim().split('\n').filter(Boolean);
    for (const line of lines.slice(-200)) {
      try {
        audit.push(JSON.parse(line));
      } catch {
        // skip malformed lines
      }
    }
  } catch {
    // no audit file yet
  }

  return {
    config,
    company,
    onboarding,
    teams,
    agents,
    projects: projectsData.projects,
    tasks: tasksData.tasks,
    sprints: sprintsData.sprints,
    goals,
    channels,
    providers: providersData.providers,
    mcpConnections: mcpData.connections,
    governanceRules,
    approvals,
    budget,
    usage: { tokens: 0, cost: 0, byAgent: {}, byProvider: {}, byModel: {} },
    runs,
    library: libraryIndex.items,
    audit,
  };
}

export class PersistenceManager implements Manager {
  async init(): Promise<void> {
    // Ensure all necessary directories exist
    const dirs = [
      path.join(DATA_DIR, 'approvals', 'pending'),
      path.join(DATA_DIR, 'approvals', 'resolved'),
      path.join(DATA_DIR, 'audit'),
      path.join(DATA_DIR, 'budgets', 'snapshots'),
      path.join(DATA_DIR, 'company'),
      path.join(DATA_DIR, 'mcp'),
      path.join(DATA_DIR, 'projects'),
      path.join(DATA_DIR, 'providers'),
      path.join(DATA_DIR, 'runs'),
      path.join(DATA_DIR, 'tasks'),
      MESSAGES_DIR,
      path.join(GOVERNANCE_DIR, 'history'),
      path.join(GOVERNANCE_DIR, 'rules'),
      LIBRARY_DIR,
    ];
    for (const d of dirs) {
      await ensureDir(d);
    }
    console.log('[persistence] Directories verified.');
  }

  async shutdown(): Promise<void> {
    // Flush all pending writes immediately
    for (const [filePath, timer] of writeTimers.entries()) {
      clearTimeout(timer);
      writeTimers.delete(filePath);
    }
    console.log('[persistence] Shut down, pending writes flushed.');
  }
}
