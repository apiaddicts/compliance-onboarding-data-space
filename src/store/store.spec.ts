/**
 * Unit tests for src/store/store.ts
 */

import { setupStore, reducers } from './store';

describe('store', () => {
  it('should create a store with default state', () => {
    const store = setupStore();
    const state = store.getState();
    expect(state.view).toEqual({ view: 'HOME' });
  });

  it('should accept preloaded state', () => {
    const store = setupStore({ view: { view: 'PARTICIPANT' } });
    expect(store.getState().view.view).toBe('PARTICIPANT');
  });

  it('should export reducers object with view key', () => {
    expect(reducers).toHaveProperty('view');
    expect(typeof reducers.view).toBe('function');
  });
});
