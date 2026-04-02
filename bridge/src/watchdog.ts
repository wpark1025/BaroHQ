import { PlatformConfig, Manager } from './types';
import { getConfigPath, readJson } from './persistence';
import { BroadcastFn } from './auditLogger';

interface RateLimitEvent {
  provider: string;
  model?: string;
  timestamp: string;
  retryAfterMs?: number;
  statusCode?: number;
}

export class Watchdog implements Manager {
  private broadcast: BroadcastFn | null = null;
  private rateLimitHistory: RateLimitEvent[] = [];
  private resumeTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private monitorInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {}

  setBroadcast(fn: BroadcastFn): void {
    this.broadcast = fn;
  }

  async init(): Promise<void> {
    // Monitor for stuck/stale rate limit state every 60s
    this.monitorInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    console.log('[watchdog] Watchdog initialized.');
  }

  /**
   * Report a rate limit hit.
   */
  async onRateLimitHit(params: {
    provider: string;
    model?: string;
    retryAfterMs?: number;
    statusCode?: number;
  }): Promise<void> {
    const config = await readJson<PlatformConfig>(getConfigPath(), {} as PlatformConfig);
    const now = new Date().toISOString();

    const event: RateLimitEvent = {
      provider: params.provider,
      model: params.model,
      timestamp: now,
      retryAfterMs: params.retryAfterMs,
      statusCode: params.statusCode,
    };

    this.rateLimitHistory.push(event);

    // Trim history to last 100 events
    if (this.rateLimitHistory.length > 100) {
      this.rateLimitHistory = this.rateLimitHistory.slice(-100);
    }

    if (this.broadcast) {
      this.broadcast('rate_limit_hit', {
        provider: params.provider,
        model: params.model,
        timestamp: now,
        retryAfterMs: params.retryAfterMs,
      });
    }

    console.log(`[watchdog] Rate limit hit: provider=${params.provider}, retryAfter=${params.retryAfterMs}ms`);

    // Schedule auto-resume if configured
    if (config.autoResume?.enabled) {
      const bufferMinutes = config.autoResume.bufferMinutes || 2;
      const retryAfterMs = params.retryAfterMs || 60000; // default 1 minute
      const resumeDelayMs = retryAfterMs + bufferMinutes * 60 * 1000;

      this.scheduleAutoResume(params.provider, resumeDelayMs);
    }
  }

  /**
   * Schedule auto-resume after rate limit.
   */
  private scheduleAutoResume(provider: string, delayMs: number): void {
    // Cancel any existing resume timer for this provider
    const existing = this.resumeTimers.get(provider);
    if (existing) {
      clearTimeout(existing);
    }

    const resumeAt = new Date(Date.now() + delayMs).toISOString();

    if (this.broadcast) {
      this.broadcast('auto_resume_scheduled', {
        provider,
        resumeAt,
        delayMs,
      });
    }

    console.log(`[watchdog] Auto-resume scheduled for ${provider} at ${resumeAt}`);

    const timer = setTimeout(() => {
      this.resumeTimers.delete(provider);
      console.log(`[watchdog] Auto-resume triggered for ${provider}`);

      if (this.broadcast) {
        this.broadcast('provider_health', {
          providerId: provider,
          status: 'active',
          reason: 'auto_resume_after_rate_limit',
        });
      }
    }, delayMs);

    this.resumeTimers.set(provider, timer);
  }

  /**
   * Get rate limit history.
   */
  getRateLimitHistory(): RateLimitEvent[] {
    return [...this.rateLimitHistory];
  }

  /**
   * Check if a provider is currently rate limited.
   */
  isRateLimited(provider: string): boolean {
    return this.resumeTimers.has(provider);
  }

  /**
   * Get scheduled resume time for a provider.
   */
  getResumeInfo(provider: string): { scheduled: boolean; provider: string } {
    return {
      scheduled: this.resumeTimers.has(provider),
      provider,
    };
  }

  /**
   * Clean up old rate limit events.
   */
  private cleanup(): void {
    const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour ago
    this.rateLimitHistory = this.rateLimitHistory.filter((e) => {
      return new Date(e.timestamp).getTime() > cutoff;
    });
  }

  /**
   * Manually cancel auto-resume for a provider.
   */
  cancelAutoResume(provider: string): void {
    const timer = this.resumeTimers.get(provider);
    if (timer) {
      clearTimeout(timer);
      this.resumeTimers.delete(provider);
      console.log(`[watchdog] Auto-resume cancelled for ${provider}`);
    }
  }

  async shutdown(): Promise<void> {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    for (const timer of this.resumeTimers.values()) {
      clearTimeout(timer);
    }
    this.resumeTimers.clear();
    console.log('[watchdog] Watchdog shut down.');
  }
}
