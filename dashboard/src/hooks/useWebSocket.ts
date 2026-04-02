'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage, Agent, Project, Task, Sprint, Goal, Provider, McpConnection, GovernanceRule, BudgetInfo, Approval, AuditEntry, Channel, Message } from '@/lib/types';
import { useAgentStore } from '@/store/useAgentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useProviderStore } from '@/store/useProviderStore';
import { useMcpStore } from '@/store/useMcpStore';
import { useGovernanceStore } from '@/store/useGovernanceStore';
import { useGoalStore } from '@/store/goalStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useApprovalStore } from '@/store/approvalStore';
import { useAuditStore } from '@/store/auditStore';
import { useTeamStore } from '@/store/useTeamStore';
import { useChatStore } from '@/store/useChatStore';
import type { Team } from '@/lib/types';

const WS_URL = 'ws://localhost:3001';
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const RETRY_MULTIPLIER = 1.5;

interface FullStateSyncPayload {
  agents?: Agent[];
  projects?: Project[];
  tasks?: Task[];
  sprints?: Sprint[];
  goals?: Goal[];
  providers?: Provider[];
  mcpConnections?: McpConnection[];
  rules?: GovernanceRule[];
  budget?: BudgetInfo;
  approvals?: Approval[];
  auditEntries?: AuditEntry[];
  teams?: Team[];
  channels?: Channel[];
  messages?: Record<string, Message[]>;
  usage?: { tokens: number; cost: number; byAgent: Record<string, { tokens: number; cost: number }>; byProvider: Record<string, { tokens: number; cost: number }>; byModel: Record<string, { tokens: number; cost: number }> };
}

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
    const providerStore = useProviderStore.getState();
    const mcpStore = useMcpStore.getState();
    const governanceStore = useGovernanceStore.getState();
    const goalStore = useGoalStore.getState();
    const budgetStore = useBudgetStore.getState();
    const approvalStore = useApprovalStore.getState();
    const auditStore = useAuditStore.getState();
    const teamStore = useTeamStore.getState();
    const chatStore = useChatStore.getState();

    switch (msg.type) {
      // ---- Full state sync ----
      case 'full_state_sync': {
        const p = msg.payload as FullStateSyncPayload;
        if (p.agents) agentStore.setAgents(p.agents);
        if (p.projects) projectStore.setProjects(p.projects);
        if (p.tasks) projectStore.setTasks(p.tasks);
        if (p.sprints) projectStore.setSprints(p.sprints);
        if (p.goals) {
          // goalStore uses a direct set via zustand; access setState
          useGoalStore.setState({ goals: p.goals });
        }
        if (p.providers) providerStore.setProviders(p.providers);
        if (p.mcpConnections) mcpStore.setConnections(p.mcpConnections);
        if (p.rules) governanceStore.setRules(p.rules);
        if (p.budget) {
          useBudgetStore.setState({ budget: p.budget });
        }
        if (p.approvals) {
          useApprovalStore.setState({ approvals: p.approvals });
        }
        if (p.auditEntries) {
          useAuditStore.setState({ entries: p.auditEntries });
        }
        if (p.teams) teamStore.setTeams(p.teams);
        if (p.channels) chatStore.setChannels(p.channels);
        if (p.messages) chatStore.setAllMessages(p.messages);
        if (p.usage) agentStore.setUsage(p.usage);
        break;
      }

      // ---- Agent events ----
      case 'agents:update':
        if (Array.isArray(msg.payload)) {
          agentStore.setAgents(msg.payload as Agent[]);
        }
        break;
      case 'agent:update':
      case 'agent_status': {
        const agent = msg.payload as { id: string; [key: string]: unknown };
        if (agent && agent.id) {
          agentStore.updateAgent(agent.id, agent);
        }
        break;
      }
      case 'agent:add':
        agentStore.addAgent(msg.payload as Agent);
        break;
      case 'agent:remove':
        if (typeof msg.payload === 'string') {
          agentStore.removeAgent(msg.payload);
        }
        break;
      case 'roster_update':
        if (Array.isArray(msg.payload)) {
          agentStore.setAgents(msg.payload as Agent[]);
        }
        break;

      // ---- Project events ----
      case 'projects:update':
        if (Array.isArray(msg.payload)) {
          projectStore.setProjects(msg.payload as Project[]);
        }
        break;
      case 'project:add':
        projectStore.addProject(msg.payload as Project);
        break;
      case 'project:update': {
        const proj = msg.payload as { id: string; [key: string]: unknown };
        if (proj && proj.id) {
          projectStore.updateProject(proj.id, proj as Partial<Project>);
        }
        break;
      }

      // ---- Task events ----
      case 'tasks:update':
        if (Array.isArray(msg.payload)) {
          projectStore.setTasks(msg.payload as Task[]);
        }
        break;
      case 'task_created':
      case 'task:add':
        projectStore.addTask(msg.payload as Task);
        break;
      case 'task:update': {
        const task = msg.payload as { id: string; [key: string]: unknown };
        if (task && task.id) {
          projectStore.updateTask(task.id, task as Partial<Task>);
        }
        break;
      }

      // ---- Sprint events ----
      case 'sprints:update':
        if (Array.isArray(msg.payload)) {
          projectStore.setSprints(msg.payload as Sprint[]);
        }
        break;

      // ---- Goal events ----
      case 'goals:update':
        if (Array.isArray(msg.payload)) {
          useGoalStore.setState({ goals: msg.payload as Goal[] });
        }
        break;

      // ---- Provider events ----
      case 'providers:update':
        if (Array.isArray(msg.payload)) {
          providerStore.setProviders(msg.payload as Provider[]);
        }
        break;
      case 'provider:health': {
        const ph = msg.payload as { id: string; status: Provider['status'] };
        if (ph && ph.id) {
          providerStore.setHealthStatus(ph.id, ph.status);
        }
        break;
      }

      // ---- MCP events ----
      case 'mcp:update':
        if (Array.isArray(msg.payload)) {
          mcpStore.setConnections(msg.payload as McpConnection[]);
        }
        break;

      // ---- Governance events ----
      case 'rules:update':
        if (Array.isArray(msg.payload)) {
          governanceStore.setRules(msg.payload as GovernanceRule[]);
        }
        break;

      // ---- Budget events ----
      case 'budget:update':
        useBudgetStore.setState({ budget: msg.payload as BudgetInfo });
        break;

      // ---- Approval events ----
      case 'approvals:update':
        if (Array.isArray(msg.payload)) {
          useApprovalStore.setState({ approvals: msg.payload as Approval[] });
        }
        break;
      case 'approval:new':
        useApprovalStore.setState((state) => ({
          approvals: [...state.approvals, msg.payload as Approval],
        }));
        break;

      // ---- Audit events ----
      case 'audit:new':
        useAuditStore.setState((state) => ({
          entries: [msg.payload as AuditEntry, ...state.entries],
        }));
        break;

      // ---- Team events ----
      case 'teams:update':
        if (Array.isArray(msg.payload)) {
          teamStore.setTeams(msg.payload as Team[]);
        }
        break;

      // ---- Chat events ----
      case 'channels:update':
        if (Array.isArray(msg.payload)) {
          chatStore.setChannels(msg.payload as Channel[]);
        }
        break;
      case 'message:new': {
        const m = msg.payload as Message;
        if (m && m.channelId) {
          chatStore.addMessage(m.channelId, m);
        }
        break;
      }

      // ---- Usage events ----
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

        // Request full state on connect
        ws.send(JSON.stringify({ type: 'request_state', payload: null }));
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
