import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  ShieldCheck,
  Cpu,
  Car,
  Database,
  ArrowLeft
} from 'lucide-react';

interface ReportSkeletonProps {
  plate?: string;
  onCancel?: () => void;
}

const INQUIRY_STEPS = [
  {
    stage: 'Gateway Oficial',
    title: 'Conectando ao gateway e bases governamentais...',
    detail: 'Autenticação segura via SENATRAN, Renavam e bases estaduais'
  },
  {
    stage: 'Segurança Pública',
    title: 'Auditando ocorrências de furto, roubo e apropriação...',
    detail: 'Cruzamento com Sistema Nacional de Informações de Segurança'
  },
  {
    stage: 'Financeiro & Fazenda',
    title: 'Verificando débitos, IPVA, licenciamento e multas...',
    detail: 'Consulta concorrente SEFAZ, Detran e Registro Renainf'
  },
  {
    stage: 'Judicial & Jurídico',
    title: 'Rastreando restrições administrativas e judiciais...',
    detail: 'Investigando ordens de penhora RENAJUD e bloqueios de transferência'
  },
  {
    stage: 'Mercado & Inteligência',
    title: 'Calculando histórico FIPE, recalls e score de risco...',
    detail: 'Compilação de evidências e consolidação do laudo oficial'
  }
];

