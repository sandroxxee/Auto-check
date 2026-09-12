import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MessageSquare,
  Building,
  Car,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { api } from '../services/api.ts';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlate?: string;
  userEmail?: string;
  userName?: string;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
  defaultPlate = '',
  userEmail = '',
  userName = ''
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'duvida_laudo' | 'financeiro' | 'b2b_api' | 'parceria' | 'outro'>('duvida_laudo');
  const [plateRelated, setPlateRelated] = useState(defaultPlate);
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios marcados com (*).');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.createSupportTicket({
        name,
        email,
        phone: phone || undefined,
        subject,
        category,
        message,
        plateRelated: plateRelated || undefined
      });

      setProtocol(res.ticket.id);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Erro ao enviar mensagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProtocol(null);
    setMessage('');
    setSubject('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0B1728] border border-white/[0.14] rounded-2xl shadow-2xl overflow-hidden text-slate-200 max-h-[92vh] flex flex-col">
        {/* Top Gradient Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 flex-shrink-0" />

        <div className="p-6 sm:p-7 overflow-y-auto">
          {/* Close Button */}
          <button
            id="support-modal-close-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {protocol ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Chamado Registrado!</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Nossa equipe técnica e de atendimento veicular já recebeu sua solicitação.
                </p>
              </div>

              <div className="bg-[#101F33] border border-white/[0.1] rounded-xl p-4 max-w-sm mx-auto">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Número de Protocolo</p>
                <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">#{protocol}</p>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Tempo médio de resposta: <strong>até 2 horas úteis</strong>
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="support-success-close-btn"
                  onClick={handleReset}
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-lg shadow-blue-500/10">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Central de Atendimento & Suporte</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dúvidas sobre laudos, integrações B2B ou solicitações técnicas.
                  </p>
                </div>
              </div>

              {/* Fast Help Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                <a
                  href="https://wa.me/5511999999999?text=Ol%C3%A1,%20preciso%20de%20suporte%20no%20AutoCheck%20Brasil"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 flex items-center gap-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">WhatsApp Suporte</p>
                    <p className="text-[10px] text-emerald-400/80">Atendimento humano em tempo real</p>
                  </div>
                </a>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-300">Encarregado DPO / LGPD</p>
                    <p className="text-[10px] text-blue-400/80">dpo@autocheck.com.br</p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Support Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nome *</label>
                    <input
                      id="support-name-input"
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail para Resposta *</label>
                    <input
                      id="support-email-input"
                      type="email"
                      required
                      placeholder="seu@email.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                    <select
                      id="support-category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="duvida_laudo">Dúvida sobre Laudo Veicular</option>
                      <option value="financeiro">Financeiro / Recarga de Créditos</option>
                      <option value="b2b_api">API & Integração para Empresas</option>
                      <option value="parceria">Parceria / Concessionárias</option>
                      <option value="outro">Outro Assunto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Placa Relacionada (Opcional)</label>
                    <input
                      id="support-plate-input"
                      type="text"
                      placeholder="Ex: ABC1D23"
                      value={plateRelated}
                      onChange={(e) => setPlateRelated(e.target.value.toUpperCase())}
                      className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assunto do Chamado *</label>
                  <input
                    id="support-subject-input"
                    type="text"
                    required
                    placeholder="Ex: Esclarecimento sobre restrição financeira no laudo"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mensagem Detalhada *</label>
                  <textarea
                    id="support-message-input"
                    required
                    rows={4}
                    placeholder="Descreva sua solicitação com o máximo de detalhes possível..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500">
                    Seus dados estão protegidos sob a LGPD (Lei 13.709/2018).
                  </p>
                  <button
                    id="support-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 flex-shrink-0"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Abrir Chamado</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
