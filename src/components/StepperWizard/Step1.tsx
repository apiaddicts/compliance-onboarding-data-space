import { Box, Alert } from '@mui/material';
import './StepperWizard.scss';
import { ParticipantStepper, ServiceStepper } from '@/interfaces';
import { ParticipantForm } from './FormParticipant';
import { ServiceOfferingForm } from './FormService';
import { TermsAndConditionsForm } from './FormTerms&Conds';

interface Step1Prop {
  selectedShape: string | null;
  participantForm: ParticipantStepper;
  setParticipantForm: (participantForm: ParticipantStepper) => void;
  serviceForm: ServiceStepper;
  setServiceForm: (serviceForm: ServiceStepper) => void;
  acceptTerms: boolean;
  setAcceptTerms: (acceptTerms: boolean) => void;
  errorManager: {
    show: boolean;
    message: string;
  };
}

export const Step1 = ({
  selectedShape,
  participantForm,
  setParticipantForm,
  serviceForm,
  setServiceForm,
  acceptTerms,
  setAcceptTerms,
  errorManager
}: Step1Prop ) => {
  return <Box className="form-container">
    {errorManager.show && <Alert severity="error">{errorManager.message}</Alert>}
    {selectedShape === 'Participant' &&
      <ParticipantForm
        participantForm={participantForm}
        setParticipantForm={setParticipantForm}
      />
    }
    {selectedShape === 'Service Offering' &&
      <ServiceOfferingForm
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
      />
    }
    {selectedShape === 'Terms and Conditions' &&
      <TermsAndConditionsForm
        acceptTerms={acceptTerms}
        setAcceptTerms={setAcceptTerms}
      />
    }
  </Box>
}
