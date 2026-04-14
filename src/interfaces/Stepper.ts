export interface ParticipantStepper {
  legalName: string;
  legalRegistrationNumber: string;
  headquarterAddress: string;
  legalAddres: string;
  parentOrganization: string;
  subOrganization: string;
}

export interface ServiceStepper {
  providedBy: string;
  policy: string;
  termsAndConditionsUrl: string;
  termsAndConditionsHash: string;
  requestType: string;
  accessType: string;
  formatType: string;
  aggregationOf: string;
  dependsOf: string;
  dataProtectionRegime: string;
}
