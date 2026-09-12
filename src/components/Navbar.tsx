import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  User,
  LogOut,
  Car,
  Headphones,
  Settings,
  Search,
  CheckCircle2
} from 'lucide-react';
import { UserAccount } from '../types/index.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';


interface NavbarProps {
  user: UserAccount | null;
  onNavigate: (view: 'home' | 'report' | 'dashboard' | 'pricing' | 'how-it-works' | 'faq' | 'admin' | 'profile' | 'legal') => void;
  onQuickSearch: (plate: string) => void;
  onOpenCreditModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenSupportModal: () => void;
  onLogout: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onNavigate,
  onQuickSearch,
  onOpenCreditModal,
  onOpenAuthModal,
  onOpenSupportModal,
  onLogout,
  currentView
}) => {
  const [quickPlate, setQuickPlate] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPlate.trim().length >= 7) {
      onQuickSearch(quickPlate.trim().toUpperCase());
      setQuickPlate('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07111F]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <button
          id="nav-logo-btn"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#F8FAFC]">AutoCheck</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#101F33] text-[#3B82F6] border border-white/[0.08]">
                BRASIL
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] font-semibold tracking-wide">HISTÓRICO VEICULAR</p>
          </div>
        </button>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#94A3B8]">
          <button
            id="nav-home-btn"
            onClick={() => onNavigate('home')}
            className={`hover:text-[#F8FAFC] transition-colors cursor-pointer ${currentView === 'home' ? 'text-[#3B82F6] font-bold' : ''}`}
          >
            Consultar Placa
          </button>
          <button
            id="nav-how-it-works-btn"
            onClick={() => onNavigate('how-it-works')}
            className={`hover:text-[#F8FAFC] transition-colors cursor-pointer ${currentView === 'how-it-works' ? 'text-[#3B82F6] font-bold' : ''}`}
          >
            Como Funciona
          </button>
          <button
            id="nav-pricing-btn"
            onClick={() => onNavigate('pricing')}
            className={`hover:text-[#F8FAFC] transition-colors cursor-pointer ${currentView === 'pricing' ? 'text-[#3B82F6] font-bold' : ''}`}
          >
            Preços
          </button>
          <button
            id="nav-faq-btn"
            onClick={() => onNavigate('faq')}
            className={`hover:text-[#F8FAFC] transition-colors cursor-pointer ${currentView === 'faq' ? 'text-[#3B82F6] font-bold' : ''}`}
          >
            Dúvidas
          </button>
          <button
            id="nav-support-btn"
            onClick={onOpenSupportModal}
            className="hover:text-[#F8FAFC] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Suporte</span>
          </button>
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Search in Navbar (Desktop) */}
          {currentView !== 'home' && (
            <form onSubmit={handleQuickSubmit} className="hidden lg:flex items-center relative">
              <input
                type="text"
                placeholder="Placa..."
                value={quickPlate}
                maxLength={8}
                onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                className="w-32 focus:w-40 transition-all duration-200 bg-[#0B1728] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F8FAFC] uppercase placeholder:normal-case placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#3B82F6]"
              />
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 pointer-events-none" />
            </form>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Credits Balance Pill */}
          <button
            id="nav-credits-btn"
            onClick={onOpenCreditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101F33] border border-white/[0.08] hover:border-[#22C55E]/40 text-xs font-bold text-[#F8FAFC] transition-colors shadow-xs group cursor-pointer"
            title="Recarregar créditos de consulta"
          >

            <Zap className="w-3.5 h-3.5 text-[#22C55E] group-hover:scale-110 transition-transform" />
            <span className="text-[#22C55E]">{user?.credits ?? 0}</span>
            <span className="text-[#94A3B8] hidden sm:inline">créditos</span>
            <span className="text-[10px] ml-0.5 bg-[#22C55E]/20 text-[#22C55E] px-1 rounded font-black">+</span>
          </button>

          {/* User Account Controls */}
          {user ? (
            <div className="relative">
              <button
                id="nav-user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-[#101F33] border border-white/[0.08] hover:border-[#3B82F6]/50 text-[#F8FAFC] transition-colors focus:outline-none cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-[#3B82F6] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="text-xs font-semibold hidden sm:inline max-w-[100px] truncate text-[#F8FAFC]">
                  {user.name?.split(' ')[0] || 'Minha Conta'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#101F33] border border-white/[0.08] shadow-2xl py-2 text-xs text-[#94A3B8] z-50 animate-in fade-in"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-white/[0.08]">
                    <p className="font-bold text-[#F8FAFC] truncate">{user.name || 'Usuário'}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" />
                        {user.role === 'admin' ? 'Administrador' : 'Conta Ativa'}
                      </span>
                    </div>
                  </div>

                  <button
                    id="dropdown-profile-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('profile');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#0B1728] flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Minha Conta & Perfil
                  </button>

                  <button
                    id="dropdown-dashboard-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#0B1728] flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <Car className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Meus Laudos & Histórico
                  </button>

                  <button
                    id="dropdown-buy-credits-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenCreditModal();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#0B1728] flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Comprar Mais Créditos
                  </button>

                  <button
                    id="dropdown-support-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSupportModal();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#0B1728] flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <Headphones className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Suporte e Ajuda
                  </button>

                  {user.role === 'admin' && (
                    <button
                      id="dropdown-admin-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('admin');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-[#0B1728] flex items-center gap-2 text-purple-400 border-t border-white/[0.08] cursor-pointer transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-purple-400" />
                      Painel Administrativo
                    </button>
                  )}

                  <button
                    id="dropdown-logout-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#0B1728] flex items-center gap-2 text-[#EF4444] border-t border-white/[0.08] cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 rounded-lg bg-[#101F33] hover:bg-[#0B1728] border border-white/[0.08] text-xs font-bold text-[#F8FAFC] transition-colors cursor-pointer"
              >
                Entrar
              </button>
              <button
                id="nav-register-btn"
                onClick={() => onOpenAuthModal('register')}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
