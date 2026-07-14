// =============================================================================
// AuthContext.jsx
// -----------------------------------------------------------------------------
// Este arquivo é o "cérebro" da autenticação da aplicação.
// Ele usa a Context API do React para compartilhar o estado de login
// (usuário logado, token de acesso, funções de login/logout) com
// qualquer componente da árvore, sem precisar passar props manualmente
// de componente em componente ("prop drilling").
//
// Fluxo geral:
//   1. AuthProvider envolve toda a aplicação (ver App.jsx).
//   2. Componentes filhos usam o hook useAuth() para ler o usuário atual
//      ou chamar login()/logout().
//   3. O token de acesso (accessToken) fica só em memória (useState),
//      nunca em localStorage — isso evita que ele seja roubado por
//      ataques XSS (scripts maliciosos rodando na página).
//   4. O refresh token (usado para renovar a sessão) fica em um cookie
//      httpOnly, controlado pelo backend. O JavaScript do navegador não
//      consegue ler nem manipular esse cookie, o que é mais seguro.
// =============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Cria o "canal" de contexto. O valor inicial (null) só é usado se alguém
// tentar consumir o contexto fora do AuthProvider (ver useAuth() no final).
const AuthContext = createContext(null);

// URL base da API de autenticação.
// IMPORTANTE: troque isso pela URL real do seu backend (ex: seu Strapi,
// Node/Express, etc). Enquanto estiver com essa URL fake, as chamadas de
// login vão falhar.
const API_URL = 'https://sua-api.com';

// -----------------------------------------------------------------------------
// AuthProvider
// Componente que guarda o estado de autenticação e disponibiliza funções
// para o restante da aplicação. Deve envolver toda a árvore de componentes
// que precisa saber se o usuário está logado (normalmente, o App inteiro).
// -----------------------------------------------------------------------------
export function AuthProvider({ children }) {
  // Dados do usuário logado (nome, email, id, etc — o que o backend devolver)
  const [user, setUser] = useState(null);

  // Token JWT (ou similar) usado para autenticar chamadas à API.
  // Fica em memória: some quando a página é recarregada (por isso existe
  // o mecanismo de "restaurar sessão" logo abaixo).
  const [token, setToken] = useState(null);

  // Controla a tela de carregamento inicial, enquanto tentamos verificar
  // se já existe uma sessão ativa (evita "piscar" a tela de login antes
  // de saber se o usuário já estava logado).
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------
  // Restaurar sessão ao carregar o app
  // ---------------------------------------------------------------------
  // Como o accessToken vive só em memória, ele se perde a cada F5.
  // Para não obrigar o usuário a logar de novo toda hora, fazemos uma
  // chamada ao backend logo na montagem do componente, enviando o cookie
  // httpOnly (credentials: 'include'). Se o backend reconhecer esse
  // cookie como válido, ele devolve um novo accessToken e os dados do
  // usuário — e a sessão é "restaurada" sem o usuário perceber.
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // envia o cookie httpOnly automaticamente
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.accessToken);
          setUser(data.user);
        }
        // Se res não for ok (401, por exemplo), simplesmente não há
        // sessão válida — o usuário permanece deslogado, sem erro visível.
      } catch (err) {
        // Falha de rede ou backend fora do ar: tratamos como "sem sessão".
        // Não exibimos erro aqui porque isso roda em toda carga de página,
        // e um erro nesse momento não deve travar a experiência do usuário.
      } finally {
        // Independente do resultado, paramos de mostrar o loading.
        setLoading(false);
      }
    }
    restoreSession();
  }, []); // [] = roda só uma vez, quando o AuthProvider é montado

  // ---------------------------------------------------------------------
  // login(email, password)
  // ---------------------------------------------------------------------
  // Envia as credenciais ao backend. Se as credenciais forem válidas,
  // o backend deve devolver { accessToken, user } e também setar o
  // cookie httpOnly com o refresh token (isso acontece no header
  // Set-Cookie da resposta, de forma transparente para o front-end).
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // necessário para o navegador aceitar/enviar o cookie
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      // Tenta ler uma mensagem de erro customizada do backend;
      // se não conseguir parsear, usa uma mensagem genérica.
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || 'Credenciais inválidas');
    }

    const data = await res.json();
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []); // useCallback evita recriar essa função a cada render

  // ---------------------------------------------------------------------
  // logout()
  // ---------------------------------------------------------------------
  // Avisa o backend para invalidar a sessão (ex: apagar/revogar o refresh
  // token) e limpa o estado local, independentemente do resultado da
  // chamada de rede (por isso o try/finally).
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  // ---------------------------------------------------------------------
  // authFetch(path, options)
  // ---------------------------------------------------------------------
  // Wrapper em volta do fetch() nativo que já injeta automaticamente o
  // header "Authorization: Bearer <token>" em toda chamada autenticada.
  // Use isso (em vez de fetch puro) sempre que precisar chamar uma rota
  // protegida da API, ex: authFetch('/posts', { method: 'GET' })
  const authFetch = useCallback(
    (path, options = {}) => {
      return fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
    [token] // recria a função sempre que o token mudar
  );

  // Objeto exposto para todos os componentes que consumirem useAuth().
  const value = {
    user,                      // dados do usuário logado (ou null)
    token,                     // accessToken atual (ou null)
    loading,                   // true enquanto verifica sessão existente
    isAuthenticated: !!user,   // atalho booleano bem prático nas telas
    login,
    logout,
    authFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// useAuth()
// -----------------------------------------------------------------------------
// Hook customizado para consumir o AuthContext de forma segura.
// Em vez de cada componente fazer useContext(AuthContext) diretamente,
// centralizamos aqui e adicionamos uma verificação: se alguém tentar usar
// esse hook fora do <AuthProvider>, lançamos um erro claro explicando o
// problema (em vez de um erro genérico de "cannot read property of null").
//
// Uso típico em qualquer componente:
//   const { user, login, logout, isAuthenticated } = useAuth();
// -----------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}
