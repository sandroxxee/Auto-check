import React from 'react';
import { ShieldCheck, Lock, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: any) => void;
  onOpenLegal: (tab: 'privacidade' | 'termos' | 'uso-responsavel') => void;
  onOpenSupport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal, onOpenSupport }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07111F] text-[#94A3B8] text-xs border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-[#F8FAFC] tracking-tight">AutoCheck Brasil</span>
            </div>

            <p className="text-[#94A3B8] text-xs leading-relaxed max-w-sm">
              Plataforma de inteligência e histórico veicular por placa no Brasil. Fornecemos dados transparentes para apoiar negociações automotivas seguras.
            </p>

            <div className="pt-2 flex items-center gap-4 text-[11px] text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#22C55E]" /> Criptografia SSL 256-bit
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" /> Conforme LGPD
              </span>
            </div>
          </div>

          {/* Col 3: Navegação */}
          <div className="space-y-3">
            <h4 className="text-[#F8FAFC] font-bold text-xs uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Consulta por Placa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Como Funciona
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Tabela de Preços
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Dúvidas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & LGPD */}
          <div className="space-y-3">
            <h4 className="text-[#F8FAFC] font-bold text-xs uppercase tracking-wider">Segurança & Legal</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onOpenLegal('privacidade')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('termos')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Termos de Uso
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('uso-responsavel')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Uso Responsável de Dados
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal')} className="hover:text-[#F8FAFC] transition-colors cursor-pointer">
                  Conformidade LGPD
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Suporte */}
          <div className="space-y-3">
            <h4 className="text-[#F8FAFC] font-bold text-xs uppercase tracking-wider">Atendimento</h4>
            <p className="text-[#94A3B8] text-xs">
              Segunda a Sexta das 08h às 18h.<br />
              Atendimento técnico e comercial.
            </p>
            {onOpenSupport && (
              <button
                id="footer-support-btn"
                onClick={onOpenSupport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101F33] hover:bg-[#0B1728] text-[#F8FAFC] font-medium text-xs border border-white/[0.08] transition-colors cursor-pointer"
              >
                Falar com o Suporte
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer / Aviso Legal Obrigatório */}
        <div className="pt-8 border-t border-white/[0.08] text-[11px] text-[#94A3B8] leading-relaxed space-y-2">
          <p>
            <strong className="text-[#F8FAFC]">Aviso de Isenção e Uso de Dados:</strong> O AutoCheck Brasil consolida informações veiculares a partir de bases públicas e provedores homologados no momento de cada requisição. Os dados destinam-se a subsidiar a análise de procedência veicular e não dispensam vistoria cautelar física presencial especializada antes de qualquer transação comercial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-[#94A3B8]">
            <p>© {new Date().getFullYear()} AutoCheck Brasil • Criado por <strong className="text-[#F8FAFC]">Sandro Luiz Mayer</strong>. Todos os direitos reservados. Proibida cópia, plágio ou reprodução não autorizada.</p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
