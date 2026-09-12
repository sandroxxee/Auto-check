import { ConsolidatedReport, PlanPricing, CreditPackage, ProviderConfig, QueryStats, UserAccount, CreditTransaction, SupportTicket } from '../types/index.ts';

export const api = {
  // --- Auth & Session ---
  async syncOAuthUser(payload: { uid: string; email: string; name?: string; phone?: string }): Promise<{ success: boolean; user: UserAccount; token: string; message: string }> {
    const res = await fetch('/api/auth/oauth-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao sincronizar conta OAuth.');
    }
    if (data.user?.id) {
      localStorage.setItem('autocheck_user_id', data.user.id);
      localStorage.setItem('autocheck_user_email', data.user.email);
    }
    return data;
  },

  async register(payload: { name: string; email: string; password: string; phone?: string; document?: string; company?: string }): Promise<{ success: boolean; user: UserAccount; token: string; message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao cadastrar usuário.');
    }
    if (data.user?.id) {
      localStorage.setItem('autocheck_user_id', data.user.id);
      localStorage.setItem('autocheck_user_email', data.user.email);
    }
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<{ success: boolean; user: UserAccount; token: string; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao realizar login.');
    }
    if (data.user?.id) {
      localStorage.setItem('autocheck_user_id', data.user.id);
      localStorage.setItem('autocheck_user_email', data.user.email);
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; demoCode?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao solicitar recuperação de senha.');
    }
    return data;
  },

  async resetPassword(payload: { email: string; code: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao redefinir senha.');
    }
    return data;
  },

  async updateProfile(payload: { name?: string; phone?: string; document?: string; company?: string }): Promise<{ success: boolean; message: string; user: UserAccount }> {
    const userId = localStorage.getItem('autocheck_user_id');
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao atualizar perfil.');
    }
    return data;
  },

  async changePassword(payload: { oldPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const userId = localStorage.getItem('autocheck_user_id');
    const res = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao alterar senha.');
    }
    return data;
  },

  async getTransactions(): Promise<CreditTransaction[]> {
    const userId = localStorage.getItem('autocheck_user_id');
    if (!userId) {
      return [];
    }
    const res = await fetch('/api/user/transactions', {
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    return data.transactions || [];
  },

  logout(): void {
    localStorage.removeItem('autocheck_user_id');
    localStorage.removeItem('autocheck_user_email');
  },

  // 1. Check vehicle
  async checkVehicle(plate: string, queryType: 'basic' | 'complete' | 'professional' = 'basic'): Promise<{
    success: boolean;
    report: ConsolidatedReport;
    remainingCredits?: number;
    loyaltyBonusApplied?: boolean;
    earnedNewBonus?: boolean;
    loyalty?: {
      eligible: boolean;
      paidQueriesCount: number;
      loyaltyQueriesCount: number;
      rewardsAvailable: number;
      progressPercentage: number;
    };
  }> {
    const userId = localStorage.getItem('autocheck_user_id');
    const res = await fetch('/api/vehicle/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {})
      },
      body: JSON.stringify({ plate, queryType })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const error: any = new Error(data.error || 'Falha ao consultar placa.');
      error.requiresAuth = data.requiresAuth || res.status === 401;
      error.requiresCredits = data.requiresCredits || res.status === 402;
      error.priceBrl = data.priceBrl;
      error.queryType = data.queryType || queryType;
      error.plate = data.plate || plate;
      error.loyaltyProgress = data.loyaltyProgress;
      error.loyaltyTarget = data.loyaltyTarget;
      throw error;
    }
    return data;
  },

  // 1.1 Get Loyalty Status
  async getLoyaltyStatus(): Promise<{
    eligible: boolean;
    paidQueriesCount: number;
    loyaltyQueriesCount: number;
    rewardsAvailable: number;
    progressPercentage: number;
  }> {
    const userId = localStorage.getItem('autocheck_user_id');
    if (!userId) {
      return { eligible: false, paidQueriesCount: 0, loyaltyQueriesCount: 0, rewardsAvailable: 0, progressPercentage: 0 };
    }
    const res = await fetch('/api/user/loyalty', {
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    return data.loyalty || { eligible: false, paidQueriesCount: 0, loyaltyQueriesCount: 0, rewardsAvailable: 0, progressPercentage: 0 };
  },

  // 2. Get report by ID
  async getReport(id: string): Promise<ConsolidatedReport> {
    const res = await fetch(`/api/vehicle/report/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Relatório não encontrado.');
    }
    return data.report;
  },

  // 3. Upgrade report
  async upgradeReport(id: string): Promise<ConsolidatedReport> {
    const userId = localStorage.getItem('autocheck_user_id');
    const res = await fetch(`/api/vehicle/report/${id}/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {})
      }
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao desbloquear relatório completo.');
    }
    return data.report;
  },

  // 4. Get demo plates
  async getDemoPlates(): Promise<Array<{ plate: string; type: string; vehicle: string; score: number; status: string; badge: string; description: string }>> {
    const res = await fetch('/api/vehicle/demo-plates');
    const data = await res.json();
    return data.plates || [];
  },

  // 5. Get user details
  async getUser(): Promise<UserAccount | null> {
    const userId = localStorage.getItem('autocheck_user_id');
    if (!userId) {
      return null;
    }
    const res = await fetch('/api/user/me', {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.user || null;
  },

  // 6. Get user query history
  async getUserQueries(): Promise<ConsolidatedReport[]> {
    const userId = localStorage.getItem('autocheck_user_id');
    if (!userId) {
      return [];
    }
    const res = await fetch('/api/user/queries', {
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    return data.queries || [];
  },

  // 7. Buy credits (mock checkout)
  async buyCredits(packageId: string, paymentMethod: string): Promise<{ success: boolean; message: string; credits: number }> {
    const userId = localStorage.getItem('autocheck_user_id') || 'user_demo';
    const res = await fetch('/api/user/credits/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ packageId, paymentMethod })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao processar pagamento.');
    }
    return data;
  },

  // 8. Get prices
  async getPrices(): Promise<{ plans: PlanPricing[]; creditPackages: CreditPackage[] }> {
    const res = await fetch('/api/prices');
    const data = await res.json();
    return data;
  },

  // 9. Admin Stats
  async getAdminStats(): Promise<{ stats: QueryStats; providers: ProviderConfig[]; auditLogs: any[] }> {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    return data;
  },

  // 10. Update Provider Config
  async updateProvider(id: string, updates: Partial<ProviderConfig>): Promise<void> {
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      throw new Error('Falha ao atualizar provedor.');
    }
  },

  // 11. Download PDF
  async downloadPdf(reportId: string, filename = 'AutoCheck-Relatorio.pdf'): Promise<void> {
    const res = await fetch(`/api/reports/${reportId}/pdf`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Falha ao gerar arquivo PDF.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // 12. Download JSON
  async downloadJson(reportId: string, filename = 'AutoCheck-Relatorio.json'): Promise<void> {
    const res = await fetch(`/api/reports/${reportId}/json`);
    if (!res.ok) throw new Error('Falha ao exportar JSON.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // 13. Support & Tickets
  async createSupportTicket(payload: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    category: 'duvida_laudo' | 'financeiro' | 'b2b_api' | 'parceria' | 'outro';
    message: string;
    plateRelated?: string;
  }): Promise<{ success: boolean; message: string; ticket: SupportTicket }> {
    const res = await fetch('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao enviar mensagem de suporte.');
    }
    return data;
  },

  async getSupportTickets(): Promise<SupportTicket[]> {
    const res = await fetch('/api/support/tickets');
    const data = await res.json();
    return data.tickets || [];
  },

  async testApiBrasil(payload: { plate: string; token?: string; apiUrl?: string; deviceToken?: string }): Promise<{
    success: boolean;
    httpStatus: number;
    rawResponse: any;
    endpointUsed: string;
    plateQueried: string;
    error?: string;
  }> {
    const res = await fetch('/api/admin/test-apibrasil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async setApiBrasilToken(payload: { token: string; deviceToken?: string; apiUrl?: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    const res = await fetch('/api/admin/set-apibrasil-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // 14. PIX Operations
  async getPixConfig(): Promise<{ pixKey: string; pixKeyType: string; beneficiaryName: string; beneficiaryCity: string }> {
    const res = await fetch('/api/payment/pix-config');
    const data = await res.json();
    return data.pix;
  },

  async updatePixConfig(payload: { pixKey: string; pixKeyType?: string; beneficiaryName?: string; beneficiaryCity?: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/pix-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async generatePix(payload: { amount: number; description?: string; reportId?: string; packageId?: string }): Promise<{
    success: boolean;
    pix: {
      copyPaste: string;
      qrCodeUrl: string;
      txId: string;
      amount: number;
      beneficiaryName: string;
      beneficiaryCity: string;
      expiresInSeconds: number;
    };
  }> {
    const res = await fetch('/api/payment/generate-pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async confirmPix(payload: { txId: string; reportId?: string; packageId?: string; amount?: number }): Promise<{
    success: boolean;
    message: string;
    report?: ConsolidatedReport;
  }> {
    const userId = localStorage.getItem('autocheck_user_id');
    const res = await fetch('/api/payment/confirm-pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {})
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};

