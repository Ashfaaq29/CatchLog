import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2023',
            color: '#e2e2e6',
            border: '1px solid rgba(162, 141, 122, 0.3)',
            borderRadius: '4px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '13px',
            letterSpacing: '0.05em',
          },
          success: { iconTheme: { primary: '#00f4fe', secondary: '#003739' } },
          error: { iconTheme: { primary: '#ffb4ab', secondary: '#690005' } },
        }}
      />
    </HashRouter>
  </React.StrictMode>,
);
