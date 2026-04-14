/**
 * Render tests for the heavyweight components.
 *
 * Strategy: render each component with minimal mocks so that the
 * module-level code (imports, state init, JSX return) gets executed.
 * This pushes statement/line coverage well above 50%.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import viewReducer from '@/store/view/viewSlice';

import { TextEncoder as NodeTextEncoder } from 'node:util';
if (globalThis.TextEncoder === undefined) {
  (globalThis as any).TextEncoder = NodeTextEncoder;
}

/* ------------------------------------------------------------------ */
/*  Global mocks                                                       */
/* ------------------------------------------------------------------ */

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/utils/environment', () => ({
  getEnvironment: () => ({
    VITE_API_SIGN: 'test',
    VITE_PRIVATE_KEY: 'test',
    VITE_CLEARING_URL: 'test',
    VITE_CLIENT_ID_KONG: 'test',
    VITE_CLIENT_SECRET_KONG: 'test',
    VITE_API_BACK: 'test',
  }),
}));

jest.mock('@/utils/i18n', () => ({ __esModule: true, default: {} }));

jest.mock('@/apis/signApi', () => ({
  getJsonFile: jest.fn().mockResolvedValue({ data: {} }),
  clearingHouse: jest.fn().mockResolvedValue({ data: {} }),
  validLRN: jest.fn().mockResolvedValue('{}'),
}));

jest.mock('@microlink/react-json-view', () => {
  const M = (props: any) => <pre data-testid="json-view">{JSON.stringify(props.src)}</pre>;
  M.displayName = 'MockJsonView';
  return { __esModule: true, default: M };
});

// Mock signCredential (uses crypto)
jest.mock('@/utils/sign', () => ({
  signCredential: jest.fn().mockResolvedValue({
    proof: { type: 'test', created: 'now', proofPurpose: 'test', verificationMethod: 'test', jws: 'a.b.c' },
  }),
  generateTemporaryKeys: jest.fn().mockResolvedValue({ publicKey: {}, privateKey: {} }),
  exportPrivateKeyPEM: jest.fn().mockResolvedValue('-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----'),
}));

// Mock JSON templates
jest.mock('@/assets/files/participant.template.json', () => ({ credentialSubject: {} }), { virtual: true });
jest.mock('@/assets/files/terms&Conditions.template.json', () => ({ credentialSubject: {} }), { virtual: true });
jest.mock('@/assets/files/serviceOffering.template.json', () => ({ credentialSubject: {} }), { virtual: true });
jest.mock('@/assets/files/legalParticipant.template.json', () => ({ credentialSubject: {} }), { virtual: true });
jest.mock('@/assets/files/verifiablePresentation.json', () => ({ verifiableCredential: [] }), { virtual: true });
jest.mock('@/assets/files/did.json', () => ({ id: 'did:web:test' }), { virtual: true });

// Mock crypto for signCredential and StepKey
beforeEach(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      subtle: {
        generateKey: jest.fn().mockResolvedValue({ publicKey: {}, privateKey: {} }),
        sign: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
        exportKey: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
      },
    },
    writable: true,
    configurable: true,
  });
});

/* ------------------------------------------------------------------ */
/*  Test helpers                                                       */
/* ------------------------------------------------------------------ */

