import React, { useState } from 'react';
import { Search, Home, HelpCircle, ArrowRight, ShieldCheck, Car } from 'lucide-react';

interface NotFoundViewProps {
  onNavigateHome: () => void;
  onSearchPlate: (plate: string) => void;
  onOpenHelp: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigateHome,
  onSearchPlate,
  onOpenHelp
}) => {
  const [plate, setPlate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plate.trim()) {
      onSearchPlate(plate.trim());
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Visual 404 badge */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-[#0B1728] border border-white/[0.14] flex items-center justify-center mx-auto shadow-2xl relative z-10">
            <Car className="w-10 h-10 text-blue-400" />
          </div>
          <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider uppercase">
            Erro 404 • Rota Não Localizada
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Página ou Laudo Não Encontrado
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            O endereço que você tentou acessar não existe ou o identificador da consulta expirou. Você pode realizar uma nova consulta de placa abaixo ou retornar ao início.
          </p>
        </div>

        {/* Quick Search on 404 */}
        <div className="bg-[#0B1728] border border-white/[0.12] rounded-2xl p-4 sm:p-5 shadow-xl max-w-md mx-auto">
          <p className="text-xs font-semibold text-slate-300 mb-2.5 text-left">
            Consultar placa veicular diretamente:
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="notfound-plate-input"
                type="text"
                maxLength={8}
                placeholder="Ex: ABC1D23"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 uppercase font-bold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            <button
              id="notfound-search-btn"
              type="submit"
              disabled={!plate.trim()}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-40"
            >
              Consultar
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            id="notfound-home-btn"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-xs font-semibold text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Voltar para a Página Inicial</span>
          </button>

          <button
            id="notfound-help-btn"
            onClick={onOpenHelp}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Dúvidas & Ajuda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
