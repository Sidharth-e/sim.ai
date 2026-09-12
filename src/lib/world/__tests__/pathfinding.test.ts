import { findPath, findVoxelPath } from '../pathfinding';

describe('pathfinding', () => {
  it('should find 2D path between two points', () => {
    const blocked = new Set(['1,0']);
    const path = findPath([0, 0], [2, 0], blocked);
    expect(path).toBeDefined();
    expect(path.length).toBeGreaterThan(0);
  });

  it('should find 3D voxel path around obstacles', () => {
    const solidBlocks = new Set(['1,1,0', '1,2,0']);
    const waypoints = findVoxelPath([0, 1, 0], [3, 1, 0], solidBlocks);
    expect(waypoints.length).toBeGreaterThan(0);
    const hasBlocked = waypoints.some(([x, y, z]) => solidBlocks.has(`${x},${y},${z}`));
    expect(hasBlocked).toBe(false);
  });

  it('should return destination when already at target', () => {
    const waypoints = findVoxelPath([2, 1, 2], [2, 1, 2], new Set());
    expect(waypoints).toEqual([[2, 1, 2]]);
  });
});
