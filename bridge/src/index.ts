import { PersistenceManager } from './persistence';
import { WebSocketServer } from './websocket';
import { FileWatcher } from './watcher';
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
import { AuditLogger } from './auditLogger';
import { RunHistoryManager } from './runHistoryManager';
import { UsageReader } from './usageReader';
import { Watchdog } from './watchdog';
import { LibraryManager } from './libraryManager';
import { Commander } from './commander';
import { Manager } from './types';

const PORT = parseInt(process.env.BRIDGE_PORT || process.env.PORT || '3001', 10);

async function main(): Promise<void> {
  console.log('========================================');
  console.log('  BaroHQ Bridge Server v6.0.0');
  console.log('========================================');
  console.log(`[bridge] Starting on port ${PORT}...`);

  // 1. Create all manager instances
  const persistence = new PersistenceManager();
  const wss = new WebSocketServer(PORT);
  const watcher = new FileWatcher(500);
  const auditLogger = new AuditLogger();
  const configManager = new ConfigManager();
  const teamManager = new TeamManager();
  const projectManager = new ProjectManager();
  const taskManager = new TaskManager();
  const channelManager = new ChannelManager();
  const goalManager = new GoalManager();
  const approvalManager = new ApprovalManager();
  const budgetManager = new BudgetManager();
  const providerManager = new ProviderManager();
  const mcpManager = new McpManager();
  const governanceManager = new GovernanceManager();
  const onboardingManager = new OnboardingManager();
  const runHistoryManager = new RunHistoryManager();
  const usageReader = new UsageReader();
  const watchdog = new Watchdog();
  const libraryManager = new LibraryManager();

  // 2. Wire broadcast function to all managers
  const broadcast = (type: string, payload: Record<string, unknown>) => {
    wss.broadcast(type, payload);
  };

  auditLogger.setBroadcast(broadcast);
  configManager.setBroadcast(broadcast);
  teamManager.setBroadcast(broadcast);
  projectManager.setBroadcast(broadcast);
  taskManager.setBroadcast(broadcast);
  channelManager.setBroadcast(broadcast);
  goalManager.setBroadcast(broadcast);
  approvalManager.setBroadcast(broadcast);
  budgetManager.setBroadcast(broadcast);
  providerManager.setBroadcast(broadcast);
  mcpManager.setBroadcast(broadcast);
  governanceManager.setBroadcast(broadcast);
  onboardingManager.setBroadcast(broadcast);
  runHistoryManager.setBroadcast(broadcast);
  usageReader.setBroadcast(broadcast);
  watchdog.setBroadcast(broadcast);
  libraryManager.setBroadcast(broadcast);

  // 3. Create commander (message router)
  const commander = new Commander({
    configManager,
    teamManager,
    projectManager,
    taskManager,
    channelManager,
    goalManager,
    approvalManager,
    budgetManager,
    providerManager,
    mcpManager,
    governanceManager,
    onboardingManager,
    runHistoryManager,
    libraryManager,
    auditLogger,
    usageReader,
  });

  // 4. Set up WebSocket message handler
  wss.setMessageHandler((msg, respond) => {
    commander.handleMessage(msg, respond).catch((err) => {
      console.error('[bridge] Unhandled command error:', err);
      respond('error', { message: 'Internal server error' });
    });
  });

  // 5. Set up file watcher callback
  watcher.setCallback(async (eventType: string, filePath: string) => {
    const category = FileWatcher.categorize(filePath);

    console.log(`[watcher] ${eventType} ${category}: ${filePath}`);

    try {
      switch (category) {
        case 'teams':
          // data/teams.json changed - reload all team configs and broadcast
          await configManager.loadAll();
          {
            const teams = await teamManager.listTeams();
            broadcast('team_created', { teams });
          }
          break;
        case 'channel':
          // channels.json or message file changed
          broadcast('channel_updated', { reloaded: true });
          break;
        case 'goal':
          // goals.json changed
          {
            const goals = await goalManager.listAllGoals();
            broadcast('goal_updated', { goals });
          }
          break;
        case 'governance':
          // Governance rule changed
          {
            const rules = await governanceManager.listRules();
            broadcast('governance_updated', { rules });
          }
          break;
        case 'project':
          // Projects file changed
          {
            const projects = await projectManager.listProjects();
            broadcast('project_updated', { projects });
          }
          break;
        case 'task':
          // Tasks or sprints file changed
          {
            const tasks = await taskManager.listTasks();
            const sprints = await taskManager.listSprints();
            broadcast('task_updated', { tasks, sprints });
          }
          break;
        case 'company':
          // Company info or onboarding state changed
          {
            const state = await onboardingManager.getState();
            const company = await onboardingManager.getCompanyInfo();
            broadcast('config_updated', { onboarding: state, company });
          }
          break;
        case 'provider':
          // Providers file changed
          {
            const providers = await providerManager.listProviders();
            broadcast('provider_updated', { providers });
          }
          break;
        case 'mcp':
          // MCP connections changed
          {
            const connections = await mcpManager.listConnections();
            broadcast('mcp_updated', { connections });
          }
          break;
        case 'config':
          // Root config.json changed
          broadcast('config_updated', { reloaded: true });
          break;
      }
    } catch (err) {
      console.error(`[watcher] Error handling ${category} change:`, err);
    }
  });

  // 6. Initialize all managers in order
  const allManagers: Manager[] = [
    persistence,
    auditLogger,
    configManager,
    teamManager,
    projectManager,
    taskManager,
    channelManager,
    goalManager,
    approvalManager,
    budgetManager,
    providerManager,
    mcpManager,
    governanceManager,
    onboardingManager,
    runHistoryManager,
    usageReader,
    watchdog,
    libraryManager,
  ];

  for (const manager of allManagers) {
    await manager.init();
  }

  // 7. Start WebSocket server and file watcher
  await wss.init();
  await watcher.init();

  console.log('[bridge] All systems initialized. Bridge is running.');

  // 8. Log startup audit entry
  await auditLogger.log('bridge_start', 'system', 'bridge', `Bridge started on port ${PORT}`);

  // 9. Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[bridge] Received ${signal}. Shutting down gracefully...`);

    await auditLogger.log('bridge_stop', 'system', 'bridge', `Bridge stopping (${signal})`);

    // Shut down in reverse order
    await watcher.shutdown();
    await wss.shutdown();

    for (const manager of [...allManagers].reverse()) {
      if (manager.shutdown) {
        await manager.shutdown();
      }
    }

    console.log('[bridge] Shutdown complete.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('uncaughtException', (err) => {
    console.error('[bridge] Uncaught exception:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[bridge] Unhandled rejection:', reason);
  });
}

main().catch((err) => {
  console.error('[bridge] Fatal error during startup:', err);
  process.exit(1);
});
