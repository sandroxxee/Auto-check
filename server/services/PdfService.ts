import { jsPDF } from 'jspdf';
import { ConsolidatedReport, UserAccount } from '../../shared/types/index.ts';

export class PdfService {
  public static generateVehicleReportPdf(report: ConsolidatedReport, user?: UserAccount | null): Buffer {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    type RGB = readonly [number, number, number];

    const primaryBlue: RGB = [59, 130, 246];
    const darkNavy: RGB = [7, 17, 31];
    const cardBg: RGB = [248, 250, 252];
    const borderGray: RGB = [226, 232, 240];
    const textDark: RGB = [15, 23, 42];
    const textMuted: RGB = [100, 116, 139];
    const greenSuccess: RGB = [34, 197, 94];
    const yellowWarn: RGB = [245, 158, 11];
    const redDanger: RGB = [239, 68, 68];

    const isComplete = report.queryType === 'complete';
    const clientName = user?.name || user?.company || (user?.email ? user.email.split('@')[0] : 'Cliente Cadastrado');
    const clientEmail = user?.email || 'Acesso Autenticado';
    const queryDate = new Date(report.createdAt || Date.now());
    const dataFormatada = queryDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaFormatada = queryDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Top Header Banner
    doc.setFillColor(...darkNavy);
    doc.rect(0, 0, pageWidth, 32, 'F');

    doc.setFillColor(...primaryBlue);
    doc.rect(0, 32, pageWidth, 2, 'F');

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('AUTOCHECK BRASIL', margin, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('PLATAFORMA NACIONAL DE INTELIGÊNCIA E AUDITORIA VEICULAR', margin, 19);

    // Status Badge
    doc.setFillColor(isComplete ? greenSuccess[0] : yellowWarn[0], isComplete ? greenSuccess[1] : yellowWarn[1], isComplete ? greenSuccess[2] : yellowWarn[2]);
    doc.roundedRect(margin, 22.5, isComplete ? 44 : 48, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(isComplete ? 'LAUDO COMPLETO 360°' : 'LAUDO BÁSICO CADASTRAL', margin + 2, 26.5);

    // Right Header Metadata
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`PROTOCOLO: #AC-${report.id.substring(0, 10).toUpperCase()}`, pageWidth - margin, 12, { align: 'right' });
    doc.setTextColor(148, 163, 184);
    doc.text(`PESQUISA: ${dataFormatada} às ${horaFormatada}`, pageWidth - margin, 18, { align: 'right' });
    doc.text(`SOLICITANTE: ${clientName.toUpperCase()}`, pageWidth - margin, 24, { align: 'right' });

    y = 40;

    // Card 1: Informações do Cliente & Pesquisa
    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryBlue);
    doc.text('DADOS DA REQUISIÇÃO & AUDITORIA DE CRÉDITO', margin + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(`Cliente / Titular: ${clientName}`, margin + 4, y + 11);
    doc.text(`E-mail: ${clientEmail}`, margin + 4, y + 15);

    doc.text(`Data da Pesquisa: ${dataFormatada} às ${horaFormatada}`, margin + (contentWidth / 2) + 4, y + 11);
    const creditStatusText = report.loyaltyDiscountApplied
      ? `Desconto Fidelidade 100% OFF (10 Consultas Pagas) • Saldo: ${user ? user.credits : 0}`
      : user
      ? `1 Vistoria Utilizada (Saldo Restante: ${user.credits} vistorias)`
      : '1 Vistoria Processada';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(report.loyaltyDiscountApplied ? greenSuccess : user && user.credits > 0 ? greenSuccess : textDark));
    doc.text(`Consumo: ${creditStatusText}`, margin + (contentWidth / 2) + 4, y + 15);

    y += 23;

    // Card 2: Placa Mercosul & Veículo & Score
    doc.setFillColor(...cardBg);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 34, 2.5, 2.5, 'FD');

