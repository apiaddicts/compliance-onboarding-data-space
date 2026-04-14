export interface IdentityInterface {
  documentName: string;
  issuer: string;
  verificationMethod: string;
  verifiableCredentialID: string;
  credentialSubjectID: string;
  tAndCVDID?: string;
  tAndCCSubjectId?: string;
  url?: string;
  signAlgorithm?: string;
}