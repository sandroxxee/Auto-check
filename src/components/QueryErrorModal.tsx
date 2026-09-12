import React from 'react';
import {
  X,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  CreditCard,
  MessageSquare
} from 'lucide-react';

interface QueryErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plate: string;
  errorMessage: string;
  onRetry: () => void;
  onOpenSupport: () => void;
  onOpenCredits: () => void;
}

export const QueryErrorModal: React.FC<QueryErrorModalProps> = ({
  isOpen,
  onClose,
  plate,
  errorMessage,
  onRetry,
  onOpenSupport,
  onOpenCredits
}) => {
  if (!isOpen) return null;

  const isCreditError = errorMessage.toLowerCase().includes('crédito') || errorMessage.toLowerCase().includes('saldo');
  const isPlateFormatError = errorMessage.toLowerCase().includes('inválid') || errorMessage.toLowerCase().includes('formato');
  const isApiPlanError = errorMessage.toLowerCase().includes('plano') || errorMessage.toLowerCase().includes('apibrasil');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0B1728] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        <div className="p-6 sm:p-7">
          {/* Close button */}
          <button
            id="query-error-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-3 shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              Não Foi Possível Concluir a Consulta
            </h2>

            {plate && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#101F33] border border-white/[0.1] font-mono text-xs font-bold text-slate-300">
                Placa: <span className="text-white">{plate.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Error Details Box */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1.5 mb-5 leading-relaxed">
            <p className="font-semibold text-white">Motivo identificado:</p>
            <p className="text-rose-200/90">{errorMessage || 'Falha de comunicação temporária com as bases estaduais de trânsito.'}</p>
          </div>

          {/* Suggestions List */}
          <div className="space-y-2 mb-6 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Recomendações:</p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              {isPlateFormatError ? (
                <>
                  <li>Verifique se a placa contém 7 caracteres (padrão Mercosul ABC1D23 ou cinza ABC1234).</li>
                  <li>Certifique-se de que não há espaços ou caracteres especiais.</li>
                </>
              ) : isCreditError ? (
                <>
                  <li>Seu saldo atual é insuficiente para processar essa consulta com relatório detalhado.</li>
                  <li>Adicione créditos com liberação instantânea via Pix para prosseguir.</li>
                </>
              ) : isApiPlanError ? (
                <>
                  <li>Sua autenticação com a APIBrasil foi validada com sucesso pelo servidor.</li>
                  <li>A APIBrasil exige que sua conta tenha um plano de Veículos ativo (ex: Plano Data Plus ou pacote de consultas) contratado no painel da APIBrasil.</li>
                  <li>Acesse o painel em <span className="text-white font-mono">app.apibrasil.io</span> ou <span className="text-white font-mono">apibrasil.com.br/planos</span> para ativar o plano correspondente.</li>
                </>
              ) : (
                <>
                  <li>Tente novamente em instantes. Nosso sistema tentará uma rota de contingência alternativa.</li>
                  <li>Veículos muito recentes (0 km) podem levar até 48h para sincronização no Registro Nacional.</li>
                </>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            {isCreditError ? (
              <button
                id="error-buy-credits-btn"
                onClick={() => { onClose(); onOpenCredits(); }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Recarregar Saldo de Consultas</span>
              </button>
            ) : (
              <button
                id="error-retry-btn"
                onClick={() => { onClose(); onRetry(); }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente Agora</span>
              </button>
            )}

            <button
              id="error-support-btn"
              onClick={() => { onClose(); onOpenSupport(); }}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Falar com o Suporte Técnico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