    // Placa Mercosul
    const plateBoxWidth = 36;
    const plateBoxHeight = 22;
    const plateX = margin + 4;
    const plateY = y + 6;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 51, 153);
    doc.setLineWidth(0.6);
    doc.roundedRect(plateX, plateY, plateBoxWidth, plateBoxHeight, 2, 2, 'FD');

    doc.setFillColor(0, 51, 153);
    doc.roundedRect(plateX, plateY, plateBoxWidth, 5.5, 2, 2, 'F');
    doc.rect(plateX, plateY + 3.5, plateBoxWidth, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text('BRASIL', plateX + plateBoxWidth / 2, plateY + 4, { align: 'center' });

    doc.setFont('courier', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...textDark);
    doc.text(report.plateFormatted || report.plate, plateX + plateBoxWidth / 2, plateY + 16, { align: 'center' });

    // Nome do Veículo
    const vehicleName = report.vehicle 
      ? `${report.vehicle.marca} ${report.vehicle.modelo}`.toUpperCase()
      : `VEÍCULO PLACA ${report.plateFormatted}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...textDark);
    doc.text(vehicleName, margin + plateBoxWidth + 8, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    const vehicleSub = report.vehicle
      ? `Ano ${report.vehicle.anoFabricacao}/${report.vehicle.anoModelo} • Cor ${report.vehicle.cor} • Combustível ${report.vehicle.combustivel} • ${report.vehicle.municipio}/${report.vehicle.uf}`
      : 'Identificação veicular homologada.';
    doc.text(vehicleSub, margin + plateBoxWidth + 8, y + 17);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primaryBlue);
    doc.text(`Modalidade: ${isComplete ? 'Laudo Completo 360° (11 Bases Auditadas)' : 'Laudo Básico Cadastral'}`, margin + plateBoxWidth + 8, y + 25);

    // Score de Risco
    const scoreBoxWidth = 34;
    const scoreBoxX = pageWidth - margin - scoreBoxWidth - 4;
    const scoreBoxY = y + 4.5;

    let scoreColor = greenSuccess;
    let scoreLabel = 'BAIXO RISCO';
    if (report.score < 50) {
      scoreColor = redDanger;
      scoreLabel = 'ALTO RISCO';
    } else if (report.score < 80) {
      scoreColor = yellowWarn;
      scoreLabel = 'RISCO MODERADO';
    }

    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxWidth, 25, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(isComplete ? 'SCORE DE RISCO 360°' : 'SCORE CADASTRAL', scoreBoxX + scoreBoxWidth / 2, scoreBoxY + 5.5, { align: 'center' });

    doc.setFontSize(15);
    doc.text(`${report.score}/100`, scoreBoxX + scoreBoxWidth / 2, scoreBoxY + 14, { align: 'center' });

    doc.setFontSize(6.5);
    doc.text(scoreLabel, scoreBoxX + scoreBoxWidth / 2, scoreBoxY + 20, { align: 'center' });

    y += 40;

    // Helper functions
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        doc.setFillColor(...darkNavy);
        doc.rect(0, 0, pageWidth, 16, 'F');
        doc.setFillColor(...primaryBlue);
        doc.rect(0, 16, pageWidth, 1.2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('AUTOCHECK BRASIL • LAUDO HISTÓRICO VEICULAR (CONTINUAÇÃO)', margin, 10);
        doc.setFontSize(7.5);
        doc.text(`PLACA: ${report.plateFormatted || report.plate} • PROTOCOLO: #AC-${report.id.substring(0, 10).toUpperCase()}`, pageWidth - margin, 10, { align: 'right' });
        y = 24;
      }
    };

    const drawSectionTitle = (title: string, currentY: number) => {
      doc.setFillColor(...darkNavy);
      doc.rect(margin, currentY, 3, 7.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...textDark);
      doc.text(title, margin + 5, currentY + 5.5);

      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + 9, pageWidth - margin, currentY + 9);

      return currentY + 13;
    };

    const drawDataGrid = (
      items: Array<{ label: string; value: string; highlight?: 'success' | 'warn' | 'danger' }>,
      startY: number,
      cols = 2
    ) => {
      const colWidth = contentWidth / cols;
      const rowHeight = 9.5;
      let currY = startY;

      items.forEach((item, index) => {
        const colIndex = index % cols;
        if (colIndex === 0 && index > 0) {
          currY += rowHeight;
        }
        const x = margin + colIndex * colWidth;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...textMuted);
        doc.text(item.label.toUpperCase(), x, currY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);

        if (item.highlight === 'success') {
          doc.setTextColor(...greenSuccess);
        } else if (item.highlight === 'danger') {
          doc.setTextColor(...redDanger);
        } else if (item.highlight === 'warn') {
          doc.setTextColor(...yellowWarn);
        } else {
          doc.setTextColor(...textDark);
        }

        const maxValWidth = colWidth - 4;
        const displayVal = doc.getTextWidth(item.value) > maxValWidth 
          ? item.value.substring(0, 38) + '...'
          : item.value;

        doc.text(displayVal, x, currY + 4.5);
      });

      return currY + rowHeight + 3;
    };

    const drawLockedModule = (moduleName: string, description: string, currentY: number) => {
      doc.setFillColor(...cardBg);
      doc.setDrawColor(...borderGray);
      doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...yellowWarn);
      doc.text(`[BLOQUEADO NO LAUDO BÁSICO] ${moduleName}`, margin + 4, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text(`${description} - Disponível exclusivamente no Laudo Completo 360°.`, margin + 4, currentY + 9);

      return currentY + 15;
    };

    // 1. Dados Cadastrais
    y = drawSectionTitle('1. DADOS CADASTRAIS E ESPECIFICAÇÕES DO VEÍCULO', y);
    if (report.vehicle) {
      const v = report.vehicle;
      y = drawDataGrid([
        { label: 'Marca / Modelo', value: `${v.marca} / ${v.modelo}` },
        { label: 'Ano Fab. / Modelo', value: `${v.anoFabricacao} / ${v.anoModelo}` },
        { label: 'Versão Oficial', value: v.versao || 'Padrão Homologado' },
        { label: 'Cor Predominante', value: v.cor || 'Não informada' },
        { label: 'Combustível', value: v.combustivel || 'Flex' },
        { label: 'Município / UF Emplacamento', value: `${v.municipio} / ${v.uf}` },
        { label: 'Chassi (Protegido LGPD)', value: v.chassiMascarado || '*** PROTEGIDO ***' },
        { label: 'Motor (Protegido LGPD)', value: v.motorMascarado || '*** PROTEGIDO ***' },
        { label: 'Espécie / Segmento', value: `${v.tipoVeiculo || 'Automóvel'} (${v.segmento || 'Passeio'})` },
        { label: 'Situação de Circulação', value: v.situacaoVeiculo === 'EM_CIRCULACAO' ? 'EM CIRCULAÇÃO (REGULAR)' : v.situacaoVeiculo, highlight: v.situacaoVeiculo === 'EM_CIRCULACAO' ? 'success' : 'warn' }
      ], y, 2);
    }

    y += 2;

    // 2. Roubo e Furto (SINESP)
    y = drawSectionTitle('2. CHECAGEM POLICIAL & CRIMINAL (SINESP / SEGURANÇA PÚBLICA)', y);
    const theftOk = report.theft.status === 'NADA_CONSTA';
    y = drawDataGrid([
      { 
        label: 'Situação de Roubo / Furto', 
        value: theftOk ? 'NADA CONSTA (LIVRE DE RESTRIÇÃO POLICIAL)' : 'ALERTA DE ROUBO/FURTO ATIVO',
        highlight: theftOk ? 'success' : 'danger'
      },
      { label: 'Data da Auditoria Policial', value: `${dataFormatada} às ${horaFormatada}` },
      { label: 'Boletim de Ocorrência', value: report.theft.boletimOcorrencia || 'Nenhum registro ativo' },
      { label: 'Parecer do Sistema Policial', value: report.theft.mensagem || 'Veículo regular sem queixa de furto.' }
    ], y, 2);

    y += 2;

    // 3. Gravame (SNG)
    y = drawSectionTitle('3. GRAVAME & RESTRIÇÕES FINANCEIRAS (SNG / B3 / DETRAN)', y);
    if (!isComplete) {
      y = drawLockedModule('Auditoria de Gravame e Financiamento Ativo', 'Verificação de alienação fiduciária, arrendamento mercantil e reserva de domínio', y);
    } else {
      const financingOk = report.financing.status === 'SEM_RESTRICAO';
      y = drawDataGrid([
        { 
          label: 'Situação Financeira', 
          value: financingOk ? 'SEM RESTRIÇÃO FINANCEIRA (VEÍCULO QUITADO)' : (report.financing.descricao || 'GRAVAME REGISTRADO'),
          highlight: financingOk ? 'success' : 'warn'
        },
        { label: 'Agente Financeiro / Banco', value: report.financing.agenteFinanceiro || 'Sem agente financeiro ativo' },
        { label: 'Data de Inclusão do Gravame', value: report.financing.dataInclusao || 'Não se aplica' },
        { label: 'Contrato Protegido', value: report.financing.contratoMascarado || 'Sem restrições ativas' }
      ], y, 2);
    }

    y += 2;

    // 4. Leilão e Sinistros
    y = drawSectionTitle('4. HISTÓRICO DE LEILÕES E SINISTROS SECURITÁRIOS (COPEL / SEGURADORAS)', y);
    if (!isComplete) {
      y = drawLockedModule('Histórico de Passagem por Leilão e Sinistros', 'Auditoria em mais de 120 leiloeiros oficiais e base de sinistros com perda total ou média monta', y);
    } else {
      const auctionOk = report.auction.status === 'SEM_REGISTRO';
      const accidentOk = report.accident.status === 'SEM_REGISTRO';
      y = drawDataGrid([
        { 
          label: 'Registro em Leilão', 
          value: auctionOk ? 'SEM REGISTRO EM LEILÃO' : (report.auction.descricao || 'PASSAGEM POR LEILÃO IDENTIFICADA'),
          highlight: auctionOk ? 'success' : 'danger'
        },
        { 
          label: 'Histórico de Sinistro / Dano', 
          value: accidentOk ? 'SEM REGISTRO DE SINISTRO' : (report.accident.descricao || 'AVARIA REGISTRADA'),
          highlight: accidentOk ? 'success' : 'danger'
        },
        { label: 'Empresa / Comitente Leiloeiro', value: report.auction.empresaLeilao || 'Nenhum apontamento localizado' },
        { label: 'Classificação de Monta', value: report.accident.tipoSinistro || 'Sem dano estrutural apontado' }
      ], y, 2);
    }

    y += 2;

    // 5. Débitos e Multas
    y = drawSectionTitle('5. DÉBITOS, MULTAS E AUTUAÇÕES (APIBRASIL / RENAINF / SEFAZ)', y);
    if (!isComplete) {
      y = drawLockedModule('Checagem Completa de Débitos e Multas Estaduais/Federais', 'Consulta de autuações Renainf, IPVA atrasado, DPVAT e taxas de licenciamento pendentes', y);
    } else {
      const totalDeb = report.debitos?.totalGeral ?? report.fines.valorTotalEstimado ?? 0;
      y = drawDataGrid([
        { 
          label: 'Autuações Renainf', 
          value: report.fines.quantidade === 0 ? 'NENHUMA AUTUAÇÃO PENDENTE' : `${report.fines.quantidade} autuação(ões) ativa(s)`,
          highlight: report.fines.quantidade === 0 ? 'success' : 'warn'
        },
        { 
          label: 'Total Geral de Débitos', 
          value: totalDeb === 0 ? 'R$ 0,00 (QUITADO E REGULARIZADO)' : `R$ ${totalDeb.toFixed(2).replace('.', ',')}`,
          highlight: totalDeb === 0 ? 'success' : 'danger'
        },
        {
          label: 'IPVA Atrasado / Licenciamento',
          value: report.debitos && (report.debitos.ipvaAtrasado > 0 || report.debitos.taxaLicenciamento > 0)
            ? `IPVA: R$ ${report.debitos.ipvaAtrasado.toFixed(2).replace('.', ',')} | Licenc: R$ ${report.debitos.taxaLicenciamento.toFixed(2).replace('.', ',')}`
            : 'Sem débitos de IPVA/Licenciamento',
          highlight: report.debitos && (report.debitos.ipvaAtrasado > 0 || report.debitos.taxaLicenciamento > 0) ? 'warn' : 'success'
        },
        {
          label: 'Base Homologada',
          value: report.debitos?.fonteConsulta || 'APIBrasil • Renainf & SEFAZ'
        }
      ], y, 2);
    }

    y += 2;

    // 6. Restrições Administrativas & Judiciais
    checkPageBreak(32);
    y = drawSectionTitle('6. RESTRIÇÕES ADMINISTRATIVAS E JUDICIAIS (RENAJUD / DETRAN)', y);
    if (!isComplete) {
      y = drawLockedModule('Bloqueios Judiciais RENAJUD e Detran', 'Verificação de ordens de penhora judicial, busca e apreensão, guincho e restrições administrativas', y);
    } else {
      const restrictions = report.restricoesAdministrativas || report.administrativeRestrictions;
      const hasRestrictions = restrictions && (restrictions.status === 'RESTRICOES_ENCONTRADAS' || (restrictions.quantidade && restrictions.quantidade > 0));
      y = drawDataGrid([
        {
          label: 'Status de Restrições',
          value: !hasRestrictions ? 'NADA CONSTA (LIVRE DE RESTRIÇÕES)' : (restrictions?.temBloqueioJudicial ? 'BLOQUEIO JUDICIAL RENAJUD' : 'RESTRIÇÃO ADMINISTRATIVA ATIVA'),
          highlight: !hasRestrictions ? 'success' : 'danger'
        },
        {
          label: 'Bloqueio Judicial RENAJUD',
          value: restrictions?.temBloqueioJudicial ? 'BLOQUEIO JUDICIAL ATIVO' : 'Nada Consta (Liberado)',
          highlight: restrictions?.temBloqueioJudicial ? 'danger' : 'success'
        },
        {
          label: 'Bloqueio Administrativo DETRAN',
          value: restrictions?.temBloqueioAdministrativo ? 'Consta Bloqueio Administrativo' : 'Sem Bloqueio',
          highlight: restrictions?.temBloqueioAdministrativo ? 'warn' : 'success'
        },
        {
          label: 'Restrição de Guincho / Pátio',
          value: restrictions?.temRestricaoGuincho ? 'Consta Apreensão em Pátio' : 'Livre de Apreensão',
          highlight: restrictions?.temRestricaoGuincho ? 'danger' : 'success'
        }
      ], y, 2);
    }

    // Rodapé
    const footerY = pageHeight - 18;
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text(
      'Aviso Legal: As informações contidas neste laudo são consolidadas de bases públicas e parceiros homologados na data da pesquisa.',
      margin,
      footerY + 4
    );
    doc.text(
      `Solicitante: ${clientName} (${clientEmail}) • Pesquisa realizada em ${dataFormatada} às ${horaFormatada} • Conforme LGPD (Lei 13.709/2018).`,
      margin,
      footerY + 8
    );

    doc.setFont('helvetica', 'bold');
    doc.text(
      `AutoCheck Brasil • www.autocheck.com.br • Hash de Verificação: ${report.id}`,
      margin,
      footerY + 12
    );

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  }
}
