import { Router, Request, Response } from 'express';
import { queryEngine } from '../services/QueryEngine.ts';
import { dbService } from '../services/db.ts';
import { providerRegistry } from '../providers/ProviderRegistry.ts';
import { PRODUCT_PRICES, CREDIT_PACKAGES, updatePrices, updateCreditPackages } from '../config/prices.ts';
import { PdfService } from '../services/PdfService.ts';
import { PixService } from '../services/PixService.ts';
import { QueryRequestSchema } from '../../shared/schemas/vehicle.ts';

export const apiRouter = Router();

const DEMO_PLATES = new Set(['ABC1D23', 'BRA2E19', 'KOL9876', 'SAV1010', 'ROU8080', 'DEMO123', 'XYZ9876', 'MOC1234', 'TEST999', 'JIX7B96']);

// 1. Check Vehicle by Plate
apiRouter.post('/vehicle/check', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = QueryRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.issues[0]?.message || 'Parâmetros inválidos'
      });
      return;
    }

    const { plate, queryType, forceRefresh } = parseResult.data;
    const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const userId = (req.headers['x-user-id'] as string) || req.body.userId;
    const isDemoPlate = DEMO_PLATES.has(cleanPlate);

    // BLINDAGEM DE SEGURANÇA E AUDITORIA:
    // Placas reais exigem usuário autenticado com saldo suficiente para não gastar a API sem pagar.
    let user = userId ? dbService.getUser(userId) : undefined;

    if (!isDemoPlate) {
      if (!user) {
        dbService.logAction('BLOCKED_UNAUTHENTICATED', cleanPlate, `Tentativa de consulta ${queryType} bloqueada: usuário não autenticado.`);
        res.status(401).json({
          success: false,
          requiresAuth: true,
          queryType,
          plate: cleanPlate,
          priceBrl: queryType === 'complete' ? 49.90 : 34.90,
          error: 'Para consultar esta placa é necessário se cadastrar ou entrar na sua conta.'
        });
        return;
      }

      // VERIFICAÇÃO DO PROGRAMA DE FIDELIDADE (10 consultas pagas = 1 crédito/consulta grátis de desconto)
      const loyaltyStatus = dbService.isUserEligibleForLoyaltyDiscount(user.id);
      const hasLoyaltyDiscount = loyaltyStatus.eligible;

      // Se o usuário comum não tem desconto de fidelidade E o saldo de créditos for zero, exige recarga
      if (user.role !== 'admin' && !hasLoyaltyDiscount && user.credits < 1) {
        dbService.logAction('BLOCKED_NO_CREDITS', cleanPlate, `Tentativa de consulta ${queryType} bloqueada: saldo zerado (0 créditos). Progresso fidelidade: ${loyaltyStatus.loyaltyQueriesCount}/10 consultas.`, user.id);
        const priceBrl = queryType === 'complete' ? 49.90 : 34.90;
        res.status(402).json({
          success: false,
          requiresCredits: true,
          currentCredits: user.credits,
          loyaltyProgress: loyaltyStatus.loyaltyQueriesCount,
          loyaltyTarget: 10,
          queryType,
          plate: cleanPlate,
          priceBrl,
          error: `Saldo insuficiente para realizar a consulta ${queryType === 'complete' ? 'Completa (R$ 49,90)' : 'Básica (R$ 34,90)'}. Faça uma recarga ou complete 10 consultas para ganhar 1 consulta grátis.`
        });
        return;
      }
    }

    const report = await queryEngine.executeQuery({
      plate: cleanPlate,
      queryType,
      userId: user?.id,
      forceRefresh
    });

    let loyaltyBonusApplied = false;
    let earnedNewBonus = false;

    // Se a consulta foi executada para uma placa real e o usuário é um cliente registrado
    if (!isDemoPlate && user && user.role !== 'admin') {
      const loyaltyStatus = dbService.isUserEligibleForLoyaltyDiscount(user.id);
      const priceBrl = queryType === 'complete' ? 49.90 : 34.90;

      if (loyaltyStatus.eligible) {
        // Aplica o desconto de 1 crédito pelo programa de fidelidade (10 consultas pagas)
        const result = dbService.applyLoyaltyDiscount(user.id, cleanPlate, queryType);
        user = result.user;
        loyaltyBonusApplied = true;
        report.loyaltyDiscountApplied = true;
        report.loyaltyMessage = '🎉 Desconto Fidelidade Aplicado: 1 crédito concedido gratuitamente por você ter completado 10 consultas pagas.';
      } else {
        // Processa débito normal de 1 crédito e computa histórico para o programa de fidelidade
        const result = dbService.recordPaidQuery(user.id, cleanPlate, queryType, priceBrl);
        user = result.user;
        earnedNewBonus = result.earnedNewBonus;
        if (earnedNewBonus) {
          report.loyaltyMessage = '★ Parabéns! Você completou 10 consultas pagas. Sua próxima consulta terá 1 crédito de desconto por fidelidade!';
        }
      }

      dbService.saveReport(report);
    } else if (isDemoPlate) {
      dbService.logAction('DEMO_QUERY', cleanPlate, `Consulta de demonstração executada (Custo R$ 0,00)`, user?.id);
    }

    const currentLoyalty = user ? dbService.isUserEligibleForLoyaltyDiscount(user.id) : undefined;

    res.json({
      success: true,
      report,
      remainingCredits: user?.credits,
      loyaltyBonusApplied,
      earnedNewBonus,
      loyalty: currentLoyalty
    });
  } catch (error: unknown) {
    const message = (error as Error).message || 'Falha ao processar consulta veicular.';
    res.status(400).json({
      success: false,
      error: message
    });
  }
});

