/**
 * Unit tests for src/utils/functions.ts
 */

import { debounce, parseErrorAxios, isISO31662, isPEMStructure } from './functions';

/* ------------------------------------------------------------------ */
/*  debounce                                                          */
/* ------------------------------------------------------------------ */

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should delay function execution', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on subsequent calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    jest.advanceTimersByTime(200);
    debounced(); // restart
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

/* ------------------------------------------------------------------ */
/*  parseErrorAxios                                                   */
/* ------------------------------------------------------------------ */

describe('parseErrorAxios', () => {
  it('should parse an AxiosError with response', () => {
    const err = {
      response: {
        status: 422,
        data: {
          error: 'VALIDATION',
          error_description: 'Invalid input',
        },
      },
    };

    const result = parseErrorAxios(err);
    expect(result).toEqual({
      status: 422,
      error_code: 'VALIDATION',
      error_description: 'Invalid input',
    });
  });

  it('should fall back to error_code when error is undefined', () => {
    const err = {
      response: {
        status: 500,
        data: {
          error_code: 'INTERNAL',
          error_description: 'Something broke',
        },
      },
    };

    const result = parseErrorAxios(err);
    expect(result).toEqual({
      status: 500,
      error_code: 'INTERNAL',
      error_description: 'Something broke',
    });
  });

  it('should throw when there is no response', () => {
    const err = { message: 'Network Error' };
    expect(() => parseErrorAxios(err)).toThrow();
  });
});

/* ------------------------------------------------------------------ */
/*  isISO31662                                                        */
/* ------------------------------------------------------------------ */

describe('isISO31662', () => {
  it.each([
    ['ES-M', true],
    ['US-CA', true],
    ['DE-BY', true],
    ['es-m', false],
    ['INVALID', false],
    ['', false],
  ])('isISO31662("%s") → %s', (input, expected) => {
    expect(isISO31662(input)).toBe(expected);
  });
});

/* ------------------------------------------------------------------ */
/*  isPEMStructure                                                    */
/* ------------------------------------------------------------------ */

describe('isPEMStructure', () => {
  it('should return true for a valid PEM string', () => {
    const pem = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg==
-----END PRIVATE KEY-----`;
    expect(isPEMStructure(pem)).toBe(true);
  });

  it('should return false for a random string', () => {
    expect(isPEMStructure('not a pem')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isPEMStructure('')).toBe(false);
  });
});
