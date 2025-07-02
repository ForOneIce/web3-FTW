import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Web3Provider } from './context/Web3Context';
import { LanguageProvider } from './context/LanguageContext';
import './styles/globals.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
); 