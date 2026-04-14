/**
 * Unit tests for src/utils/storage.ts
 */

import { setToken, getToken, removeToken } from './storage';

beforeEach(() => localStorage.clear());

describe('setToken', () => {
  it('should store the token info in localStorage', () => {
    const tokenInfo = {
      access_token: 'abc123',
      expires_in: 300,
      refresh_expires_in: 1800,
      refresh_token: 999,
    };

    setToken(tokenInfo);
    expect(localStorage.getItem('tokenInfo')).toBe(JSON.stringify(tokenInfo));
  });
});

describe('getToken', () => {
  it('should return null when no token is stored', () => {
    expect(getToken()).toBeNull();
  });

  it('should return the parsed token when present', () => {
    const tokenInfo = {
      access_token: 'abc123',
      expires_in: 300,
      refresh_expires_in: 1800,
      refresh_token: 999,
    };
    localStorage.setItem('tokenInfo', JSON.stringify(tokenInfo));
    expect(getToken()).toEqual(tokenInfo);
  });
});

describe('removeToken', () => {
  it('should clear the token from localStorage', () => {
    localStorage.setItem('tokenInfo', '"something"');
    removeToken();
    expect(localStorage.getItem('tokenInfo')).toBeNull();
  });
});
