import '@/style/main.scss'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { setupStore } from '@/store'
import { App } from './App'
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';

const container = document.getElementById('root')
const root = createRoot(container as HTMLDivElement)

root.render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={setupStore()}>
        <App />
      </Provider>
    </I18nextProvider>
  </StrictMode>
)
