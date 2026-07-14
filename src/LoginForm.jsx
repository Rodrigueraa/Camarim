import { useState } from 'react';
import { useAuth } from './AuthContext';
import './LoginForm.css';

export function LoginForm({ onSuccess }) {
  // Pega a função login() e o restante da lógica de autenticação
  // do contexto criado em AuthContext.jsx.
  const { login } = useAuth();

  // Estado dos campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mensagem de erro exibida ao usuário (ex: "credenciais inválidas")
  const [error, setError] = useState('');

  // Controla o estado de "enviando", para desabilitar o botão e mostrar
  // um feedback visual (evita cliques duplicados enquanto a requisição
  // ainda está em andamento).
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------------------
  // handleSubmit
  // ---------------------------------------------------------------------
  // Disparado quando o formulário é enviado (botão clicado ou Enter).
  async function handleSubmit(e) {
    e.preventDefault(); // impede o recarregamento padrão da página
    setError('');

    // Validação simples no front-end antes de gastar uma chamada de rede
    if (!email || !password) {
      setError('Preencha email e senha.');
      return;
    }

    setSubmitting(true);
    try {
      // Chama a função login() do AuthContext, que faz a requisição
      // real ao backend e atualiza o estado global de autenticação.
      await login(email, password);

      // Se chegou aqui, o login funcionou — avisa o componente pai.
      onSuccess?.(); // o "?." evita erro caso onSuccess não tenha sido passado
    } catch (err) {
      // login() lança um Error com mensagem amigável em caso de falha
      // (ver AuthContext.jsx -> função login)
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Bem-vindo!</h2>
        <p className="login-subtitle">Entre com sua conta</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Placeholder visual — ainda sem tela de recuperação de senha */}
          <button type="button" className="login-forgot">
            Esqueceu a senha?
          </button>

          {/* Só renderiza o aviso de erro se houver uma mensagem */}
          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={submitting} className="login-button">
            {submitting ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <p className="login-footer">
          Não tem uma conta? <button type="button">Cadastre-se</button>
        </p>
      </div>
    </div>
  );
}