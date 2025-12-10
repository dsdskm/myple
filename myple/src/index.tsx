import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { AppProvider } from './context/AppContext';

// Google Maps API 로드
const loadGoogleMapsScript = () => {
  if (!window.google) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
};

// Google Maps API가 로드되었는지 확인
const checkGoogleMapsLoaded = () => {
  if (window.google) {
    console.log('Google Maps API loaded');
  } else {
    console.warn('Google Maps API not loaded');
  }
};

// Google Maps API 로드 후 앱 렌더링
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

loadGoogleMapsScript();

// Google Maps API가 로드될 때까지 기다림
const waitForGoogleMaps = (callback: () => void, timeout = 10000) => {
  const interval = setInterval(() => {
    if (window.google) {
      clearInterval(interval);
      callback();
    } else if (timeout <= 0) {
      clearInterval(interval);
      console.error('Google Maps API failed to load');
    }
  }, 100);
};

waitForGoogleMaps(() => {
  root.render(
    <BrowserRouter>
      <React.StrictMode>
        <TDSMobileAITProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </TDSMobileAITProvider>
      </React.StrictMode>
    </BrowserRouter>
  );
});

reportWebVitals();