'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAgentStore } from '@/store/useAgentStore';
import { DEFAULT_FLOOR_LAYOUT, NODE_POSITIONS, EDGES } from '@/lib/constants';
import { findPath, findNearestNode, getNextPosition, pathToPositions } from '@/lib/pathfinding';
import AgentSprite from './AgentSprite';
import { Desk, Couch, CoffeeMachine, Whiteboard, Plant, Bookshelf } from './Furniture';
import { Wall, Door, Window } from './Walls';
import type { Agent } from '@/lib/types';

const FLOOR_WIDTH = 800;
const FLOOR_HEIGHT = 620;
const AGENT_SPEED = 2;

function renderFurniture(item: (typeof DEFAULT_FLOOR_LAYOUT)[number]) {
  switch (item.type) {
    case 'desk':
      return <Desk key={item.id} x={item.x} y={item.y} />;
    case 'couch':
      return <Couch key={item.id} x={item.x} y={item.y} />;
    case 'coffee_machine':
      return <CoffeeMachine key={item.id} x={item.x} y={item.y} />;
    case 'whiteboard':
      return <Whiteboard key={item.id} x={item.x} y={item.y} />;
    case 'plant':
      return <Plant key={item.id} x={item.x} y={item.y} />;
    case 'bookshelf':
      return <Bookshelf key={item.id} x={item.x} y={item.y} />;
    default:
      return null;
  }
}

