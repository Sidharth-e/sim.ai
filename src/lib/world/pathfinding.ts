import createGraph from 'ngraph.graph';
import path from 'ngraph.path';

export function findPath(
  start: [number, number],
  end: [number, number],
  blocked: Set<string>
) {
  const minX = Math.min(start[0], end[0]) - 5;
  const maxX = Math.max(start[0], end[0]) + 5;
  const minZ = Math.min(start[1], end[1]) - 5;
  const maxZ = Math.max(start[1], end[1]) + 5;

  const graph = createGraph();
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      if (blocked.has(`${x},${z}`)) continue;
      graph.addNode(`${x},${z}`);
      const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      for (const [dx, dz] of directions) {
        const nx = x + dx;
        const nz = z + dz;
        if (!blocked.has(`${nx},${nz}`)) {
          graph.addLink(`${x},${z}`, `${nx},${nz}`);
        }
      }
    }
  }
  const pathFinder = path.aStar(graph);
  return pathFinder.find(`${start[0]},${start[1]}`, `${end[0]},${end[1]}`);
}

interface PathNode {
  x: number;
  y: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent?: PathNode;
}

export function findVoxelPath(
  start: [number, number, number],
  target: [number, number, number],
  solidBlocks: Set<string>,
  maxSteps = 600
): [number, number, number][] {
  const sx = Math.round(start[0]);
  const sy = Math.round(start[1]);
  const sz = Math.round(start[2]);

  const tx = Math.round(target[0]);
  const ty = Math.round(target[1]);
  const tz = Math.round(target[2]);

  if (sx === tx && sy === ty && sz === tz) {
    return [[tx, ty, tz]];
  }

  const heuristic = (x: number, y: number, z: number) =>
    Math.sqrt((x - tx) ** 2 + (y - ty) ** 2 + (z - tz) ** 2);

  const startNode: PathNode = {
    x: sx,
    y: sy,
    z: sz,
    g: 0,
    h: heuristic(sx, sy, sz),
    f: heuristic(sx, sy, sz),
  };

  const openList: PathNode[] = [startNode];
  const closedSet = new Set<string>();

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  let iterations = 0;
  let closestNode = startNode;

  while (openList.length > 0 && iterations < maxSteps) {
    iterations++;

    let lowestIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    const current = openList.splice(lowestIndex, 1)[0];
    const key = `${current.x},${current.y},${current.z}`;
    closedSet.add(key);

    if (current.h < closestNode.h) {
      closestNode = current;
    }

    if (
      (current.x === tx && current.z === tz && Math.abs(current.y - ty) <= 1) ||
      current.h < 1.2
    ) {
      const waypoints: [number, number, number][] = [];
      let curr: PathNode | undefined = current;
      while (curr) {
        waypoints.unshift([curr.x, curr.y, curr.z]);
        curr = curr.parent;
      }
      return waypoints;
    }

    for (const [dx, dz] of directions) {
      const nx = current.x + dx;
      const nz = current.z + dz;

      for (let dy = -1; dy <= 1; dy++) {
        const ny = current.y + dy;
        const nKey = `${nx},${ny},${nz}`;

        if (closedSet.has(nKey)) continue;

        const isHeadBlocked = solidBlocks.has(`${nx},${ny + 1},${nz}`);
        const isBodyBlocked = solidBlocks.has(`${nx},${ny},${nz}`);
        if (isHeadBlocked || isBodyBlocked) continue;

        const stepCost = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const g = current.g + stepCost;
        const h = heuristic(nx, ny, nz);
        const f = g + h;

        const existing = openList.find((n) => n.x === nx && n.y === ny && n.z === nz);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        } else {
          openList.push({
            x: nx,
            y: ny,
            z: nz,
            g,
            h,
            f,
            parent: current,
          });
        }
      }
    }
  }

  const fallbackWaypoints: [number, number, number][] = [];
  let curr: PathNode | undefined = closestNode;
  while (curr) {
    fallbackWaypoints.unshift([curr.x, curr.y, curr.z]);
    curr = curr.parent;
  }
  return fallbackWaypoints.length > 0 ? fallbackWaypoints : [[tx, ty, tz]];
}
