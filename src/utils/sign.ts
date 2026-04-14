export type KeyAlgorithm = 'ES256' | 'RS256' | 'PS256';

function pemToBytes(pem: string): Uint8Array {
  const pemBody = pem
    .replace(/-----BEGIN [\w\s]+-----/, '')
    .replace(/-----END [\w\s]+-----/, '')
    .replace(/\s/g, '');
  const binaryString = atob(pemBody);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function detectKeyType(bytes: Uint8Array): KeyAlgorithm {
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  if (hex.includes('2a8648ce3d0201')) return 'ES256';
  if (hex.includes('2a864886f70d0101')) return 'RS256';
  return 'ES256';
}

export function detectAlgorithmFromPEM(pem: string): KeyAlgorithm {
  const bytes = pemToBytes(pem);
  return detectKeyType(bytes);
}

function toBase64Url(base64: string): string {
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/={1,2}$/, '');
}

const JWS2020_CONTEXT = 'https://w3id.org/security/suites/jws-2020/v1';

async function canonize(doc: Record<string, any>): Promise<string> {
  const jsonld = await import('jsonld');
  return jsonld.default.canonize(doc, {
    algorithm: 'URDNA2015',
    format: 'application/n-quads',
  });
}

async function sha256(data: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
}

export async function signCredential(
  vc: Record<string, any>,
  privateKeyPem: string,
  verificationMethod: string,
  algorithmOverride?: KeyAlgorithm
) {
  let alg: KeyAlgorithm = 'ES256';
  let key: CryptoKey;

  if (privateKeyPem) {
    alg = algorithmOverride || detectAlgorithmFromPEM(privateKeyPem);
    const { importPKCS8 } = await import('jose');
    key = (await importPKCS8(privateKeyPem.trim(), alg)) as unknown as CryptoKey;
  } else {
    const keyPair = await generateTemporaryKeys();
    key = keyPair.privateKey;
  }

  const proof: Record<string, any> = {
    type: 'JsonWebSignature2020',
    created: new Date().toISOString(),
    proofPurpose: 'assertionMethod',
    verificationMethod: verificationMethod.trim()
  };

  const canonizedData = await canonize(vc);
  const hashedData = new Uint8Array(await sha256(canonizedData));

  const context = Array.isArray(vc['@context']) ? [...vc['@context']] : [vc['@context']];
  if (!context.includes(JWS2020_CONTEXT)) context.push(JWS2020_CONTEXT);
  const proofForHash = { ...proof, '@context': context };
  const canonizedProof = await canonize(proofForHash);
  const hashedProof = new Uint8Array(await sha256(canonizedProof));

  const signingInput = new Uint8Array(hashedProof.length + hashedData.length);
  signingInput.set(hashedProof);
  signingInput.set(hashedData, hashedProof.length);

  const header = { alg, b64: false, crit: ['b64'] };
  const headerB64 = toBase64Url(btoa(JSON.stringify(header)));

  const dataToSign = new Uint8Array(
    new TextEncoder().encode(headerB64 + '.').length + signingInput.length
  );
  dataToSign.set(new TextEncoder().encode(headerB64 + '.'));
  dataToSign.set(signingInput, new TextEncoder().encode(headerB64 + '.').length);

  const importAlgorithms: Record<KeyAlgorithm, AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams> = {
    'ES256': { name: 'ECDSA', namedCurve: 'P-256' },
    'RS256': { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    'PS256': { name: 'RSA-PSS', hash: 'SHA-256' }
  };

  const signAlgorithms: Record<KeyAlgorithm, AlgorithmIdentifier | RsaPssParams | EcdsaParams> = {
    'ES256': { name: 'ECDSA', hash: { name: 'SHA-256' } },
    'RS256': { name: 'RSASSA-PKCS1-v1_5' },
    'PS256': { name: 'RSA-PSS', saltLength: 32 }
  };

  let cryptoKey: CryptoKey;
  if (privateKeyPem) {
    const keyBytes = pemToBytes(privateKeyPem);
    cryptoKey = await window.crypto.subtle.importKey(
      'pkcs8', keyBytes.buffer as ArrayBuffer, importAlgorithms[alg], false, ['sign']
    );
  } else {
    cryptoKey = key;
  }

  const signatureBuffer = await window.crypto.subtle.sign(
    signAlgorithms[alg], cryptoKey, dataToSign
  );
  const signatureB64 = toBase64Url(btoa(String.fromCharCode(...new Uint8Array(signatureBuffer))));

  return {
    ...vc,
    proof: {
      ...proof,
      jws: `${headerB64}..${signatureB64}`
    }
  };
}

export async function generateTemporaryKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );

  return keyPair;
}

export async function sha256Hex(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function exportPrivateKeyPEM(privateKey: CryptoKeyPair) {
  const exported = await window.crypto.subtle.exportKey(
    "pkcs8",
    privateKey.privateKey
  );

  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const base64Key = window.btoa(exportedAsString);
  const chunks = base64Key.match(/.{1,64}/g);
  const pemBody = chunks ? chunks.join('\n') : base64Key;

  const pem = `-----BEGIN PRIVATE KEY-----\n${pemBody}\n-----END PRIVATE KEY-----`;

  return pem;
}
