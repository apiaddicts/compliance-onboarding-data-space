const { TextEncoder, TextDecoder } = require('node:util');

if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;

jest.mock('@gaia-x/json-web-signature-2020', () => ({
  JsonWebSignature2020Signer: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockImplementation(async (doc) => ({
      ...doc,
      proof: {
        type: 'JsonWebSignature2020',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:web:mock#key',
        jws: 'eyJhbGciOiJSUzI1NiJ9..mockSignature'
      }
    }))
  }))
}));

jest.mock('jose', () => ({
  importPKCS8: jest.fn().mockResolvedValue({})
}));
