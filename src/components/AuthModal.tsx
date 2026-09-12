import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Zap
} from 'lucide-react';
import { api } from '../services/api.ts';
import { UserAccount } from '../types/index.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [company, setCompany] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot' | 'reset') => {
    resetFormState();
    setMode(newMode);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const authenticatedUser = await loginWithEmail(email, password);
      setSuccessMessage('Login efetuado com sucesso!');
      setTimeout(() => {
        onAuthSuccess(authenticatedUser);
        onClose();
      }, 500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMessage('Nome, e-mail e senha são obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const newUser = await registerWithEmail({
        name,
        email,
        password,
        phone: phone || undefined,
        document: document || undefined,
        company: company || undefined
      });
      setSuccessMessage('Conta criada com sucesso com Firebase Auth!');
      setTimeout(() => {
        onAuthSuccess(newUser);
        onClose();
      }, 700);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Informe seu e-mail cadastrado.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await resetPassword(email);
      setSuccessMessage('Instruções de redefinição de senha enviadas para seu e-mail.');
      setMode('login');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Erro ao solicitar recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !recoveryCode || !password) {
      setErrorMessage('Preencha o e-mail, código de verificação e a nova senha.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.resetPassword({
        email,
        code: recoveryCode,
        newPassword: password
      });
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const authenticatedUser = await loginWithGoogle();
      setSuccessMessage(`Conectado com sucesso via Google!`);
      setTimeout(() => {
        onAuthSuccess(authenticatedUser);
        onClose();
      }, 500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Falha ao autenticar com Google.');
    } finally {
      setIsLoading(false);
    }
  };


  // Quick demo test login
  const handleQuickDemoLogin = async (type: 'demo' | 'admin') => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const credentials = type === 'admin'
        ? { email: 'admin@autocheck.com.br', password: 'admin123456' }
        : { email: 'carlos.silva@exemplo.com.br', password: '123456' };

      const res = await api.login(credentials);
      setSuccessMessage(`Conectado como ${res.user.name}!`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 400);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Falha ao acessar conta de teste.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0B1728] border border-white/[0.14] rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header with gradient line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />

        <div className="p-6 sm:p-7">
          {/* Close button */}
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3 shadow-lg shadow-blue-500/10">
              {mode === 'login' && <Lock className="w-6 h-6" />}
              {mode === 'register' && <User className="w-6 h-6" />}
              {(mode === 'forgot' || mode === 'reset') && <KeyRound className="w-6 h-6" />}
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'login' && 'Acessar Conta'}
              {mode === 'register' && 'Criar Conta Gratuita'}
              {mode === 'forgot' && 'Recuperar Senha'}
              {mode === 'reset' && 'Nova Senha'}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login' && 'Acesse seus laudos, saldo de créditos e histórico de consultas.'}
              {mode === 'register' && 'Cadastre-se e ganhe 2 consultas completas bônus imediatas.'}
              {mode === 'forgot' && 'Digite seu e-mail para receber o código de segurança.'}
              {mode === 'reset' && 'Insira o código de segurança e defina sua nova senha.'}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
                <div className="relative">
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Senha</label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no AutoCheck</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#0B1728] px-2 text-slate-400 font-semibold">ou continue com</span>
                </div>
              </div>

              <button
                id="google-login-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#101F33] hover:bg-[#152740] border border-white/[0.12] transition-colors text-white font-semibold text-xs flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Ainda não possui conta?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Cadastre-se grátis
                  </button>
                </p>
              </div>

              {/* Quick Demo Logins Box */}
              <div className="pt-4 mt-4 border-t border-white/[0.08]">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                  Acesso rápido de teste
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('demo')}
                    className="py-2 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-slate-300 font-medium text-center transition-colors truncate"
                  >
                    👤 Cliente Demo (Carlos)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="py-2 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[11px] text-purple-300 font-medium text-center transition-colors truncate"
                  >
                    🛡️ Administrador
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                <div className="relative">
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="Seu nome ou razão social"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail *</label>
                <div className="relative">
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <input
                      id="register-phone-input"
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CPF ou CNPJ</label>
                  <div className="relative">
                    <input
                      id="register-doc-input"
                      type="text"
                      placeholder="000.000.000-00"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Senha *</label>
                  <div className="relative">
                    <input
                      id="register-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 dígitos"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Senha *</label>
                  <div className="relative">
                    <input
                      id="register-confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Bonus Highlight */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 font-medium">
                <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Bônus especial: <strong>+2 créditos gratuitos</strong> creditados na hora!</span>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Criar Minha Conta Gratuita</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#0B1728] px-2 text-slate-400 font-semibold">ou cadastre-se com</span>
                </div>
              </div>

              <button
                id="google-register-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#101F33] hover:bg-[#152740] border border-white/[0.12] transition-colors text-white font-semibold text-xs flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"
                  />
                </svg>
                <span>Cadastrar com Google</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Já possui cadastro?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    Fazer Login
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail Cadastrado</label>
                <div className="relative">
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    placeholder="seu.email@exemplo.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar Código de Recuperação</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Voltar para o login
                </button>
              </div>
            </form>
          )}

          {/* MODE: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Código de Segurança (6 dígitos)</label>
                <div className="relative">
                  <input
                    id="reset-code-input"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ex: 123456"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-4 py-2 text-sm text-white tracking-widest font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    id="reset-new-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirmar Nova Senha</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Cancelar e voltar ao login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