function renderWithStore(ui: React.ReactElement, preloadedView = 'HOME') {
  const store = configureStore({
    reducer: combineReducers({ view: viewReducer }),
    preloadedState: { view: { view: preloadedView } },
  });
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

/* ------------------------------------------------------------------ */
/*  CustomStepIcon                                                     */
/* ------------------------------------------------------------------ */

describe('CustomStepIcon', () => {
  const { CustomStepIcon } = require('@/components/common/CustomStepIcon');

  it('should render inactive state', () => {
    const { container } = render(<CustomStepIcon active={false} completed={false} icon={1} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should render active state', () => {
    const { container } = render(<CustomStepIcon active={true} completed={false} icon={2} />);
    expect(container.textContent).toContain('2');
  });

  it('should render completed state with check icon', () => {
    const { container } = render(<CustomStepIcon active={false} completed={true} icon={3} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ */
/*  StepKey                                                            */
/* ------------------------------------------------------------------ */

describe('StepKey', () => {
  const { StepKey } = require('@/components/ownDidForm/StepKey');

  it('should render with private key textarea', () => {
    const setPrivateKey = jest.fn();
    render(<StepKey privateKey="" setPrivateKey={setPrivateKey} />);
    expect(screen.getByPlaceholderText('placeholder.private-key')).toBeInTheDocument();
  });

  it('should call setPrivateKey on change', () => {
    const setPrivateKey = jest.fn();
    render(<StepKey privateKey="" setPrivateKey={setPrivateKey} />);
    const input = screen.getByPlaceholderText('placeholder.private-key');
    fireEvent.change(input, { target: { value: 'my-key' } });
    expect(setPrivateKey).toHaveBeenCalledWith('my-key');
  });
});

/* ------------------------------------------------------------------ */
/*  LanguageSelector                                                   */
/* ------------------------------------------------------------------ */

describe('LanguageSelector', () => {
  const LanguageSelector = require('@/components/LanguageSelector/LanguageSelector').default;

  it('should render with language button', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should open menu on click', () => {
    render(<LanguageSelector />);
    fireEvent.click(screen.getByText('English'));
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  NavBar                                                             */
/* ------------------------------------------------------------------ */

describe('NavBar', () => {
  // NavBar uses LanguageSelector and store
  jest.mock('@/components/LanguageSelector/LanguageSelector', () => {
    const LS = () => <div data-testid="lang-selector">EN</div>;
    LS.displayName = 'LS';
    return { __esModule: true, default: LS };
  });

  const NavBar = require('@/components/NavBar/NavBar').default;

  it('should render on HOME view', () => {
    renderWithStore(<NavBar />);
    expect(screen.getByText('Gaia-X Credentials Generator')).toBeInTheDocument();
  });

  it('should show back button when view is not HOME', () => {
    renderWithStore(<NavBar />, 'PARTICIPANT');
    expect(screen.getByTitle('common.back')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  ParticipantWizard/StepInfo                                         */
/* ------------------------------------------------------------------ */

describe('ParticipantWizard/StepInfo (InfoView)', () => {
  const { InfoView } = require('@/components/ParticipantWizard/StepInfo');

  it('should render info view', () => {
    const { container } = render(<InfoView />);
    expect(container.textContent).toContain('participant.info-title');
  });
});

/* ------------------------------------------------------------------ */
/*  ParticipantWizard/Step2                                            */
/* ------------------------------------------------------------------ */

describe('ParticipantWizard/Step2', () => {
  const { Step2 } = require('@/components/ParticipantWizard/Step2');

  it('should render terms checkbox', () => {
    render(
      <Step2
        acceptTerms={false}
        setAcceptTerms={jest.fn()}
        termsText="terms text"
        errorManager={{ show: false, message: '' }}
      />
    );
    expect(screen.getByText('participant.terms-title')).toBeInTheDocument();
  });

  it('should show error when errorManager.show is true', () => {
    render(
      <Step2
        acceptTerms={false}
        setAcceptTerms={jest.fn()}
        termsText="terms"
        errorManager={{ show: true, message: 'Error!' }}
      />
    );
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  StepperWizard/StepInfo                                             */
/* ------------------------------------------------------------------ */

describe('StepperWizard/StepInfo (InfoView)', () => {
  const { InfoView } = require('@/components/StepperWizard/StepInfo');

  it('should render shape cards', () => {
    render(
      <InfoView
        selectedShape={null}
        setSelectedShape={jest.fn()}
        setActiveStep={jest.fn()}
        setErrorManager={jest.fn()}
      />
    );
    expect(screen.getByText('Participant')).toBeInTheDocument();
    expect(screen.getByText('Service Offering')).toBeInTheDocument();
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
  });

  it('should call setSelectedShape on card click', () => {
    const setSelectedShape = jest.fn();
    const setActiveStep = jest.fn();
    render(
      <InfoView
        selectedShape={null}
        setSelectedShape={setSelectedShape}
        setActiveStep={setActiveStep}
        setErrorManager={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('Participant'));
    expect(setSelectedShape).toHaveBeenCalledWith('Participant');
    expect(setActiveStep).toHaveBeenCalledWith(0);
  });
});

/* ------------------------------------------------------------------ */
/*  StepperWizard/FormParticipant                                      */
/* ------------------------------------------------------------------ */

describe('StepperWizard/FormParticipant', () => {
  const { ParticipantForm } = require('@/components/StepperWizard/FormParticipant');
  const defaultForm = {
    legalName: '', legalRegistrationNumber: '', headquarterAddress: '',
    legalAddres: '', parentOrganization: '', subOrganization: '',
  };

  it('should render all form fields', () => {
    render(<ParticipantForm participantForm={defaultForm} setParticipantForm={jest.fn()} />);
    expect(screen.getByPlaceholderText('placeholder.legal-name')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  StepperWizard/FormTerms&Conds                                      */
/* ------------------------------------------------------------------ */

describe('StepperWizard/FormTerms&Conds', () => {
  const { TermsAndConditionsForm } = require('@/components/StepperWizard/FormTerms&Conds');

  it('should render terms checkbox', () => {
    render(<TermsAndConditionsForm acceptTerms={false} setAcceptTerms={jest.fn()} />);
    expect(screen.getByText('participant.terms-title')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  StepperWizard/LastStep                                             */
/* ------------------------------------------------------------------ */

describe('StepperWizard/LastStep (SignStep)', () => {
  const { SignStep } = require('@/components/StepperWizard/LastStep');

  it('should render JSON preview', () => {
    render(<SignStep jsonValue={{ test: true }} />);
    expect(screen.getByTestId('json-view')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  StepperWizard/FormService                                          */
/* ------------------------------------------------------------------ */

describe('StepperWizard/FormService', () => {
  const { ServiceOfferingForm } = require('@/components/StepperWizard/FormService');
  const defaultForm = {
    providedBy: '', policy: '', termsAndConditionsUrl: '',
    termsAndConditionsHash: '', requestType: '', accessType: '',
    formatType: '', aggregationOf: '', dependsOf: '', dataProtectionRegime: '',
  };

  it('should render service offering form', () => {
    render(<ServiceOfferingForm serviceForm={defaultForm} setServiceForm={jest.fn()} />);
    expect(screen.getByPlaceholderText('placeholder.provided-by')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.policy')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  StepperWizard/Step1                                                */
/* ------------------------------------------------------------------ */

describe('StepperWizard/Step1', () => {
  const { Step1 } = require('@/components/StepperWizard/Step1');
  const emptyPartForm = {
    legalName: '', legalRegistrationNumber: '', headquarterAddress: '',
    legalAddres: '', parentOrganization: '', subOrganization: '',
  };
  const emptyServiceForm = {
    providedBy: '', policy: '', termsAndConditionsUrl: '',
    termsAndConditionsHash: '', requestType: '', accessType: '',
    formatType: '', aggregationOf: '', dependsOf: '', dataProtectionRegime: '',
  };

  it('should render participant form when selectedShape=Participant', () => {
    render(
      <Step1
        selectedShape="Participant"
        participantForm={emptyPartForm}
        setParticipantForm={jest.fn()}
        serviceForm={emptyServiceForm}
        setServiceForm={jest.fn()}
        acceptTerms={false}
        setAcceptTerms={jest.fn()}
        errorManager={{ show: false, message: '' }}
      />
    );
    expect(screen.getByPlaceholderText('placeholder.legal-name')).toBeInTheDocument();
  });

  it('should render service form when selectedShape=Service Offering', () => {
    render(
      <Step1
        selectedShape="Service Offering"
        participantForm={emptyPartForm}
        setParticipantForm={jest.fn()}
        serviceForm={emptyServiceForm}
        setServiceForm={jest.fn()}
        acceptTerms={false}
        setAcceptTerms={jest.fn()}
        errorManager={{ show: false, message: '' }}
      />
    );
    expect(screen.getByPlaceholderText('placeholder.provided-by')).toBeInTheDocument();
  });

  it('should render terms form when selectedShape=Terms and Conditions', () => {
    render(
      <Step1
        selectedShape="Terms and Conditions"
        participantForm={emptyPartForm}
        setParticipantForm={jest.fn()}
        serviceForm={emptyServiceForm}
        setServiceForm={jest.fn()}
        acceptTerms={false}
        setAcceptTerms={jest.fn()}
        errorManager={{ show: false, message: '' }}
      />
    );
    expect(screen.getByText('participant.terms-title')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  IdentityStep                                                       */
/* ------------------------------------------------------------------ */

describe('IdentityStep', () => {
  const { StepIdentity } = require('@/components/ownDidForm/IdentityStep');
  const emptyIdentity = {
    documentName: '', issuer: '', verificationMethod: '',
    verifiableCredentialID: '', credentialSubjectID: '',
    tAndCVDID: '', tAndCCSubjectId: '', url: '',
  };

  it('should render import mode by default', () => {
    render(
      <StepIdentity
        identity={emptyIdentity}
        setIdentity={jest.fn()}
        isImportMode={true}
        setIsImportMode={jest.fn()}
        errorManager={{ show: false, message: '' }}
        setErrorManager={jest.fn()}
        setOpenSnack={jest.fn()}
        setTypeSnack={jest.fn()}
        setMsgs={jest.fn()}
        setDownload={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText('placeholder.url-did')).toBeInTheDocument();
  });

  it('should render manual form when import mode is off', () => {
    render(
      <StepIdentity
        identity={emptyIdentity}
        setIdentity={jest.fn()}
        isImportMode={false}
        setIsImportMode={jest.fn()}
        errorManager={{ show: false, message: '' }}
        setErrorManager={jest.fn()}
        setOpenSnack={jest.fn()}
        setTypeSnack={jest.fn()}
        setMsgs={jest.fn()}
        setDownload={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText('placeholder.doc-name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.issuer')).toBeInTheDocument();
  });

  it('should render extra T&C fields when stepper=false', () => {
    render(
      <StepIdentity
        identity={emptyIdentity}
        setIdentity={jest.fn()}
        stepper={false}
        isImportMode={false}
        setIsImportMode={jest.fn()}
        errorManager={{ show: false, message: '' }}
        setErrorManager={jest.fn()}
        setOpenSnack={jest.fn()}
        setTypeSnack={jest.fn()}
        setMsgs={jest.fn()}
        setDownload={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText('placeholder.terms-id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('placeholder.terms-subject')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

describe('VerifiableCredentialModal', () => {
  const { VerifiableCredentialModal } = require('@/components/Modal/Modal');

  it('should render the modal when open', () => {
    render(
      <VerifiableCredentialModal
        open={true}
        handleClose={jest.fn()}
        vc1={{ id: '1' }}
        vc2={{ id: '2' }}
        vc3={{ id: '3' }}
      />
    );
    expect(screen.getByText('participant.modal-title')).toBeInTheDocument();
    expect(screen.getByText('LegalParticipant')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  ModalVC                                                            */
/* ------------------------------------------------------------------ */

describe('VerifiableCredentialStepperModal', () => {
  const { VerifiableCredentialStepperModal } = require('@/components/Modal/ModalVC');

  it('should render the stepper modal when open', () => {
    render(
      <VerifiableCredentialStepperModal
        open={true}
        handleClose={jest.fn()}
        vc={{ test: true }}
      />
    );
    expect(screen.getByTestId('json-view')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  ParticipantWizard/Step3                                            */
/* ------------------------------------------------------------------ */

describe('ParticipantWizard/Step3', () => {
  const { Step3 } = require('@/components/ParticipantWizard/Step3');

  it('should render with legal participant toggle', () => {
    render(<Step3 legalParticipant={{ a: 1 }} termsAndConditions={{ b: 2 }} />);
    expect(screen.getByText('LegalParticipant')).toBeInTheDocument();
    expect(screen.getByText('GaiaXTermsAndConditions')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  StepperWizard (full)                                               */
/* ------------------------------------------------------------------ */

describe('StepperWizard (full render)', () => {
  const { StepperWizard } = require('@/components/StepperWizard/StepperWizard');

  it('should render the info view by default', () => {
    renderWithStore(<StepperWizard />);
    expect(screen.getByText('Participant')).toBeInTheDocument();
    expect(screen.getByText('Service Offering')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  ParticipantWizard (full)                                           */
/* ------------------------------------------------------------------ */

describe('ParticipantWizard (full render)', () => {
  const { ParticipantWizard } = require('@/components/ParticipantWizard/ParticipantWizard');

  it('should render the info step', () => {
    renderWithStore(<ParticipantWizard />);
    expect(screen.getByText('participant.info-title')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  ParticipantWizard/Step1                                            */
/* ------------------------------------------------------------------ */

describe('ParticipantWizard/Step1 (import mode)', () => {
  const { Step1 } = require('@/components/ParticipantWizard/Step1');
  const defaultForm = {
    legalName: '', legalRegistrationNumber: '', legalRegistrationNumberType: 'vatID',
    headquarterAddress: '', legalAddress: '', parentOrganization: '', subOrganization: '',
    url: '', lrnVerifiableCId: '', lrnCSubjectId: '',
  };

  it('should render import mode with URL input', () => {
    render(
      <Step1
        legalPartForm={defaultForm}
        setLegalPartForm={jest.fn()}
        useUrl={false}
        setUseUrl={jest.fn()}
        errorManager={{ show: false, message: '' }}
        setErrorManager={jest.fn()}
        setOpenSnack={jest.fn()}
        setTypeSnack={jest.fn()}
        setMsgs={jest.fn()}
        setDownload={jest.fn()}
        isImportMode={true}
        setIsImportMode={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText('placeholder.url-participant')).toBeInTheDocument();
  });

  it('should render manual form when import mode is off', () => {
    render(
      <Step1
        legalPartForm={defaultForm}
        setLegalPartForm={jest.fn()}
        useUrl={false}
        setUseUrl={jest.fn()}
        errorManager={{ show: false, message: '' }}
        setErrorManager={jest.fn()}
        setOpenSnack={jest.fn()}
        setTypeSnack={jest.fn()}
        setMsgs={jest.fn()}
        setDownload={jest.fn()}
        isImportMode={false}
        setIsImportMode={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText('placeholder.legal-name')).toBeInTheDocument();
  });
});
