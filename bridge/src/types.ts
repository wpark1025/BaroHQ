// ============================================================
// Enums
// ============================================================

export enum AgentStatus {
  Idle = 'idle',
  Working = 'working',
  Paused = 'paused',
  Offline = 'offline',
  Meeting = 'meeting',
  Break = 'break',
}

export enum TaskType {
  Story = 'story',
  Task = 'task',
  Bug = 'bug',
  Epic = 'epic',
  Subtask = 'subtask',
  Issue = 'issue',
}

export enum TaskStatus {
  Backlog = 'backlog',
  Todo = 'todo',
  InProgress = 'in_progress',
  InReview = 'in_review',
  Done = 'done',
  Cancelled = 'cancelled',
}

export enum TaskPriority {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  None = 'none',
}

export enum ProjectStatus {
  Planning = 'planning',
  Active = 'active',
  OnHold = 'on_hold',
  Completed = 'completed',
  Archived = 'archived',
}

export enum ProjectPriority {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum SprintStatus {
  Planning = 'planning',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum GoalStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  AtRisk = 'at_risk',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum ApprovalStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Expired = 'expired',
}

export enum ProviderType {
  ClaudeCode = 'claude_code',
  ClaudeAPI = 'claude_api',
  Gemini = 'gemini',
  OpenAI = 'openai',
  OpenRouter = 'open_router',
  Custom = 'custom',
}

export enum ProviderStatus {
  Active = 'active',
  Degraded = 'degraded',
  Down = 'down',
  Disabled = 'disabled',
}

export enum McpConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Connecting = 'connecting',
}

export enum RuleCategory {
  Coding = 'coding',
  Design = 'design',
  Legal = 'legal',
  Security = 'security',
  Process = 'process',
  Communication = 'communication',
  Custom = 'custom',
}

export enum EnforcementLevel {
  Block = 'block',
  Warn = 'warn',
  Log = 'log',
  Off = 'off',
}

// ============================================================
// Core Interfaces
// ============================================================

export interface AgentAppearance {
  hair: string;
  shirt: string;
  pants: string;
  skin: string;
}

export interface AgentPosition {
  x: number;
  y: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  appearance: AgentAppearance;
  position: AgentPosition;
  providerId: string;
  modelTier: string;
  mcpConnections: string[];
  teamId: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  title: string;
  appearance: AgentAppearance;
  providerId: string;
  modelTier: string;
  mcpConnections: string[];
  status: AgentStatus;
}

