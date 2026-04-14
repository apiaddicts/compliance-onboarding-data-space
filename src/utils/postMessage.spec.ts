/**
 * Unit tests for src/utils/postMessage.ts
 */

import { TextEncoder as NodeTextEncoder } from 'node:util';

// Polyfill TextEncoder for jsdom
if (globalThis.TextEncoder === undefined) {
  (globalThis as any).TextEncoder = NodeTextEncoder;
}

import { isEmbeddedInIframe, sendVcsToParent, vcToBase64 } from './postMessage';

describe('isEmbeddedInIframe', () => {
  it('should return false when window.parent === window (top-level)', () => {
    // In jsdom, window.parent === window by default
    expect(isEmbeddedInIframe()).toBe(false);
  });
});

describe('vcToBase64', () => {
  it('should encode a VC object into base64', () => {
    const vc = { id: 'test', type: 'VC' };
    const result = vcToBase64(vc, 'test.json');

    expect(result.filename).toBe('test.json');
    expect(typeof result.content_in_base64).toBe('string');

    // Decode and verify round-trip
    const decoded = JSON.parse(Buffer.from(result.content_in_base64, 'base64').toString('utf-8'));
    expect(decoded).toEqual(vc);
  });
});

describe('sendVcsToParent', () => {
  it('should not throw when not in an iframe', () => {
    // When not embedded, it returns early without error
    expect(() => sendVcsToParent([])).not.toThrow();
  });
});
