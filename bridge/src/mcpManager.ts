import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  McpConnection,
  McpConnectionStatus,
  McpTool,
  McpPreset,
  PlatformConfig,
  Manager,
} from './types';
import {
  getDataDir,
  getConfigPath,
  readJson,
  writeJsonAtomic,
} from './persistence';
import { BroadcastFn } from './auditLogger';

interface McpConnectionsFile {
  connections: McpConnection[];
}

interface McpPresetsFile {
  presets: McpPreset[];
}

export class McpManager implements Manager {
  private connectionsPath: string;
  private presetsPath: string;
  private broadcast: BroadcastFn | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();

  constructor() {
    const dataDir = getDataDir();
    this.connectionsPath = path.join(dataDir, 'mcp', 'connections.json');
    this.presetsPath = path.join(dataDir, 'mcp', 'presets.json');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    const intervalSec = config.mcp?.healthCheckIntervalSeconds || 120;

    // Health checks on configured interval
    this.healthCheckInterval = setInterval(() => {
      this.runHealthChecks().catch((err) =>
        console.error('[mcp] Health check error:', err)
      );
    }, intervalSec * 1000);

    console.log(`[mcp] MCP manager initialized. Health checks every ${intervalSec}s.`);
  }

  private async loadConnections(): Promise<McpConnectionsFile> {
    return readJson<McpConnectionsFile>(this.connectionsPath, { connections: [] });
  }

  private async saveConnections(data: McpConnectionsFile): Promise<void> {
    await writeJsonAtomic(this.connectionsPath, data);
  }

  /**
   * List all MCP connections.
   */
  async listConnections(): Promise<McpConnection[]> {
    const data = await this.loadConnections();
    return data.connections;
  }

  /**
   * Get a single connection by ID.
   */
  async getConnection(id: string): Promise<McpConnection | null> {
    const data = await this.loadConnections();
    return data.connections.find((c) => c.id === id) || null;
  }

  /**
   * List available presets.
   */
  async listPresets(): Promise<McpPreset[]> {
    const data = await readJson<McpPresetsFile>(this.presetsPath, { presets: [] });
    return data.presets;
  }

  /**
   * Create a new MCP connection.
   */
  async createConnection(input: Partial<McpConnection>): Promise<McpConnection> {
    const data = await this.loadConnections();
    const now = new Date().toISOString();

    const connection: McpConnection = {
      id: input.id || uuidv4(),
      preset: input.preset || '',
      name: input.name || 'New Connection',
      description: input.description || '',
      status: McpConnectionStatus.Disconnected,
      transport: input.transport || 'sse',
      config: input.config || {},
      tools: input.tools || [],
      scope: input.scope || 'global',
      lastHealthCheck: null,
      createdAt: now,
      updatedAt: now,
    };

    data.connections.push(connection);
    await this.saveConnections(data);

    if (this.broadcast) {
      this.broadcast('mcp_created', { connection });
    }

    console.log(`[mcp] Created connection: ${connection.name} (${connection.id})`);
    return connection;
  }

