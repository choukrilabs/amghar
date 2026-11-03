import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const baseFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : undefined;
  let activeFetch = baseFetch;
  const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (!desc || (desc.configurable && !desc.writable && !desc.set)) {
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get: () => activeFetch,
      set: (fn) => {
        if (typeof fn === 'function') activeFetch = fn;
      },
    });
  }
} catch {
  // Ignore if environment locks window.fetch
}

createRoot(document.getElementById('root')!).render(<App />);
