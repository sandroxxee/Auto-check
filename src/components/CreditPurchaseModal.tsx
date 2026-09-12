import React, { useState } from 'react';
import { X, Zap, QrCode, CreditCard, CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, Clock, Gift } from 'lucide-react';
import { CreditPackage } from '../types/index.ts';
import { api } from '../services/api.ts';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: CreditPackage[];
  onSuccess: (creditsAdded: number) => void;
  targetReportId?: string;
  onReportUnlocked?: () => void;
}

export const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({
  isOpen,
  onClose,
  packages,
  onSuccess,
  targetReportId,
  onReportUnlocked
}) => {
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage>(packages[0] || {
    id: 'pack_3',
    name: 'Pacote Essencial',
    credits: 3,
    priceBrl: 79.90,
    pricePerCredit: 26.63,
    badge: 'Popular'
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pixData, setPixData] = useState<{
    copyPaste: string;
    qrCodeUrl: string;
    txId: string;
    amount: number;
    beneficiaryName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartPixPayment = async () => {
    try {
      setLoading(true);
      const res = await api.generatePix({
        amount: selectedPkg.priceBrl,
        description: `AutoCheck ${selectedPkg.name}`,
        packageId: selectedPkg.id,
        reportId: targetReportId
      });

      if (res.success && res.pix) {
        setPixData(res.pix);
      } else {
        throw new Error('Falha ao gerar cobrança PIX.');
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Falha ao iniciar pagamento PIX.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPixPayment = async () => {
    try {
      setLoading(true);
      const res = await api.confirmPix({
        txId: pixData?.txId || 'tx_' + Date.now(),
        packageId: selectedPkg.id,
        reportId: targetReportId,
        amount: selectedPkg.priceBrl
      });

      setCompleted(true);
      onSuccess(selectedPkg.credits);
      if (onReportUnlocked) onReportUnlocked();

      setTimeout(() => {
        setCompleted(false);
        setPixData(null);
        onClose();
      }, 2500);
    } catch (err: unknown) {
      alert((err as Error).message || 'Falha ao confirmar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCardPayment = async () => {
    try {
      setLoading(true);
      await api.buyCredits(selectedPkg.id, 'Cartão de Crédito');
      setCompleted(true);
      onSuccess(selectedPkg.credits);
      if (onReportUnlocked) onReportUnlocked();
      setTimeout(() => {
        setCompleted(false);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      alert((err as Error).message || 'Falha ao processar recarga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0B1728] border border-white/[0.15] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Desbloquear Consultas & Laudo</h3>
              <p className="text-[11px] text-slate-400">Liberação instantânea com emissão de PDF oficial</p>
            </div>
          </div>

          <button
            onClick={() => {
              setPixData(null);
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="py-10 text-center space-y-4 animate-in zoom-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-black text-white">Pagamento Confirmado!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Seus créditos e laudo completo foram liberados com sucesso.
            </p>
          </div>
        ) : pixData ? (
          /* PIX Screen with QR Code and Copia e Cola */
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Pague via PIX para liberação imediata
              </span>
              <p className="text-2xl font-black text-white font-mono mt-2">
                R$ {pixData.amount.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-slate-400">
                Beneficiário: <strong className="text-slate-200">{pixData.beneficiaryName}</strong>
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-2xl border-4 border-emerald-500/40">
              <img
                src={pixData.qrCodeUrl}
                alt="QR Code Pix"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Copia e Cola input */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Código Pix Copia e Cola:</span>
                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Expira em 15 min
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixData.copyPaste}
                  className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl px-3 py-2.5 text-[11px] text-slate-300 font-mono focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyPix}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-lg transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmation button */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleConfirmPixPayment}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verificando pagamento...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Já fiz o Pix / Liberar Laudo Agora</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setPixData(null)}
                className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition-colors"
              >
                Trocar forma de pagamento ou pacote
              </button>
            </div>
          </div>
        ) : (
          /* Package & Payment Method Selector */
          <>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Escolha a quantidade de consultas:
              </label>

              <div className="grid grid-cols-3 gap-3">
                {packages.map((pkg) => {
                  const isSelected = selectedPkg.id === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkg(pkg)}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                          : 'bg-[#101F33] border-white/[0.08] text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{pkg.credits} {pkg.credits === 1 ? 'Consulta' : 'Consultas'}</span>
                        {pkg.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-mono font-black text-base sm:text-lg text-white mt-1">
                        R$ {pkg.priceBrl.toFixed(2).replace('.', ',')}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Loyalty reminder note */}
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5 flex items-center gap-2.5 text-xs text-blue-300">
                <Gift className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-[11px] leading-tight">
                  <strong className="text-white">Programa de Fidelidade:</strong> A cada 10 vistorias pagas realizadas, você ganha <strong>1 consulta completa 100% gratuita</strong> automaticamente.
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Forma de pagamento:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    paymentMethod === 'pix'
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                      : 'bg-[#101F33] border-white/[0.08] text-slate-300 hover:border-white/20'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Pix Instantâneo</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">Liberação imediata</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-500/15 border-blue-500 text-white shadow-lg'
                      : 'bg-[#101F33] border-white/[0.08] text-slate-300 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Cartão de Crédito</p>
                    <p className="text-[10px] text-slate-400">Até 3x sem juros</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Total & Action Button */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-slate-400">Total a pagar:</p>
                <p className="text-xl font-black text-white font-mono">
                  R$ {selectedPkg.priceBrl.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <button
                id="modal-confirm-buy-credits-btn"
                onClick={paymentMethod === 'pix' ? handleStartPixPayment : handleCardPayment}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  <>
                    <span>{paymentMethod === 'pix' ? 'Gerar QR Code Pix' : 'Pagar com Cartão'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
