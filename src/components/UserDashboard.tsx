import React, { useEffect, useState } from 'react';
import {
  Car,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Gift,
  Award,
  Sparkles
} from 'lucide-react';
import { ConsolidatedReport, UserAccount } from '../types/index.ts';
import { api } from '../services/api.ts';
import { getUserVehicleReportsFromFirestore } from '../services/firebase.ts';


interface UserDashboardProps {
  user: UserAccount | null;
  onSelectReport: (report: ConsolidatedReport) => void;
  onNewSearch: () => void;
  onOpenCreditModal: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onSelectReport,
  onNewSearch,
  onOpenCreditModal
}) => {
  const [queries, setQueries] = useState<ConsolidatedReport[]>([]);
  const [loyalty, setLoyalty] = useState<{
    eligible: boolean;
    paidQueriesCount: number;
    loyaltyQueriesCount: number;
    rewardsAvailable: number;
    progressPercentage: number;
  }>({
    eligible: false,
    paidQueriesCount: user?.paidQueriesCount || 0,
    loyaltyQueriesCount: user?.loyaltyQueriesCount || 0,
    rewardsAvailable: user?.loyaltyRewardsEarned || 0,
    progressPercentage: Math.min(100, Math.round(((user?.loyaltyQueriesCount || 0) / 10) * 100))
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [queriesData, firestoreReports, loyaltyData] = await Promise.all([
        api.getUserQueries().catch(() => []),
        getUserVehicleReportsFromFirestore(user?.id).catch(() => []),
        api.getLoyaltyStatus().catch(() => null)
      ]);

      // Combina e deduplica relatórios por ID ou placa + data
      const mergedMap = new Map<string, ConsolidatedReport>();
      [...firestoreReports, ...queriesData].forEach((rep) => {
        if (rep && rep.id && !mergedMap.has(rep.id)) {
          mergedMap.set(rep.id, rep);
        }
      });

      const mergedQueries = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setQueries(mergedQueries.length > 0 ? mergedQueries : queriesData);
      if (loyaltyData) {
        setLoyalty(loyaltyData);
      }
    } catch (err) {
      console.error('Falha ao carregar dados do painel:', err);
    } finally {
      setLoading(false);
    }
  };


  const filteredQueries = queries.filter((q) =>
    q.plate.toLowerCase().includes(filter.toLowerCase()) ||
    (q.vehicle?.modelo && q.vehicle.modelo.toLowerCase().includes(filter.toLowerCase())) ||
    (q.vehicle?.marca && q.vehicle.marca.toLowerCase().includes(filter.toLowerCase()))
  );

  const remainingForBonus = Math.max(0, 10 - loyalty.loyaltyQueriesCount);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Minhas Consultas Veiculares
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe o histórico de laudos gerados, programa de fidelidade e gerencie seu saldo de créditos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dash-buy-credits-btn"
            onClick={onOpenCreditModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Saldo: {user?.credits ?? 0} créditos</span>
          </button>

          <button
            id="dash-new-query-btn"
            onClick={onNewSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Car className="w-4 h-4" />
            <span>Nova Consulta</span>
          </button>
        </div>
      </div>

      {/* Cartão do Programa de Fidelidade (10 Vistorias/Consultas Pagas = 1 Grátis) */}
      <div className="rounded-2xl bg-gradient-to-r from-[#101F33] via-[#0E284D] to-[#101F33] border border-blue-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Gift className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Programa de Fidelidade AutoCheck
              </span>
              {loyalty.eligible && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Desconto de 1 Crédito Pronto!
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white">
              {loyalty.eligible
                ? 'Você tem 1 Consulta Grátis disponível por Fidelidade!'
                : `A cada 10 consultas pagas, ganhe 1 consulta 100% grátis`}
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {loyalty.eligible ? (
                <span className="text-emerald-300 font-semibold">
                  O desconto de 1 crédito será aplicado automaticamente na sua próxima consulta de placa. O saldo não será debitado!
                </span>
              ) : (
                <>
                  Você completou <strong className="text-white">{loyalty.loyaltyQueriesCount} de 10</strong> consultas do ciclo atual (Total histórico: {loyalty.paidQueriesCount} pagas). 
                  Faltam apenas <strong className="text-amber-400">{remainingForBonus} consulta(s)</strong> para resgatar 1 crédito de desconto.
                </>
              )}
            </p>
          </div>

          <div className="w-full lg:w-80 space-y-2 bg-[#07111F]/70 p-4 rounded-xl border border-white/[0.08]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Progresso do Bônus</span>
              <span className="text-white font-bold font-mono">
                {loyalty.loyaltyQueriesCount} / 10 ({loyalty.progressPercentage}%)
              </span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  loyalty.eligible
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse'
                    : 'bg-gradient-to-r from-blue-600 to-amber-500'
                }`}
                style={{ width: `${Math.max(5, loyalty.progressPercentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>0 consultas</span>
              <span className="text-amber-400 font-semibold">★ 10 = 1 Grátis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Filtrar por placa ou modelo..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#101F33] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Query History Table / Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Carregando consultas registradas...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="rounded-3xl bg-[#101F33] border border-white/[0.08] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <Car className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Nenhuma consulta encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Você ainda não possui consultas cadastradas com estes termos. Inicie uma nova consulta pela placa.
          </p>
          <button
            onClick={onNewSearch}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Fazer primeira consulta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQueries.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectReport(item)}
              className="rounded-2xl bg-[#101F33] border border-white/[0.08] hover:border-blue-500/40 p-6 transition-all duration-200 cursor-pointer group shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-lg bg-[#07111F] border border-blue-500/30 px-2.5 py-1 font-mono font-bold text-sm text-blue-300">
                    {item.plateFormatted}
                  </div>

                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : item.score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    Score: {item.score}/100
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {item.vehicle?.marca} {item.vehicle?.modelo}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ano {item.vehicle?.anoFabricacao || '-'}/{item.vehicle?.anoModelo || '-'} • {item.vehicle?.cor} • {item.vehicle?.municipio}/{item.vehicle?.uf}
                </p>

                <div className="my-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-xs">
                  {item.theft.status === 'NADA_CONSTA' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Roubo: Nada Consta
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <XCircle className="w-3.5 h-3.5" /> Restrição Policial
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>

                <span className="text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                  <span>Ver laudo</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