// 2. Get Vehicle Report by ID
apiRouter.get('/vehicle/report/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const report = dbService.getReport(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Relatório não encontrado.' });
      return;
    }
    res.json({ success: true, report });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 3. Upgrade Report (from Basic to Complete)
apiRouter.post('/vehicle/report/:id/upgrade', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId;
    const report = await queryEngine.upgradeReport(req.params.id, userId);
    res.json({ success: true, report });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// 4. Demo Plates presets for testing
apiRouter.get('/vehicle/demo-plates', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    plates: [
      {
        plate: 'ABC1D23',
        type: 'mercosul',
        vehicle: 'Toyota Corolla XEi 2020',
        score: 95,
        status: 'Excelente / Impecável',
        badge: 'Veículo 100% Regular',
        description: 'Sem restrições, sem sinistros, gravame quitado.'
      },
      {
        plate: 'BRA2E19',
        type: 'mercosul',
        vehicle: 'Jeep Renegade 2023',
        score: 85,
        status: 'Gravame Ativo',
        badge: 'Alienação Fiduciária',
        description: 'Financiamento bancário ativo no SNG.'
      },
      {
        plate: 'KOL9876',
        type: 'antiga',
        vehicle: 'Chevrolet Onix Plus 2021',
        score: 70,
        status: 'Passagem por Leilão',
        badge: 'Leilão Financeira',
        description: 'Arrematado em leilão de recuperação bancária.'
      },
      {
        plate: 'SAV1010',
        type: 'antiga',
        vehicle: 'VW Golf GTI 2018',
        score: 60,
        status: 'Alerta de Sinistro',
        badge: 'Sinistro Média Monta',
        description: 'Histórico de colisão e reparo estrutural médio.'
      },
      {
        plate: 'ROU8080',
        type: 'mercosul',
        vehicle: 'Hyundai HB20 2023',
        score: 20,
        status: 'Restrição Policial',
        badge: 'Roubo / Furto Ativo',
        description: 'Boletim de ocorrência ativo registrado no SINESP.'
      }
    ]
  });
});

// 5. Providers Management
apiRouter.get('/providers', (_req: Request, res: Response): void => {
  const providers = providerRegistry.getAllProviders();
  res.json({ success: true, providers });
});