export interface Team {
  id: string;
  name: string;
  icon: string;
  accent: string;
  description: string;
  floor: number | { width: number; height: number };
  budget: number | { monthly: number | null; spent: number };
  projects: string[];
  channels: string[];
  agents: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TeamConfig {
  agents: AgentConfig[];
}

export interface TeamState {
  agents: Record<string, { status: AgentStatus; position?: AgentPosition }>;
  lastUpdate: string | null;
}

// ============================================================
// Project Management
// ============================================================

export interface ProjectMilestone {
  id: string;
  name: string;
  date: string;
  status: string;
}

export interface ProjectTimeline {
  startDate: string;
  endDate: string;
  milestones: ProjectMilestone[];
}

export interface ProjectGit {
  repo: string;
  branch: string;
  lastCommit: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  owner: string;
  teams: string[];
  teamLeads: Record<string, string>;
  goals: string[];
  sprints: string[];
  budget: number;
  timeline: ProjectTimeline;
  git: ProjectGit;
  channels: string[];
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTimeTracking {
  estimated: number;
  logged: number;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  edited: boolean;
}

export interface TaskHistory {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp: string;
}

export interface LinkedTask {
  taskId: string;
  relation: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates';
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  reporter: string;
  team: string;
  project: string;
  sprint: string;
  parent: string;
  children: string[];
  labels: string[];
  storyPoints: number;
  dueDate: string;
  timeTracking: TaskTimeTracking;
  linkedGoal: string;
  linkedTasks: LinkedTask[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  history: TaskHistory[];
  autoCreated: boolean;
  autoCreatedFrom: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  project: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  goal: string;
  tasks: string[];
  velocity: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  priority: TaskPriority;
  owner: string;
  team: string;
  project: string;
  teams: string[];
  linkedTasks: string[];
  taskProgress: number;
  children: string[];
  comments: TaskComment[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Governance
// ============================================================

export interface GovernanceHistoryEntry {
  version: number;
  content: string;
  changedBy: string;
  changedAt: string;
  changeNote: string;
}

export interface GovernanceEnforcement {
  level: string;
  onViolation: string;
  preCommitHook?: boolean;
}

export interface GovernanceRule {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  enforcer: string;
  enforcerName: string;
  version: number;
  content: string;
  contentFormat: 'markdown' | 'text' | 'json';
  tags: string[];
  scope: string;
  scopeTeams: string[];
  enforcement: EnforcementLevel | GovernanceEnforcement;
  history: GovernanceHistoryEntry[];
  createdBy: string;
  createdAt: string | null;
  updatedAt: string | null;
}

// ============================================================
// Providers & MCP
// ============================================================

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  orgId?: string;
  maxConcurrent?: number;
  timeout?: number;
  [key: string]: unknown;
}

export interface ModelMapping {
  opus?: string;
  sonnet?: string;
  haiku?: string;
  [key: string]: string | undefined;
}

export interface ProviderPricing {
  inputPer1k?: number;
  outputPer1k?: number;
  inputPer1M?: number;
  outputPer1M?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface Provider {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  priority: number;
  status: string;
  config: ProviderConfig;
  modelMapping: ModelMapping;
  pricing: ProviderPricing | Record<string, ProviderPricing>;
  lastHealthCheck: string | null;
  createdAt: string | null;
}

export interface ProviderRouting {
  strategy: string;
  fallbackEnabled: boolean;
  fallbackTriggers: string[];
  retryAttempts: number;
}

export interface ProvidersFile {
  providers: Provider[];
  routing: ProviderRouting;
}

export interface McpTransportConfig {
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface McpTool {
  name: string;
  description: string;
  enabled: boolean;
}

export interface McpConnection {
  id: string;
  preset: string;
  name: string;
  description: string;
  status: McpConnectionStatus;
  transport: 'sse' | 'stdio' | 'streamable-http';
  config: McpTransportConfig;
  tools: McpTool[];
  scope: 'global' | 'team' | 'agent';
  lastHealthCheck: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface McpPreset {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  defaultTransport: 'sse' | 'stdio' | 'streamable-http';
  defaultUrl: string;
  authType: string;
  authInstructions: string;
  docsUrl: string;
  requiredScopes: string[];
  popular: boolean;
}

// ============================================================
// Budget & Usage
// ============================================================

export interface BudgetByEntry {
  id: string;
  name: string;
  spent: number;
  limit: number;
}

export interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  threshold: number;
  current: number;
  timestamp: string;
}

export interface BudgetInfo {
  monthlyLimit: number | null;
  currentMonth: string | null;
  spent: number;
  byProvider: Record<string, number> | BudgetByEntry[];
  byTeam: Record<string, number> | BudgetByEntry[];
  byProject: Record<string, number> | BudgetByEntry[];
  alerts: BudgetAlert[];
}

export interface BudgetSnapshot {
  date: string;
  spent: number;
  limit: number | null;
  byProvider: Record<string, number>;
  byTeam: Record<string, number>;
  byProject: Record<string, number>;
}

export interface UsageData {
  tokens: number;
  cost: number;
  byAgent: Record<string, { tokens: number; cost: number }>;
  byProvider: Record<string, { tokens: number; cost: number }>;
  byModel: Record<string, { tokens: number; cost: number }>;
}

// ============================================================
// Approvals & Audit
// ============================================================

export interface ApprovalContext {
  type: string;
  resourceId: string;
  [key: string]: unknown;
}

export interface ApprovalOption {
  label: string;
  value: string;
  destructive?: boolean;
}

export interface Approval {
  id: string;
  action: string;
  description: string;
  requester: string;
  approver: string;
  status: ApprovalStatus;
  context: ApprovalContext;
  options: ApprovalOption[];
  delegatedTo?: string;
  escalatedAt?: string;
  createdAt: string;
  resolvedAt: string;
  resolvedBy: string;
  comment: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  timestamp: string;
}

// ============================================================
// Runs
// ============================================================

export interface RunUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export interface RunRecord {
  id: string;
  agentId: string;
  team: string;
  provider: string;
  providerType: string;
  model: string;
  modelTier: string;
  prompt: string;
  output: string;
  usage: RunUsage;
  durationMs: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage: string;
  projectId: string;
  taskId: string;
  autoIssueCreated: boolean;
  mcpToolsUsed: string[];
  timestamp: string;
}

// ============================================================
// Chat & Communication
// ============================================================

export interface Channel {
  id: string;
  name: string;
  type: 'team' | 'project' | 'direct' | 'general';
  members: string[];
  teamId: string;
  unread: number;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

export interface Message {
  id: string;
  channelId: string;
  author: string;
  text: string;
  timestamp: string;
  reactions: MessageReaction[];
  thread: string[];
}

// ============================================================
// Platform Config
// ============================================================

export interface LicenseFeatures {
  sprints: boolean;
  autoIssue: boolean;
  advancedApprovals: boolean;
  apiAccess: boolean;
}

export interface License {
  key: string | null;
  tier: string;
  expiresAt: string | null;
  maxAgents: number;
  maxTeams: number;
  maxProjects: number;
  maxProviders: number;
  maxMcpConnections: number;
  maxGovernanceRules: number;
  features: LicenseFeatures;
}

export interface PlatformConfig {
  platformName: string;
  version: string;
  onboardingComplete: boolean;
  plan: string;
  license: License;
  usageLimits: {
    sessionTokenLimit: number;
    weeklyHoursLimit: number;
    sessionDurationHours: number;
  };
  autoResume: {
    enabled: boolean;
    bufferMinutes: number;
  };
  teamNumbering: {
    reserved: Record<string, string>;
    nextAvailable: number;
  };
  budgets: {
    enabled: boolean;
    companyMonthlyLimit: number | null;
    alertThresholds: number[];
    pauseOnExceed: boolean;
    overrideRequiresApproval: boolean;
  };
  providers: {
    defaultProvider: string;
    fallbackEnabled: boolean;
    fallbackOrder: string[];
  };
  approvals: {
    enabled: boolean;
    protectedActions: string[];
    defaultApprover: string;
    autoApproveTimeout: number | null;
  };
  tasks: {
    autoCreateIssues: boolean;
    autoIssueOnFailure: boolean;
    issuePrefix: string;
    sprintsEnabled: boolean;
    defaultSprintDurationDays: number;
  };
  governance: {
    enabled: boolean;
    enforceOnCommit: boolean;
    versionHistory: boolean;
  };
  mcp: {
    enabled: boolean;
    healthCheckIntervalSeconds: number;
    maxConnectionsPerAgent: number;
    autoDiscoverTools: boolean;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    rotateDaily: boolean;
  };
  ceo: {
    name: string;
    appearance: AgentAppearance;
  };
}

// ============================================================
// Onboarding
// ============================================================

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  startedAt: string | null;
  completedAt: string | null;
}

export interface CompanyInfo {
  name: string | null;
  industry: string | null;
  description: string | null;
  logo: string | null;
  createdAt: string | null;
}

// ============================================================
// Library
// ============================================================

export interface LibraryItem {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  path: string;
  publishedBy: string;
  publishedFrom: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryIndex {
  items: LibraryItem[];
}

// ============================================================
// WebSocket Messages
// ============================================================

export interface WsMessage {
  type: string;
  payload: Record<string, unknown>;
  requestId?: string;
}

// Incoming message types from dashboard
export type IncomingMessageType =
  // Config
  | 'get_full_state'
  | 'update_config'
  // Agents
  | 'create_agent'
  | 'update_agent'
  | 'delete_agent'
  | 'move_agent'
  // Teams
  | 'create_team'
  | 'archive_team'
  | 'rename_team'
  | 'delete_team'
  | 'list_teams'
  // Projects
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'list_projects'
  // Tasks
  | 'create_task'
  | 'update_task'
  | 'delete_task'
  | 'list_tasks'
  | 'transition_task'
  | 'log_time'
  // Sprints
  | 'create_sprint'
  | 'update_sprint'
  | 'start_sprint'
  | 'complete_sprint'
  // Goals
  | 'create_goal'
  | 'update_goal'
  | 'delete_goal'
  | 'add_goal_comment'
  // Channels & Messages
  | 'create_channel'
  | 'send_message'
  | 'send_dm'
  | 'get_messages'
  | 'mark_read'
  // Approvals
  | 'resolve_approval'
  | 'batch_resolve_approvals'
  | 'delegate_approval'
  // Providers
  | 'create_provider'
  | 'update_provider'
  | 'delete_provider'
  | 'test_provider'
  // MCP
  | 'create_mcp_connection'
  | 'update_mcp_connection'
  | 'delete_mcp_connection'
  | 'test_mcp_connection'
  | 'discover_mcp_tools'
  // Governance
  | 'create_governance_rule'
  | 'update_governance_rule'
  | 'delete_governance_rule'
  | 'toggle_governance_rule'
  | 'rollback_governance_rule'
  // Budget
  | 'update_budget'
  | 'budget_override'
  // Onboarding
  | 'onboarding_step'
  | 'complete_onboarding'
  // Library
  | 'publish_to_library'
  | 'list_library'
  // Runs
  | 'list_runs'
  | 'get_run'
  // Audit
  | 'query_audit';

// Outgoing message types to dashboard
export type OutgoingMessageType =
  | 'full_state_sync'
  | 'roster_update'
  | 'agent_updated'
  | 'agent_deleted'
  | 'team_created'
  | 'team_archived'
  | 'team_renamed'
  | 'team_deleted'
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_transitioned'
  | 'sprint_created'
  | 'sprint_updated'
  | 'sprint_started'
  | 'sprint_completed'
  | 'goal_created'
  | 'goal_updated'
  | 'goal_deleted'
  | 'channel_created'
  | 'channel_updated'
  | 'message'
  | 'dm_message'
  | 'messages_history'
  | 'approval_created'
  | 'approval_resolved'
  | 'provider_created'
  | 'provider_updated'
  | 'provider_deleted'
  | 'provider_health'
  | 'mcp_created'
  | 'mcp_updated'
  | 'mcp_deleted'
  | 'mcp_tools_discovered'
  | 'mcp_health'
  | 'governance_created'
  | 'governance_updated'
  | 'governance_deleted'
  | 'governance_toggled'
  | 'governance_rolledback'
  | 'budget_updated'
  | 'budget_alert'
  | 'budget_override_requested'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'library_item_published'
  | 'run_completed'
  | 'run_failed'
  | 'audit_entry'
  | 'audit_query_result'
  | 'usage_update'
  | 'rate_limit_hit'
  | 'auto_resume_scheduled'
  | 'config_updated'
  | 'error'
  | 'response';

// ============================================================
// Manager Interface
// ============================================================

export interface Manager {
  init(): Promise<void>;
  shutdown?(): Promise<void>;
}

// ============================================================
// Full State (for full_state_sync)
// ============================================================

export interface FullState {
  config: PlatformConfig;
  company: CompanyInfo;
  onboarding: OnboardingState;
  teams: Team[];
  agents: Agent[];
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  goals: Goal[];
  channels: Channel[];
  providers: Provider[];
  mcpConnections: McpConnection[];
  governanceRules: GovernanceRule[];
  approvals: Approval[];
  budget: BudgetInfo;
  usage: UsageData;
  runs: RunRecord[];
  library: LibraryItem[];
  audit: AuditEntry[];
}
