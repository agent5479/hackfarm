import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const base = import.meta.env.BASE_URL;
const fonts = document.createElement('style');
fonts.textContent = `
@font-face {
  font-family: 'Amatic-Hackfarm';
  src: url('${base}images/uploads/2021/03/AmaticSC-Regular.woff') format('woff');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Amatic-Hackfarm';
  src: url('${base}images/uploads/2021/03/AmaticSC-Bold.woff') format('woff');
  font-weight: 700;
  font-display: swap;
}
`;
document.head.appendChild(fonts);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
