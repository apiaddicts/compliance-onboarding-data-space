import {
  generateTemporaryKeys,
  exportPrivateKeyPEM,
  sha256Hex,
  detectAlgorithmFromPEM,
} from './sign';

const fakeKeyPair = {
  publicKey: {} as CryptoKey,
  privateKey: { type: 'private' } as CryptoKey,
};

const fakeSigBuffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;

const fakePkcs8Buffer = new Uint8Array([
  48, 46, 2, 1, 0, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1,
]).buffer;

beforeEach(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      subtle: {
        generateKey: jest.fn().mockResolvedValue(fakeKeyPair),
        sign: jest.fn().mockResolvedValue(fakeSigBuffer),
        exportKey: jest.fn().mockResolvedValue(fakePkcs8Buffer),
      },
    },
    writable: true,
    configurable: true,
  });
});

describe('generateTemporaryKeys', () => {
  it('should call crypto.subtle.generateKey with ECDSA P-256', async () => {
    const result = await generateTemporaryKeys();

    expect(globalThis.crypto.subtle.generateKey).toHaveBeenCalledWith(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify'],
    );
    expect(result).toEqual(fakeKeyPair);
  });
});

describe('detectAlgorithmFromPEM', () => {
  it('should detect ES256 for ECDSA P-256 key', () => {
    const ecPem = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg' +
      'test1234567890abcdefghijklmnopqrstuvwxyz0123456789' +
      '\n-----END PRIVATE KEY-----';
    const alg = detectAlgorithmFromPEM(ecPem);
    expect(alg).toBe('ES256');
  });

  it('should detect RS256 for RSA key', () => {
    const rsaPem = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA' +
      'test1234567890abcdefghijklmnopqrstuvwxyz0123456789' +
      '\n-----END PRIVATE KEY-----';
    const alg = detectAlgorithmFromPEM(rsaPem);
    expect(alg).toBe('RS256');
  });

  it('should default to ES256 for unknown key format', () => {
    const unknownPem = '-----BEGIN PRIVATE KEY-----\nAAAAAAAA\n-----END PRIVATE KEY-----';
    const alg = detectAlgorithmFromPEM(unknownPem);
    expect(alg).toBe('ES256');
  });
});

describe('exportPrivateKeyPEM', () => {
  it('should return a PEM-formatted string', async () => {
    const pem = await exportPrivateKeyPEM(fakeKeyPair as CryptoKeyPair);

    expect(pem).toContain('-----BEGIN PRIVATE KEY-----');
    expect(pem).toContain('-----END PRIVATE KEY-----');
  });

  it('should call crypto.subtle.exportKey with pkcs8', async () => {
    await exportPrivateKeyPEM(fakeKeyPair as CryptoKeyPair);

    expect(globalThis.crypto.subtle.exportKey).toHaveBeenCalledWith(
      'pkcs8',
      fakeKeyPair.privateKey,
    );
  });
});

describe('sha256Hex', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        subtle: {
          ...globalThis.crypto.subtle,
          digest: jest.fn().mockImplementation(async (_algo: string, data: ArrayBuffer) => {
            const bytes = new Uint8Array(data);
            const fakeHash = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
              fakeHash[i] = bytes[i % bytes.length] ^ (i * 7);
            }
            return fakeHash.buffer;
          }),
        },
      },
      writable: true,
      configurable: true,
    });
  });

  it('should return a 64-character hex string', async () => {
    const result = await sha256Hex('test');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should call crypto.subtle.digest with SHA-256', async () => {
    await sha256Hex('hello');
    const calls = (globalThis.crypto.subtle.digest as jest.Mock).mock.calls;
    expect(calls[0][0]).toBe('SHA-256');
  });
});
