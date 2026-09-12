import React from 'react';
import { X, ShieldCheck, FileText, AlertTriangle, Lock } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacidade' | 'termos' | 'uso-responsavel';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacidade'
}) => {
  const [tab, setTab] = React.useState<'privacidade' | 'termos' | 'uso-responsavel'>(initialTab);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl bg-[#0B1728] border border-white/[0.12] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#101F33]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Central de Conformidade & Legal</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/[0.08] bg-[#07111F] px-6 text-xs font-semibold">
          <button
            onClick={() => setTab('privacidade')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              tab === 'privacidade'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Política de Privacidade (LGPD)
          </button>

          <button
            onClick={() => setTab('termos')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              tab === 'termos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Termos de Uso
          </button>

          <button
            onClick={() => setTab('uso-responsavel')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              tab === 'uso-responsavel'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Uso Responsável & Vistoria
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh]">
          {tab === 'privacidade' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Compromisso com a Privacidade e LGPD</h4>
              <p>
                A AutoCheck Brasil preza pela privacidade de todos os usuários e cidadãos, atuando em estrita observância à Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais).
              </p>

              <h4 className="text-sm font-bold text-white">2. Não Exposição de Dados Pessoais Sensíveis</h4>
              <p>
                Nossos relatórios não divulgam CPF completo, endereço residencial, telefone ou dados privados de pessoas físicas. Quaisquer identificadores são obrigatoriamente mascarados (ex: ***.456.789-**).
              </p>

              <h4 className="text-sm font-bold text-white">3. Coleta e Finalidade de Dados</h4>
              <p>
                Armazenamos exclusivamente registros de consultas (logs técnicos) para fins de segurança, auditoria antifraude e controle de créditos adquiridos. Não comercializamos listas de dados com terceiros não autorizados.
              </p>
            </div>
          )}

          {tab === 'termos' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Natureza do Serviço</h4>
              <p>
                A AutoCheck Brasil atua como integradora e consolidadora de informações veiculares públicas e de parceiros comerciais homologados. A plataforma organiza os dados para facilitar a consulta antes de uma negociação.
              </p>

              <h4 className="text-sm font-bold text-white">2. Limitação de Responsabilidade</h4>
              <p>
                As informações são fornecidas &quot;como estão&quot; pelas fontes no momento da consulta. A ausência de registro nas fontes consultadas não constitui garantia legal de inexistência de sinistro, avaria oculta ou gravame não averbado no órgão de trânsito.
              </p>

              <h4 className="text-sm font-bold text-white">3. Reembolso e Créditos</h4>
              <p>
                Consultas concluídas e relatórios gerados com sucesso consomem o crédito correspondente. Em caso de instabilidade sistêmica comprovada, os créditos serão estornados à conta do usuário.
              </p>
            </div>
          )}

          {tab === 'uso-responsavel' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">1. Guia do Comprador Consciente</h4>
              <p>
                A consulta do histórico por placa é a primeira etapa fundamental na compra de um veículo usado ou seminovo. No entanto, ela complementa — mas não substitui — os seguintes passos:
              </p>

              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Vistoria Cautelar Física:</strong> Inspeção da estrutura do chassi, soldas, longarinas e pintura com especialista presencial.</li>
                <li><strong>Conferência Documental:</strong> Verificação física do Certificado de Registro e Licenciamento de Veículo (CRLV-e).</li>
                <li><strong>Teste Mecânico (Test-Drive):</strong> Avaliação de motor, suspensão, freios e câmbio em oficina de confiança.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#101F33] border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
