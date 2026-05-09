import { useSimStore } from '../useSimStore';

describe('useSimStore', () => {
  beforeEach(() => {
    useSimStore.setState({
      stats: { hunger: 90, energy: 100, happiness: 100 },
      position: [0, 1, 0],
      isThinking: false,
      lastThought: '',
      inventory: { wood: 0, raw_meat: 0, cooked_meat: 0 },
    });
  });

  it('should have initial inventory', () => {
    const state = useSimStore.getState();
    expect(state.inventory).toEqual({ wood: 0, raw_meat: 0, cooked_meat: 0 });
  });

  it('should add items to inventory', () => {
    useSimStore.getState().addToInventory('wood', 5);
    expect(useSimStore.getState().inventory.wood).toBe(5);

    useSimStore.getState().addToInventory('wood', 3);
    expect(useSimStore.getState().inventory.wood).toBe(8);
  });

  it('should add new items to inventory', () => {
    useSimStore.getState().addToInventory('stone', 1);
    expect(useSimStore.getState().inventory.stone).toBe(1);
  });

  it('should remove items from inventory', () => {
    useSimStore.setState({ inventory: { wood: 10 } });
    useSimStore.getState().removeFromInventory('wood', 4);
    expect(useSimStore.getState().inventory.wood).toBe(6);
  });

  it('should not allow negative inventory', () => {
    useSimStore.setState({ inventory: { wood: 5 } });
    useSimStore.getState().removeFromInventory('wood', 10);
    expect(useSimStore.getState().inventory.wood).toBe(0);
  });

  it('should handle removing non-existent items', () => {
    useSimStore.getState().removeFromInventory('stone', 5);
    expect(useSimStore.getState().inventory.stone).toBe(0);
  });
});
