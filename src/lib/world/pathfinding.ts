import createGraph from 'ngraph.graph';
import path from 'ngraph.path';

export function findPath(start: [number, number], end: [number, number], blocked: Set<string>) {
  const graph = createGraph();
  // Simple 2D grid pathfinding for now (x, z)
  for (let x = -10; x <= 10; x++) {
    for (let z = -10; z <= 10; z++) {
      if (blocked.has(`${x},${z}`)) continue;
      graph.addNode(`${x},${z}`);
      // Add neighbors (up, down, left, right)
      [[1,0], [-1,0], [0,1], [0,-1]].forEach(([dx, dz]) => {
        const nx = x + dx;
        const nz = z + dz;
        if (!blocked.has(`${nx},${nz}`)) {
          graph.addLink(`${x},${z}`, `${nx},${nz}`);
        }
      });
    }
  }
  const pathFinder = path.aStar(graph);
  return pathFinder.find(`${start[0]},${start[1]}`, `${end[0]},${end[1]}`);
}