apiRouter.post('/admin/test-apibrasil', async (req: Request, res: Response): Promise<void> => {
  try {
    const { plate = 'BRA2E19', token, apiUrl, deviceToken } = req.body;
    const finalToken = (token || process.env.APIBRASIL_BEARER_TOKEN || process.env.APIBRASIL_TOKEN || process.env.VEHICLE_API_KEY || '').trim();
    const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const finalDevice = (deviceToken || process.env.APIBRASIL_DEVICE_TOKEN || process.env.DEVICE_TOKEN || '').trim();

    if (!finalToken) {
      res.status(400).json({
        success: false,
        error: 'Nenhum token fornecido ou configurado no ambiente (APIBRASIL_BEARER_TOKEN ou APIBRASIL_TOKEN).'
      });
      return;
    }

    const candidateUrls = [
      (apiUrl || '').trim(),
      process.env.CONSULTA_VEICULAR_API_URL,
      process.env.APIBRASIL_URL,
      'https://gateway.apibrasil.io/api/v2/vehicles/dados',
      'https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits',
      'https://gateway.apibrasil.io/api/v2/vehicles/fipe',
      'https://gateway.apibrasil.io/api/v2/vehicles/base/001/consulta'
    ];
    const uniqueUrls = Array.from(new Set(candidateUrls.filter(Boolean)));

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${finalToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (finalDevice) {
      headers['DeviceToken'] = finalDevice;
      headers['Device-Token'] = finalDevice;
    }

    let lastResult: any = null;

    for (const url of uniqueUrls) {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ placa: cleanPlate, plate: cleanPlate })
      });

      const status = response.status;
      const text = await response.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {}

      lastResult = {
        success: response.ok,
        httpStatus: status,
        rawResponse: json || text,
        endpointUsed: url,
        plateQueried: cleanPlate
      };

      if (response.ok) {
        res.json(lastResult);
        return;
      }
    }

    res.json(lastResult);
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

apiRouter.post('/admin/set-apibrasil-token', (req: Request, res: Response): void => {
  const { token, deviceToken, apiUrl } = req.body;
  if (token) process.env.APIBRASIL_TOKEN = token;
  if (deviceToken) process.env.APIBRASIL_DEVICE_TOKEN = deviceToken;
  if (apiUrl) process.env.APIBRASIL_URL = apiUrl;
  process.env.DEMO_MODE = 'false';

  res.json({
    success: true,
    message: 'Credenciais da APIBrasil atualizadas na memória do servidor com sucesso.',
    demoMode: process.env.DEMO_MODE === 'true'
  });
});

apiRouter.post('/admin/providers/:id', (req: Request, res: Response): void => {
  const id = req.params.id;
  const updates = req.body;
  const success = providerRegistry.updateProviderConfig(id, updates);
  if (!success) {
    res.status(404).json({ success: false, error: 'Provedor não localizado.' });
    return;
  }
  res.json({ success: true, message: 'Configurações do provedor atualizadas.' });
});

// 6. Admin Analytics & Stats
apiRouter.get('/admin/stats', (_req: Request, res: Response): void => {
  const stats = dbService.getStats();
  const providers = providerRegistry.getAllProviders();
  const auditLogs = dbService.getAuditLogs(15);
  res.json({ success: true, stats, providers, auditLogs });
});

// 7. Audit Logs
apiRouter.get('/admin/audit-logs', (_req: Request, res: Response): void => {
  const logs = dbService.getAuditLogs(50);
  res.json({ success: true, logs });
});

// 8. Pricing & Plans
apiRouter.get('/prices', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    plans: PRODUCT_PRICES,
    creditPackages: CREDIT_PACKAGES
  });
});

apiRouter.post('/admin/prices', (req: Request, res: Response): void => {
  if (req.body.plans) {
    updatePrices(req.body.plans);
  }
  if (req.body.creditPackages) {
    updateCreditPackages(req.body.creditPackages);
  }
  res.json({ success: true, message: 'Tabela de preços atualizada com sucesso.' });
});

