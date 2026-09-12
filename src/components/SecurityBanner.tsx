import React from 'react';
import { ShieldCheck, ArrowRight, EyeOff, CheckCircle2 } from 'lucide-react';

interface SecurityBannerProps {
  onConsultClick: () => void;
}

export const SecurityBanner: React.FC<SecurityBannerProps> = ({ onConsultClick }) => {
  return (
    <section className="py-16 bg-[#07111F] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0B1728] border border-white/[0.08] p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Subtle gradient flair */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold">
              <EyeOff className="w-3.5 h-3.5" /> DECISÃO CONSCIENTE
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight leading-tight">
              Não compre no escuro.
            </h2>

            <p className="text-[#94A3B8] text-sm sm:text-base leading-relaxed">
              Um veículo pode parecer perfeito por fora e ainda possuir registros importantes em seu histórico, como gravames ativos, passagens por leilões de seguradora ou alertas policiais. Nossa plataforma organiza as informações disponíveis para ajudar você a tomar uma decisão mais consciente e segura.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                <span>Sem necessidade de cadastro prévio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                <span>Dados consolidados em laudo único</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto relative z-10">
            <button
              id="security-banner-cta-btn"
              onClick={onConsultClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-base shadow-[0_0_20px_rgba(59,130,246,0.35)] flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-white" />
              <span>Consultar uma placa</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
