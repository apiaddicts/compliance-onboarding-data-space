export interface LegalParticipantInterface {
  legalName: string;
  legalRegistrationNumber: string;
  legalRegistrationNumberType: string;
  lrnVerifiableCId?: string;
  lrnCSubjectId?: string;
  headquarterAddress: string;
  legalAddress: string;
  parentOrganization?: string;
  subOrganization?: string;
  url?: string;
}