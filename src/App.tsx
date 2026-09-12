import React, { useState, useEffect } from 'react';
import { Helmet } from './components/Helmet.tsx';
import { Navbar } from './components/Navbar.tsx';
import { PlateInput } from './components/PlateInput.tsx';
import { HeroMockup } from './components/HeroMockup.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { BenefitsGrid } from './components/BenefitsGrid.tsx';
import { SecurityBanner } from './components/SecurityBanner.tsx';
import { FreeTierHighlight } from './components/FreeTierHighlight.tsx';
import { PricingSection } from './components/PricingSection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { Footer } from './components/Footer.tsx';
import { ReportView } from './components/ReportView.tsx';
import { UserDashboard } from './components/UserDashboard.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { CreditPurchaseModal } from './components/CreditPurchaseModal.tsx';
import { LegalModal } from './components/LegalModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { UserProfileView } from './components/UserProfileView.tsx';
import { ContactSupportModal } from './components/ContactSupportModal.tsx';
import { NotFoundView } from './components/NotFoundView.tsx';
import { OfflineBanner } from './components/OfflineBanner.tsx';
import { QueryErrorModal } from './components/QueryErrorModal.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

import { ConsolidatedReport, UserAccount, PlanPricing, CreditPackage } from './types/index.ts';
import { api } from './services/api.ts';
import { saveVehicleReportToFirestore } from './services/firebase.ts';
import { useAuth } from './contexts/AuthContext.tsx';
import { ShieldCheck, Sparkles, CheckCircle2, Lock, ArrowRight } from 'lucide-react';


