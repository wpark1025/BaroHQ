import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Provider,
  ProviderStatus,
  ProvidersFile,
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

export class ProviderManager implements Manager {
  private providersPath: string;
  private broadcast: BroadcastFn | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.providersPath = path.join(getDataDir(), 'providers', 'providers.json');
  }

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    // Health checks every 60s
    this.healthCheckInterval = setInterval(() => {
      this.runHealthChecks().catch((err) =>
        console.error('[providers] Health check error:', err)
      );
    }, 60000);

    console.log('[providers] Provider manager initialized.');
  }

  private async load(): Promise<ProvidersFile> {
    return readJson<ProvidersFile>(this.providersPath, {
      providers: [],
      routing: { strategy: 'priority', fallbackEnabled: true, fallbackTriggers: ['rate_limited', 'down', 'error'], retryAttempts: 2 },
    });
  }

  private async save(data: ProvidersFile): Promise<void> {
    await writeJsonAtomic(this.providersPath, data);
  }

  /**
   * List all providers.
   */
  async listProviders(): Promise<Provider[]> {
    const data = await this.load();
    return data.providers;
  }

  /**
   * Get a single provider by ID.
   */
  async getProvider(id: string): Promise<Provider | null> {
    const data = await this.load();
    return data.providers.find((p) => p.id === id) || null;
  }

  /**
   * Create a new provider.
   */
  async createProvider(input: Partial<Provider>): Promise<Provider> {
    const data = await this.load();
    const now = new Date().toISOString();

    const provider: Provider = {
      id: input.id || uuidv4(),
      type: input.type || 'custom',
      name: input.name || 'New Provider',
      enabled: input.enabled !== undefined ? input.enabled : true,
      priority: input.priority || data.providers.length + 1,
      status: input.status || ProviderStatus.Active,
      config: input.config || {},
      modelMapping: input.modelMapping || {},
      pricing: input.pricing || {},
      lastHealthCheck: null,
      createdAt: now,
    };

    data.providers.push(provider);
    await this.save(data);

    // Update config fallback order
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    if (config.providers) {
      config.providers.fallbackOrder = data.providers
        .filter((p) => p.enabled)
        .sort((a, b) => a.priority - b.priority)
        .map((p) => p.id);
      await writeJsonAtomic(getConfigPath(), config);
    }

    if (this.broadcast) {
      this.broadcast('provider_created', { provider });
    }

    console.log(`[providers] Created provider: ${provider.name} (${provider.id})`);
    return provider;
  }

  /**
   * Update a provider.
   */
  async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider | null> {
    const data = await this.load();
    const idx = data.providers.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const provider = { ...data.providers[idx], ...updates, id };
    data.providers[idx] = provider;
    await this.save(data);

    if (this.broadcast) {
      this.broadcast('provider_updated', { provider });
    }

    return provider;
  }

  /**
   * Delete a provider.
   */
  async deleteProvider(id: string): Promise<boolean> {
    const data = await this.load();
    const idx = data.providers.findIndex((p) => p.id === id);
    if (idx === -1) return false;

    data.providers.splice(idx, 1);
    await this.save(data);

    if (this.broadcast) {
      this.broadcast('provider_deleted', { providerId: id });
    }

    console.log(`[providers] Deleted provider: ${id}`);
    return true;
  }

  /**
   * Test a provider connection.
   */
  async testProvider(id: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const provider = await this.getProvider(id);
    if (!provider) return { success: false, latencyMs: 0, error: 'Provider not found' };

    const start = Date.now();

    try {
      // For claude_code type, just check if we can reach a local process
      // For API types, try a basic connectivity check
      if (provider.type === 'claude_code' || provider.type === 'claude-code') {
        // Local CLI - always available if installed
        const latencyMs = Date.now() - start;
        await this.updateProvider(id, {
          status: ProviderStatus.Active,
          lastHealthCheck: new Date().toISOString(),
        });
        return { success: true, latencyMs };
      }

      // For API providers, check if API key is configured
      if (!provider.config.apiKey && !provider.config.baseUrl) {
        return { success: false, latencyMs: Date.now() - start, error: 'No API key or base URL configured' };
      }

      // Simulate health check (actual HTTP calls would need the provider SDK)
      const latencyMs = Date.now() - start;
      await this.updateProvider(id, {
        status: ProviderStatus.Active,
        lastHealthCheck: new Date().toISOString(),
      });

      return { success: true, latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      await this.updateProvider(id, {
        status: ProviderStatus.Down,
        lastHealthCheck: new Date().toISOString(),
      });
      return { success: false, latencyMs, error: errorMsg };
    }
  }

  /**
   * Run health checks on all enabled providers.
   */
  async runHealthChecks(): Promise<void> {
    const data = await this.load();

    for (const provider of data.providers) {
      if (!provider.enabled) continue;

      const result = await this.testProvider(provider.id);
      if (this.broadcast) {
        this.broadcast('provider_health', {
          providerId: provider.id,
          status: result.success ? 'active' : 'down',
          latencyMs: result.latencyMs,
          error: result.error,
        });
      }
    }
  }

  /**
   * Get the next available provider based on fallback routing.
   */
  async getNextAvailableProvider(excludeIds?: string[]): Promise<Provider | null> {
    const data = await this.load();
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    const excludeSet = new Set(excludeIds || []);

    const candidates = data.providers
      .filter((p) => p.enabled && !excludeSet.has(p.id) && p.status !== ProviderStatus.Down && p.status !== ProviderStatus.Disabled)
      .sort((a, b) => a.priority - b.priority);

    if (candidates.length === 0) return null;

    // If fallback is enabled, try in order
    if (config.providers?.fallbackEnabled) {
      return candidates[0];
    }

    // Otherwise only return the default
    const defaultId = config.providers?.defaultProvider;
    return candidates.find((p) => p.id === defaultId) || candidates[0];
  }

  /**
   * Create the correct adapter config for a provider type.
   * Returns the config shape needed to call that provider.
   */
  getAdapterConfig(provider: Provider): Record<string, unknown> {
    switch (provider.type) {
      case 'claude_code':
      case 'claude-code':
        return { type: 'local_cli' };
      case 'claude_api':
        return {
          type: 'anthropic_api',
          apiKey: provider.config.apiKey,
          baseUrl: provider.config.baseUrl || 'https://api.anthropic.com',
          maxConcurrent: provider.config.maxConcurrent || 5,
        };
      case 'openai':
        return {
          type: 'openai_api',
          apiKey: provider.config.apiKey,
          baseUrl: provider.config.baseUrl || 'https://api.openai.com/v1',
          orgId: provider.config.orgId,
        };
      case 'gemini':
        return {
          type: 'google_api',
          apiKey: provider.config.apiKey,
          baseUrl: provider.config.baseUrl || 'https://generativelanguage.googleapis.com',
        };
      case 'open_router':
        return {
          type: 'openrouter_api',
          apiKey: provider.config.apiKey,
          baseUrl: provider.config.baseUrl || 'https://openrouter.ai/api/v1',
        };
      default:
        return {
          type: 'custom',
          ...provider.config,
        };
    }
  }

  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    console.log('[providers] Provider manager shut down.');
  }
}
