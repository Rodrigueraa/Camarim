// =============================================================================
// main.jsx
// -----------------------------------------------------------------------------
// Ponto de entrada da aplicação. É o primeiro arquivo JavaScript que roda,
// referenciado pelo <script type="module" src="/src/main.jsx"> no index.html.
//
// Responsabilidade única: pegar o componente <App /> e "montá-lo" dentro
// da div com id="root" que existe no index.html.
// =============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Estilos globais do Bootstrap (grid, componentes, utilitários)
import 'bootstrap/dist/css/bootstrap.min.css';

// createRoot conecta o React à div#root do HTML.
// StrictMode é um modo de desenvolvimento do React que ajuda a detectar
// problemas comuns (ex: efeitos colaterais duplicados) — ele não afeta
// a versão de produção, é só um "modo de alerta" durante o desenvolvimento.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
