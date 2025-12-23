import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// --------------------------------------------------------------------------------
// POSTMESSAGE ERROR SUPPRESSION & MONKEY-PATCH
// --------------------------------------------------------------------------------
// This addresses the "SyntaxError: Failed to execute 'postMessage' on 'Window': 
// Invalid target origin 'null' in a call to 'postMessage'." error.
// This often happens in environments where scripts or iframes have a 'null' origin.

const originalPostMessage = window.postMessage;
// @ts-ignore - Intentionally monkey-patching postMessage for error suppression
window.postMessage = function (message: any, targetOrigin: any, transfer?: any) {
  // If targetOrigin is explicitly 'null', or if we are in a null-origin context,
  // we default to '*' to prevent the browser from throwing a Security/Syntax error.
  const safeOrigin = targetOrigin === 'null' ? '*' : targetOrigin;

  try {
    if (transfer !== undefined) {
      return (originalPostMessage as any).call(window, message, safeOrigin, transfer);
    }
    return (originalPostMessage as any).call(window, message, safeOrigin);
  } catch (err) {
    // If it still throws, we just log it as a warning instead of letting it bubble up as an Uncaught Error
    console.debug('Suppressed failed postMessage:', err);
  }
};

// Also keep the global error listeners for any other variations of this error
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (msg.includes("postMessage") && msg.includes("'null'")) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  if (msg.includes("postMessage") && msg.includes("'null'")) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});
// --------------------------------------------------------------------------------


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
