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
  CodexCli = 'codex-cli',
  GeminiCli = 'gemini_cli',
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
  providerId?: string;
  modelTier?: string;
  isHuman?: boolean;
  mcpConnections: string[];
  status: AgentStatus;
}

export interface Team {
  id: string;
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

export interface TeamConfig {
  agents: AgentConfig[];
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

export interface GovernanceRule {
  id: string;
  name: string;
  category: RuleCategory;
  status: 'active' | 'inactive' | 'draft';
  enforcer: string;
  enforcerName: string;
  version: number;
  content: string;
  contentFormat: 'markdown' | 'text' | 'json';
  tags: string[];
  scope: 'global' | 'team' | 'project';
  scopeTeams: string[];
  enforcement: EnforcementLevel;
  history: GovernanceHistoryEntry[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
  inputPer1k: number;
  outputPer1k: number;
  currency: string;
}

export interface Provider {
  id: string;
  type: ProviderType;
  name: string;
  enabled: boolean;
  priority: number;
  status: ProviderStatus;
  config: ProviderConfig;
  modelMapping: ModelMapping;
  pricing: ProviderPricing;
  lastHealthCheck: string;
  createdAt: string;
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
  lastHealthCheck: string;
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
  authType: 'api_key' | 'oauth' | 'none';
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
  monthlyLimit: number;
  spent: number;
  byProvider: BudgetByEntry[];
  byTeam: BudgetByEntry[];
  byProject: BudgetByEntry[];
  alerts: BudgetAlert[];
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
  providerType: ProviderType;
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

export interface PlatformConfig {
  companyName: string;
  companyIndustry: string;
  companyDescription: string;
  companyLogo: string;
  onboardingComplete: boolean;
  ceo: AgentConfig;
  executives: AgentConfig[];
  teams: Team[];
  providers: Provider[];
  mcpConnections: McpConnection[];
  governanceRules: GovernanceRule[];
  budget: BudgetInfo;
  createdAt: string;
}

// ============================================================
// Onboarding
// ============================================================

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  startedAt: string;
  completedAt: string;
}

export interface CompanyInfo {
  name: string;
  industry: string;
  description: string;
  logo: string;
  createdAt: string;
}

// ============================================================
// WebSocket
// ============================================================

export interface WebSocketMessage {
  type: string;
  payload: unknown;
}