export const ReportSkeleton: React.FC<ReportSkeletonProps> = ({ plate, onCancel }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        const next = prev < INQUIRY_STEPS.length - 1 ? prev + 1 : prev;
        return next;
      });
    }, 900);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return prev;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 350);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentStep = INQUIRY_STEPS[currentStepIdx];
  const formattedPlate = plate ? plate.toUpperCase() : 'CONSULTANDO';

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-[#F8FAFC]">
      {/* 1. Top Breadcrumb & Live Query Telemetry Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
            {onCancel ? (
              <button
                onClick={onCancel}
                className="hover:text-[#3B82F6] transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Cancelar</span>
              </button>
            ) : (
              <span>Início</span>
            )}
            <ChevronRight className="w-3 h-3 text-[#94A3B8]/60" />
            <span>Processando Laudo</span>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]/60" />
            <span className="font-mono text-[#3B82F6] font-bold bg-[#3B82F6]/10 px-2 py-0.5 rounded border border-[#3B82F6]/20 animate-pulse">
              {formattedPlate}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Gerando Laudo do Veículo
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-ping" />
              Processando
            </span>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-[#101F33] border border-white/[0.08] animate-pulse animate-shimmer" />
          <div className="h-9 w-28 rounded-xl bg-[#101F33] border border-white/[0.08] animate-pulse animate-shimmer hidden sm:block" />
        </div>
      </div>

      {/* 2. Interactive Live Telemetry Ticker (Microanimation banner) */}
      <div className="rounded-2xl bg-gradient-to-r from-[#101F33] via-[#0D2446] to-[#101F33] border border-[#3B82F6]/30 p-5 sm:p-6 shadow-xl relative overflow-hidden animate-shimmer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B1728] border border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6] shrink-0 shadow-lg relative">
              <Cpu className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3B82F6]" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30">
                  Etapa {currentStepIdx + 1} de {INQUIRY_STEPS.length} • {currentStep.stage}
                </span>
                <span className="text-xs text-[#94A3B8] font-mono">
                  {Math.min(progress, 99)}% concluído
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-[#F8FAFC] transition-all duration-300">
                {currentStep.title}
              </p>
              <p className="text-xs text-[#94A3B8]">
                {currentStep.detail}
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 shrink-0 space-y-2">
            <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
              <span>Tempo de resposta</span>
              <span className="text-[#3B82F6] font-mono font-bold">~1.2s</span>
            </div>
            {/* Dynamic Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#07111F] overflow-hidden border border-white/[0.08] p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#3B82F6] transition-all duration-300 relative overflow-hidden"
                style={{ width: `${Math.min(progress, 98)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]/80">
              <Database className="w-3 h-3 text-[#3B82F6]" />
              <span>Cruzando bases oficiais com contingência ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Header Card Skeleton (Vehicle Info & Score) */}
      <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Plate Graphic & Title Skeleton */}
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Mercosul Plate Skeleton */}
            <div className="w-32 sm:w-36 h-20 sm:h-22 rounded-xl bg-[#0B1728] border-2 border-white/[0.12] p-2 flex flex-col justify-between shrink-0 shadow-lg relative overflow-hidden animate-shimmer">
              <div className="h-3.5 bg-[#3B82F6]/60 rounded flex items-center justify-between px-1">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <span className="text-[8px] font-bold text-white tracking-widest">BRASIL</span>
                <div className="w-2 h-2 rounded-full bg-white/60" />
              </div>
              <div className="flex items-center justify-center my-auto">
                <span className="font-mono text-base sm:text-lg font-black tracking-wider text-[#F8FAFC]">
                  {formattedPlate}
                </span>
              </div>
              <div className="h-1.5 w-1/3 mx-auto bg-white/10 rounded" />
            </div>

            {/* Vehicle Title & Badges Placeholder */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-5 w-20 rounded bg-white/10 animate-pulse animate-shimmer" />
                <div className="h-5 w-24 rounded bg-white/10 animate-pulse animate-shimmer" />
                <div className="h-5 w-16 rounded bg-white/10 animate-pulse animate-shimmer" />
              </div>

              {/* Title Bar Skeleton */}
              <div className="space-y-1.5">
                <div className="h-7 sm:h-8 w-64 sm:w-80 rounded-lg bg-white/15 animate-pulse animate-shimmer" />
                <div className="h-4 w-44 rounded bg-white/10 animate-pulse animate-shimmer" />
              </div>

              {/* Specs Pills Skeleton */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="h-6 w-24 rounded-full bg-[#0B1728] border border-white/[0.08] animate-pulse animate-shimmer" />
                <div className="h-6 w-20 rounded-full bg-[#0B1728] border border-white/[0.08] animate-pulse animate-shimmer" />
                <div className="h-6 w-28 rounded-full bg-[#0B1728] border border-white/[0.08] animate-pulse animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Right: Score Gauge Skeleton */}
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-5 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
            <div className="space-y-1 text-left lg:text-right">
              <div className="h-4 w-28 rounded bg-white/10 animate-pulse animate-shimmer ml-auto" />
              <div className="h-3 w-36 rounded bg-white/5 animate-pulse animate-shimmer ml-auto" />
            </div>

            {/* Score Ring Placeholder */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0B1728] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner overflow-hidden animate-shimmer">
              <div className="absolute inset-2 rounded-xl border-2 border-dashed border-[#3B82F6]/30 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="text-center space-y-0.5">
                <span className="text-xs font-mono font-bold text-[#3B82F6] animate-pulse">SCORE</span>
                <div className="h-4 w-8 mx-auto rounded bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Safety Summary Cards Skeleton (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Roubo & Furto', icon: 'shield' },
          { label: 'Débitos & Multas', icon: 'dollar' },
          { label: 'Restrições Judiciais', icon: 'scale' },
          { label: 'Gravame / SNG', icon: 'lock' }
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[#101F33] border border-white/[0.08] p-4 space-y-3 relative overflow-hidden animate-shimmer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B1728] border border-white/[0.08] flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-white/20 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-[#F8FAFC]">{item.label}</span>
              </div>
              <div className="h-5 w-16 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="space-y-1 pt-1">
              <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 5. Tabs Navigation Skeleton */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        <div className="h-8 w-28 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/30 animate-pulse" />
        <div className="h-8 w-32 rounded-lg bg-[#101F33] border border-white/[0.08] animate-pulse" />
        <div className="h-8 w-32 rounded-lg bg-[#101F33] border border-white/[0.08] animate-pulse" />
        <div className="h-8 w-24 rounded-lg bg-[#101F33] border border-white/[0.08] animate-pulse hidden sm:block" />
        <div className="h-8 w-24 rounded-lg bg-[#101F33] border border-white/[0.08] animate-pulse hidden md:block" />
      </div>

      {/* 6. Detailed 2-Column Grid (Mirroring real report sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Dados Cadastrais, Débitos, Restrições */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Dados Cadastrais Skeleton */}
          <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 space-y-4 shadow-xl relative overflow-hidden animate-shimmer">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#3B82F6]" />
                <span className="font-bold text-sm text-[#F8FAFC]">Dados Cadastrais do Veículo</span>
              </div>
              <div className="h-5 w-24 rounded-full bg-white/10 animate-pulse" />
            </div>

            {/* Table Rows Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-[#0B1728] border border-white/[0.04] space-y-1.5">
                  <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-white/20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Card: Débitos & Multas Detalhadas Skeleton */}
          <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 space-y-4 shadow-xl relative overflow-hidden animate-shimmer">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="h-4 w-40 rounded bg-white/15 animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
            </div>

            <div className="p-4 rounded-xl bg-[#0B1728] border border-white/[0.06] flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
                <div className="h-6 w-36 rounded bg-white/20 animate-pulse" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3.5 w-5/6 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): FIPE, IPVA, Gravame, Recalls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Tabela FIPE & Histórico Skeleton */}
          <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 space-y-4 shadow-xl relative overflow-hidden animate-shimmer">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="h-4 w-32 rounded bg-white/15 animate-pulse" />
              <div className="h-5 w-20 rounded bg-white/10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-8 w-44 rounded bg-white/25 animate-pulse" />
            </div>

            {/* Simulated Chart Bars */}
            <div className="pt-2">
              <div className="text-[11px] text-[#94A3B8] mb-2 flex justify-between">
                <span>Histórico 6 Meses</span>
                <span className="text-[#3B82F6]">Estimativa Oficial</span>
              </div>
              <div className="h-28 rounded-xl bg-[#0B1728] border border-white/[0.06] p-3 flex items-end justify-between gap-2">
                {[45, 60, 55, 70, 65, 80].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t bg-[#3B82F6]/30 border-t border-[#3B82F6]/50 animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                    />
                    <div className="h-2 w-full rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: IPVA e Licenciamento SC Skeleton */}
          <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 space-y-3 shadow-xl relative overflow-hidden animate-shimmer">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="h-4 w-36 rounded bg-white/15 animate-pulse" />
              <div className="h-5 w-16 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#0B1728] space-y-1">
                <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-24 rounded bg-white/20 animate-pulse" />
              </div>
              <div className="p-3 rounded-lg bg-[#0B1728] space-y-1">
                <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-24 rounded bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Card: Recalls e Segurança Skeleton */}
          <div className="rounded-2xl bg-[#101F33] border border-white/[0.08] p-5 space-y-2 shadow-xl relative overflow-hidden animate-shimmer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0B1728] flex items-center justify-center text-[#22C55E]">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="h-4 w-36 rounded bg-white/15 animate-pulse" />
                <div className="h-3 w-48 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
