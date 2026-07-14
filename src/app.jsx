import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LoginForm } from './LoginForm';
import { ProtectedRoute } from './ProtectedRoute';

function LoginPage() {
  const navigate = useNavigate();
  return <LoginForm onSuccess={() => navigate('/dashboard')} />;
}

function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Bem-vindo, {user?.name}</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
}

export default function App() {
  return (
    // AuthProvider envolve TUDO, incluindo o roteador — assim qualquer
    // página (mesmo futuras) pode acessar useAuth() sem problema.
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota raiz: quem acessar "/" direto é mandado para "/login".
              O "replace" evita que "/" fique no histórico de navegação. */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rota pública: qualquer um pode acessar a tela de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rota protegida: o ProtectedRoute verifica se o usuário está
              autenticado antes de renderizar a DashboardPage. Se não
              estiver, redireciona para /login automaticamente
              (ver ProtectedRoute.jsx). */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}