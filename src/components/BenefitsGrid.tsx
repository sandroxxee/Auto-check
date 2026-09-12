import React from 'react';
import { ShieldAlert, Car, Landmark, Flame, Gavel, AlertOctagon } from 'lucide-react';

export const BenefitsGrid: React.FC = () => {
  const benefits = [
    {
      icon: ShieldAlert,
      title: 'Roubo e Furto',
      description: 'Verifique se existem restrições ativas de roubo ou furto nas fontes homologadas da base nacional.',
      badgeColor: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
      iconColor: 'text-[#22C55E]'
    },
    {
      icon: Car,
      title: 'Dados Cadastrais Oficiais',
      description: 'Confira marca, modelo, versão, ano de fabricação/modelo, cor, combustível, chassi mascarado e procedência.',
      badgeColor: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20',
      iconColor: 'text-[#3B82F6]'
    },
    {
      icon: Landmark,
      title: 'Gravame e Alienação',
      description: 'Verifique registros de alienação fiduciária, reserva de domínio e restrições financeiras vinculadas ao veículo.',
      badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
      iconColor: 'text-[#F59E0B]'
    },
    {
      icon: Flame,
      title: 'Sinistros e Avarias',
      description: 'Identifique registros de sinistros de seguradora (pequena, média ou grande monta) e indenizações integrais.',
      badgeColor: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
      iconColor: 'text-[#EF4444]'
    },
    {
      icon: Gavel,
      title: 'Histórico de Leilão',
      description: 'Consulte se o veículo já foi levado a leilão de seguradoras, bancos ou financeiras antes de fechar negócio.',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      icon: AlertOctagon,
      title: 'Multas e Restrições Renainf',
      description: 'Consulte registros de multas, débitos pendentes e restrições administrativas do Detran e Renainf.',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      iconColor: 'text-sky-400'
    }
  ];

  return (
    <section className="py-20 bg-[#0B1728] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] px-3.5 py-1 rounded-full bg-[#101F33] border border-white/[0.08]">
            COBERTURA COMPLETA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-4 tracking-tight">
            Tudo o que você precisa saber sobre o veículo
          </h2>
          <p className="text-[#94A3B8] mt-3 text-base">
            Cruzamos diferentes fontes autorizadas e bases oficiais para fornecer segurança total na sua negociação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 hover:border-[#3B82F6]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#07111F] border border-white/[0.08] flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className={`w-6 h-6 ${b.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">{b.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${b.badgeColor}`}>
                    Disponível
                  </span>
                  <span className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Tempo real
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
