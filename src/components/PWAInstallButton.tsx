import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, ShieldCheck, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'hero' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // Se já estiver instalado como PWA standalone, suprime o botão
  if (isInstalled && !installedSuccess) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // Se não for instalável nem iOS e nem estiver em teste, não renderiza
  if (!isInstallable && !isIOS && !installedSuccess) {
    return null;
  }

  return (
    <>
      {variant === 'navbar' && (
        <button
          id="pwa-install-nav-btn"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer ${className}`}
          title="Instalar AutoCheck Brasil no celular ou computador"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-200" />
          <span>Instalar App</span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          id="pwa-install-hero-btn"
          onClick={handleInstallClick}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#101F33] hover:bg-[#152842] border border-blue-500/30 text-blue-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>Baixar App AutoCheck</span>
        </button>
      )}

      {variant === 'floating' && (
        <div className="fixed bottom-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            id="pwa-install-floating-btn"
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0B1728] hover:bg-[#101F33] border border-blue-500/40 text-[#F8FAFC] text-xs font-bold shadow-xl shadow-black/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <Download className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-white leading-tight">Instalar AutoCheck</p>
              <p className="text-[9px] text-blue-300">Acesso rápido sem internet</p>
            </div>
          </button>
        </div>
      )}

      {/* Modal Guia Passo a Passo para iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#0B1728] border border-white/[0.12] p-6 shadow-2xl text-[#F8FAFC] space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Instalar no iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-400">AutoCheck Brasil PWA</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#07111F] rounded-xl p-3.5 space-y-3 text-xs border border-white/[0.06]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-slate-300">
                  Toque no botão de <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline text-blue-400" />) na barra inferior do Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-slate-300">
                  Role o menu para baixo e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-slate-300">
                  Toque em <strong>Adicionar</strong> no canto superior direito para concluir.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-xl border border-amber-400/50 animate-in fade-in">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-950 animate-pulse" />
      <span>Modo Offline — Exibindo dados salvos em cache.</span>
    </div>
  );
};
