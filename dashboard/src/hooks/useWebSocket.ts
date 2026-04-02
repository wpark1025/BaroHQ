'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage } from '@/lib/types';
import { useAgentStore } from '@/store/useAgentStore';
import { useProjectStore } from '@/store/useProjectStore';

const WS_URL = 'ws://localhost:3001';
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const RETRY_MULTIPLIER = 1.5;

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const dispatch = useCallback((msg: WebSocketMessage) => {
    const agentStore = useAgentStore.getState();
    const projectStore = useProjectStore.getState();

    switch (msg.type) {
      case 'agents:update':
        if (Array.isArray(msg.payload)) {
          agentStore.setAgents(msg.payload);
        }
        break;
      case 'agent:update': {
        const agent = msg.payload as { id: string; [key: string]: unknown };
        if (agent && agent.id) {
          agentStore.updateAgent(agent.id, agent);
        }
        break;
      }
      case 'agent:add':
        agentStore.addAgent(msg.payload as Parameters<typeof agentStore.addAgent>[0]);
        break;
      case 'agent:remove':
        if (typeof msg.payload === 'string') {
          agentStore.removeAgent(msg.payload);
        }
        break;
      case 'projects:update':
        if (Array.isArray(msg.payload)) {
          projectStore.setProjects(msg.payload);
        }
        break;
      case 'tasks:update':
        if (Array.isArray(msg.payload)) {
          projectStore.setTasks(msg.payload);
        }
        break;
      case 'usage:update':
        agentStore.setUsage(msg.payload as Parameters<typeof agentStore.setUsage>[0]);
        break;
      default:
        break;
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }
        setConnected(true);
        retryDelayRef.current = INITIAL_RETRY_DELAY;
      };

      ws.onmessage = (event) => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(msg);
          dispatch(msg);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        wsRef.current = null;

        // Reconnect with exponential backoff
        const delay = retryDelayRef.current;
        retryDelayRef.current = Math.min(delay * RETRY_MULTIPLIER, MAX_RETRY_DELAY);
        retryTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Connection failed, will retry via onclose
    }
  }, [dispatch]);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { connected, send, lastMessage };
}
