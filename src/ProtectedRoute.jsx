import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }) {
  // isAuthenticated: true/false conforme há ou não um usuário logado
  // loading: true enquanto o AuthContext ainda está verificando se existe
  //          uma sessão válida (ver restoreSession em AuthContext.jsx)
  const { isAuthenticated, loading } = useAuth();

  // Enquanto ainda não sabemos se o usuário está logado (checagem inicial
  // da sessão), mostramos um estado de carregamento. Isso evita "piscar"
  // a tela de login por um instante para quem já estava autenticado.
  if (loading) return <p>Carregando...</p>;

  // Se depois da checagem o usuário NÃO estiver autenticado, redireciona
  // para /login. O "replace" evita que a rota protegida fique no histórico
  // do navegador (senão o botão "voltar" levaria de volta pra uma página
  // que o usuário não deveria acessar).
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Se passou pelas duas checagens acima, o usuário está autenticado:
  // renderiza normalmente o conteúdo da rota protegida.
  return children;
}