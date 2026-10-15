import { jsPDF } from 'jspdf';
import type { MonthlyStats, Transaction, SavingsGoal, CategoryBudget, UserProfile } from '../types/finance.ts';
import { formatCurrency, getMonthName } from './finance.ts';

export function generateMonthlyReportPDF(options: {
  stats: MonthlyStats;
  selectedMonth: string;
  transactions: Transaction[];
  goals: SavingsGoal[];
  budgets: CategoryBudget[];
  userProfile?: UserProfile;
}) {
  const { stats, selectedMonth, transactions, goals, budgets, userProfile } = options;
  const monthName = getMonthName(selectedMonth);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // Background Header Accent
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Decorative Emerald accent line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 31, pageWidth, 1.5, 'F');

  // Brand Wordmark
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('KAKEBO', margin, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 231, 183); // emerald-300
  doc.text('FINANZAS PERSONALES & GAMIFICACIÓN', margin, 20);

  // Document Title on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`Informe Mensual: ${monthName}`, pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  const generationDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Generado el: ${generationDate} · Usuario: ${userProfile?.name || 'Usuario'}`, pageWidth - margin, 20, {
    align: 'right',
  });

  y = 42;

  // Section 1: Executive KPI Cards (4 cards)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Resumen Ejecutivo del Mes', margin, y);
  y += 5;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 22;

  const kpis = [
    { label: 'Ingresos Totales', val: formatCurrency(stats.income), color: [16, 185, 129], sub: 'Flujo positivo' },
    { label: 'Gastos Totales', val: formatCurrency(stats.expenses), color: [225, 29, 72], sub: `${stats.income > 0 ? Math.round((stats.expenses / stats.income) * 100) : 0}% de ingresos` },
    { label: 'Ahorro Neto Real', val: formatCurrency(stats.netSavings), color: [16, 185, 129], sub: 'Superávit final' },
    { label: 'Tasa de Ahorro', val: `${stats.savingsRate}%`, color: [14, 165, 233], sub: stats.savingsRate >= 20 ? 'Meta cumplida' : 'Objetivo: 20%' },
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + 3);
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    // Colored mini bar top
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.rect(x, y, cardWidth, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 2.5, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 2.5, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.sub, x + 2.5, y + 18.5);
  });

  y += cardHeight + 8;

  // Section 2: Diagnóstico Regla 50 / 30 / 20
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Diagnóstico del Método 50 / 30 / 20', margin, y);
  y += 5;

  const ruleColWidth = (pageWidth - margin * 2 - 6) / 3;
  const ruleCardHeight = 24;

  const ruleSections = [
    {
      name: 'Necesidades Básicas',
      target: '50%',
      actual: `${stats.needsPercentage}%`,
      amount: formatCurrency(stats.needsTotal),
      status: stats.needsPercentage <= 50 ? 'En Rango Óptimo' : 'Elevado (>50%)',
      color: [14, 165, 233],
    },
    {
      name: 'Deseos & Estilo de Vida',
      target: '30%',
      actual: `${stats.wantsPercentage}%`,
      amount: formatCurrency(stats.wantsTotal),
      status: stats.wantsPercentage <= 30 ? 'Bajo Control' : 'Atención (>30%)',
      color: [244, 63, 94],
    },
    {
      name: 'Ahorro & Metas',
      target: '20%',
      actual: `${stats.savingsPercentage}%`,
      amount: formatCurrency(stats.savingsTotal),
      status: stats.savingsPercentage >= 20 ? 'Excelente Rendimiento' : 'Por debajo del 20%',
      color: [16, 185, 129],
    },
  ];

  ruleSections.forEach((rule, idx) => {
    const x = margin + idx * (ruleColWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, ruleColWidth, ruleCardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(rule.name, x + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Real: ${rule.actual} (Objetivo: ${rule.target})`, x + 3, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(rule.color[0], rule.color[1], rule.color[2]);
    doc.text(rule.amount, x + 3, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Estado: ${rule.status}`, x + 3, y + 21.5);
  });

  y += ruleCardHeight + 8;

  // Section 3: Desglose por Categorías (Table)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Desglose de Gastos por Categoría', margin, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CATEGORÍA', margin + 3, y + 4.5);
  doc.text('GASTO REAL', margin + 70, y + 4.5);
  doc.text('% DEL TOTAL', margin + 110, y + 4.5);
  doc.text('LÍMITE PRESUPUESTO', margin + 140, y + 4.5);
  y += 6.5;

  // Rows
  const sortedCategories = [...stats.categoryBreakdown].sort((a, b) => b.amount - a.amount);

  sortedCategories.forEach((cat, index) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 16;
    }

    const budget = budgets.find((b) => b.category === cat.category);
    const budgetLimit = budget ? formatCurrency(budget.monthlyLimit) : 'Sin límite';
    const isOver = budget ? cat.amount > budget.monthlyLimit : false;

    // Alternate row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(cat.category, margin + 3, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(cat.amount), margin + 70, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.text(`${cat.percentage}%`, margin + 110, y + 4.2);

    if (isOver) {
      doc.setTextColor(225, 29, 72);
      doc.text(`${budgetLimit} (Excedido)`, margin + 140, y + 4.2);
    } else {
      doc.setTextColor(71, 85, 105);
      doc.text(budgetLimit, margin + 140, y + 4.2);
    }

    y += 6;
  });

  y += 6;

  // Section 4: Metas de Ahorro Activas
  if (goals.length > 0) {
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('4. Progreso de Alcancías & Metas de Ahorro', margin, y);
    y += 5;

    // Table header for goals
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('META', margin + 3, y + 4.5);
    doc.text('ACUMULADO', margin + 75, y + 4.5);
    doc.text('OBJETIVO', margin + 115, y + 4.5);
    doc.text('PROGRESO', margin + 155, y + 4.5);
    y += 6.5;

    goals.forEach((g, gIdx) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 16;
      }

      const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

      if (gIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(g.title, margin + 3, y + 4.2);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(formatCurrency(g.currentAmount), margin + 75, y + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(formatCurrency(g.targetAmount), margin + 115, y + 4.2);

      doc.setFont('helvetica', 'bold');
      doc.text(`${percent}%`, margin + 155, y + 4.2);

      y += 6;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Kakebo - Aplicación de Finanzas Personales & Gamificación para Jóvenes Adultos',
      margin,
      pageHeight - 7
    );
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  // Save the PDF
  const filename = `reporte_financiero_${selectedMonth}.pdf`;
  doc.save(filename);
}