// 9. Auth & User Management
apiRouter.post('/auth/register', (req: Request, res: Response): void => {
  try {
    const { name, email, password, phone, document, company } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Nome, e-mail e senha são obrigatórios.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'A senha deve conter no mínimo 6 caracteres.' });
      return;
    }

    const { user, token } = dbService.registerUser({
      name,
      email,
      password,
      phone,
      document,
      company
    });

    res.json({
      success: true,
      message: 'Conta criada com sucesso! Você ganhou 2 créditos de bônus.',
      user,
      token
    });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/auth/oauth-sync', (req: Request, res: Response): void => {
  try {
    const { email, name, uid, phone } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'E-mail é obrigatório para sincronização OAuth.' });
      return;
    }

    const { user, token } = dbService.upsertOAuthUser({
      uid,
      email,
      name,
      phone
    });

    res.json({
      success: true,
      message: `Bem-vindo, ${user.name.split(' ')[0]}!`,
      user,
      token
    });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Informe e-mail e senha.' });
      return;
    }

    const { user, token } = dbService.authenticateUser(email, password);
    res.json({
      success: true,
      message: `Bem-vindo de volta, ${user.name.split(' ')[0]}!`,
      user,
      token
    });
  } catch (error: unknown) {
    res.status(401).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response): void => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Informe seu e-mail cadastrado.' });
      return;
    }

    const code = dbService.generateRecoveryCode(email);
    res.json({
      success: true,
      message: `Código de verificação gerado e enviado para ${email}.`,
      demoCode: code // Display code in response for demo convenience
    });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response): void => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ success: false, error: 'E-mail, código e nova senha são obrigatórios.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    dbService.resetPasswordWithCode(email, code, newPassword);
    res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Faça login com a nova senha.'
    });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.put('/user/profile', (req: Request, res: Response): void => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'user_demo';
    const { name, phone, document, company } = req.body;
    const updated = dbService.updateUserProfile(userId, { name, phone, document, company });
    res.json({ success: true, message: 'Perfil atualizado com sucesso.', user: updated });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/user/change-password', (req: Request, res: Response): void => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'user_demo';
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Informe a senha atual e a nova senha.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    dbService.changePassword(userId, oldPassword, newPassword);
    res.json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.get('/user/transactions', (req: Request, res: Response): void => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.json({ success: true, transactions: [] });
    return;
  }
  const transactions = dbService.getUserTransactions(userId);
  res.json({ success: true, transactions });
});

// 10. User Profile & Queries
apiRouter.get('/user/me', (req: Request, res: Response): void => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.json({ success: true, user: null });
    return;
  }
  const user = dbService.getUser(userId);
  res.json({ success: true, user: user || null });
});

apiRouter.get('/user/loyalty', (req: Request, res: Response): void => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.json({ success: false, error: 'Usuário não autenticado' });
    return;
  }
  const loyalty = dbService.isUserEligibleForLoyaltyDiscount(userId);
  res.json({ success: true, loyalty });
});

apiRouter.get('/user/queries', (req: Request, res: Response): void => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.json({ success: true, queries: [] });
    return;
  }
  const queries = dbService.getReportsByUserId(userId);
  res.json({ success: true, queries });
});

// 10. PIX Payment & Configuration
apiRouter.get('/payment/pix-config', (_req: Request, res: Response): void => {
  const pix = dbService.getPixSettings();
  res.json({ success: true, pix });
});

