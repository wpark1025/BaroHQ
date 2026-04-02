import { WaypointNode, WaypointEdge } from './constants';

/**
 * BFS pathfinding on the waypoint graph.
 * Returns an ordered array of node IDs from `fromId` to `toId`.
 * Returns empty array if no path found.
 */
export function findPath(
  fromId: string,
  toId: string,
  nodes: WaypointNode[],
  edges: WaypointEdge[]
): string[] {
  if (fromId === toId) return [fromId];

  const nodeIds = new Set(nodes.map((n) => n.id));
  if (!nodeIds.has(fromId) || !nodeIds.has(toId)) return [];

  // Build adjacency list (undirected graph)
  const adjacency: Record<string, string[]> = {};
  for (const node of nodes) {
    adjacency[node.id] = [];
  }
  for (const edge of edges) {
    if (adjacency[edge.from]) adjacency[edge.from].push(edge.to);
    if (adjacency[edge.to]) adjacency[edge.to].push(edge.from);
  }

  // BFS
  const visited = new Set<string>();
  const parent: Record<string, string | null> = {};
  const queue: string[] = [fromId];
  visited.add(fromId);
  parent[fromId] = null;

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === toId) {
      // Reconstruct path
      const path: string[] = [];
      let node: string | null = toId;
      while (node !== null) {
        path.unshift(node);
        node = parent[node];
      }
      return path;
    }

    for (const neighbor of adjacency[current] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = current;
        queue.push(neighbor);
      }
    }
  }

  return []; // No path found
}

/**
 * Find the nearest waypoint node to a given (x, y) position.
 */
export function findNearestNode(
  x: number,
  y: number,
  nodes: WaypointNode[]
): WaypointNode | null {
  if (nodes.length === 0) return null;

  let nearest = nodes[0];
  let minDist = Infinity;

  for (const node of nodes) {
    const dx = node.x - x;
    const dy = node.y - y;
    const dist = dx * dx + dy * dy;
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }

  return nearest;
}

/**
 * Get the next pixel position when moving toward a target along the path.
 * Returns the new { x, y } position after one tick of movement at given speed.
 */
export function getNextPosition(
  current: { x: number; y: number },
  target: { x: number; y: number },
  speed: number
): { x: number; y: number; arrived: boolean } {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= speed) {
    return { x: target.x, y: target.y, arrived: true };
  }

  const ratio = speed / distance;
  return {
    x: current.x + dx * ratio,
    y: current.y + dy * ratio,
    arrived: false,
  };
}

/**
 * Convert a path of node IDs into a path of (x, y) coordinates.
 */
export function pathToPositions(
  pathIds: string[],
  nodes: WaypointNode[]
): { x: number; y: number }[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const positions: { x: number; y: number }[] = [];

  for (const id of pathIds) {
    const node = nodeMap.get(id);
    if (node) {
      positions.push({ x: node.x, y: node.y });
    }
  }

  return positions;
}

/**
 * Calculate total distance of a path.
 */
export function pathDistance(positions: { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x;
    const dy = positions[i].y - positions[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}
