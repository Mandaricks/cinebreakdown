import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Tratamento de erros global para falhas de inicialização
window.onerror = function(message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background: #450a0a; color: #fca5a5; padding: 2rem; font-family: monospace; height: 100vh; overflow: auto;">
        <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Erro Crítico de Inicialização</h2>
        <div style="background: #000; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
          ${message}
        </div>
        <div style="font-size: 0.875rem; opacity: 0.8;">
          Local: ${source}:${lineno}:${colno}
        </div>
        ${error && error.stack ? `<pre style="margin-top: 1rem; white-space: pre-wrap; opacity: 0.7;">${error.stack}</pre>` : ''}
        <button onclick="window.location.reload()" style="margin-top: 2rem; background: #fff; color: #000; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: bold;">Tentar Recarregar</button>
      </div>
    `;
  }
};

console.log("Inicializando CineBreakdown com React " + React.version);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);