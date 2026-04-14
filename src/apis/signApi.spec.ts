/**
 * Unit tests for src/apis/signApi.ts
 */

import apis from './index';
import { getJsonFile, submitCompliance, validLRN } from './signApi';

jest.mock('./index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/utils', () => ({
  getEnvironment: () => ({
    VITE_API_BACK: 'https://api.test.com',
    VITE_CLIENT_ID_KONG: 'test-client-id',
    VITE_CLIENT_SECRET_KONG: 'test-client-secret',
    VITE_COMPLIANCE_URL: 'https://compliance.lab.gaia-x.eu/v1-staging',
  }),
}));

beforeEach(() => jest.clearAllMocks());

describe('getJsonFile', () => {
  it('should call apis.get with the provided URL', async () => {
    const mockResponse = { data: { key: 'value' } };
    (apis.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getJsonFile('https://example.com/data.json');
    expect(apis.get).toHaveBeenCalledWith('https://example.com/data.json');
    expect(result).toEqual(mockResponse);
  });
});

describe('submitCompliance', () => {
  it('should POST to compliance endpoint with the given VP', async () => {
    const vp = { id: 'vp-1', type: 'VerifiablePresentation' };
    const mockResponse = { data: { status: 'ok' } };
    (apis.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await submitCompliance(vp);
    expect(apis.post).toHaveBeenCalledWith(
      'https://compliance.lab.gaia-x.eu/v1-staging/api/credential-offers',
      vp,
      { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
    );
    expect(result).toEqual(mockResponse);
  });
});

describe('validLRN', () => {
  it('should first get a Kong token and then call valid-lrn', async () => {
    const tokenResponse = { data: { access_token: 'mock-token-123' } };
    const lrnResponse = { data: { valid: true } };

    (apis.post as jest.Mock)
      .mockResolvedValueOnce(tokenResponse)
      .mockResolvedValueOnce(lrnResponse);

    const result = await validLRN('did:web:example', 'lrn-123', 'participant');

    // First call: get token
    expect(apis.post).toHaveBeenNthCalledWith(1, 'https://api.test.com/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      scope: 'read',
    });

    // Second call: validate LRN with token
    expect(apis.post).toHaveBeenNthCalledWith(
      2,
      'https://api.test.com/valid-lrn',
      { didId: 'did:web:example', idLrn: 'lrn-123', type: 'participant' },
      { headers: { token: 'mock-token-123' } },
    );

    expect(result).toEqual({ valid: true });
  });
});