  /**
   * Update a connection.
   */
  async updateConnection(id: string, updates: Partial<McpConnection>): Promise<McpConnection | null> {
    const data = await this.loadConnections();
    const idx = data.connections.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const connection = {
      ...data.connections[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    data.connections[idx] = connection;
    await this.saveConnections(data);

    if (this.broadcast) {
      this.broadcast('mcp_updated', { connection });
    }

    return connection;
  }

  /**
   * Delete a connection.
   */
  async deleteConnection(id: string): Promise<boolean> {
    const data = await this.loadConnections();
    const idx = data.connections.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    // Cancel any reconnect timer
    const timer = this.reconnectTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(id);
    }
    this.reconnectAttempts.delete(id);

    data.connections.splice(idx, 1);
    await this.saveConnections(data);

    if (this.broadcast) {
      this.broadcast('mcp_deleted', { connectionId: id });
    }

    console.log(`[mcp] Deleted connection: ${id}`);
    return true;
  }

  /**
   * Test/connect to an MCP connection.
   */
  async testConnection(id: string): Promise<{ success: boolean; tools?: McpTool[]; error?: string }> {
    const connection = await this.getConnection(id);
    if (!connection) return { success: false, error: 'Connection not found' };

    try {
      await this.updateConnection(id, { status: McpConnectionStatus.Connecting });

      // Validate configuration
      if (connection.transport === 'sse' || connection.transport === 'streamable-http') {
        if (!connection.config.url) {
          await this.updateConnection(id, { status: McpConnectionStatus.Error });
          return { success: false, error: 'No URL configured' };
        }
      } else if (connection.transport === 'stdio') {
        if (!connection.config.command) {
          await this.updateConnection(id, { status: McpConnectionStatus.Error });
          return { success: false, error: 'No command configured for stdio transport' };
        }
      }

      // Mark as connected (actual MCP protocol connection would happen here)
      await this.updateConnection(id, {
        status: McpConnectionStatus.Connected,
        lastHealthCheck: new Date().toISOString(),
      });

      this.reconnectAttempts.delete(id);
      return { success: true, tools: connection.tools };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      await this.updateConnection(id, { status: McpConnectionStatus.Error });
      this.scheduleReconnect(id);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Disconnect an MCP connection.
   */
  async disconnect(id: string): Promise<void> {
    const timer = this.reconnectTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(id);
    }
    this.reconnectAttempts.delete(id);

    await this.updateConnection(id, { status: McpConnectionStatus.Disconnected });
  }

  /**
   * Schedule a reconnect with exponential backoff.
   */
  private scheduleReconnect(id: string): void {
    const attempts = this.reconnectAttempts.get(id) || 0;
    if (attempts >= 5) {
      console.log(`[mcp] Max reconnect attempts reached for ${id}`);
      return;
    }

    // Exponential backoff: 5s, 10s, 20s, 40s, 80s
    const delayMs = 5000 * Math.pow(2, attempts);
    this.reconnectAttempts.set(id, attempts + 1);

    const timer = setTimeout(async () => {
      this.reconnectTimers.delete(id);
      console.log(`[mcp] Reconnecting ${id} (attempt ${attempts + 1})...`);
      await this.testConnection(id);
    }, delayMs);

    this.reconnectTimers.set(id, timer);
  }

  /**
   * Discover tools for a connection (query tools/list).
   */
  async discoverTools(id: string): Promise<McpTool[]> {
    const connection = await this.getConnection(id);
    if (!connection) return [];

    // In a real implementation, this would call the MCP tools/list endpoint
    // For now, return the connection's configured tools
    const tools = connection.tools || [];

    if (this.broadcast) {
      this.broadcast('mcp_tools_discovered', { connectionId: id, tools });
    }

    return tools;
  }

  /**
   * Resolve which tools are available for a specific agent.
   */
  async resolveToolsForAgent(agentId: string, agentMcpConnections: string[]): Promise<McpTool[]> {
    const data = await this.loadConnections();
    const tools: McpTool[] = [];

    for (const conn of data.connections) {
      // Include global connections
      if (conn.scope === 'global' && conn.status === McpConnectionStatus.Connected) {
        tools.push(...conn.tools.filter((t) => t.enabled));
        continue;
      }

      // Include connections explicitly assigned to this agent
      if (agentMcpConnections.includes(conn.id) && conn.status === McpConnectionStatus.Connected) {
        tools.push(...conn.tools.filter((t) => t.enabled));
      }
    }

    return tools;
  }

  /**
   * Update credentials for a connection.
   */
  async updateCredentials(id: string, credentials: Record<string, string>): Promise<McpConnection | null> {
    const connection = await this.getConnection(id);
    if (!connection) return null;

    const updatedConfig = { ...connection.config };
    if (credentials.apiKey) {
      updatedConfig.headers = { ...updatedConfig.headers, Authorization: `Bearer ${credentials.apiKey}` };
    }
    if (credentials.url) {
      updatedConfig.url = credentials.url;
    }
    if (credentials.env) {
      updatedConfig.env = { ...updatedConfig.env, ...JSON.parse(credentials.env) };
    }

    return this.updateConnection(id, { config: updatedConfig });
  }

  /**
   * Run health checks on all connected MCP connections.
   */
  async runHealthChecks(): Promise<void> {
    const data = await this.loadConnections();

    for (const conn of data.connections) {
      if (conn.status !== McpConnectionStatus.Connected) continue;

      // Simple health check: update timestamp (real implementation would ping the MCP server)
      await this.updateConnection(conn.id, {
        lastHealthCheck: new Date().toISOString(),
      });

      if (this.broadcast) {
        this.broadcast('mcp_health', {
          connectionId: conn.id,
          status: conn.status,
        });
      }
    }
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();
    this.reconnectAttempts.clear();
    console.log('[mcp] MCP manager shut down.');
  }
}
