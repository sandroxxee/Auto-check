import React from 'react';
import { Shield, Check, Info, ArrowRight } from 'lucide-react';

interface FreeTierHighlightProps {
  onStartFree: () => void;
}

export const FreeTierHighlight: React.FC<FreeTierHighlightProps> = ({ onStartFree }) => {
  return (
    <section className="py-16 bg-[#07111F] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-[#22C55E]" /> CONSULTA BÁSICA HOMOLOGADA
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
                Identificação Cadastral e Restrição de Roubo/Furto por R$ 34,90
              </h2>

              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Integramos fontes oficiais para que você possa verificar com precisão a situação cadastral e de roubo/furto de qualquer veículo no Brasil por apenas R$ 34,90, ou desbloquear o laudo completo 360° por R$ 49,90.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#F8FAFC] pt-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                  <span>Checagem oficial de Roubo e Furto (SINESP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                  <span>Dados cadastrais completos (Marca, Ano, UF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                  <span>Chassi e motor identificadores protegidos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                  <span>Resultado instantâneo na tela</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08] text-[11px] text-[#94A3B8] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                <span>
                  Para verificar gravames, leilões, sinistros e emitir o Laudo Pericial em PDF, selecione a Consulta Completa por R$ 49,90.
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 w-full lg:w-auto">
              <button
                id="free-tier-start-btn"
                onClick={onStartFree}
                className="w-full lg:w-auto px-8 py-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <span>Fazer Consulta Básica (R$ 34,90)</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
