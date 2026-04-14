import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Container, Stepper, Step, StepLabel, Snackbar, Alert } from '@mui/material';
import { Step1 } from './Step1';
import { SignStep } from './LastStep';
import { InfoView } from './StepInfo';
import { StepKey } from '../ownDidForm/StepKey';
import { StepIdentity } from '../ownDidForm/IdentityStep';
import { VerifiableCredentialStepperModal } from '../Modal/ModalVC';
import { KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight, CheckCircle } from '@mui/icons-material';
import { ParticipantStepper, ServiceStepper, IdentityInterface } from '@/interfaces';
import { signCredential, isISO31662, isPEMStructure } from '@/utils';
import { CustomStepIcon } from '../common/CustomStepIcon';
import './StepperWizard.scss';
import participantTemplate from '@/assets/files/participant.template.json';
import termsAndConditionsTemplate from '@/assets/files/terms&Conditions.template.json';
import serviceOfferingTemplate from '@/assets/files/serviceOffering.template.json';

export const StepperWizard = () => {
  const { t } = useTranslation();
  const STEPS_STEPPER = [
    t("steps.create-vc"),
    t("steps.private-key"),
    t("steps.identity"),
    t("steps.sign")
  ];

  const [activeStep, setActiveStep] = useState(-1);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  const [participantForm, setParticipantForm] = useState<ParticipantStepper>({
    legalName: '',
    legalRegistrationNumber: '',
    headquarterAddress: '',
    legalAddres: '',
    parentOrganization: '',
    subOrganization: ''
  });
  const [serviceForm, setServiceForm] = useState<ServiceStepper>({
    providedBy: '',
    policy: '',
    termsAndConditionsUrl: '',
    termsAndConditionsHash: '',
    requestType: '',
    accessType: '',
    formatType: '',
    aggregationOf: '',
    dependsOf: '',
    dataProtectionRegime: ''
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
  const [pKey, setPKey] = useState('');

  const [participantStepper, setParticipantStepper] = useState(participantTemplate);
  const [serviceStepper, setServiceStepper] = useState(serviceOfferingTemplate);
  const [termsAndConditions, setTermsAndConditions] = useState(termsAndConditionsTemplate);
  const [termsText] = useState(t("participant.terms-text"));

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [vcValue, setVCValue] = useState({});

  const [isDidImportMode, setIsDidImportMode] = useState(true);
  const [download, setDownload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openSnack, setOpenSnack] = useState(false);
  const [typeSnack, setTypeSnack] = useState<"success"|"error">('success');
  const [msgs, setMsgs] = useState('');

  const [errorPartForm, setErrorPartForm] = useState({
    show: false,
    message: ''
  });
  const [errorIdentityForm, setErrorIdentityForm] = useState({
    show: false,
    message: ''
  });

  const isValidParticipantForm = () => {
    setErrorIdentityForm({ show: false, message: '' });
    if (!isISO31662(participantForm.headquarterAddress)) {
      setErrorPartForm({ show: true, message: t("participant.errors.invalid-headquarter-address") });
      return false;
    }
    if (!isISO31662(participantForm.legalAddres)) {
      setErrorPartForm({ show: true, message: t("participant.errors.invalid-legal-address") });
      return false;
    }
    const allForm = participantForm.legalName !== '' &&
      participantForm.legalRegistrationNumber !== '' &&
      participantForm.headquarterAddress !== '' &&
      participantForm.legalAddres !== '';
    if (!allForm) {
      setErrorPartForm({ show: true, message: t("participant.errors.fill-fields")})
      setTypeSnack('error');
      setMsgs(t("participant.errors.fill-fields"));
      setOpenSnack(true);
      return false;
    }
    return allForm;
  }

  const handleStepKey = (pKey: string) => {
    if (pKey === '') {
      setTypeSnack('error');
      setMsgs(t("participant.errors.private-key-required"));
      setOpenSnack(true);
      return false;
    }
    if (!isPEMStructure(pKey)) {
      setTypeSnack('error');
      setMsgs(t("participant.errors.invalid-private-key"));
      setOpenSnack(true);
      return false;
    }
    return true;
  }

  const isValidServiceForm = () => {
    setErrorIdentityForm({ show: false, message: '' });
    const allForm = serviceForm.providedBy !== '' &&
      serviceForm.policy !== '' &&
      serviceForm.termsAndConditionsUrl !== '' &&
      serviceForm.termsAndConditionsHash !== '' &&
      serviceForm.requestType !== '' &&
      serviceForm.accessType !== '' &&
      serviceForm.formatType !== '';
    if (!allForm) {
      setErrorPartForm({ show: true, message: t("participant.errors.fill-fields")})
      setTypeSnack('error');
      setMsgs(t("participant.errors.fill-fields"));
      setOpenSnack(true);
      return false;
    }
    return allForm;
  }

  const isValidIdentityForm = () => {
    return (
      identityForm.documentName !== '' &&
      identityForm.issuer !== '' &&
      identityForm.verificationMethod !== '' &&
      identityForm.verifiableCredentialID !== '' &&
      identityForm.credentialSubjectID !== ''
    )
  }

  const handleSignCredential = async (credential: Record<string, any>, privateKey: string) => {
    try {
      const verificationMethod = identityForm.verificationMethod
        || 'did:web:self-description.opendataspace.io#X509-JWK2020';

      const prepared = {
        ...credential,
        "id": identityForm.verifiableCredentialID || credential.id,
        "issuer": identityForm.issuer || credential.issuer,
        "credentialSubject": {
          ...credential.credentialSubject,
          "id": identityForm.credentialSubjectID || credential.credentialSubject?.id
        }
      };

      const algOverride = identityForm.signAlgorithm as 'ES256' | 'RS256' | 'PS256' | undefined;
      const signedVC = await signCredential(prepared, privateKey, verificationMethod, algOverride);
      setVCValue(signedVC);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error signing credential:', error);
    }
  }

  const showError = (msg: string) => {
    setTypeSnack('error');
    setMsgs(msg);
    setOpenSnack(true);
  }

  const validateKeyStep = (): boolean => {
    if (!handleStepKey(pKey)) {
      showError(t("stepper.service.errors.private-key-error"));
      return false;
    }
    return true;
  }

  const validateIdentityStep = (): boolean => {
    if (!isDidImportMode) {
      if (!isValidIdentityForm()) {
        showError(t("stepper.service.errors.identity-form-invalid"));
        return false;
      }
    } else {
      if (identityForm.url === '') {
        showError(t("stepper.service.errors.enter-file-url"));
        return false;
      }
      if (!download) {
        showError(t("stepper.service.errors.file-download-failed"));
        return false;
      }
    }
    return true;
  }

  const handleParticipant = async () => {
    if (activeStep === 0) {
      if (!isValidParticipantForm()) {
        showError(t("stepper.service.errors.fill-fields"));
        return;
      }
      setParticipantStepper({
        ...participantStepper,
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
          ...participantStepper.credentialSubject,
          "gx:legalName": participantForm.legalName,
          "gx:headquarterAddress": { "gx:countrySubdivisionCode": participantForm.headquarterAddress },
          "gx:legalRegistrationNumber": { "id": participantForm.legalRegistrationNumber },
          "gx:legalAddress": { "gx:countrySubdivisionCode": participantForm.legalAddres },
          ...(participantForm.parentOrganization && { "gx:parentOrganization": participantForm.parentOrganization }),
          ...(participantForm.subOrganization && { "gx:subOrganization": participantForm.subOrganization })
        }
      });
      setActiveStep(prev => prev + 1);
    } else if (activeStep === 1) {
      if (validateKeyStep()) setActiveStep(prev => prev + 1);
    } else if (activeStep === 2) {
      if (validateIdentityStep()) setActiveStep(prev => prev + 1);
    } else {
      await handleSignCredential(participantStepper, pKey);
    }
  }

  const handleService = async () => {
    if (activeStep === 0) {
      if (!isValidServiceForm()) {
        showError(t("stepper.service.errors.fill-fields"));
        return;
      }
      setServiceStepper({
        ...serviceStepper,
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
          ...serviceStepper.credentialSubject,
          "gx:providedBy": { "id": serviceForm.providedBy },
          "gx:policy": serviceForm.policy,
          "gx:termsAndConditions": { "gx:URL": serviceForm.termsAndConditionsUrl, "gx:hash": serviceForm.termsAndConditionsHash },
          "gx:dataAccountExport": { "gx:requestType": serviceForm.requestType, "gx:accessType": serviceForm.accessType, "gx:formatType": serviceForm.formatType },
          "gx:aggregationOf": serviceForm.aggregationOf,
          "gx:dependsOn": serviceForm.dependsOf,
          "gx:dataProtectionRegime": serviceForm.dataProtectionRegime,
        }
      });
      setActiveStep(prev => prev + 1);
    } else if (activeStep === 1) {
      if (validateKeyStep()) setActiveStep(prev => prev + 1);
    } else if (activeStep === 2) {
      if (validateIdentityStep()) setActiveStep(prev => prev + 1);
    } else {
      await handleSignCredential(serviceStepper, pKey);
    }
  }

  const handleTerms = async () => {
    if (activeStep === 0) {
      if (!acceptTerms) {
        setErrorPartForm({ show: true, message: t("participant.errors.accept-terms") });
        showError(t("participant.errors.accept-terms"));
        return;
      }
      setTermsAndConditions({
        ...termsAndConditions,
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
          ...termsAndConditions.credentialSubject,
          "gx:termsAndConditions": termsText
        }
      });
      setActiveStep(prev => prev + 1);
    } else if (activeStep === 1) {
      if (validateKeyStep()) setActiveStep(prev => prev + 1);
    } else if (activeStep === 2) {
      if (validateIdentityStep()) setActiveStep(prev => prev + 1);
    } else {
      await handleSignCredential(termsAndConditions, pKey);
    }
  }

  const handleNext = async () => {
    if (selectedShape === 'Participant') {
      await handleParticipant();
    } else if (selectedShape === 'Service Offering') {
      await handleService();
    } else if (selectedShape === 'Terms and Conditions') {
      await handleTerms();
    }
  }

  const handleBack = () => setActiveStep(prev => prev - 1);
  const handleClose = () => setIsModalOpen(false);

  const getSignStepValue = () => {
    if (selectedShape === 'Participant') return participantStepper;
    if (selectedShape === 'Service Offering') return serviceStepper;
    return termsAndConditions;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case -1:
        return (
          <InfoView
            selectedShape={selectedShape}
            setSelectedShape={setSelectedShape}
            setActiveStep={setActiveStep}
            setErrorManager={setErrorPartForm}
          />
        );
      case 0:
        return (
          <Step1
            selectedShape={selectedShape}
            participantForm={participantForm}
            setParticipantForm={setParticipantForm}
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
            errorManager={errorPartForm}
          />
        );
      case 1:
        return <StepKey privateKey={pKey} setPrivateKey={setPKey} signAlgorithm={identityForm.signAlgorithm} setSignAlgorithm={(alg) => setIdentityForm({...identityForm, signAlgorithm: alg})} />;
      case 2:
        return (
          <StepIdentity
            identity={identityForm}
            setIdentity={setIdentityForm}
            stepper={true}
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
      case 3:
        return <SignStep jsonValue={getSignStepValue()} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" className="wizard-content">
      <Box className="card-container">
        <Box className="stepper-section">
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS_STEPPER.map((label) => (
              <Step key={label}>
                <StepLabel slots={{ stepIcon: CustomStepIcon }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box className="content-body">
          {renderStepContent()}
        </Box>
      </Box>

      <div className='buttons'>
      {activeStep > -1 &&
        <Button
          variant="contained"
          className="previous-button"
          startIcon={<KeyboardDoubleArrowLeft />}
          onClick={handleBack}
        >
          {t("common.previous")}
        </Button>
      }
      {(activeStep !== -1 && activeStep < STEPS_STEPPER.length) &&
        <Button
          variant="contained"
          className="start-button"
          onClick={handleNext}
          endIcon={activeStep === STEPS_STEPPER.length - 1 ? <CheckCircle/> : <KeyboardDoubleArrowRight />}
        >
          {activeStep === STEPS_STEPPER.length - 1 ? STEPS_STEPPER[activeStep] : t("common.next")}
        </Button>
      }
      </div>
      <VerifiableCredentialStepperModal
        open={isModalOpen}
        handleClose={handleClose}
        vc={vcValue}
      />
      <Snackbar
        open={openSnack}
        autoHideDuration={5000}
        onClose={() => setOpenSnack(false)}
        message={msgs}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={typeSnack} onClose={() => setOpenSnack(false)} sx={{ width: '100%' }}>
          {msgs}
        </Alert>
      </Snackbar>
    </Container>
  );
};
