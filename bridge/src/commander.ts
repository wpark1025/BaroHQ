import { WsMessage, PlatformConfig, TaskStatus, ProjectStatus, GoalStatus, SprintStatus } from './types';
import { readJson, writeJsonAtomic, getConfigPath, assembleFullState } from './persistence';
import { ConfigManager } from './configManager';
import { TeamManager } from './teamManager';
import { ProjectManager } from './projectManager';
import { TaskManager } from './taskManager';
import { ChannelManager } from './channelManager';
import { GoalManager } from './goalManager';
import { ApprovalManager } from './approvalManager';
import { BudgetManager } from './budgetManager';
import { ProviderManager } from './providerManager';
import { McpManager } from './mcpManager';
import { GovernanceManager } from './governanceManager';
import { OnboardingManager } from './onboardingManager';
import { RunHistoryManager } from './runHistoryManager';
import { LibraryManager } from './libraryManager';
import { AuditLogger } from './auditLogger';
import { UsageReader } from './usageReader';

type RespondFn = (type: string, payload: Record<string, unknown>) => void;

export class Commander {
  private configManager: ConfigManager;
  private teamManager: TeamManager;
  private projectManager: ProjectManager;
  private taskManager: TaskManager;
  private channelManager: ChannelManager;
  private goalManager: GoalManager;
  private approvalManager: ApprovalManager;
  private budgetManager: BudgetManager;
  private providerManager: ProviderManager;
  private mcpManager: McpManager;
  private governanceManager: GovernanceManager;
  private onboardingManager: OnboardingManager;
  private runHistoryManager: RunHistoryManager;
  private libraryManager: LibraryManager;
  private auditLogger: AuditLogger;
  private usageReader: UsageReader;

  constructor(managers: {
    configManager: ConfigManager;
    teamManager: TeamManager;
    projectManager: ProjectManager;
    taskManager: TaskManager;
    channelManager: ChannelManager;
    goalManager: GoalManager;
    approvalManager: ApprovalManager;
    budgetManager: BudgetManager;
    providerManager: ProviderManager;
    mcpManager: McpManager;
    governanceManager: GovernanceManager;
    onboardingManager: OnboardingManager;
    runHistoryManager: RunHistoryManager;
    libraryManager: LibraryManager;
    auditLogger: AuditLogger;
    usageReader: UsageReader;
  }) {
    this.configManager = managers.configManager;
    this.teamManager = managers.teamManager;
    this.projectManager = managers.projectManager;
    this.taskManager = managers.taskManager;
    this.channelManager = managers.channelManager;
    this.goalManager = managers.goalManager;
    this.approvalManager = managers.approvalManager;
    this.budgetManager = managers.budgetManager;
    this.providerManager = managers.providerManager;
    this.mcpManager = managers.mcpManager;
    this.governanceManager = managers.governanceManager;
    this.onboardingManager = managers.onboardingManager;
    this.runHistoryManager = managers.runHistoryManager;
    this.libraryManager = managers.libraryManager;
    this.auditLogger = managers.auditLogger;
    this.usageReader = managers.usageReader;
  }

