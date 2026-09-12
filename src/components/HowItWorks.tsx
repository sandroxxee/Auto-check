import React from 'react';
import { Search, Cpu, FileCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Digite a placa do veículo',
      description: 'Informe os 7 caracteres da placa Mercosul ou convencional. Não precisa de RENAVAM ou documento pessoal.'
    },
    {
      number: '02',
      icon: Cpu,
      title: 'Consulta imediata nas bases',
      description: 'Nossa tecnologia conecta-se instantaneamente a fontes públicas e homologadas com deduplicação e alta velocidade.'
    },
    {
      number: '03',
      icon: FileCheck,
      title: 'Acesse o Laudo Completo',
      description: 'Visualize de forma clara a ficha técnica, situação de roubo/furto, dados cadastrais e histórico de procedência.'
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-[#07111F] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] px-3.5 py-1 rounded-full bg-[#101F33] border border-white/[0.08]">
            PROCESSO TRANSPARENTE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-4 tracking-tight">
            Como funciona a consulta
          </h2>
          <p className="text-[#94A3B8] mt-3 text-base">
            Desenvolvido para entregar a resposta mais confiável e rápida do mercado em apenas 3 passos.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-8 shadow-xl hover:border-[#3B82F6]/40 transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-center justify-center text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-3xl font-black text-white/10 group-hover:text-[#3B82F6]/30 transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">{step.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
