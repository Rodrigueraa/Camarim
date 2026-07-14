// =============================================================================
// vite.config.js
// -----------------------------------------------------------------------------
// Configuração do Vite, a ferramenta que roda o servidor de desenvolvimento
// (npm run dev) e monta o build de produção (npm run build).
// -----------------------------------------------------------------------------

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // O plugin do React permite que o Vite entenda arquivos .jsx e faça
  // o "Fast Refresh" (atualização instantânea da tela ao salvar o código,
  // sem perder o estado da aplicação).
  plugins: [react()],
});
