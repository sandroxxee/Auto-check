import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Sparkles
} from 'lucide-react';
import { validateAndNormalizePlate } from '../../shared/schemas/vehicle.ts';

interface PlateInputProps {
  onSearch: (plate: string, queryType?: 'basic' | 'complete') => void;
  isLoading?: boolean;
  initialValue?: string;
  defaultQueryType?: 'basic' | 'complete';
}

export const PlateInput: React.FC<PlateInputProps> = ({
  onSearch,
  isLoading = false,
  initialValue = '',
  defaultQueryType = 'complete'
}) => {
  const [inputVal, setInputVal] = useState(initialValue);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'basic' | 'complete'>(defaultQueryType);

  useEffect(() => {
    if (initialValue) {
      setInputVal(initialValue);
    }
  }, [initialValue]);

  const cleanChars = inputVal.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const validation = validateAndNormalizePlate(inputVal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!cleanChars) {
      setErrorMsg('Por favor, digite a placa do veículo.');
      return;
    }

    if (!validation.valid) {
      setErrorMsg(validation.error || 'Formato de placa inválido. Digite 7 caracteres (ex: BRA2E19 ou ABC1234).');
      return;
    }

    setErrorMsg(null);
    onSearch(validation.cleanPlate, selectedType);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Real Brazilian Plate Frame on sleek dark card backing */}
        <div className="relative rounded-2xl bg-white border border-white/[0.12] shadow-[0_10px_35px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300 hover:border-[#3B82F6]/60 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)]">
          {/* Top Blue Mercosul Strip */}
          <div className="h-8 sm:h-9 bg-[#003399] px-4 flex items-center justify-between text-white select-none">
            {/* Left: Mercosul Emblem & BRASIL */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-yellow-300 text-[10px]">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <span className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white drop-shadow-xs">
                BRASIL
              </span>
            </div>

            {/* Right: Brazilian Flag */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-4 bg-[#009c3b] rounded-[2px] relative overflow-hidden flex items-center justify-center shadow-xs border border-white/20">
                <div className="w-3.5 h-2.5 bg-[#ffdf00] rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#002776] rounded-full"></div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-blue-100 hidden sm:inline">
                MERCOSUL
              </span>
            </div>
          </div>

          {/* Stamped Plate Number Surface */}
          <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center relative">
            {/* Subtle decorative plate bolt impressions */}
            <div className="absolute top-3 left-4 w-2 h-2 rounded-full bg-slate-300 border border-slate-400/50 shadow-inner"></div>
            <div className="absolute top-3 right-4 w-2 h-2 rounded-full bg-slate-300 border border-slate-400/50 shadow-inner"></div>

            <input
              id="hero-plate-input"
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value.toUpperCase());
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="BRA2E19"
              maxLength={8}
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
              className="w-full text-center font-mono font-black text-4xl sm:text-6xl tracking-[0.25em] sm:tracking-[0.35em] text-slate-900 bg-transparent uppercase placeholder:text-slate-300 focus:outline-none focus:ring-0 disabled:opacity-60"
            />

            {/* Plate Format Badge */}
            <div className="mt-1 flex items-center gap-2">
              {validation.valid ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  {validation.type === 'mercosul' ? 'Placa Padrão Mercosul' : 'Placa Padrão Tradicional'}
                </span>
              ) : cleanChars.length > 0 ? (
                <span className="text-[11px] font-medium text-slate-500">
                  {cleanChars.length} de 7 caracteres
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Padrão Mercosul ou Padrão Cinza Nacional
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modalidade de Consulta - Segmented Control Dark Fintech */}
        <div className="flex items-center justify-center p-1 bg-[#0B1728] rounded-xl border border-white/[0.08] text-xs font-semibold max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setSelectedType('complete')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              selectedType === 'complete'
                ? 'bg-[#101F33] text-[#F8FAFC] font-bold shadow-md border border-white/[0.08]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#3B82F6]" />
            <span>Completa • R$ 49,90</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('basic')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              selectedType === 'basic'
                ? 'bg-[#101F33] text-[#F8FAFC] font-bold shadow-md border border-white/[0.08]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <span>Básica • R$ 34,90</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#EF4444]" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Primary Action Button - Fintech Glow */}
        <button
          id="hero-search-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl font-bold text-base sm:text-lg shadow-[0_4px_24px_rgba(59,130,246,0.35)] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-[#F8FAFC] hover:shadow-[0_4px_30px_rgba(59,130,246,0.45)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Consultando bases governamentais...</span>
            </>
          ) : (
            <>
              <span>Consultar Histórico do Veículo</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </>
          )}
        </button>

        {/* Security / Trust Guarantees */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
            Sem necessidade de RENAVAM ou CPF
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            Dados em tempo real
          </span>
          <span className="text-[#94A3B8]/70 hidden sm:inline">
            100% em conformidade com LGPD
          </span>
        </div>
      </form>
    </div>
  );
};
