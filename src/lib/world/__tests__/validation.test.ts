import { validateBlockPlacement } from '../validation';

describe('validateBlockPlacement', () => {
  it('should accept valid block placement nearby', () => {
    const result = validateBlockPlacement([1, 0, 1], 'stone', [0, 1, 0]);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid block type', () => {
    const result = validateBlockPlacement([1, 0, 1], 'unobtainium', [0, 1, 0]);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Invalid block type');
  });

  it('should reject placement out of world bounds', () => {
    const result = validateBlockPlacement([500, 0, 0], 'dirt');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('out of world bounds');
  });

  it('should reject placement directly inside Sim position', () => {
    const result = validateBlockPlacement([0, 1, 0], 'wood', [0, 1, 0]);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('inside Sim body');
  });

  it('should reject placement exceeding max reach', () => {
    const result = validateBlockPlacement([15, 1, 15], 'wood', [0, 1, 0]);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('too far away');
  });

  it('should reject placement if block already exists at position', () => {
    const result = validateBlockPlacement(
      [2, 1, 2],
      'stone',
      [0, 1, 0],
      [{ pos: [2, 1, 2] }]
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('already exists');
  });
});
