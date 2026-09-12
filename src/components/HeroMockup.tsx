import React from 'react';
import { ShieldCheck, CheckCircle2, Car, Calendar, MapPin, Gauge } from 'lucide-react';

interface HeroMockupProps {
  onTestPlate?: (plate: string) => void;
}

export const HeroMockup: React.FC<HeroMockupProps> = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Ambient background glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6]/20 to-[#22C55E]/20 rounded-3xl blur-xl opacity-50 pointer-events-none"></div>

      {/* Mockup Container */}
      <div className="relative rounded-2xl bg-[#101F33] border border-white/[0.08] p-6 shadow-2xl space-y-4">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-center justify-center text-[#3B82F6] shadow-sm">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#22C55E]">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-[#22C55E] -ml-3.5"></span>
                BASE NACIONAL HOMOLOGADA
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-[#F8FAFC]">
                Volkswagen T-Cross Highline
              </h4>
              <p className="text-xs text-[#94A3B8]">1.4 16V TSI Flex Aut. • Campinas/SP</p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block px-3 py-1 rounded-lg bg-[#07111F] border border-white/[0.08] text-xs font-mono font-black text-[#F8FAFC] tracking-wider shadow-inner">
              BRA2E19
            </div>
          </div>
        </div>

        {/* Security & Theft Status Banner */}
        <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E] font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wide">Situação de Roubo / Furto</p>
              <p className="text-xs text-[#22C55E] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> NADA CONSTA NO SISTEMA NACIONAL
              </p>
            </div>
          </div>

          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#22C55E] text-[#07111F] font-black tracking-wide shadow-xs">
            REGULAR
          </span>
        </div>

        {/* Technical Data Badges */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Ano Fabr./Modelo</p>
              <p className="font-bold text-[#F8FAFC]">2022 / 2023</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Emplacamento</p>
              <p className="font-bold text-[#F8FAFC]">Campinas - SP</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Combustível</p>
              <p className="font-bold text-[#F8FAFC]">Álcool / Gasolina</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B1728] border border-white/[0.08] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Chassi Mascarado</p>
              <p className="font-mono font-bold text-[#F8FAFC]">9BWAG41B9NP******</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            Relatório gerado em tempo real
          </span>
          <span className="font-semibold text-[#F8FAFC]">Fontes Oficiais Homologadas</span>
        </div>
      </div>
    </div>
  );
};
