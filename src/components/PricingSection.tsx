import React from 'react';
import { Check, Zap, Sparkles, Shield, Building } from 'lucide-react';
import { PlanPricing, CreditPackage } from '../types/index.ts';

interface PricingSectionProps {
  plans: PlanPricing[];
  creditPackages: CreditPackage[];
  onSelectPlan: (planId: string) => void;
  onSelectPackage: (pkg: CreditPackage) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plans,
  creditPackages,
  onSelectPlan,
  onSelectPackage
}) => {
  return (
    <section id="precos" className="py-20 bg-[#07111F] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] px-3.5 py-1 rounded-full bg-[#101F33] border border-white/[0.08]">
            TRANSPARÊNCIA TOTAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-4 tracking-tight">
            Valores e Planos de Consulta
          </h2>
          <p className="text-[#94A3B8] mt-3 text-base">
            Consulte de forma avulsa ou adquira pacotes com desconto para seu negócio ou frota. Sem mensalidades forçadas.
          </p>
        </div>

        {/* 3 Main Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {plans.map((p) => {
            const isHighlight = p.id === 'complete';
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isHighlight
                    ? 'bg-[#101F33] border-2 border-[#3B82F6] shadow-[0_10px_35px_rgba(59,130,246,0.2)] lg:-translate-y-2'
                    : 'bg-[#101F33] border border-white/[0.08] shadow-xl hover:border-white/[0.15]'
                }`}
              >
                {isHighlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#3B82F6] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Mais Escolhido
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-extrabold text-[#F8FAFC]">{p.name}</h3>
                    {(p.id === 'basic' || p.id === 'free') && <Shield className="w-5 h-5 text-[#22C55E]" />}
                    {p.id === 'complete' && <Zap className="w-5 h-5 text-[#3B82F6]" />}
                    {p.id === 'pro' && <Building className="w-5 h-5 text-purple-400" />}
                  </div>

                  <p className="text-xs text-[#94A3B8] mb-6 min-h-[32px]">{p.description}</p>

                  <div className="mb-6 pb-6 border-b border-white/[0.08]">
                    <span className="text-3xl sm:text-4xl font-black text-[#F8FAFC] font-mono">
                      {p.priceBrl === 0 ? 'Grátis' : `R$ ${p.priceBrl.toFixed(2).replace('.', ',')}`}
                    </span>
                    <span className="text-xs text-[#94A3B8] ml-2 font-medium">/ consulta</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F8FAFC]">
                        <Check className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id={`pricing-select-${p.id}`}
                  onClick={() => onSelectPlan(p.id)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    isHighlight
                      ? 'bg-[#3B82F6] hover:bg-blue-600 text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)]'
                      : 'bg-[#0B1728] hover:bg-[#16273f] text-[#F8FAFC] border border-white/[0.08]'
                  }`}
                >
                  {p.ctaText || 'Selecionar Plano'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Credit Packages Bar */}
        <div className="rounded-2xl bg-[#0B1728] border border-white/[0.08] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Pacotes de Créditos com Desconto</h3>
              <p className="text-xs text-[#94A3B8]">Créditos não expiram. Ideal para despachantes, lojistas e frotas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg)}
                className="p-4 rounded-xl bg-[#101F33] border border-white/[0.08] hover:border-[#3B82F6]/50 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-sm font-bold text-[#F8FAFC] block group-hover:text-[#3B82F6] transition-colors">
                    {pkg.credits} Consultas
                  </span>
                  <span className="text-xs text-[#94A3B8] font-medium">
                    R$ {(pkg.priceBrl / pkg.credits).toFixed(2).replace('.', ',')} por consulta
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-[#F8FAFC] font-mono block">
                    R$ {pkg.priceBrl.toFixed(2).replace('.', ',')}
                  </span>
                  {pkg.badge && (
                    <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                      {pkg.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
