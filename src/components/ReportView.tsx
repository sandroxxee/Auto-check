import React, { useState } from 'react';
import {
  ShieldAlert,
  Car,
  Landmark,
  Flame,
  Gavel,
  Scale,
  Download,
  Share2,
  Printer,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  Zap,
  Lock,
  FileText,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Fuel,
  Gauge,
  Wrench,
  RefreshCw,
  BadgePercent,
  Calendar,
  MapPin,
  Gift,
  MessageCircle,
  Mail,
  ExternalLink,
  X,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { VehicleReport, UserAccount } from '../types/index.ts';
import { generateVehiclePdf, generateVehiclePdfFile } from '../services/pdfGenerator.ts';
import { ReportSkeleton } from './ReportSkeleton.tsx';

interface ReportViewProps {
  report?: VehicleReport | null;
  isLoading?: boolean;
  plateBeingQueried?: string;
  user: UserAccount | null;
  onUpgrade?: () => void;
  onOpenCreditModal?: () => void;
  onNewSearch: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  isLoading = false,
  plateBeingQueried,
  user,
  onUpgrade,
  onOpenCreditModal,
  onNewSearch
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Microanimação de carregamento (Skeleton Screen) ativa enquanto os dados são processados
  if (isLoading || !report) {
    return (
      <ReportSkeleton
        plate={plateBeingQueried || report?.plate}
        onCancel={onNewSearch}
      />
    );
  }

  const isComplete = report.queryType === 'complete';

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      // Small timeout to allow UI state to update
      await new Promise(resolve => setTimeout(resolve, 150));
      generateVehiclePdf(report, user);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      // Fallback to print dialog if jsPDF encounters unexpected environment issues
      try {
        window.print();
      } catch (printErr) {
        console.error('Falha ao acionar impressão:', printErr);
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShare = async () => {
    const vehicleInfo = `${report.vehicle?.marca || ''} ${report.vehicle?.modelo || ''}`.trim() || 'Veículo';
    const shareTitle = `Laudo Veicular AutoCheck - ${report.plateFormatted}`;
    const shareText = `Confira o laudo pericial oficial do veículo ${vehicleInfo} (Placa: ${report.plateFormatted}) - Score de Segurança: ${report.score}/100 (${report.riskLevel.toUpperCase()}).`;
    const shareUrl = window.location.href;

    // Se o navegador possuir suporte à API Web Share (Dispositivos Móveis e Navegadores Modernos)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        setSharing(true);
        // Tenta incluir o arquivo PDF na chamada de compartilhamento caso o navegador suporte compartilhamento de arquivos
        let sharedWithFile = false;
        try {
          const pdfFile = generateVehiclePdfFile(report, user);
          if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              url: shareUrl,
              files: [pdfFile]
            });
            sharedWithFile = true;
          }
        } catch (fileErr) {
          console.warn('Compartilhamento de arquivo via Web Share não suportado, enviando texto/link:', fileErr);
        }

        if (!sharedWithFile) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
        }
        return;
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Web Share falhou ou não permitido no ambiente, abrindo modal direto:', err);
          setShowShareModal(true);
        }
        return;
      } finally {
        setSharing(false);
      }
    }

    // Fallback: Exibe modal de compartilhamento com opções de WhatsApp, E-mail, Copiar Link e PDF
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `laudo-${report.plateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
    if (score >= 50) return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
    return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'baixo':
        return (
          <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-xs font-bold">
            Risco Baixo
          </span>
        );
      case 'medio':
        return (
          <span className="px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs font-bold">
            Risco Moderado
          </span>
        );
      case 'alto':
        return (
          <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold">
            Risco Alto
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-xs font-bold">
            Risco Crítico
          </span>
        );
    }
  };

  const clientDisplayName = user?.name || user?.company || (user?.email ? user.email.split('@')[0] : 'Cliente Cadastrado');
  const queryDateFormatted = new Date(report.createdAt || Date.now()).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-[#F8FAFC] print:p-0 print:m-0 print:max-w-none print:text-black">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
            <button onClick={onNewSearch} className="hover:text-[#3B82F6] transition-colors font-medium cursor-pointer">
              Início
            </button>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]/60" />
            <span>Laudo Veicular</span>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]/60" />
            <span className="font-mono text-[#F8FAFC] font-bold">{report.plateFormatted}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              {isComplete ? 'Laudo Completo 360°' : 'Laudo Básico Veicular'}
            </h1>
            {isComplete ? (
              <span className="px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> Laudo Completo 360° (R$ 49,90)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-[#F59E0B]" /> Consulta Básica (R$ 34,90)
              </span>
            )}
            {report.isDemo && (
              <span className="px-2.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 text-[10px] font-bold uppercase tracking-wider">
                Demonstração
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="report-download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-50 ${
              pdfSuccess
                ? 'bg-[#22C55E] text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                : 'bg-[#3B82F6] hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            }`}
          >
            {pdfSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>PDF Baixado com Sucesso!</span>
              </>
            ) : (
              <>
                <Download className={`w-4 h-4 ${downloadingPdf ? 'animate-bounce' : ''}`} />
                <span>{downloadingPdf ? 'Gerando Laudo Oficial...' : 'Baixar PDF'}</span>
              </>
            )}
          </button>

          <button
            id="report-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#101F33] hover:bg-[#0B1728] border border-white/[0.08] text-[#F8FAFC] text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            title="Imprimir laudo ou salvar como PDF"
          >
            <Printer className="w-4 h-4 text-[#3B82F6]" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          <button
            id="report-share-btn"
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#101F33] hover:bg-[#0B1728] border border-white/[0.08] text-[#F8FAFC] text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Compartilhar laudo via WhatsApp, E-mail ou Link"
          >
            <Share2 className={`w-4 h-4 text-[#3B82F6] ${sharing ? 'animate-spin' : ''}`} />
            <span>{sharing ? 'Compartilhando...' : copied ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>

          <button
            id="report-json-btn"
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#101F33] hover:bg-[#0B1728] border border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold transition-colors shadow-xs hidden md:flex cursor-pointer"
            title="Exportar JSON"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Client & Query Metadata Banner */}
      <div className="rounded-xl bg-[#0B1728] border border-white/[0.08] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8]">Solicitante / Cliente:</span>
            <span className="font-bold text-[#F8FAFC]">{clientDisplayName}</span>
            {user?.email && <span className="text-[#64748B]">({user.email})</span>}
          </div>
          <span className="text-white/20 hidden md:inline">|</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[#94A3B8]">Dia da Pesquisa:</span>
            <span className="font-bold text-[#F8FAFC]">{queryDateFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {report.loyaltyDiscountApplied ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1 animate-pulse">
              <Gift className="w-3.5 h-3.5 text-emerald-400" /> Desconto Fidelidade Aplicado (1 Crédito Grátis)
            </span>
          ) : user ? (
            <span className="px-2.5 py-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] font-bold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 1 Vistoria Utilizada • Saldo: {user.credits} vistorias restantes
            </span>
          ) : null}
          <span className="font-mono text-[11px] text-[#94A3B8] bg-[#101F33] px-2.5 py-1 rounded border border-white/[0.08]">
            ID: #{report.id.substring(0, 10).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Loyalty Discount Notification */}
      {(report.loyaltyDiscountApplied || report.loyaltyMessage) && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-[#07111F] border border-emerald-500/40 p-4 flex items-center justify-between gap-3 text-xs text-emerald-300 shadow-lg print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                {report.loyaltyDiscountApplied ? '🎉 Desconto Fidelidade 100% Aplicado' : '★ Programa de Fidelidade AutoCheck'}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  10 Consultas = 1 Grátis
                </span>
              </div>
              <p className="text-emerald-200/90 text-xs mt-0.5">
                {report.loyaltyMessage || 'Esta consulta foi concedida gratuitamente pelo programa de fidelidade após 10 consultas pagas.'}
              </p>
            </div>
          </div>
          {report.loyaltyDiscountApplied && (
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider hidden sm:inline-block shadow-md">
              0 Créditos Cobrados
            </span>
          )}
        </div>
      )}

      {/* Main Header Card */}
      <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Plate & Vehicle Title */}
          <div className="flex items-start gap-5">
            {/* Real Brazilian Plate Stamp */}
            <div className="rounded-xl bg-white border border-white/[0.15] shadow-lg overflow-hidden text-center min-w-[140px] flex-shrink-0">
              <div className="bg-[#003399] text-white text-[9px] font-bold py-1 px-2 tracking-widest flex items-center justify-between">
                <span>★ BRASIL</span>
                <span className="text-[8px]">MERCOSUL</span>
              </div>
              <div className="bg-slate-50 py-2 px-3 font-mono font-black text-2xl text-slate-900 tracking-wider">
                {report.plateFormatted}
              </div>
            </div>

            <div>
              {isComplete ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded-full border border-[#22C55E]/20 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> TODAS AS 11 BASES PERICIAIS DESBLOQUEADAS
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded-full border border-[#F59E0B]/20 inline-flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> CONSULTA BÁSICA • 5 MÓDULOS AVANÇADOS BLOQUEADOS
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] mt-1.5">
                {report.vehicle?.marca} {report.vehicle?.modelo}
              </h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#94A3B8] mt-1 font-medium">
                <span>Ano {report.vehicle?.anoFabricacao || '-'}/{report.vehicle?.anoModelo || '-'}</span>
                <span>•</span>
                <span>{report.vehicle?.cor || 'Cor não informada'}</span>
                <span>•</span>
                <span>{report.vehicle?.combustivel || 'Combustível'}</span>
                <span>•</span>
                <span>{report.vehicle?.municipio || '-'}/{report.vehicle?.uf || '-'}</span>
              </div>
            </div>
          </div>

          {/* Safety Score Meter Box */}
          <div className="flex items-center gap-4 bg-[#0B1728] border border-white/[0.08] p-4 rounded-xl w-full lg:w-auto justify-between sm:justify-start">
            <div className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center font-mono ${getScoreColor(report.score)} shadow-xs`}>
              <span className="text-2xl font-black">{report.score}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest -mt-1 opacity-75">/100</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  {isComplete ? 'Score 360° Pericial' : 'Score Cadastral Preliminar'}
                </span>
                {getRiskBadge(report.riskLevel)}
              </div>
              <p className="text-[11px] text-[#94A3B8] max-w-[200px] leading-tight">
                {isComplete
                  ? 'Auditado com dados periciais de leilão, gravame e débitos.'
                  : 'Score básico inicial. O score completo 360° requer o Laudo Completo.'}
              </p>
            </div>
          </div>
        </div>

        {/* Score Breakdown Accordion / Details */}
        {report.scoreBreakdown && report.scoreBreakdown.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#3B82F6]" /> Justificativa Detalhada da Pontuação:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {report.scoreBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-start gap-2.5 text-xs"
                >
                  {item.type === 'positive' && <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />}
                  {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />}
                  {item.type === 'danger' && <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />}
                  {item.type === 'neutral' && <Info className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F8FAFC]">{item.rule}</span>
                      {item.points !== 0 && (
                        <span className={`text-[10px] font-bold px-1.5 rounded ${item.points > 0 ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                          {item.points > 0 ? `+${item.points}` : item.points} pts
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Paywall Banner for Basic Query */}
      {!isComplete && (
        <div className="rounded-2xl bg-[#0B1728] border-2 border-[#3B82F6]/50 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Desbloqueie o Laudo Completo
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
              Módulos de Gravame, Sinistros e Leilão
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Você visualizou o laudo básico (R$ 34,90). Desbloqueie o Laudo Completo 360° (R$ 49,90) para acessar <strong>Gravame/Financiamento (SNG)</strong>, <strong>Passagem por Leilões</strong>, <strong>Sinistros Securitários</strong> e <strong>Débitos Renainf</strong> com laudo oficial em PDF.
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10">
            {user && user.credits > 0 ? (
              <button
                id="upgrade-with-credits-btn"
                onClick={onUpgrade}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Usar 1 Crédito (Saldo: {user.credits})</span>
              </button>
            ) : (
              <button
                id="buy-credits-upgrade-btn"
                onClick={onOpenCreditModal}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Desbloquear Laudo Completo (R$ 49,90)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Report Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Dados do Veículo */}
        <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
              <Car className="w-4 h-4 text-[#3B82F6]" />
              <span>DADOS CADASTRAIS</span>
            </div>
            <span className="text-[10px] text-[#22C55E] font-semibold bg-[#22C55E]/10 px-2.5 py-0.5 rounded border border-[#22C55E]/20">
              {report.vehicle?.situacaoVeiculo || 'EM CIRCULAÇÃO'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[0.08]">
              <span className="text-[#94A3B8]">Marca:</span>
              <span className="font-bold text-[#F8FAFC]">{report.vehicle?.marca || 'Não informado'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.08]">
              <span className="text-[#94A3B8]">Modelo:</span>
              <span className="font-bold text-[#F8FAFC] text-right max-w-[180px] truncate">{report.vehicle?.modelo || 'Não informado'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.08]">
              <span className="text-[#94A3B8]">Ano Fab./Modelo:</span>
              <span className="font-bold text-[#F8FAFC]">{report.vehicle?.anoFabricacao || '-'}/{report.vehicle?.anoModelo || '-'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.08]">
              <span className="text-[#94A3B8]">Cor Oficial:</span>
              <span className="font-bold text-[#F8FAFC]">{report.vehicle?.cor || 'Não informada'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.08]">
              <span className="text-[#94A3B8]">Combustível:</span>
              <span className="font-bold text-[#F8FAFC]">{report.vehicle?.combustivel || 'Não informado'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.08]">
              <span className="text-[#94A3B8]">Chassi Mascarado:</span>
              <span className="font-mono font-bold text-[#3B82F6]">{report.vehicle?.chassiMascarado || 'Não disponível'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#94A3B8]">Município/UF:</span>
              <span className="font-bold text-[#F8FAFC]">{report.vehicle?.municipio || '-'}/{report.vehicle?.uf || '-'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Roubo e Furto */}
        <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-[#22C55E]" />
              <span>ROUBO E FURTO</span>
            </div>
            <span className="text-[10px] text-[#3B82F6] font-semibold bg-[#3B82F6]/10 px-2.5 py-0.5 rounded border border-[#3B82F6]/20">
              BASE NACIONAL
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
              <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Status de Ocorrência:</p>
              <div className="flex items-center gap-2 mt-1">
                {report.theft.status === 'NADA_CONSTA' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    <span className="font-black text-[#22C55E] text-sm">NADA CONSTA NO SISTEMA</span>
                  </>
                ) : report.theft.status === 'RESTRICAO_ENCONTRADA' ? (
                  <>
                    <XCircle className="w-5 h-5 text-[#EF4444]" />
                    <span className="font-black text-[#EF4444] text-sm">RESTRIÇÃO POLICIAL ENCONTRADA</span>
                  </>
                ) : (
                  <>
                    <Info className="w-4 h-4 text-[#94A3B8]" />
                    <span className="font-bold text-[#94A3B8]">Não disponível nesta fonte</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              {report.theft.mensagem}
            </p>

            {report.theft.boletimOcorrencia && (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-[11px] space-y-1">
                <p><strong>B.O.:</strong> {report.theft.boletimOcorrencia}</p>
                <p><strong>Órgão:</strong> {report.theft.orgaoRegistro}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Gravame e Financiamento */}
        <div className={`rounded-2xl border p-6 shadow-xl space-y-4 ${!isComplete ? 'bg-[#101F33]/60 border-white/[0.05]' : 'bg-[#101F33] border-white/[0.08]'}`}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
              <Landmark className="w-4 h-4 text-[#F59E0B]" />
              <span>GRAVAME / SNG</span>
            </div>
            {isComplete ? (
              <span className="text-[10px] text-[#94A3B8] font-semibold bg-[#0B1728] px-2.5 py-0.5 rounded border border-white/[0.08]">
                Sistema de Gravames
              </span>
            ) : (
              <span className="text-[10px] text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Bloqueado no Básico
              </span>
            )}
          </div>

          {!isComplete ? (
            <div className="p-4 rounded-xl bg-[#0B1728]/80 border border-white/[0.06] text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-[#F8FAFC]">Gravame & Alienação Bloqueados</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  Identifique se o veículo possui alienação fiduciária ativa, arrendamento mercantil ou financiamento em aberto no Sistema Nacional de Gravames (SNG/B3).
                </p>
              </div>
              <button
                onClick={onUpgrade || onOpenCreditModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Desbloquear Gravame
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
                <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Status Financeiro:</p>
                <div className="flex items-center gap-2 mt-1">
                  {report.financing.status === 'SEM_RESTRICAO' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      <span className="font-black text-[#22C55E] text-sm">SEM RESTRIÇÃO / QUITADO</span>
                    </>
                  ) : report.financing.status === 'ALIENACAO_FIDUCIARIA' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                      <span className="font-black text-[#F59E0B] text-sm">ALIENAÇÃO FIDUCIÁRIA</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#94A3B8]" />
                      <span className="font-bold text-[#94A3B8]">Não identificado</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                {report.financing.descricao}
              </p>

              {report.financing.agenteFinanceiro && (
                <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[11px] text-[#F59E0B]">
                  <strong>Agente Financeiro:</strong> {report.financing.agenteFinanceiro}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 4: Histórico de Sinistro */}
        <div className={`rounded-2xl border p-6 shadow-xl space-y-4 ${!isComplete ? 'bg-[#101F33]/60 border-white/[0.05]' : 'bg-[#101F33] border-white/[0.08]'}`}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
              <Flame className="w-4 h-4 text-[#EF4444]" />
              <span>SINISTROS E AVARIAS</span>
            </div>
            {isComplete ? (
              <span className="text-[10px] text-[#94A3B8] font-semibold bg-[#0B1728] px-2.5 py-0.5 rounded border border-white/[0.08]">
                Bases Securitárias
              </span>
            ) : (
              <span className="text-[10px] text-[#EF4444] font-bold bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Bloqueado no Básico
              </span>
            )}
          </div>

          {!isComplete ? (
            <div className="p-4 rounded-xl bg-[#0B1728]/80 border border-white/[0.06] text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-[#F8FAFC]">Histórico de Sinistros Bloqueado</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  Descubra se o veículo possui registros de colisões graves de média ou grande monta, alagamento, incêndio ou perda total indenizada por seguradoras.
                </p>
              </div>
              <button
                onClick={onUpgrade || onOpenCreditModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Desbloquear Sinistros
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
                <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Classificação de Sinistro:</p>
                <div className="flex items-center gap-2 mt-1">
                  {report.accident.status === 'SEM_REGISTRO' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      <span className="font-black text-[#22C55E] text-sm">NENHUM REGISTRO</span>
                    </>
                  ) : report.accident.status === 'MEDIA_MONTA' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                      <span className="font-black text-[#F59E0B] text-sm">MÉDIA MONTA</span>
                    </>
                  ) : report.accident.status === 'GRANDE_MONTA' ? (
                    <>
                      <XCircle className="w-5 h-5 text-[#EF4444]" />
                      <span className="font-black text-[#EF4444] text-sm">GRANDE MONTA (PERDA TOTAL)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#94A3B8]" />
                      <span className="font-bold text-[#94A3B8]">Não identificado</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                {report.accident.descricao}
              </p>

              {report.accident.tipoSinistro && (
                <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] text-[#EF4444]">
                  <strong>Tipo:</strong> {report.accident.tipoSinistro} {report.accident.percentualDanoEstimado && `(${report.accident.percentualDanoEstimado})`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 5: Histórico de Leilão */}
        <div className={`rounded-2xl border p-6 shadow-xl space-y-4 ${!isComplete ? 'bg-[#101F33]/60 border-white/[0.05]' : 'bg-[#101F33] border-white/[0.08]'}`}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
              <Gavel className="w-4 h-4 text-purple-400" />
              <span>PASSAGEM POR LEILÃO</span>
            </div>
            {isComplete ? (
              <span className="text-[10px] text-[#94A3B8] font-semibold bg-[#0B1728] px-2.5 py-0.5 rounded border border-white/[0.08]">
                Casas Leiloeiras
              </span>
            ) : (
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Bloqueado no Básico
              </span>
            )}
          </div>

          {!isComplete ? (
            <div className="p-4 rounded-xl bg-[#0B1728]/80 border border-white/[0.06] text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-[#F8FAFC]">Histórico de Leilão Bloqueado</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  Verifique se o veículo foi arrematado em leilões judiciais, de seguradoras, financeiras ou frotistas em todo o Brasil (evitando desvalorização oculta de até 40%).
                </p>
              </div>
              <button
                onClick={onUpgrade || onOpenCreditModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Desbloquear Leilões
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
                <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Registro de Leilão:</p>
                <div className="flex items-center gap-2 mt-1">
                  {report.auction.status === 'SEM_REGISTRO' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      <span className="font-black text-[#22C55E] text-sm">SEM PASSAGEM</span>
                    </>
                  ) : report.auction.status === 'LEILAO_FINANCEIRA' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-purple-400" />
                      <span className="font-black text-purple-400 text-sm">LEILÃO DE FINANCEIRA</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#94A3B8]" />
                      <span className="font-bold text-[#94A3B8]">Não identificado</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                {report.auction.descricao}
              </p>

              {report.auction.empresaLeilao && (
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                  <p><strong>Leiloeiro:</strong> {report.auction.empresaLeilao}</p>
                  {report.auction.comitente && <p><strong>Comitente:</strong> {report.auction.comitente}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 6: Débitos e Multas APIBrasil */}
        <div className={`rounded-2xl border p-6 shadow-xl space-y-4 ${!isComplete ? 'bg-[#101F33]/60 border-white/[0.05]' : 'bg-[#101F33] border-white/[0.08]'}`}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
              <Scale className="w-4 h-4 text-[#3B82F6]" />
              <span>DÉBITOS & MULTAS (APIBRASIL)</span>
            </div>
            {isComplete ? (
              <span className="text-[10px] text-[#22C55E] font-semibold bg-[#22C55E]/10 px-2.5 py-0.5 rounded border border-[#22C55E]/20">
                {report.debitos?.fonteConsulta || 'APIBrasil • Renainf & SEFAZ'}
              </span>
            ) : (
              <span className="text-[10px] text-[#3B82F6] font-bold bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Bloqueado no Básico
              </span>
            )}
          </div>

          {!isComplete ? (
            <div className="p-4 rounded-xl bg-[#0B1728]/80 border border-white/[0.06] text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-[#F8FAFC]">Débitos & Multas Bloqueados</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  A apuração completa de multas do Renainf e órgãos estaduais, IPVA em atraso, taxa de licenciamento e Dívida Ativa estadual é exclusiva do Laudo Completo.
                </p>
              </div>
              <button
                onClick={onUpgrade || onOpenCreditModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Desbloquear Débitos
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
                <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Situação de Débitos & Autuações:</p>
                <div className="flex items-center gap-2 mt-1">
                  {report.fines.quantidade === 0 && (!report.debitos || report.debitos.totalGeral === 0) ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      <span className="font-black text-[#22C55E] text-sm">SEM REGISTROS OU DÉBITOS</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                      <span className="font-black text-[#F59E0B] text-sm">
                        {report.fines.quantidade > 0 ? `${report.fines.quantidade} AUTUAÇÃO(ÕES) ATIVA(S)` : 'DÉBITOS PENDENTES'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Total Consolidado de Débitos */}
              {((report.debitos && report.debitos.totalGeral > 0) || report.fines.valorTotalEstimado > 0) ? (
                <div className="p-3.5 rounded-xl bg-[#0B1728] border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#94A3B8]">Total Geral de Débitos:</span>
                    <span className="text-base font-black text-[#F59E0B]">
                      R$ {(report.debitos?.totalGeral || report.fines.valorTotalEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {report.debitos && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08] text-[10px]">
                      <div className="p-2 rounded bg-[#101F33] border border-white/[0.05]">
                        <span className="text-[#94A3B8] block">Multas Renainf:</span>
                        <span className="font-bold text-[#F8FAFC]">
                          R$ {(report.debitos.multasRenainf || report.fines.valorTotalEstimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#101F33] border border-white/[0.05]">
                        <span className="text-[#94A3B8] block">IPVA Atrasado:</span>
                        <span className={`font-bold ${report.debitos.ipvaAtrasado > 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                          R$ {(report.debitos.ipvaAtrasado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#101F33] border border-white/[0.05]">
                        <span className="text-[#94A3B8] block">Licenciamento:</span>
                        <span className={`font-bold ${report.debitos.taxaLicenciamento > 0 ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                          R$ {(report.debitos.taxaLicenciamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[#101F33] border border-white/[0.05]">
                        <span className="text-[#94A3B8] block">Dívida Ativa:</span>
                        <span className={`font-bold ${report.debitos.dividaAtiva > 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                          R$ {(report.debitos.dividaAtiva || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-[#22C55E] flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  Veículo regularizado perante os órgãos de trânsito estaduais e federais.
                </p>
              )}

              {/* Lista detalhada de multas */}
              {report.fines.detalhes && report.fines.detalhes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
                    Detalhamento de Autuações:
                  </p>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {report.fines.detalhes.map((d, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#0B1728] border border-white/[0.08] text-[10px] space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#F8FAFC] truncate">{d.orgao}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            d.gravidade === 'Gravíssima' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' :
                            d.gravidade === 'Grave' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            d.gravidade === 'Média' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {d.gravidade}
                          </span>
                        </div>
                        <p className="text-[#94A3B8] leading-tight">{d.descricao}</p>
                        <div className="flex items-center justify-between text-[9px] text-[#64748B] pt-0.5">
                          <span>Auto: {d.autoInfracao} • {d.dataHora}</span>
                          <span className="font-bold text-[#F8FAFC]">R$ {d.valor.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 7: Restrições Administrativas & Judiciais */}
        <div className={`rounded-2xl border p-6 shadow-xl space-y-4 ${!isComplete ? 'bg-[#101F33]/60 border-white/[0.05]' : 'bg-[#101F33] border-white/[0.08]'}`}>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
              <Scale className="w-4 h-4 text-[#3B82F6]" />
              <span>RESTRIÇÕES ADMINISTRATIVAS & JUDICIAIS</span>
            </div>
            {isComplete ? (
              <span className="text-[10px] text-[#3B82F6] font-semibold bg-[#3B82F6]/10 px-2.5 py-0.5 rounded border border-[#3B82F6]/20">
                RENAJUD • DETRAN
              </span>
            ) : (
              <span className="text-[10px] text-[#3B82F6] font-bold bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/20 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Bloqueado no Básico
              </span>
            )}
          </div>

          {!isComplete ? (
            <div className="p-4 rounded-xl bg-[#0B1728]/80 border border-white/[0.06] text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm text-[#F8FAFC]">Bloqueios RENAJUD e Detran Bloqueados</p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1">
                  A auditoria de ordens judiciais de penhora ou busca e apreensão (RENAJUD), bloqueios administrativos, guincho e restrições tributárias é exclusiva do Laudo Completo.
                </p>
              </div>
              <button
                onClick={onUpgrade || onOpenCreditModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Desbloquear RENAJUD
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
                <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Status de Restrições:</p>
                <div className="flex items-center gap-2 mt-1">
                  {report.restricoesAdministrativas?.status === 'SEM_RESTRICOES' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                      <span className="font-black text-[#22C55E] text-sm">NADA CONSTA (LIVRE DE RESTRIÇÕES)</span>
                    </>
                  ) : report.restricoesAdministrativas?.status === 'RESTRICOES_ENCONTRADAS' ? (
                    <>
                      <XCircle className="w-5 h-5 text-[#EF4444]" />
                      <span className="font-black text-[#EF4444] text-sm">
                        {report.restricoesAdministrativas.temBloqueioJudicial ? 'BLOQUEIO JUDICIAL RENAJUD' : 'RESTRIÇÃO ADMINISTRATIVA ATIVA'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Info className="w-4 h-4 text-[#94A3B8]" />
                      <span className="font-bold text-[#94A3B8]">Fonte Indisponível</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                {report.restricoesAdministrativas?.descricao || 'Verificação de impedimentos judiciais (Renajud), bloqueios administrativos e restrições tributárias.'}
              </p>

              {/* Grid de Indicadores de Restrição */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-[#0B1728] border border-white/[0.08] space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] block">Bloqueio Judicial:</span>
                  <span className={`font-bold text-[11px] flex items-center gap-1 ${
                    report.restricoesAdministrativas?.temBloqueioJudicial ? 'text-[#EF4444]' : 'text-[#22C55E]'
                  }`}>
                    {report.restricoesAdministrativas?.temBloqueioJudicial ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        RENAJUD Ativo
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Nada Consta
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0B1728] border border-white/[0.08] space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] block">Bloqueio Administrativo:</span>
                  <span className={`font-bold text-[11px] flex items-center gap-1 ${
                    report.restricoesAdministrativas?.temBloqueioAdministrativo ? 'text-[#F59E0B]' : 'text-[#22C55E]'
                  }`}>
                    {report.restricoesAdministrativas?.temBloqueioAdministrativo ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Consta Restrição
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Sem Bloqueio
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0B1728] border border-white/[0.08] space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] block">Restrição Tributária:</span>
                  <span className={`font-bold text-[11px] flex items-center gap-1 ${
                    report.restricoesAdministrativas?.temRestricaoTributaria ? 'text-[#F59E0B]' : 'text-[#22C55E]'
                  }`}>
                    {report.restricoesAdministrativas?.temRestricaoTributaria ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Consta Dívida
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Sem Restrição
                      </>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0B1728] border border-white/[0.08] space-y-0.5">
                  <span className="text-[10px] text-[#94A3B8] block">Guincho / Pátio:</span>
                  <span className={`font-bold text-[11px] flex items-center gap-1 ${
                    report.restricoesAdministrativas?.temRestricaoGuincho ? 'text-[#EF4444]' : 'text-[#22C55E]'
                  }`}>
                    {report.restricoesAdministrativas?.temRestricaoGuincho ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Apreensão Ativa
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Liberado
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Detalhamento de Restrições Ativas */}
              {report.restricoesAdministrativas?.detalhes && report.restricoesAdministrativas.detalhes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">
                    Detalhamento de Restrições e Bloqueios:
                  </p>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {report.restricoesAdministrativas.detalhes.map((det, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#0B1728] border border-white/[0.08] text-[10px] space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#F8FAFC] truncate">{det.orgao || 'DETRAN / Poder Judiciário'}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            det.tipo === 'Judicial' || det.tipo === 'Renajud'
                              ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                              : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                          }`}>
                            {det.tipo.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[#94A3B8] leading-tight">{det.descricao}</p>
                        {(det.numeroProcesso || det.dataRegistro) && (
                          <div className="flex items-center justify-between text-[9px] text-[#64748B] pt-0.5">
                            {det.numeroProcesso && <span>Proc: {det.numeroProcesso}</span>}
                            {det.dataRegistro && <span>Data: {det.dataRegistro}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MÓDULOS DE INTELIGÊNCIA ABERTA E DADOS OFICIAIS (FIPE, IPVA, RECALL, INMETRO, MERCOSUL) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
              Inteligência de Mercado & Dados Oficiais Abertos
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded border border-[#22C55E]/20">
            DADOS REAIS CRUZADOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Tabela FIPE Oficial */}
          {report.fipe && (
            <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
                  <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                  <span>TABELA FIPE OFICIAL</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-semibold bg-[#0B1728] px-2 py-0.5 rounded border border-white/[0.08]">
                  Cód: {report.fipe.codigoFipe}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#0B1728] border border-white/[0.08] text-center">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Preço Médio de Mercado ({report.fipe.mesReferencia})</p>
                  <p className="text-2xl sm:text-3xl font-black text-[#22C55E] tracking-tight mt-1">
                    {report.fipe.valorFormatado}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-[10px] text-[#94A3B8] font-medium">Variação 12 meses:</span>
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {report.fipe.variacao12MesesPerc}% (Estável)
                    </span>
                  </div>
                </div>

                {report.fipe.historicoPreco && report.fipe.historicoPreco.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider">Histórico Recente de Mercado:</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {report.fipe.historicoPreco.slice(-3).map((item, idx) => (
                        <div key={idx} className="p-2 rounded bg-[#0B1728] border border-white/[0.08] text-center">
                          <p className="text-[9px] text-[#94A3B8]">{item.mes}</p>
                          <p className="text-[10px] font-bold text-[#F8FAFC]">
                            R$ {(item.valor / 1000).toFixed(1)}k
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card: IPVA e Custos Anuais por Estado (SEFAZ) */}
          {report.ipva && (
            <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
                  <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                  <span>IPVA & CUSTOS ANUAIS (SEFAZ)</span>
                </div>
                <span className="text-[10px] text-[#F59E0B] font-semibold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                  UF: {report.ipva.uf} ({report.ipva.aliquotaPerc}%)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Estimativa de IPVA Anual:</p>
                    <p className="text-xl font-black text-[#F8FAFC] mt-0.5">
                      {report.ipva.isento ? (
                        <span className="text-[#22C55E]">ISENTO DE IPVA</span>
                      ) : (
                        `R$ ${report.ipva.valorIpvaEstimado.toLocaleString('pt-BR')}`
                      )}
                    </p>
                  </div>
                  {report.ipva.isento ? (
                    <span className="px-2.5 py-1 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-[10px] font-bold">
                      ISENÇÃO POR IDADE
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-[#94A3B8] border border-white/[0.08] text-[10px]">
                      Exercício {report.ipva.anoExercicio}
                    </span>
                  )}
                </div>

                <div className="space-y-2 border-t border-white/[0.08] pt-2">
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Taxa de Licenciamento Anual:</span>
                    <span className="font-bold text-[#F8FAFC]">R$ {report.ipva.taxaLicenciamentoEstimada.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Custo Tributário Total Anual:</span>
                    <span className="font-black text-[#F59E0B]">R$ {report.ipva.custoTotalAnual.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0B1728] border border-white/[0.08] text-[11px] text-[#94A3B8] leading-relaxed">
                  <Info className="w-3.5 h-3.5 text-[#3B82F6] inline mr-1 -mt-0.5" />
                  {report.ipva.regraIsencao}
                </div>
              </div>
            </div>
          )}

          {/* Card: Recalls Pendentes (SENATRAN / Gov.br) */}
          {report.recall && (
            <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
                  <Wrench className="w-4 h-4 text-purple-400" />
                  <span>RECALLS DE FÁBRICA (SENATRAN)</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-semibold bg-[#0B1728] px-2 py-0.5 rounded border border-white/[0.08]">
                  Gov.br
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Status de Segurança:</p>
                  <div className="flex items-center gap-2 mt-1">
                    {!report.recall.possuiRecall ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                        <span className="font-black text-[#22C55E] text-sm">NENHUM RECALL PENDENTE</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-purple-400" />
                        <span className="font-black text-purple-400 text-sm">
                          {report.recall.totalRecalls} CAMPANHA(S) REGISTRADA(S)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {report.recall.recalls && report.recall.recalls.length > 0 ? (
                  <div className="space-y-2">
                    {report.recall.recalls.map((rec, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 space-y-1">
                        <p className="font-bold text-purple-300">{rec.componente} ({rec.protocolo})</p>
                        <p className="text-[10px] text-[#94A3B8]">{rec.risco}</p>
                        <p className="text-[10px] text-[#22C55E]"><strong>Solução:</strong> {rec.solucao}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    Veículo em conformidade de segurança. Não há registros de chamamentos de fábrica abertos para este chassi ou lote de produção.
                  </p>
                )}

                <p className="text-[10px] text-[#94A3B8] border-t border-white/[0.08] pt-2 italic">
                  {report.recall.orientacaoDetran}
                </p>
              </div>
            </div>
          )}

          {/* Card: Ficha Técnica e Consumo Inmetro (PBEV) */}
          {report.technicalSpecs && (
            <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>CONSUMO & INMETRO (PBEV)</span>
                </div>
                <span className="text-[10px] text-[#22C55E] font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                  Selo Nota {report.technicalSpecs.classificacaoPbev}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Consumo Urbano vs Rodoviário */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#0B1728] border border-white/[0.08] space-y-1">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Gasolina (km/l)</span>
                    <p className="font-bold text-[#F8FAFC]">
                      Cidade: <span className="text-cyan-400">{report.technicalSpecs.consumoUrbanoGasolinaKml}</span>
                    </p>
                    <p className="font-bold text-[#F8FAFC]">
                      Estrada: <span className="text-cyan-400">{report.technicalSpecs.consumoRodoviarioGasolinaKml}</span>
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B1728] border border-white/[0.08] space-y-1">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">Etanol (km/l)</span>
                    <p className="font-bold text-[#F8FAFC]">
                      Cidade: <span className="text-[#22C55E]">{report.technicalSpecs.consumoUrbanoEtanolKml}</span>
                    </p>
                    <p className="font-bold text-[#F8FAFC]">
                      Estrada: <span className="text-[#22C55E]">{report.technicalSpecs.consumoRodoviarioEtanolKml}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-white/[0.08] pt-2">
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Potência / Cilindradas:</span>
                    <span className="font-bold text-[#F8FAFC]">{report.technicalSpecs.potenciaCv} cv ({report.technicalSpecs.cilindradasCm3} cm³)</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Capacidade do Tanque:</span>
                    <span className="font-bold text-[#F8FAFC]">{report.technicalSpecs.capacidadeTanqueLitros} Litros</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Porta-Malas:</span>
                    <span className="font-bold text-[#F8FAFC]">{report.technicalSpecs.capacidadePortaMalasLitros} Litros</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Autonomia Estimada (Rodoviária):</span>
                    <span className="font-black text-cyan-400">Até {report.technicalSpecs.autonomiaRodoviariaKm} km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card: Padrão Mercosul & Emplacamento (DENATRAN) */}
          {report.mercosul && (
            <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <span>PADRÃO MERCOSUL & DETRAN</span>
                </div>
                <span className="text-[10px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  DENATRAN
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0B1728] border border-white/[0.08]">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-semibold">Padrão Registrado:</p>
                  <p className="text-sm font-black text-[#F8FAFC] mt-0.5">
                    {report.mercosul.padraoAtual === 'mercosul' ? 'PLACA PADRÃO MERCOSUL' : 'PLACA CINZA ANTIGA'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.08]">
                    <span className="text-[#94A3B8]">Equivalente oficial:</span>
                    <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {report.mercosul.placaEquivalente}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Troca Obrigatória na Transferência:</span>
                    <span className={`font-bold ${report.mercosul.obrigatorioTroca ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                      {report.mercosul.obrigatorioTroca ? 'SIM (PLACA ANTIGA)' : 'NÃO NECESSÁRIA'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#94A3B8]">Custo de Estamparia na Troca:</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {report.mercosul.custoTrocaEstimadoBrl === 0 ? 'R$ 0,00 (Isento)' : `R$ ${report.mercosul.custoTrocaEstimadoBrl.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#94A3B8] leading-relaxed border-t border-white/[0.08] pt-2">
                  {report.mercosul.orientacaoTransferencia}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fontes Consultadas Ledger */}
      <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2 text-[#F8FAFC] font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
            <span>TRANSPARÊNCIA: FONTES CONSULTADAS</span>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Tempo de resposta: <strong className="text-[#F8FAFC]">{report.durationMs}ms</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {report.sources && report.sources.map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#F8FAFC]">{s.name}</p>
                <p className="text-[11px] text-[#94A3B8]">
                  {s.modulesReturned.join(', ') || 'Verificação cadastral'} • {s.latencyMs}ms
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Notice */}
      <div className="p-4 rounded-xl bg-[#0B1728] border border-white/[0.08] text-[11px] text-[#94A3B8] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#F8FAFC]">Aviso Legal:</strong> Este laudo apresenta as informações consolidadas a partir das bases oficiais na data e horário da requisição ({new Date(report.createdAt).toLocaleDateString('pt-BR')} às {new Date(report.createdAt).toLocaleTimeString('pt-BR')}). Recomendamos sempre a realização de vistoria física especializada antes de fechar qualquer negócio.
        </p>
      </div>

      {/* Modal de Compartilhamento Direto (WhatsApp, E-mail, Copiar Link e PDF) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#101F33] border border-white/[0.12] rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Compartilhar Laudo Veicular</h3>
                  <p className="text-xs text-slate-400">Placa: <strong className="text-white font-mono">{report.plateFormatted}</strong> • {report.vehicle?.marca} {report.vehicle?.modelo}</p>
                </div>
              </div>
              <button
                id="close-share-modal-btn"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opções de Envio */}
            <div className="space-y-3">
              {/* WhatsApp */}
              <a
                id="share-whatsapp-btn"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🚗 *Laudo Veicular AutoCheck - ${report.plateFormatted}*\nVeículo: ${report.vehicle?.marca || ''} ${report.vehicle?.modelo || ''} (${report.vehicle?.anoFabricacao || ''}/${report.vehicle?.anoModelo || ''})\nScore de Segurança: ${report.score}/100 (${report.riskLevel.toUpperCase()})\nStatus: ${report.riskLevel === 'baixo' ? 'Aprovado sem restrições graves' : 'Atenção aos apontamentos'}\n\n📄 Acesse o laudo completo e oficial:\n${window.location.href}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-300 group-hover:text-emerald-200">Enviar via WhatsApp</p>
                    <p className="text-xs text-emerald-200/70">Mensagem pronta com score, placa, modelo e link do laudo</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* E-mail */}
              <a
                id="share-email-btn"
                href={`mailto:?subject=${encodeURIComponent(
                  `Laudo Veicular AutoCheck - ${report.plateFormatted} (${report.vehicle?.marca || ''} ${report.vehicle?.modelo || ''})`
                )}&body=${encodeURIComponent(
                  `Olá,\n\nSegue o laudo pericial oficial do veículo ${report.vehicle?.marca || ''} ${report.vehicle?.modelo || ''} (Placa: ${report.plateFormatted}):\n\n- Score AutoCheck: ${report.score}/100\n- Nível de Risco: ${report.riskLevel.toUpperCase()}\n- Ano/Modelo: ${report.vehicle?.anoFabricacao || ''}/${report.vehicle?.anoModelo || ''}\n- Município/UF: ${report.vehicle?.municipio || ''} - ${report.vehicle?.uf || ''}\n\nPara conferir o histórico completo de leilão, sinistro, débitos e restrições, acesse o link:\n${window.location.href}\n\nAtenciosamente,\nAutoCheck Brasil - www.autocheck.com.br`
                )}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-300 group-hover:text-blue-200">Enviar por E-mail</p>
                    <p className="text-xs text-blue-200/70">Abre seu cliente de e-mail com o laudo pericial formatado</p>
                  </div>
                </div>
                <Send className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Baixar PDF */}
              <button
                id="share-download-pdf-btn"
                onClick={() => {
                  handleDownloadPdf();
                  setShowShareModal(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-300 group-hover:text-purple-200">Baixar Laudo Oficial em PDF</p>
                    <p className="text-xs text-purple-200/70">Arquivo pronto para impressão ou anexo manual</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Copiar Link Direto */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <label className="text-xs font-semibold text-slate-300">Link Direto do Laudo</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="w-full bg-[#07111F] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none select-all"
                />
                <button
                  id="share-copy-link-btn"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
