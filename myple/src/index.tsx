import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <TDSMobileAITProvider>
        <App />
      </TDSMobileAITProvider>
    </React.StrictMode>
  </BrowserRouter>
);

reportWebVitals();
