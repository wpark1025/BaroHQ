import WebSocket from 'ws';
import { WsMessage, Manager } from './types';
import { assembleFullState } from './persistence';

export type MessageHandler = (msg: WsMessage, respond: (type: string, payload: Record<string, unknown>) => void) => void;

export class WebSocketServer implements Manager {
  private wss: WebSocket.Server | null = null;
  private clients: Set<WebSocket> = new Set();
  private port: number;
  private messageHandler: MessageHandler | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(port: number) {
    this.port = port;
  }

  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  async init(): Promise<void> {
    return new Promise((resolve) => {
      this.wss = new WebSocket.Server({ port: this.port }, () => {
        console.log(`[ws] WebSocket server listening on port ${this.port}`);
        resolve();
      });

      this.wss.on('connection', (ws: WebSocket) => {
        this.clients.add(ws);
        console.log(`[ws] Client connected. Total: ${this.clients.size}`);

        // Send full state sync on connection
        this.sendFullState(ws);

        ws.on('message', (raw: WebSocket.RawData) => {
          try {
            const msg = JSON.parse(raw.toString()) as WsMessage;
            if (this.messageHandler) {
              const respond = (type: string, payload: Record<string, unknown>) => {
                this.send(ws, type, { ...payload, requestId: msg.requestId });
              };
              this.messageHandler(msg, respond);
            }
          } catch (err) {
            console.error('[ws] Failed to parse message:', err);
            this.send(ws, 'error', { message: 'Invalid message format' });
          }
        });

        ws.on('close', () => {
          this.clients.delete(ws);
          console.log(`[ws] Client disconnected. Total: ${this.clients.size}`);
        });

        ws.on('error', (err) => {
          console.error('[ws] Client error:', err);
          this.clients.delete(ws);
        });

        // Mark as alive for heartbeat
        (ws as WebSocket & { isAlive: boolean }).isAlive = true;
        ws.on('pong', () => {
          (ws as WebSocket & { isAlive: boolean }).isAlive = true;
        });
      });

      this.wss.on('error', (err) => {
        console.error('[ws] Server error:', err);
      });

      // Heartbeat every 30s
      this.heartbeatInterval = setInterval(() => {
        if (!this.wss) return;
        this.wss.clients.forEach((ws) => {
          const wsAlive = ws as WebSocket & { isAlive: boolean };
          if (!wsAlive.isAlive) {
            this.clients.delete(ws);
            return ws.terminate();
          }
          wsAlive.isAlive = false;
          ws.ping();
        });
      }, 30000);
    });
  }

  private async sendFullState(ws: WebSocket): Promise<void> {
    try {
      const state = await assembleFullState();
      this.send(ws, 'full_state_sync', state as unknown as Record<string, unknown>);
    } catch (err) {
      console.error('[ws] Failed to send full state:', err);
    }
  }

  /**
   * Send a message to a single client.
   */
  send(ws: WebSocket, type: string, payload: Record<string, unknown>): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type, payload }));
      } catch (err) {
        console.error('[ws] Failed to send message:', err);
      }
    }
  }

  /**
   * Broadcast a message to all connected clients.
   */
  broadcast(type: string, payload: Record<string, unknown>): void {
    const message = JSON.stringify({ type, payload });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (err) {
          console.error('[ws] Broadcast send error:', err);
        }
      }
    }
  }

  /**
   * Get the number of connected clients.
   */
  getClientCount(): number {
    return this.clients.size;
  }

  async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    // Close all client connections
    for (const client of this.clients) {
      client.close(1001, 'Server shutting down');
    }
    this.clients.clear();

    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close(() => {
          console.log('[ws] WebSocket server closed.');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