apiRouter.post('/admin/pix-config', (req: Request, res: Response): void => {
  try {
    const { pixKey, pixKeyType, beneficiaryName, beneficiaryCity, autoApprove } = req.body;
    const updated = dbService.updatePixSettings({
      ...(pixKey ? { pixKey: pixKey.trim() } : {}),
      ...(pixKeyType ? { pixKeyType } : {}),
      ...(beneficiaryName ? { beneficiaryName: beneficiaryName.trim() } : {}),
      ...(beneficiaryCity ? { beneficiaryCity: beneficiaryCity.trim() } : {}),
      ...(autoApprove !== undefined ? { autoApprove } : {})
    });
    res.json({ success: true, message: 'Configurações de recebimento PIX atualizadas com sucesso.', pix: updated });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/payment/generate-pix', (req: Request, res: Response): void => {
  try {
    const { amount = 24.90, description = 'Consulta AutoCheck Brasil', reportId, packageId } = req.body;
    const pixSettings = dbService.getPixSettings();

    const pixPayload = PixService.generatePixCopyPaste({
      pixKey: pixSettings.pixKey,
      beneficiaryName: pixSettings.beneficiaryName,
      beneficiaryCity: pixSettings.beneficiaryCity,
      amount: Number(amount),
      description: String(description).substring(0, 20)
    });

    res.json({
      success: true,
      pix: {
        ...pixPayload,
        beneficiaryName: pixSettings.beneficiaryName,
        beneficiaryCity: pixSettings.beneficiaryCity,
        reportId,
        packageId,
        expiresInSeconds: 900 // 15 minutos
      }
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.post('/payment/confirm-pix', async (req: Request, res: Response): Promise<void> => {
  try {
    const { txId, reportId, packageId, userId = 'user_demo', amount } = req.body;
    const targetUserId = (req.headers['x-user-id'] as string) || userId;

    let unlockedReport: any = null;

    // Se o pagamento for para desbloquear um laudo específico:
    if (reportId) {
      unlockedReport = await queryEngine.upgradeReport(reportId);
    }

    // Se for compra de pacote de créditos:
    if (packageId) {
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId) || CREDIT_PACKAGES[0];
      const user = dbService.getUser(targetUserId);
      if (user) {
        user.credits += pkg.credits;
        dbService.saveUser(user);
      }
    }

    // Registra transação
    dbService.addTransaction({
      id: txId || ('tx_pix_' + Math.random().toString(36).substring(2, 9)),
      userId: targetUserId,
      amount: packageId ? 3 : 1,
      priceBrl: Number(amount || 24.90),
      paymentMethod: 'Pix Instantâneo (BR Code)',
      type: 'credit',
      description: reportId ? `Desbloqueio de Laudo Veicular via Pix` : `Recarga de Créditos via Pix`,
      status: 'completed',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Pagamento via PIX confirmado com sucesso!',
      report: unlockedReport
    });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// 10. Credit Purchase Checkout (Mock payment flow ready for Stripe / Mercado Pago)
apiRouter.post('/user/credits/buy', (req: Request, res: Response): void => {
  try {
    const { packageId, userId, paymentMethod } = req.body;
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId) || CREDIT_PACKAGES[0];
    const targetUserId = userId || 'user_demo';

    const user = dbService.getUser(targetUserId);
    if (user) {
      user.credits += pkg.credits;
      dbService.saveUser(user);
    }

    const tx = dbService.addTransaction({
      id: 'tx_' + Math.random().toString(36).substring(2, 10),
      userId: targetUserId,
      amount: pkg.credits,
      priceBrl: pkg.priceBrl,
      paymentMethod: paymentMethod || 'Pix Automático',
      type: 'credit',
      description: `Aquisição de ${pkg.name} (${pkg.credits} créditos)`,
      status: 'completed',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `${pkg.credits} créditos adicionados com sucesso!`,
      credits: user?.credits || pkg.credits,
      transaction: tx
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 11. PDF Export
apiRouter.post('/reports/:id/pdf', (req: Request, res: Response): void => {
  try {
    const report = dbService.getReport(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Relatório não localizado.' });
      return;
    }

    const userId = (req.headers['x-user-id'] as string) || req.body?.userId || report.userId;
    const user = userId ? dbService.getUser(userId) : undefined;

    const pdfBuffer = PdfService.generateVehicleReportPdf(report, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=AutoCheck-${report.plateFormatted || report.plate}.pdf`);
    res.send(pdfBuffer);
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// 12. JSON Export
apiRouter.get('/reports/:id/json', (req: Request, res: Response): void => {
  const report = dbService.getReport(req.params.id);
  if (!report) {
    res.status(404).json({ success: false, error: 'Relatório não localizado.' });
    return;
  }
  res.setHeader('Content-Disposition', `attachment; filename=AutoCheck-${report.plate}.json`);
  res.json(report);
});

// 13. Support & Contact
apiRouter.post('/support/ticket', (req: Request, res: Response): void => {
  try {
    const { name, email, phone, subject, category, message, plateRelated } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, error: 'Nome, e-mail, assunto e mensagem são obrigatórios.' });
      return;
    }

    const ticket = dbService.createSupportTicket({
      name,
      email,
      phone,
      subject,
      category: category || 'outro',
      message,
      plateRelated
    });

    res.json({
      success: true,
      message: 'Sua mensagem foi recebida com sucesso! Protocolo gerado: #' + ticket.id,
      ticket
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

apiRouter.get('/support/tickets', (req: Request, res: Response): void => {
  const tickets = dbService.getSupportTickets();
  res.json({ success: true, tickets });
});

