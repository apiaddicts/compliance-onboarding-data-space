/**
 * Unit tests for src/store/view/viewSlice.ts
 */

import viewReducer, { changeView } from './viewSlice';

describe('viewSlice', () => {
  it('should return the initial state', () => {
    const state = viewReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ view: 'HOME' });
  });

  it('should handle changeView to PARTICIPANT', () => {
    const state = viewReducer(undefined, changeView('PARTICIPANT'));
    expect(state.view).toBe('PARTICIPANT');
  });

  it('should handle changeView to STEPPER', () => {
    const state = viewReducer(undefined, changeView('STEPPER'));
    expect(state.view).toBe('STEPPER');
  });

  it('should handle changeView back to HOME', () => {
    const previous = viewReducer(undefined, changeView('PARTICIPANT'));
    const state = viewReducer(previous, changeView('HOME'));
    expect(state.view).toBe('HOME');
  });
});
