import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Car } from 'lucide-react';

interface QueryLoadingModalProps {
  plate: string;
  isOpen: boolean;
}

export const QueryLoadingModal: React.FC<QueryLoadingModalProps> = ({ plate, isOpen }) => {
  const [stepIdx, setStepIdx] = useState(0);

  const steps = [
    { title: 'Validando formato da placa...', sub: 'Padrão Mercosul / Padrão Nacional' },
    { title: 'Consultando fontes oficiais e parceiras...', sub: 'Base cadastral e homologada' },
    { title: 'Analisando registros de roubo e furto...', sub: 'Verificação com sistema policial' },
    { title: 'Consolidando dados do veículo...', sub: 'Marca, modelo, cor, combustível e situação' },
    { title: 'Calculando score e organizando laudo...', sub: 'Finalizando laudo com evidências' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setStepIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIdx((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#101F33] border border-white/[0.08] p-8 shadow-2xl text-center space-y-6">
        {/* Plate visual badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#0B1728] border border-white/[0.08] text-[#F8FAFC]">
          <Car className="w-4 h-4 text-[#3B82F6]" />
          <span className="font-mono font-bold text-sm tracking-wider uppercase">{plate}</span>
        </div>

        {/* Animated Radar/Loader */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#3B82F6]/20 animate-ping"></div>
          <div className="absolute inset-1 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin"></div>
          <div className="w-12 h-12 rounded-full bg-[#0B1728] border border-white/[0.08] flex items-center justify-center text-[#3B82F6]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Current State Text */}
        <div className="space-y-1 min-h-[46px]">
          <h3 className="text-base font-bold text-[#F8FAFC] tracking-tight animate-in fade-in">
            {steps[stepIdx].title}
          </h3>
          <p className="text-xs text-[#94A3B8] animate-in fade-in">
            {steps[stepIdx].sub}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIdx
                  ? 'w-6 bg-[#3B82F6]'
                  : i < stepIdx
                  ? 'w-2 bg-[#22C55E]'
                  : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-center gap-2 text-[11px] text-[#94A3B8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Conexão criptografada e segura com as bases homologadas</span>
        </div>
      </div>
    </div>
  );
};