  /**
   * Route an incoming WebSocket message to the appropriate handler.
   */
  async handleMessage(msg: WsMessage, respond: RespondFn): Promise<void> {
    const p = (msg.payload || {}) as Record<string, unknown>;

    try {
      switch (msg.type) {
        // === Full State ===
        case 'get_full_state': {
          const state = await assembleFullState();
          respond('full_state_sync', state as unknown as Record<string, unknown>);
          break;
        }

        // === Config ===
        case 'update_config': {
          const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
          const updated = { ...config, ...(p.updates as Record<string, unknown>) };
          await writeJsonAtomic(getConfigPath(), updated);
          await this.auditLogger.log('update_config', p.actor as string || 'dashboard', 'config', JSON.stringify(p.updates));
          respond('config_updated', { config: updated });
          break;
        }

        // === Agents ===
        case 'create_agent': {
          const agent = await this.configManager.createAgent(p.teamDir as string, p.agent as Record<string, unknown>);
          await this.auditLogger.log('create_agent', p.actor as string || 'dashboard', agent.id, agent.name);
          respond('response', { success: true, agent });
          break;
        }
        case 'update_agent': {
          const agent = await this.configManager.updateAgent(p.teamDir as string, p.agentId as string, p.updates as Record<string, unknown>);
          if (agent) {
            await this.auditLogger.log('update_agent', p.actor as string || 'dashboard', agent.id, JSON.stringify(p.updates));
          }
          respond('response', { success: !!agent, agent });
          break;
        }
        case 'delete_agent': {
          const needsApproval = await this.approvalManager.requiresApproval('retire_agent');
          if (needsApproval) {
            const approval = await this.approvalManager.createApproval({
              action: 'retire_agent',
              description: `Delete agent ${p.agentId} from ${p.teamDir}`,
              requester: p.actor as string || 'dashboard',
              context: { type: 'agent', resourceId: p.agentId as string, teamDir: p.teamDir as string },
            });
            respond('response', { success: false, needsApproval: true, approvalId: approval.id });
          } else {
            const result = await this.configManager.deleteAgent(p.teamDir as string, p.agentId as string);
            if (result) {
              await this.auditLogger.log('delete_agent', p.actor as string || 'dashboard', p.agentId as string, `Deleted from ${p.teamDir}`);
            }
            respond('response', { success: result });
          }
          break;
        }

        // === Teams ===
        case 'create_team': {
          const { teamDir, team } = await this.teamManager.createTeam(p as { name: string; icon?: string; accent?: string; description?: string });
          await this.auditLogger.log('create_team', p.actor as string || 'dashboard', teamDir, team.name);
          respond('response', { success: true, teamDir, team });
          break;
        }
        case 'archive_team': {
          const result = await this.teamManager.archiveTeam(p.teamDir as string);
          if (result) {
            await this.auditLogger.log('archive_team', p.actor as string || 'dashboard', p.teamDir as string, 'Team archived');
          }
          respond('response', { success: result });
          break;
        }
        case 'rename_team': {
          const team = await this.teamManager.renameTeam(p.teamDir as string, p.newName as string);
          if (team) {
            await this.auditLogger.log('rename_team', p.actor as string || 'dashboard', p.teamDir as string, `Renamed to ${p.newName}`);
          }
          respond('response', { success: !!team, team });
          break;
        }
        case 'delete_team': {
          const needsApproval = await this.approvalManager.requiresApproval('delete_team');
          if (needsApproval) {
            const approval = await this.approvalManager.createApproval({
              action: 'delete_team',
              description: `Delete team ${p.teamDir}`,
              requester: p.actor as string || 'dashboard',
              context: { type: 'team', resourceId: p.teamDir as string },
            });
            respond('response', { success: false, needsApproval: true, approvalId: approval.id });
          } else {
            const result = await this.teamManager.deleteTeam(p.teamDir as string);
            if (result) {
              await this.auditLogger.log('delete_team', p.actor as string || 'dashboard', p.teamDir as string, 'Team deleted');
            }
            respond('response', { success: result });
          }
          break;
        }
        case 'list_teams': {
          const teams = await this.teamManager.listTeams();
          respond('response', { success: true, teams });
          break;
        }

        // === Projects ===
        case 'create_project': {
          const project = await this.projectManager.createProject(p as Record<string, unknown>);
          await this.auditLogger.log('create_project', p.actor as string || 'dashboard', project.id, project.name);
          respond('response', { success: true, project });
          break;
        }
        case 'update_project': {
          const project = await this.projectManager.updateProject(p.id as string, p.updates as Record<string, unknown>);
          if (project) {
            await this.auditLogger.log('update_project', p.actor as string || 'dashboard', project.id, JSON.stringify(p.updates));
          }
          respond('response', { success: !!project, project });
          break;
        }
        case 'delete_project': {
          const needsApproval = await this.approvalManager.requiresApproval('delete_project');
          if (needsApproval) {
            const approval = await this.approvalManager.createApproval({
              action: 'delete_project',
              description: `Delete project ${p.id}`,
              requester: p.actor as string || 'dashboard',
              context: { type: 'project', resourceId: p.id as string },
            });
            respond('response', { success: false, needsApproval: true, approvalId: approval.id });
          } else {
            const result = await this.projectManager.deleteProject(p.id as string);
            if (result) {
              await this.auditLogger.log('delete_project', p.actor as string || 'dashboard', p.id as string, 'Project deleted');
            }
            respond('response', { success: result });
          }
          break;
        }
        case 'list_projects': {
          const projects = await this.projectManager.listProjects();
          respond('response', { success: true, projects });
          break;
        }

        // === Tasks ===
        case 'create_task': {
          const task = await this.taskManager.createTask(p as Record<string, unknown>);
          await this.auditLogger.log('create_task', p.actor as string || 'dashboard', task.id, task.title);
          respond('response', { success: true, task });
          break;
        }
        case 'update_task': {
          const task = await this.taskManager.updateTask(p.id as string, p.updates as Record<string, unknown>, p.actor as string);
          if (task) {
            await this.auditLogger.log('update_task', p.actor as string || 'dashboard', task.id, JSON.stringify(p.updates));
          }
          respond('response', { success: !!task, task });
          break;
        }
        case 'delete_task': {
          const result = await this.taskManager.deleteTask(p.id as string);
          if (result) {
            await this.auditLogger.log('delete_task', p.actor as string || 'dashboard', p.id as string, 'Task deleted');
          }
          respond('response', { success: result });
          break;
        }
        case 'list_tasks': {
          const tasks = await this.taskManager.listTasks(p.filters as Record<string, string> | undefined);
          respond('response', { success: true, tasks });
          break;
        }
        case 'transition_task': {
          const task = await this.taskManager.transitionTask(
            p.id as string,
            p.newStatus as TaskStatus,
            p.actor as string
          );
          if (task) {
            await this.auditLogger.log('transition_task', p.actor as string || 'dashboard', task.id, `Status: ${p.newStatus}`);
          }
          respond('response', { success: !!task, task });
          break;
        }
        case 'log_time': {
          const task = await this.taskManager.logTime(
            p.id as string,
            p.hours as number,
            p.actor as string
          );
          respond('response', { success: !!task, task });
          break;
        }

        // === Sprints ===
        case 'create_sprint': {
          const sprint = await this.taskManager.createSprint(p as Record<string, unknown>);
          await this.auditLogger.log('create_sprint', p.actor as string || 'dashboard', sprint.id, sprint.name);
          respond('response', { success: true, sprint });
          break;
        }
        case 'update_sprint': {
          const sprint = await this.taskManager.updateSprint(p.id as string, p.updates as Record<string, unknown>);
          respond('response', { success: !!sprint, sprint });
          break;
        }
        case 'start_sprint': {
          const sprint = await this.taskManager.startSprint(p.id as string);
          if (sprint) {
            await this.auditLogger.log('start_sprint', p.actor as string || 'dashboard', sprint.id, sprint.name);
          }
          respond('response', { success: !!sprint, sprint });
          break;
        }
        case 'complete_sprint': {
          const sprint = await this.taskManager.completeSprint(p.id as string);
          if (sprint) {
            await this.auditLogger.log('complete_sprint', p.actor as string || 'dashboard', sprint.id, `Velocity: ${sprint.velocity}`);
          }
          respond('response', { success: !!sprint, sprint });
          break;
        }

        // === Goals ===
        case 'create_goal': {
          const goal = await this.goalManager.createGoal(
            p.teamDir as string,
            p as Record<string, unknown>
          );
          await this.auditLogger.log('create_goal', p.actor as string || 'dashboard', goal.id, goal.title);
          respond('response', { success: true, goal });
          break;
        }
        case 'update_goal': {
          const goal = await this.goalManager.updateGoal(
            p.teamDir as string,
            p.goalId as string,
            p.updates as Record<string, unknown>
          );
          respond('response', { success: !!goal, goal });
          break;
        }
        case 'delete_goal': {
          const result = await this.goalManager.deleteGoal(p.teamDir as string, p.goalId as string);
          if (result) {
            await this.auditLogger.log('delete_goal', p.actor as string || 'dashboard', p.goalId as string, 'Goal deleted');
          }
          respond('response', { success: result });
          break;
        }
        case 'add_goal_comment': {
          const goal = await this.goalManager.addComment(
            p.teamDir as string,
            p.goalId as string,
            p.comment as Record<string, unknown>
          );
          respond('response', { success: !!goal, goal });
          break;
        }

        // === Channels & Messages ===
        case 'create_channel': {
          const channel = await this.channelManager.createChannel(
            p.teamDir as string,
            p as Record<string, unknown>
          );
          await this.auditLogger.log('create_channel', p.actor as string || 'dashboard', channel.id, channel.name);
          respond('response', { success: true, channel });
          break;
        }
        case 'send_message': {
          const message = await this.channelManager.sendMessage(
            p.teamDir as string,
            p.channelId as string,
            p as Record<string, unknown>
          );
          respond('response', { success: true, message });
          break;
        }
        case 'send_dm': {
          const message = await this.channelManager.sendDm(
            p.teamDir as string,
            p.from as string,
            p.to as string,
            p.text as string
          );
          respond('response', { success: true, message });
          break;
        }
        case 'get_messages': {
          const messages = await this.channelManager.getMessages(
            p.teamDir as string,
            p.channelId as string,
            { limit: p.limit as number, before: p.before as string }
          );
          respond('messages_history', { messages, channelId: p.channelId });
          break;
        }
        case 'mark_read': {
          await this.channelManager.markRead(p.teamDir as string, p.channelId as string);
          respond('response', { success: true });
          break;
        }

        // === Approvals ===
        case 'resolve_approval': {
          const approval = await this.approvalManager.resolveApproval(
            p.approvalId as string,
            p.resolution as 'approve' | 'reject',
            p.resolvedBy as string,
            p.comment as string
          );
          if (approval) {
            await this.auditLogger.log(
              'resolve_approval',
              p.resolvedBy as string || 'dashboard',
              approval.id,
              `${p.resolution}: ${approval.action}`
            );

            // Execute the approved action if it was approved
            if (approval.status === 'approved') {
              await this.executeApprovedAction(approval.action, approval.context);
            }
          }
          respond('response', { success: !!approval, approval });
          break;
        }
        case 'batch_resolve_approvals': {
          const results = await this.approvalManager.batchResolve(
            p.approvalIds as string[],
            p.resolution as 'approve' | 'reject',
            p.resolvedBy as string,
            p.comment as string
          );
          respond('response', { success: true, results });
          break;
        }
        case 'delegate_approval': {
          const approval = await this.approvalManager.delegateApproval(
            p.approvalId as string,
            p.newApprover as string
          );
          respond('response', { success: !!approval, approval });
          break;
        }

        // === Providers ===
        case 'create_provider': {
          const provider = await this.providerManager.createProvider(p as Record<string, unknown>);
          await this.auditLogger.log('create_provider', p.actor as string || 'dashboard', provider.id, provider.name);
          respond('response', { success: true, provider });
          break;
        }
        case 'update_provider': {
          const needsApproval = await this.approvalManager.requiresApproval('change_provider');
          if (needsApproval && (p.updates as Record<string, unknown>)?.config) {
            const approval = await this.approvalManager.createApproval({
              action: 'change_provider',
              description: `Update provider ${p.id}`,
              requester: p.actor as string || 'dashboard',
              context: { type: 'provider', resourceId: p.id as string, updates: p.updates as Record<string, unknown> },
            });
            respond('response', { success: false, needsApproval: true, approvalId: approval.id });
          } else {
            const provider = await this.providerManager.updateProvider(p.id as string, p.updates as Record<string, unknown>);
            respond('response', { success: !!provider, provider });
          }
          break;
        }
        case 'delete_provider': {
          const result = await this.providerManager.deleteProvider(p.id as string);
          if (result) {
            await this.auditLogger.log('delete_provider', p.actor as string || 'dashboard', p.id as string, 'Provider deleted');
          }
          respond('response', { success: result });
          break;
        }
        case 'test_provider': {
          const result = await this.providerManager.testProvider(p.id as string);
          respond('response', { ...result });
          break;
        }

        // === MCP ===
        case 'create_mcp_connection': {
          const connection = await this.mcpManager.createConnection(p as Record<string, unknown>);
          await this.auditLogger.log('create_mcp_connection', p.actor as string || 'dashboard', connection.id, connection.name);
          respond('response', { success: true, connection });
          break;
        }
        case 'update_mcp_connection': {
          const connection = await this.mcpManager.updateConnection(p.id as string, p.updates as Record<string, unknown>);
          respond('response', { success: !!connection, connection });
          break;
        }
        case 'delete_mcp_connection': {
          const result = await this.mcpManager.deleteConnection(p.id as string);
          if (result) {
            await this.auditLogger.log('delete_mcp_connection', p.actor as string || 'dashboard', p.id as string, 'Connection deleted');
          }
          respond('response', { success: result });
          break;
        }
        case 'test_mcp_connection': {
          const result = await this.mcpManager.testConnection(p.id as string);
          respond('response', { ...result });
          break;
        }
        case 'discover_mcp_tools': {
          const tools = await this.mcpManager.discoverTools(p.id as string);
          respond('response', { success: true, tools });
          break;
        }

        // === Governance ===
        case 'create_governance_rule': {
          const rule = await this.governanceManager.createRule(p as Record<string, unknown>);
          await this.auditLogger.log('create_governance_rule', p.actor as string || 'dashboard', rule.id, rule.name);
          respond('response', { success: true, rule });
          break;
        }
        case 'update_governance_rule': {
          const needsApproval = await this.approvalManager.requiresApproval('modify_governance');
          if (needsApproval) {
            const approval = await this.approvalManager.createApproval({
              action: 'modify_governance',
              description: `Update governance rule ${p.id}`,
              requester: p.actor as string || 'dashboard',
              context: { type: 'governance_rule', resourceId: p.id as string, updates: p.updates as Record<string, unknown> },
            });
            respond('response', { success: false, needsApproval: true, approvalId: approval.id });
          } else {
            const rule = await this.governanceManager.updateRule(
              p.id as string,
              p.updates as Record<string, unknown>,
              p.actor as string,
              p.changeNote as string
            );
            if (rule) {
              await this.auditLogger.log('update_governance_rule', p.actor as string || 'dashboard', rule.id, `v${rule.version}`);
            }
            respond('response', { success: !!rule, rule });
          }
          break;
        }
        case 'delete_governance_rule': {
          const result = await this.governanceManager.deleteRule(p.id as string);
          if (result) {
            await this.auditLogger.log('delete_governance_rule', p.actor as string || 'dashboard', p.id as string, 'Rule deleted');
          }
          respond('response', { success: result });
          break;
        }
        case 'toggle_governance_rule': {
          const rule = await this.governanceManager.toggleRule(p.id as string);
          if (rule) {
            await this.auditLogger.log('toggle_governance_rule', p.actor as string || 'dashboard', rule.id, `Status: ${rule.status}`);
          }
          respond('response', { success: !!rule, rule });
          break;
        }
        case 'rollback_governance_rule': {
          const rule = await this.governanceManager.rollbackRule(
            p.id as string,
            p.targetVersion as number
          );
          if (rule) {
            await this.auditLogger.log('rollback_governance_rule', p.actor as string || 'dashboard', rule.id, `Rolled back to v${p.targetVersion}`);
          }
          respond('response', { success: !!rule, rule });
          break;
        }

        // === Budget ===
        case 'update_budget': {
          const budget = await this.budgetManager.updateBudget(p.updates as Record<string, unknown>);
          await this.auditLogger.log('update_budget', p.actor as string || 'dashboard', 'budget', JSON.stringify(p.updates));
          respond('response', { success: true, budget });
          break;
        }
        case 'budget_override': {
          const needsApproval = await this.approvalManager.requiresApproval('budget_override');
          if (needsApproval) {
            const approval = await this.approvalManager.createApproval({
              action: 'budget_override',
              description: `Override budget: new limit $${p.newLimit}`,
              requester: p.actor as string || 'dashboard',
              context: { type: 'budget', resourceId: 'company', newLimit: p.newLimit as number, reason: p.reason as string },
            });
            respond('response', { success: false, needsApproval: true, approvalId: approval.id });
          } else {
            const budget = await this.budgetManager.updateBudget({ monthlyLimit: p.newLimit as number });
            respond('response', { success: true, budget });
          }
          break;
        }

        // === Onboarding ===
        case 'onboarding_step': {
          const state = await this.onboardingManager.completeStep(
            p.step as number,
            p.data as Record<string, unknown>
          );
          respond('response', { success: true, state });
          break;
        }
        case 'complete_onboarding': {
          await this.onboardingManager.completeOnboarding(p as Record<string, unknown>);
          await this.auditLogger.log('complete_onboarding', p.actor as string || 'dashboard', 'onboarding', 'Onboarding completed');
          respond('response', { success: true });
          break;
        }

        // === Library ===
        case 'publish_to_library': {
          const item = await this.libraryManager.publishItem(p as {
            name: string;
            type: string;
            category: string;
            description: string;
            sourcePath: string;
            publishedBy: string;
            publishedFrom: string;
            tags?: string[];
          });
          await this.auditLogger.log('publish_to_library', p.actor as string || 'dashboard', item.id, item.name);
          respond('response', { success: true, item });
          break;
        }
        case 'list_library': {
          const items = await this.libraryManager.listItems(p.filters as Record<string, unknown> | undefined);
          respond('response', { success: true, items });
          break;
        }

        // === Runs ===
        case 'list_runs': {
          const runs = await this.runHistoryManager.listRuns(p.filters as Record<string, unknown> | undefined);
          respond('response', { success: true, runs });
          break;
        }
        case 'get_run': {
          const run = await this.runHistoryManager.getRun(p.id as string);
          respond('response', { success: !!run, run });
          break;
        }

        // === Audit ===
        case 'query_audit': {
          const entries = await this.auditLogger.query(p as {
            startDate?: string;
            endDate?: string;
            action?: string;
            actor?: string;
            limit?: number;
          });
          respond('audit_query_result', { entries });
          break;
        }

        default:
          console.warn(`[commander] Unknown message type: ${msg.type}`);
          respond('error', { message: `Unknown message type: ${msg.type}` });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[commander] Error handling ${msg.type}:`, err);
      respond('error', { message: errorMsg, type: msg.type });
    }
  }

  /**
   * Execute an action after it has been approved.
   */
  private async executeApprovedAction(action: string, context: Record<string, unknown>): Promise<void> {
    try {
      switch (action) {
        case 'delete_team':
          await this.teamManager.deleteTeam(context.resourceId as string);
          break;
        case 'retire_agent':
          await this.configManager.deleteAgent(context.teamDir as string, context.resourceId as string);
          break;
        case 'delete_project':
          await this.projectManager.deleteProject(context.resourceId as string);
          break;
        case 'budget_override':
          await this.budgetManager.updateBudget({ monthlyLimit: context.newLimit as number });
          break;
        case 'modify_governance':
          if (context.updates) {
            await this.governanceManager.updateRule(
              context.resourceId as string,
              context.updates as Record<string, unknown>
            );
          }
          break;
        case 'change_provider':
          if (context.updates) {
            await this.providerManager.updateProvider(
              context.resourceId as string,
              context.updates as Record<string, unknown>
            );
          }
          break;
        default:
          console.log(`[commander] No auto-execute handler for approved action: ${action}`);
      }
    } catch (err) {
      console.error(`[commander] Error executing approved action ${action}:`, err);
    }
  }
}