export default function OfficeFloor() {
  const { agents, selectAgent } = useAgentStore();
  const [localAgents, setLocalAgents] = useState<Agent[]>([]);
  const animFrameRef = useRef<number>(0);
  const pathsRef = useRef<Map<string, { x: number; y: number }[]>>(new Map());

  // Initialize local agent positions
  useEffect(() => {
    if (agents.length > 0) {
      setLocalAgents(agents);
    } else {
      // Demo agents if none loaded
      setLocalAgents([
        {
          id: 'demo-ceo',
          name: 'Alex Sterling',
          role: 'CEO',
          status: 'idle' as never,
          appearance: { hair: '#2d1b00', shirt: '#1e293b', pants: '#1e293b', skin: '#fde8c9' },
          position: { x: 100, y: 130 },
          providerId: '',
          modelTier: 'opus',
          mcpConnections: [],
          teamId: 'exec',
        },
        {
          id: 'demo-eng1',
          name: 'Jordan Blake',
          role: 'Engineer',
          status: 'working' as never,
          appearance: { hair: '#4a3728', shirt: '#3b82f6', pants: '#334155', skin: '#d4a574' },
          position: { x: 120, y: 310 },
          providerId: '',
          modelTier: 'sonnet',
          mcpConnections: [],
          teamId: 'eng',
        },
        {
          id: 'demo-eng2',
          name: 'Casey Morgan',
          role: 'Engineer',
          status: 'idle' as never,
          appearance: { hair: '#c4a35a', shirt: '#22c55e', pants: '#1e3a5f', skin: '#f5d0a9' },
          position: { x: 620, y: 310 },
          providerId: '',
          modelTier: 'sonnet',
          mcpConnections: [],
          teamId: 'eng',
        },
        {
          id: 'demo-des1',
          name: 'Riley Kim',
          role: 'Designer',
          status: 'meeting' as never,
          appearance: { hair: '#d44', shirt: '#ec4899', pants: '#312e81', skin: '#fde8c9' },
          position: { x: 700, y: 160 },
          providerId: '',
          modelTier: 'sonnet',
          mcpConnections: [],
          teamId: 'design',
        },
      ]);
    }
  }, [agents]);

  // Pathfinding animation loop
  const animate = useCallback(() => {
    setLocalAgents((prev) =>
      prev.map((agent) => {
        const path = pathsRef.current.get(agent.id);
        if (!path || path.length === 0) return agent;

        const target = path[0];
        const result = getNextPosition(agent.position, target, AGENT_SPEED);

        if (result.arrived) {
          path.shift();
          if (path.length === 0) {
            pathsRef.current.delete(agent.id);
          }
        }

        return { ...agent, position: { x: result.x, y: result.y } };
      })
    );

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animate]);

  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Move selected agent to clicked position
    const selectedAgent = localAgents.find((a) => a.id === 'demo-eng1');
    if (!selectedAgent) return;

    const fromNode = findNearestNode(selectedAgent.position.x, selectedAgent.position.y, NODE_POSITIONS);
    const toNode = findNearestNode(clickX, clickY, NODE_POSITIONS);
    if (!fromNode || !toNode) return;

    const pathIds = findPath(fromNode.id, toNode.id, NODE_POSITIONS, EDGES);
    if (pathIds.length > 0) {
      const positions = pathToPositions(pathIds, NODE_POSITIONS);
      pathsRef.current.set(selectedAgent.id, positions);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative office-grid bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden"
        style={{ width: FLOOR_WIDTH, height: FLOOR_HEIGHT }}
        onClick={handleFloorClick}
      >
        {/* Floor texture */}
        <div className="absolute inset-0 bg-slate-900/90" />

        {/* Outer Walls */}
        <Wall x={0} y={0} width={FLOOR_WIDTH} height={6} />
        <Wall x={0} y={FLOOR_HEIGHT - 6} width={FLOOR_WIDTH} height={6} />
        <Wall x={0} y={0} width={6} height={FLOOR_HEIGHT} />
        <Wall x={FLOOR_WIDTH - 6} y={0} width={6} height={FLOOR_HEIGHT} />

        {/* CEO Suite walls */}
        <Wall x={0} y={180} width={240} height={4} />
        <Wall x={240} y={0} width={4} height={180} />
        <Door x={240} y={180} width={32} height={0} />

        {/* Meeting Room walls */}
        <Wall x={640} y={0} width={4} height={100} />
        <Wall x={640} y={100} width={FLOOR_WIDTH - 640} height={4} />
        <Door x={640} y={100} width={32} height={0} />

        {/* Windows */}
        <Window x={50} y={0} width={40} height={6} />
        <Window x={140} y={0} width={40} height={6} />
        <Window x={320} y={0} width={40} height={6} />
        <Window x={480} y={0} width={40} height={6} />
        <Window x={FLOOR_WIDTH - 6} y={200} width={6} height={40} />
        <Window x={FLOOR_WIDTH - 6} y={350} width={6} height={40} />

        {/* Entrance door */}
        <Door x={384} y={FLOOR_HEIGHT - 6} width={32} height={6} />

        {/* Restroom door */}
        <Door x={180} y={FLOOR_HEIGHT - 6} width={28} height={6} />

        {/* Restroom label */}
        <div
          className="absolute text-[8px] text-slate-600 font-medium"
          style={{ left: 178, top: FLOOR_HEIGHT - 18 }}
        >
          WC
        </div>

        {/* Entrance label */}
        <div
          className="absolute text-[8px] text-slate-500 font-medium text-center"
          style={{ left: 380, top: FLOOR_HEIGHT - 20, width: 40 }}
        >
          ENTRANCE
        </div>

        {/* CEO Suite label */}
        <div
          className="absolute text-[9px] text-amber-500/60 font-bold tracking-wider"
          style={{ left: 20, top: 12 }}
        >
          CEO SUITE
        </div>

        {/* Meeting Room label */}
        <div
          className="absolute text-[9px] text-purple-500/60 font-bold tracking-wider"
          style={{ left: 660, top: 12 }}
        >
          MEETING ROOM
        </div>

        {/* Hallway label */}
        <div
          className="absolute text-[8px] text-slate-600 tracking-widest"
          style={{ left: 370, top: 395 }}
        >
          HALLWAY
        </div>

        {/* Furniture */}
        {DEFAULT_FLOOR_LAYOUT.map(renderFurniture)}

        {/* Agent Sprites */}
        {localAgents.map((agent) => (
          <AgentSprite
            key={agent.id}
            agent={agent}
            onClick={() => selectAgent(agent)}
            showLabel={true}
          />
        ))}

        {/* Grid overlay hint */}
        <div className="absolute bottom-2 right-2 text-[8px] text-slate-700">
          Click to move agent
        </div>
      </div>
    </div>
  );
}