export function App() {
  const { user, setUser, logout, refreshUser } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'report' | 'dashboard' | 'admin' | 'pricing' | 'how-it-works' | 'faq' | 'profile' | 'not-found' | 'legal'>('home');
  const [plans, setPlans] = useState<PlanPricing[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [activeReport, setActiveReport] = useState<ConsolidatedReport | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryingPlate, setQueryingPlate] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [queryErrorState, setQueryErrorState] = useState<{ isOpen: boolean; plate: string; errorMessage: string }>({
    isOpen: false,
    plate: '',
    errorMessage: ''
  });
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' | 'forgot' }>({
    isOpen: false,
    mode: 'login'
  });
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; tab: 'privacidade' | 'termos' | 'uso-responsavel' }>({
    isOpen: false,
    tab: 'privacidade'
  });
  const [pendingQuery, setPendingQuery] = useState<{ plate: string; queryType: 'basic' | 'complete' | 'professional' } | null>(null);

  // Load initial pricing data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const priceData = await api.getPrices();
      setPlans(priceData.plans);
      setCreditPackages(priceData.creditPackages);
    } catch (err) {
      console.error('Falha ao inicializar dados de preços:', err);
    }
  };


  const handleSearchPlate = async (plate: string, queryType: 'basic' | 'complete' | 'professional' = 'complete') => {
    const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const DEMO_PLATES = ['ABC1D23', 'BRA2E19', 'KOL9876', 'SAV1010', 'ROU8080', 'DEMO123', 'XYZ9876', 'MOC1234', 'TEST999', 'JIX7B96'];
    const isDemoPlate = DEMO_PLATES.includes(cleanPlate);

    // AUDITORIA E PROTEÇÃO DE SALDO:
    // Se for consulta em placa real, exige cadastro prévio e saldo de crédito para não gastar a API sem pagar.
    if (!isDemoPlate && !user) {
      setPendingQuery({ plate: cleanPlate, queryType });
      setAuthModalState({ isOpen: true, mode: 'register' });
      return;
    }

    const hasLoyaltyBonus = (user?.loyaltyRewardsEarned ?? 0) > 0 || (user?.loyaltyQueriesCount ?? 0) >= 10;
    if (!isDemoPlate && user && user.role !== 'admin' && !hasLoyaltyBonus && user.credits < 1) {
      setPendingQuery({ plate: cleanPlate, queryType });
      setShowCreditModal(true);
      return;
    }

    try {
      setQueryingPlate(cleanPlate);
      setIsQuerying(true);
      setActiveReport(null);
      setCurrentView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const result = await api.checkVehicle(cleanPlate, queryType);
      setActiveReport(result.report);
      setCurrentView('report');
      setPendingQuery(null);

      // Salva no Firestore se o usuário estiver autenticado
      if (user) {
        saveVehicleReportToFirestore(result.report, user.id).catch((e) => {
          console.warn('Erro não-bloqueante ao salvar no Firestore:', e);
        });
      }

      // Atualiza usuário para refletir saldo atual de créditos
      await refreshUser();

    } catch (err: any) {
      setCurrentView('home');
      if (err?.requiresAuth) {
        setPendingQuery({ plate: cleanPlate, queryType });
        setAuthModalState({ isOpen: true, mode: 'register' });
        return;
      }
      if (err?.requiresCredits) {
        setPendingQuery({ plate: cleanPlate, queryType });
        setShowCreditModal(true);
        return;
      }
      setQueryErrorState({
        isOpen: true,
        plate: cleanPlate,
        errorMessage: err?.message || 'Falha temporária ao consultar dados do veículo.'
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleUpgradeReport = async () => {
    if (!activeReport) return;
    try {
      setIsQuerying(true);
      const upgraded = await api.upgradeReport(activeReport.id);
      setActiveReport(upgraded);

      // Refresh user credits
      await refreshUser();
    } catch (err: unknown) {
      setQueryErrorState({
        isOpen: true,
        plate: activeReport.plate,
        errorMessage: (err as Error).message || 'Falha ao atualizar laudo para versão Completa.'
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleOpenLegal = (tab: 'privacidade' | 'termos' | 'uso-responsavel') => {
    setLegalModalState({ isOpen: true, tab });
  };

  const handleAuthSuccess = (authenticatedUser: UserAccount) => {
    setUser(authenticatedUser);
    setAuthModalState({ ...authModalState, isOpen: false });

    // Se havia uma consulta pendente ao se cadastrar/logar
    if (pendingQuery) {
      if (authenticatedUser.credits >= 1 || authenticatedUser.role === 'admin') {
        const query = pendingQuery;
        setPendingQuery(null);
        handleSearchPlate(query.plate, query.queryType);
      } else {
        // Precisa de recarga
        setShowCreditModal(true);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Metadados dinâmicos para SEO otimizado por visualização
  const getSeoMeta = () => {
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://autocheck.com.br';

    switch (currentView) {
      case 'report': {
        if (activeReport) {
          const plateText = activeReport.plateFormatted || activeReport.plate;
          const car = `${activeReport.vehicle.marca} ${activeReport.vehicle.modelo}`.trim();
          return {
            title: `Laudo Veicular Placa ${plateText} - ${car || 'Veículo'} | AutoCheck Brasil`,
            description: `Consulta da placa ${plateText}. Verifique situação de roubo/furto, dados do Renavam, gravame, leilão e débitos.`,
            canonicalUrl: `${origin}/laudo/${encodeURIComponent(activeReport.plate)}`,
            noindex: false,
            ogType: 'article'
          };
        }
        return {
          title: 'Relatório de Consulta Veicular por Placa | AutoCheck Brasil',
          description: 'Acesse o laudo completo com dados cadastrais, restrições e procedência veicular.',
          canonicalUrl: `${origin}/laudo`,
          noindex: false,
          ogType: 'website'
        };
      }

      case 'dashboard':
        return {
          title: 'Meu Histórico de Consultas e Laudos | AutoCheck Brasil',
          description: 'Acesse seus laudos gerados, saldo de créditos e histórico de placas consultadas.',
          canonicalUrl: `${origin}/painel`,
          noindex: true,
          ogType: 'website'
        };

      case 'profile':
        return {
          title: 'Configurações de Perfil e API | AutoCheck Brasil',
          description: 'Gerenciamento de dados cadastrais, faturamento e chave de API para integração.',
          canonicalUrl: `${origin}/perfil`,
          noindex: true,
          ogType: 'website'
        };

      case 'pricing':
        return {
          title: 'Planos e Pacotes de Consultas Veiculares | AutoCheck Brasil',
          description: 'Consulte valores de pacotes de consultas veiculares avulsas e planos para lojistas e frotistas.',
          canonicalUrl: `${origin}/precos`,
          noindex: false,
          ogType: 'website'
        };

      case 'how-it-works':
        return {
          title: 'Como Funciona a Consulta de Placa | AutoCheck Brasil',
          description: 'Entenda como coletamos dados veiculares em tempo real com segurança jurídica e técnica.',
          canonicalUrl: `${origin}/como-funciona`,
          noindex: false,
          ogType: 'website'
        };

      case 'faq':
        return {
          title: 'Perguntas Frequentes sobre Consulta Veicular | AutoCheck Brasil',
          description: 'Tire suas dúvidas sobre consultas de placa, laudos de leilão, regularização e prazos.',
          canonicalUrl: `${origin}/duvidas`,
          noindex: false,
          ogType: 'website'
        };

      case 'admin':
        return {
          title: 'Painel Administrativo | AutoCheck Brasil',
          description: 'Monitoramento de integridade e gestão de provedores de dados veiculares.',
          canonicalUrl: `${origin}/admin`,
          noindex: true,
          ogType: 'website'
        };

      case 'not-found':
        return {
          title: 'Página Não Encontrada (404) | AutoCheck Brasil',
          description: 'A página solicitada não foi localizada. Realize uma nova consulta de veículo pela placa.',
          canonicalUrl: `${origin}/404`,
          noindex: true,
          ogType: 'website'
        };

      case 'legal':
        return {
          title: 'Termos de Uso e Política de Privacidade LGPD | AutoCheck Brasil',
          description: 'Termos de serviço, política de privacidade em conformidade com a LGPD e uso responsável de dados.',
          canonicalUrl: `${origin}/termos`,
          noindex: false,
          ogType: 'website'
        };

      case 'home':
      default:
        return {
          title: 'Consulta Veicular por Placa | AutoCheck Brasil',
          description: 'Consulte informações disponíveis sobre um veículo usando apenas a placa. Verifique roubo/furto, dados do veículo e outros registros disponíveis.',
          canonicalUrl: `${origin}/`,
          noindex: false,
          ogType: 'website'
        };
    }
  };

  const seoMeta = getSeoMeta();

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#3B82F6] selection:text-white">
      {/* Dynamic SEO Meta Tags via react-helmet */}
      <Helmet>
        <title>{seoMeta.title}</title>
        <meta name="description" content={seoMeta.description} />
        <link rel="canonical" href={seoMeta.canonicalUrl} />

        {/* OpenGraph */}
        <meta property="og:title" content={seoMeta.title} />
        <meta property="og:description" content={seoMeta.description} />
        <meta property="og:url" content={seoMeta.canonicalUrl} />
        <meta property="og:type" content={seoMeta.ogType} />

        {/* Twitter Card */}
        <meta name="twitter:title" content={seoMeta.title} />
        <meta name="twitter:description" content={seoMeta.description} />

        {/* Robots */}
        {seoMeta.noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow" />
        )}
      </Helmet>

      {/* Navigation */}
      <Navbar
        user={user}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickSearch={(plate) => handleSearchPlate(plate)}
        onOpenCreditModal={() => setShowCreditModal(true)}
        onOpenAuthModal={(mode = 'login') => setAuthModalState({ isOpen: true, mode })}
        onOpenSupportModal={() => setShowSupportModal(true)}
        onLogout={handleLogout}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW: Home / Landing */}
        {currentView === 'home' && (
          <div className="space-y-0">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[#07111F] via-[#0B1728] to-[#07111F] border-b border-white/[0.08]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Hero Content */}
                  <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101F33] border border-white/[0.08] text-[#3B82F6] text-xs font-bold tracking-wide shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                      <span>INTELIGÊNCIA AUTOMOTIVA • CONSULTA POR PLACA</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight leading-[1.1]">
                      Histórico veicular <br className="hidden sm:inline" />
                      <span className="text-[#3B82F6]">
                        rápido, claro e seguro.
                      </span>
                    </h1>

                    <p className="text-base sm:text-lg text-[#94A3B8] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                      Consulte dados cadastrais, situação de roubo/furto, gravames, restrições e histórico de leilão antes de comprar ou vender qualquer automóvel no Brasil.
                    </p>

                    {/* Brazilian Plate Input Hero */}
                    <div className="pt-2">
                      <PlateInput
                        onSearch={(plate, queryType) => handleSearchPlate(plate, queryType)}
                        isLoading={isQuerying}
                      />
                    </div>
                  </div>

                  {/* Right Hero Mockup */}
                  <div className="lg:col-span-5">
                    <HeroMockup onTestPlate={(plate) => handleSearchPlate(plate)} />
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <HowItWorks />

            {/* Benefits & Checks Grid */}
            <BenefitsGrid />

            {/* Free Tier SINESP Highlight */}
            <FreeTierHighlight onStartFree={() => handleSearchPlate('ABC1D23')} />

            {/* Security Banner CTA */}
            <SecurityBanner onConsultClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

            {/* Pricing Section */}
            <PricingSection
              plans={plans}
              creditPackages={creditPackages}
              onSelectPlan={(planId) => {
                if (planId === 'free') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setShowCreditModal(true);
                }
              }}
              onSelectPackage={() => setShowCreditModal(true)}
            />

            {/* FAQ Accordion */}
            <FaqSection />
          </div>
        )}

        {/* VIEW: Full Vehicle Report (includes in-place Skeleton Screen microanimation while isQuerying) */}
        {currentView === 'report' && (
          <ReportView
            report={activeReport}
            isLoading={isQuerying}
            plateBeingQueried={queryingPlate}
            user={user}
            onUpgrade={handleUpgradeReport}
            onNewSearch={() => {
              setIsQuerying(false);
              setCurrentView('home');
            }}
            onOpenCreditModal={() => setShowCreditModal(true)}
          />
        )}

        {/* VIEW: User Dashboard & History */}
        {currentView === 'dashboard' && (
          <UserDashboard
            user={user}
            onSelectReport={(rep) => {
              setActiveReport(rep);
              setCurrentView('report');
            }}
            onNewSearch={() => setCurrentView('home')}
            onOpenCreditModal={() => setShowCreditModal(true)}
          />
        )}

        {/* VIEW: User Profile, Statement & API Keys */}
        {currentView === 'profile' && (
          <UserProfileView
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onOpenCreditModal={() => setShowCreditModal(true)}
          />
        )}

        {/* VIEW: Admin Panel */}
        {currentView === 'admin' && (
          <ErrorBoundary>
            <AdminPanel onBack={() => setCurrentView('home')} />
          </ErrorBoundary>
        )}

        {/* VIEW: Standalone How It Works */}
        {currentView === 'how-it-works' && (
          <div className="py-12">
            <HowItWorks />
            <div className="text-center py-12">
              <button
                onClick={() => setCurrentView('home')}
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30"
              >
                Fazer consulta agora
              </button>
            </div>
          </div>
        )}

        {/* VIEW: Standalone Pricing */}
        {currentView === 'pricing' && (
          <div className="py-6">
            <PricingSection
              plans={plans}
              creditPackages={creditPackages}
              onSelectPlan={(planId) => {
                if (planId === 'free') {
                  setCurrentView('home');
                } else {
                  setShowCreditModal(true);
                }
              }}
              onSelectPackage={() => setShowCreditModal(true)}
            />
          </div>
        )}

        {/* VIEW: Standalone FAQ */}
        {currentView === 'faq' && (
          <div className="py-6">
            <FaqSection />
          </div>
        )}

        {/* VIEW: 404 Not Found Page */}
        {currentView === 'not-found' && (
          <NotFoundView
            onNavigateHome={() => setCurrentView('home')}
            onSearchPlate={(plate) => handleSearchPlate(plate)}
            onOpenHelp={() => setCurrentView('faq')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={handleOpenLegal}
        onOpenSupport={() => setShowSupportModal(true)}
      />

      {/* Offline Status Detector & Banner */}
      <OfflineBanner />

      {/* Query Error Modal with Troubleshooting & Contingency Actions */}
      <QueryErrorModal
        isOpen={queryErrorState.isOpen}
        onClose={() => setQueryErrorState({ ...queryErrorState, isOpen: false })}
        plate={queryErrorState.plate}
        errorMessage={queryErrorState.errorMessage}
        onRetry={() => {
          if (queryErrorState.plate) {
            handleSearchPlate(queryErrorState.plate);
          }
        }}
        onOpenSupport={() => setShowSupportModal(true)}
        onOpenCredits={() => setShowCreditModal(true)}
      />

      {/* Support & Contact Ticket Modal */}
      <ContactSupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        defaultPlate={activeReport?.plate || queryingPlate}
        userEmail={user?.email || ''}
        userName={user?.name || ''}
      />

      {/* Authentication Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Credits Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        packages={creditPackages}
        targetReportId={activeReport?.id}
        onReportUnlocked={() => {
          if (activeReport) {
            handleUpgradeReport();
          }
        }}
        onSuccess={(added) => {
          if (user) {
            setUser({ ...user, credits: user.credits + added });
          }
          if (pendingQuery) {
            const query = pendingQuery;
            setPendingQuery(null);
            handleSearchPlate(query.plate, query.queryType);
          }
        }}
      />

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() => setLegalModalState({ ...legalModalState, isOpen: false })}
        initialTab={legalModalState.tab}
      />
    </div>
  );
}
export default App;
