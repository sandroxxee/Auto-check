import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Preciso informar o RENAVAM?',
      a: 'Não. A consulta do AutoCheck Brasil foi projetada para começar exclusivamente pela placa do veículo (seja padrão Mercosul ou padrão anterior de 3 letras e 4 números).'
    },
    {
      q: 'Preciso informar CPF?',
      a: 'Não. O sistema não exige documento pessoal para checar a situação cadastral e de roubo/furto do automóvel.'
    },
    {
      q: 'A checagem básica custa quanto?',
      a: 'A checagem cadastral e restrição de roubo/furto (SINESP) custa apenas R$ 34,90. Para destravar o histórico de leilão, sinistros, gravame e laudo pericial 360°, a consulta completa custa R$ 49,90.'
    },
    {
      q: 'A consulta substitui a vistoria física presencial?',
      a: 'Não. O laudo consolida informações disponíveis nas bases oficiais no exato momento da busca. Recomendamos sempre a realização de vistoria cautelar presencial antes da compra.'
    },
    {
      q: 'Os dados apresentados são oficiais?',
      a: 'Sim. As informações de dados cadastrais e roubo/furto são sincronizadas com a base nacional oficial homologada. Cada relatório lista com transparência as fontes consultadas e o horário da checagem.'
    },
    {
      q: 'Como funciona a conformidade com a LGPD?',
      a: 'Cumprimos rigorosamente a Lei Geral de Proteção de Dados (Lei 13.709/2018). Dados sensíveis e identificadores pessoais (como CPF e dados pessoais do proprietário) são permanentemente protegidos.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-[#07111F] border-t border-white/[0.08]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6] px-3.5 py-1 rounded-full bg-[#101F33] border border-white/[0.08]">
            DÚVIDAS FREQUENTES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-4 tracking-tight">
            Perguntas e Respostas
          </h2>
          <p className="text-[#94A3B8] mt-3 text-base">
            Tudo o que você precisa saber sobre a consulta veicular por placa no Brasil.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#101F33] border border-white/[0.08] overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  id={`faq-toggle-${idx}-btn`}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 text-[#F8FAFC] font-bold text-base hover:text-[#3B82F6] transition-colors focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#94A3B8] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-[#3B82F6]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#94A3B8] leading-relaxed border-t border-white/[0.08]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
