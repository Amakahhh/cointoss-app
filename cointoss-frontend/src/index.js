import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Global diagnostics
if (typeof window !== 'undefined') {
  window.__COINTOSS_DIAG__ = { start: Date.now() };
  window.addEventListener('error', (e) => {
    console.error('[Cointoss][global error]', e.message, e.error);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[Cointoss][unhandled promise]', e.reason);
  });
}

console.log('[Cointoss] Bootstrapping build at', new Date().toISOString(), 'ENV=', process.env.NODE_ENV);
// Force rebuild - betting fixes applied

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('Root element #root not found');
}

function mount() {
  try {
    const root = ReactDOM.createRoot(rootEl);
    console.log('[Cointoss] React root created');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('[Cointoss] Initial render dispatched');
  } catch (err) {
    console.error('[Cointoss] Mount failure', err);
    const fallback = document.createElement('pre');
    fallback.style.color = 'red';
    fallback.style.padding = '1rem';
    fallback.textContent = 'Mount failed: ' + (err && err.message ? err.message : String(err));
    document.body.appendChild(fallback);
  }
}

mount();











