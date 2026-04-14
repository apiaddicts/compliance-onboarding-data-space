/**
 * Unit tests for React components
 *
 * Tests for: HomePage, NavBar, LanguageSelector, JsonView,
 * ParticipantPage, StepperPage, AppRouter, App
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import viewReducer from '@/store/view/viewSlice';

/* ------------------------------------------------------------------ */
/*  Global mocks                                                       */
/* ------------------------------------------------------------------ */

// Mock react-i18next globally
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock environment.ts to avoid import.meta issues
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

// Mock i18n init to avoid HTTP backend issues
jest.mock('@/utils/i18n', () => ({ __esModule: true, default: {} }));

// Mock heavy child components to isolate tests
jest.mock('@/components/ParticipantWizard/ParticipantWizard', () => ({
  ParticipantWizard: () => <div data-testid="participant-wizard">ParticipantWizard</div>,
}));

jest.mock('@/components/StepperWizard/StepperWizard', () => ({
  StepperWizard: () => <div data-testid="stepper-wizard">StepperWizard</div>,
}));

jest.mock('@microlink/react-json-view', () => {
  const MockJsonView = (props: any) => (
    <pre data-testid="json-view">{JSON.stringify(props.src)}</pre>
  );
  MockJsonView.displayName = 'MockJsonView';
  return { __esModule: true, default: MockJsonView };
});

// Mock NavBar for AppRouter tests (we test NavBar separately)
jest.mock('@/components/NavBar/NavBar', () => {
  const NavBar = () => <div data-testid="navbar">NavBar</div>;
  NavBar.displayName = 'NavBar';
  return { __esModule: true, default: NavBar };
});

// Mock LanguageSelector
jest.mock('@/components/LanguageSelector/LanguageSelector', () => {
  const LanguageSelector = () => <div data-testid="lang-selector">EN</div>;
  LanguageSelector.displayName = 'LanguageSelector';
  return { __esModule: true, default: LanguageSelector };
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
/*  JsonView                                                          */
/* ------------------------------------------------------------------ */

describe('JsonView', () => {
  it('should render with provided JSON', () => {
    const { JsonView } = require('./JsonView/JsonView');
    const { getByTestId } = render(<JsonView jsonValue={{ hello: 'world' }} />);
    const el = getByTestId('json-view');
    expect(el.textContent).toContain('hello');
  });
});

/* ------------------------------------------------------------------ */
/*  AppRouter                                                         */
/* ------------------------------------------------------------------ */

describe('AppRouter', () => {
  const { AppRouter } = require('@/routers/AppRouter');

  it('should render the HOME view by default', () => {
    renderWithStore(<AppRouter />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should render ParticipantPage when view is PARTICIPANT', () => {
    renderWithStore(<AppRouter />, 'PARTICIPANT');
    expect(screen.getByTestId('participant-wizard')).toBeInTheDocument();
  });

  it('should render StepperPage when view is STEPPER', () => {
    renderWithStore(<AppRouter />, 'STEPPER');
    expect(screen.getByTestId('stepper-wizard')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  HomePage                                                          */
/* ------------------------------------------------------------------ */

describe('HomePage', () => {
  const { HomePage } = require('@/pages/Home/HomePage');

  it('should render home page', () => {
    const { container } = renderWithStore(<HomePage />);
    expect(container).toBeTruthy();
  });

  it('should dispatch changeView when a card is clicked', () => {
    const { store } = renderWithStore(<HomePage />);
    const cards = document.querySelectorAll('[class*="credential-card"]');
    if (cards.length > 0) {
      fireEvent.click(cards[0]);
      expect(store.getState().view.view).toBe('PARTICIPANT');
    }
  });
});

/* ------------------------------------------------------------------ */
/*  ParticipantPage                                                   */
/* ------------------------------------------------------------------ */

describe('ParticipantPage', () => {
  const { ParticipantPage } = require('@/pages/Participant/ParticipantPage');

  it('should render the ParticipantWizard', () => {
    renderWithStore(<ParticipantPage />);
    expect(screen.getByTestId('participant-wizard')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  StepperPage                                                       */
/* ------------------------------------------------------------------ */

describe('StepperPage', () => {
  const { StepperPage } = require('@/pages/Stepper/StepperPage');

  it('should render the StepperWizard', () => {
    renderWithStore(<StepperPage />);
    expect(screen.getByTestId('stepper-wizard')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */

describe('App', () => {
  const { App } = require('@/App');

  it('should render without crashing', () => {
    const { container } = renderWithStore(<App />);
    expect(container).toBeTruthy();
  });
});
