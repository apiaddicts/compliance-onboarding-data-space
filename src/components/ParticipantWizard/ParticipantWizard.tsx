import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Stepper, Step, StepLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { InfoView } from './StepInfo';
import { StepKey } from '../ownDidForm/StepKey';
import { StepIdentity } from '../ownDidForm/IdentityStep';
import { VerifiableCredentialModal } from '../Modal/Modal';
import { signCredential, sha256Hex, isISO31662, isPEMStructure } from '@/utils';
import { KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight, CheckCircle } from '@mui/icons-material';
import { LegalParticipantInterface, IdentityInterface } from '@/interfaces';
import { getJsonFile, validLRN, submitCompliance } from '@/apis/signApi';
import { CustomStepIcon } from '../common/CustomStepIcon';
import './ParticipantWizard.scss';
import legalPaticipantTemplate from '@/assets/files/legalParticipant.template.json';
import termsAndConditionsTemplate from '@/assets/files/terms&Conditions.template.json';
import verifiablePresentation from '@/assets/files/verifiablePresentation.json';
import did from '@/assets/files/did.json';

export const ParticipantWizard = () => {
  const { t } = useTranslation();
  const STEPS = [
    t("steps.start"),
    t("steps.identity"),
    t("steps.participant"),
    t("steps.terms"),
    t("steps.private-key"),
    t("steps.sign")
  ];

  const [useUrl, setUseUrl] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [legalPartForm, setLegalPartForm] = useState<LegalParticipantInterface>({
    legalName: '',
    legalRegistrationNumber: '',
    legalRegistrationNumberType: 'vatID',
    headquarterAddress: '',
    legalAddress: '',
    parentOrganization: '',
    subOrganization: '',
    url: '',
    lrnVerifiableCId: '',
    lrnCSubjectId: ''
  });
  const [identityForm, setIdentityForm] = useState<IdentityInterface>({
    documentName: '',
    issuer: '',
    verificationMethod: '',
    verifiableCredentialID: '',
    credentialSubjectID: '',
    tAndCVDID: '',
    tAndCCSubjectId: '',
    url: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsText] = useState(t("participant.terms-text"));
  const [pKey, setPKey] = useState('');
  const [isImportMode, setIsImportMode] = useState(true);
  const [isDidImportMode, setIsDidImportMode] = useState(true);
  const [download, setDownload] = useState(false);

  const [legalParticipant, setLegalParticipant] = useState(legalPaticipantTemplate);
  const [termsAndConditions, setTermsAndConditions] = useState(termsAndConditionsTemplate);
  const [lrn, setLrn] = useState({});
  const [vp, setVP] = useState(verifiablePresentation);

  const [errorPartForm, setErrorPartForm] = useState({
    show: false,
    message: ''
  });
  const [errorTermsForm, setErrorTermsForm] = useState({
    show: false,
    message: ''
  });
  const [errorIdentityForm, setErrorIdentityForm] = useState({
    show: false,
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openSnack, setOpenSnack] = useState(false);
  const [typeSnack, setTypeSnack] = useState<"success"|"error">('success');
  const [msgs, setMsgs] = useState('');

  const [complianceResult, setComplianceResult] = useState<Record<string, any> | null>(null);
  const [complianceError, setComplianceError] = useState<string[] | null>(null);

  const isValidLegalForm = async (): Promise<{ valid: boolean; error?: string }> => {
    setErrorPartForm({ show: false, message: '' });
    setIsLoading(true);
    try {
      if (!isISO31662(legalPartForm.headquarterAddress)) {
        const msg = t("participant.errors.invalid-headquarter-address");
        setErrorPartForm({ show: true, message: msg });
        return { valid: false, error: msg };
      }
      if (!isISO31662(legalPartForm.legalAddress)) {
        const msg = t("participant.errors.invalid-legal-address");
        setErrorPartForm({ show: true, message: msg });
        return { valid: false, error: msg };
      }
      const didId = identityForm.issuer || did['id'];
      const lrn = await validLRN(didId, legalPartForm.legalRegistrationNumber, legalPartForm.legalRegistrationNumberType);
      if (!lrn) {
        const msg = t("participant.errors.fail-valid-lrn");
        setErrorPartForm({ show: true, message: msg });
        return { valid: false, error: msg };
      }
      const jsonLrn = JSON.parse(lrn);
      setLrn(jsonLrn);

      const allForm = legalPartForm.legalName !== '' &&
                      legalPartForm.legalRegistrationNumber !== '' &&
                      legalPartForm.legalRegistrationNumberType !== '' &&
                      legalPartForm.headquarterAddress !== '' &&
                      legalPartForm.legalAddress !== ''
      if (!allForm) {
        const msg = t("participant.errors.fill-fields");
        setErrorPartForm({ show: true, message: msg });
        return { valid: false, error: msg };
      }
      return { valid: true };
    } catch (error: unknown) {
      console.error('LRN validation failed:', error);
      const msg = t("participant.errors.error-lrn");
      setErrorPartForm({ show: true, message: msg });
      return { valid: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }

  const handleStep1 = async () => {
    if (isImportMode) {
      if (!download) {
        setTypeSnack('error');
        setMsgs(t("participant.errors.no-file-imported"));
        setOpenSnack(true);
      } else {
        setDownload(false);
        const lrnRes = await getJsonFile(legalPartForm.legalRegistrationNumber);
        if (!lrnRes) {
          setErrorPartForm({ show: true, message: t("participant.errors.fail-valid-lrn") });
          return false;
        }
        setLrn(lrnRes.data);
        setActiveStep(prev => prev + 1);
      }
    } else {
      const result = await isValidLegalForm();
      if (result.valid) {
        let legalParticipant_ = {
          ...legalParticipant,
          "issuanceDate": new Date().toISOString(),
          "credentialSubject": {
            ...legalParticipant.credentialSubject,
            "gx:legalName": legalPartForm.legalName,
            "gx:headquarterAddress": {
              "gx:countrySubdivisionCode": legalPartForm.headquarterAddress
            },
            "gx:legalAddress": {
              "gx:countrySubdivisionCode": legalPartForm.legalAddress
            },
          }
        }
        setTypeSnack('success');
        setMsgs(t("participant.valid-legal-form"));
        setOpenSnack(true);
        setLegalParticipant(legalParticipant_);
        setActiveStep(prev => prev + 1);
      } else {
        setTypeSnack('error');
        setMsgs(result.error!);
        setOpenSnack(true);
      }
    }
  }

  const handleStep2 = async () => {
    setErrorTermsForm({ show: false, message: '' });
    if (!acceptTerms) {
      setErrorTermsForm({ show: true, message: t("participant.errors.should-accept-terms") });
      return;
    }
    let termsAndConditions_ = {
      ...termsAndConditions,
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        ...termsAndConditions.credentialSubject,
        "gx:termsAndConditions": termsText
      }
    }
    setTermsAndConditions(termsAndConditions_);
    setActiveStep(prev => prev + 1);
  }

  const handleStepKey = async () => {
    if (pKey === '') {
      setTypeSnack('error');
      setMsgs(t("participant.errors.private-key-required"));
      setOpenSnack(true);
      return;
    }
    if (!isPEMStructure(pKey)) {
      setTypeSnack('error');
      setMsgs(t("participant.errors.invalid-private-key"));
      setOpenSnack(true);
      return;
    }
    setActiveStep(prev => prev + 1);
  }

  const handleSignStep = async () => {
    setIsLoading(true);
    setComplianceResult(null);
    setComplianceError(null);

    try {
      const verificationMethod = identityForm.verificationMethod
        || 'did:web:self-description.opendataspace.io#X509-JWK2020';

      const lrnSubjectId = (lrn as Record<string, any>)?.credentialSubject?.id
        || legalParticipant.credentialSubject["gx:legalRegistrationNumber"].id;

      const termsText = termsAndConditions.credentialSubject["gx:termsAndConditions"];
      const termsHash = termsText ? await sha256Hex(termsText) : '';

      const preparedLP = {
        ...legalParticipant,
        "id": identityForm.verifiableCredentialID || legalParticipant.id,
        "issuer": identityForm.issuer || legalParticipant.issuer,
        "credentialSubject": {
          ...legalParticipant.credentialSubject,
          "id": identityForm.credentialSubjectID || legalParticipant.credentialSubject.id,
          "gx:legalRegistrationNumber": {
            "id": lrnSubjectId
          },
          ...(termsHash && { "gx-terms-and-conditions:gaiaxTermsAndConditions": termsHash })
        }
      };

      const preparedTAC = {
        ...termsAndConditions,
        "id": identityForm.tAndCVDID || termsAndConditions.id,
        "issuer": identityForm.issuer || termsAndConditions.issuer,
        "credentialSubject": {
          ...termsAndConditions.credentialSubject,
          "id": identityForm.tAndCCSubjectId || termsAndConditions.credentialSubject.id
        }
      };

      const algOverride = identityForm.signAlgorithm as 'ES256' | 'RS256' | 'PS256' | undefined;
      const signedLP = await signCredential(preparedLP, pKey, verificationMethod, algOverride);
      const signedTAC = await signCredential(preparedTAC, pKey, verificationMethod, algOverride);

      setLegalParticipant(signedLP as unknown as typeof legalPaticipantTemplate);
      setTermsAndConditions(signedTAC as unknown as typeof termsAndConditionsTemplate);

      const vpPayload = {
        ...vp,
        "holder": identityForm.issuer || vp.holder,
        "verifiableCredential": [signedLP, signedTAC, lrn]
      };
      setVP(vpPayload);
      setIsModalOpen(true);

      const complianceRes = await submitCompliance(vpPayload);
      setComplianceResult(complianceRes.data);
      setTypeSnack('success');
      setMsgs(t("participant.compliance-success"));
      setOpenSnack(true);
    } catch (error: unknown) {
      console.error('COMPLIANCE ERROR:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: Record<string, any> } };
        const data = axiosError.response?.data;
        let errors: string[];
        if (Array.isArray(data?.errors)) {
          errors = data.errors.map((e: unknown) => typeof e === 'string' ? e : JSON.stringify(e));
        } else if (data?.message && typeof data.message === 'object') {
          errors = Array.isArray(data.message.results) ? data.message.results : [JSON.stringify(data.message)];
        } else {
          errors = [data?.message || data?.error || 'Unknown compliance error'];
        }
        setComplianceError(errors);
      } else {
        setComplianceError([String(error)]);
      }
      setTypeSnack('error');
      setMsgs(t("participant.compliance-error"));
      setOpenSnack(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleNext = async () => {
    if (activeStep === 2) {
      await handleStep1();
    } else if (activeStep === 3) {
      await handleStep2();
    } else if (activeStep === 4) {
      await handleStepKey();
    } else if (activeStep === STEPS.length - 1) {
      await handleSignStep();
    } else {
      setActiveStep(prev => prev + 1);
    }
  }

  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleClose = () => setIsModalOpen(false);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <InfoView />;
      case 1:
        return (
          <StepIdentity
            identity={identityForm}
            setIdentity={setIdentityForm}
            isImportMode={isDidImportMode}
            setIsImportMode={setIsDidImportMode}
            errorManager={errorIdentityForm}
            setErrorManager={setErrorIdentityForm}
            setOpenSnack={setOpenSnack}
            setTypeSnack={setTypeSnack}
            setMsgs={setMsgs}
            setDownload={setDownload}
          />
        );
      case 2:
        return (
          <Step1
            legalPartForm={legalPartForm}
            setLegalPartForm={setLegalPartForm}
            useUrl={useUrl}
            setUseUrl={setUseUrl}
            errorManager={errorPartForm}
            setErrorManager={setErrorPartForm}
            setOpenSnack={setOpenSnack}
            setTypeSnack={setTypeSnack}
            setMsgs={setMsgs}
            setDownload={setDownload}
            isImportMode={isImportMode}
            setIsImportMode={setIsImportMode}
          />
        );
      case 3:
        return (
          <Step2
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
            termsText={termsText}
            errorManager={errorTermsForm}
          />
        );
      case 4:
        return <StepKey privateKey={pKey} setPrivateKey={setPKey} signAlgorithm={identityForm.signAlgorithm} setSignAlgorithm={(alg) => setIdentityForm({...identityForm, signAlgorithm: alg})} />;
      case 5:
        return <Step3 legalParticipant={legalParticipant} termsAndConditions={termsAndConditions} />;
      default:
        return null;
    }
  };

  const getButtonLabel = () => {
    if (isLoading) return <CircularProgress />;
    if (activeStep === 0) return t("common.start");
    if (activeStep === STEPS.length - 1) return STEPS[activeStep];
    return t("common.next");
  };

  return (
    <Container maxWidth="lg" className="wizard-content">
      <Box className="card-container">
        <Box className="stepper-container">
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel slots={{ stepIcon: CustomStepIcon }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box className="main-info">
          {renderStepContent()}
        </Box>
      </Box>

      <div className='buttons'>
      {activeStep > 0 &&
        <Button
          variant="contained"
          className="previous-button"
          startIcon={<KeyboardDoubleArrowLeft />}
          onClick={() => handleBack()}
        >
          {t("common.previous")}
        </Button>
      }
      {activeStep < STEPS.length &&
        <Button
          variant="contained"
          className="start-button"
          endIcon={activeStep === STEPS.length - 1 ? <CheckCircle/> : <KeyboardDoubleArrowRight />}
          onClick={() => handleNext()}
        >
          {getButtonLabel()}
        </Button>
      }
      </div>
      <VerifiableCredentialModal
        open={isModalOpen}
        handleClose={handleClose}
        vc1={legalParticipant}
        vc2={termsAndConditions}
        vc3={lrn}
        complianceResult={complianceResult}
        complianceError={complianceError}
      />
      <Snackbar
        open={openSnack}
        autoHideDuration={5000}
        onClose={() => setOpenSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={typeSnack}
          variant="filled"
          onClose={() => setOpenSnack(false)}
          sx={{
            minWidth: 300,
            borderRadius: 2,
            fontSize: '0.95rem',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {msgs}
        </Alert>
      </Snackbar>
    </Container>
  );
};
