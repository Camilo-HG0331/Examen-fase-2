import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { ExamResult } from '../types';
import { getStudentClassification, StudentClassification } from '../components/Admin/ClassificationReportModal';

export interface PdfExportOptions {
  orientation?: 'landscape' | 'portrait';
  mode?: 'grouped' | 'consolidated'; // 'grouped': separate tables for Aprobados, Espera, Desaprobados. 'consolidated': single ranking table.
  filterGroup?: string; // 'ALL' or specific group 'A', 'B', 'C'
  filterClassification?: 'ALL' | StudentClassification;
  searchTerm?: string;
  reportTitle?: string;
}

export function generateClassifiedPdfReport(
  results: ExamResult[],
  options: PdfExportOptions = {}
): jsPDF {
  const {
    orientation = 'landscape',
    mode = 'grouped',
    filterGroup = 'ALL',
    filterClassification = 'ALL',
    searchTerm = '',
    reportTitle = 'Reporte Oficial de Aspirantes Clasificados por Orden de Puntaje',
  } = options;

  // 1. Sort all results strictly by overallScore descending (ranking)
  const rankedAll = [...results].sort((a, b) => {
    if (b.overallScore !== a.overallScore) {
      return b.overallScore - a.overallScore;
    }
    const bLog = b.scores.logica?.percentage ?? 0;
    const aLog = a.scores.logica?.percentage ?? 0;
    if (bLog !== aLog) return bLog - aLog;
    return a.candidate.fullName.localeCompare(b.candidate.fullName);
  });

  // Filter based on user criteria
  const filteredResults = rankedAll.filter((r) => {
    const cls = getStudentClassification(r);
    if (filterClassification !== 'ALL' && cls !== filterClassification) return false;
    if (filterGroup !== 'ALL' && r.candidate.assignedGroup !== filterGroup) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = r.candidate.fullName.toLowerCase().includes(q);
      const matchDoc = r.candidate.documentNumber.toLowerCase().includes(q);
      const matchEmail = r.candidate.email.toLowerCase().includes(q);
      if (!matchName && !matchDoc && !matchEmail) return false;
    }
    return true;
  });

  // Calculate Statistics
  let aprobadosCount = 0;
  let esperaCount = 0;
  let desaprobadosCount = 0;
  let sumScores = 0;

  filteredResults.forEach((r) => {
    const cls = getStudentClassification(r);
    if (cls === 'APROBADO') aprobadosCount++;
    else if (cls === 'LISTA_ESPERA') esperaCount++;
    else desaprobadosCount++;
    sumScores += r.overallScore;
  });

  const totalEvaluados = filteredResults.length;
  const avgScore = totalEvaluados > 0 ? Math.round(sumScores / totalEvaluados) : 0;
  const aprobadosPct = totalEvaluados > 0 ? Math.round((aprobadosCount / totalEvaluados) * 100) : 0;
  const esperaPct = totalEvaluados > 0 ? Math.round((esperaCount / totalEvaluados) * 100) : 0;
  const desaprobadosPct = totalEvaluados > 0 ? Math.round((desaprobadosCount / totalEvaluados) * 100) : 0;

  // 2. Initialize jsPDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Header drawing function for initial page
  const drawHeader = () => {
    // Top institutional accent band (SENA Green #39A900)
    doc.setFillColor(57, 169, 0);
    doc.rect(0, 0, pageWidth, 6, 'F');

    // Sub-band accent
    doc.setFillColor(6, 95, 70); // deep emerald
    doc.rect(0, 6, pageWidth, 1.5, 'F');

    // Title Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(6, 95, 70);
    doc.text('SERVICIO NACIONAL DE APRENDIZAJE - SENA', marginX, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    doc.text('Tecnología en Análisis y Desarrollo de Software (ADSO) · Convocatoria Fase 2', marginX, 21.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(reportTitle, marginX, 27.5);

    // Filter subtitle if applicable
    const groupSubtitle = filterGroup !== 'ALL' ? `Grupo: ${filterGroup}  ·  ` : 'Todos los Grupos  ·  ';
    const classSubtitle = filterClassification !== 'ALL' ? `Filtro: ${filterClassification}  ·  ` : '';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text(`${groupSubtitle}${classSubtitle}Total en reporte: ${totalEvaluados} aspirantes`, marginX, 32.5);

    // Right-side emission date box
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Fecha de emisión:', pageWidth - marginX - 45, 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(dateStr, pageWidth - marginX - 45, 22);

    // Horizontal divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(marginX, 35, pageWidth - marginX, 35);
  };

  drawHeader();

  // 3. Executive KPI Summary Table
  const summaryHead = [
    ['Total Evaluados', 'Aprobados (Admitidos)', 'En Lista de Espera', 'Desaprobados', 'Promedio General'],
  ];
  const summaryBody = [
    [
      `${totalEvaluados} aspirantes`,
      `${aprobadosCount} (${aprobadosPct}%)`,
      `${esperaCount} (${esperaPct}%)`,
      `${desaprobadosCount} (${desaprobadosPct}%)`,
      `${avgScore}%`,
    ],
  ];

  autoTable(doc, {
    startY: 38,
    head: summaryHead,
    body: summaryBody,
    theme: 'plain',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [55, 65, 81],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [17, 24, 39],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { textColor: [31, 41, 55] },
      1: { textColor: [21, 128, 61], fillColor: [240, 253, 244] }, // green text & subtle bg
      2: { textColor: [180, 83, 9], fillColor: [254, 243, 199] }, // amber text & subtle bg
      3: { textColor: [185, 28, 28], fillColor: [254, 242, 242] }, // red text & subtle bg
      4: { textColor: [15, 23, 42] },
    },
    tableLineColor: [209, 213, 219],
    tableLineWidth: 0.3,
    margin: { left: marginX, right: marginX },
  });

  let currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 6 : 52;

  // Helper to build row array for an ExamResult
  const buildResultRow = (r: ExamResult, customIndex?: number) => {
    const globalRank = rankedAll.findIndex((x) => x.id === r.id) + 1;
    const rankLabel = customIndex !== undefined ? `#${customIndex} (Gral #${globalRank})` : `#${globalRank}`;
    const cls = getStudentClassification(r);
    const clsLabel =
      cls === 'APROBADO'
        ? 'APROBADO'
        : cls === 'LISTA_ESPERA'
        ? 'LISTA DE ESPERA'
        : 'DESAPROBADO';

    return [
      rankLabel,
      r.candidate.fullName,
      `${r.candidate.documentType} ${r.candidate.documentNumber}`,
      r.candidate.email,
      `Grupo ${r.candidate.assignedGroup}`,
      `${r.overallScore}%`,
      clsLabel,
      `${r.scores.logica?.percentage ?? 0}%`,
      `${r.scores.matematicas?.percentage ?? 0}%`,
      `${r.scores.comprension?.percentage ?? 0}%`,
      `${r.scores.psicologico?.percentage ?? 0}%`,
    ];
  };

  // Base Table Options for crisp readability
  const baseTableHead = [
    [
      'Puesto',
      'Aspirante',
      'Documento',
      'Correo Electrónico',
      'Grupo',
      'Puntaje',
      'Clasificación',
      'Lógica',
      'Matem.',
      'Lectura',
      'Psicol.',
    ],
  ];

  const getColumnStyles = (isLandscape: boolean): { [key: number]: any } => {
    if (isLandscape) {
      return {
        0: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 54, fontStyle: 'bold' },
        2: { halign: 'left', cellWidth: 28 },
        3: { halign: 'left', cellWidth: 44 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 15 },
        8: { halign: 'center', cellWidth: 15 },
        9: { halign: 'center', cellWidth: 15 },
        10: { halign: 'center', cellWidth: 15 },
      };
    } else {
      return {
        0: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 40, fontStyle: 'bold' },
        2: { halign: 'left', cellWidth: 22 },
        3: { halign: 'left', cellWidth: 32 },
        4: { halign: 'center', cellWidth: 14 },
        5: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 11 },
        8: { halign: 'center', cellWidth: 11 },
        9: { halign: 'center', cellWidth: 11 },
        10: { halign: 'center', cellWidth: 11 },
      };
    }
  };

  const isLandscape = orientation === 'landscape';

  if (mode === 'grouped') {
    // -------------------------------------------------------------
    // SEPARATE READABLE TABLES PER CLASSIFICATION
    // -------------------------------------------------------------
    const aprobadosList = filteredResults.filter((r) => getStudentClassification(r) === 'APROBADO');
    const esperaList = filteredResults.filter((r) => getStudentClassification(r) === 'LISTA_ESPERA');
    const desaprobadosList = filteredResults.filter((r) => getStudentClassification(r) === 'DESAPROBADO');

    // Section 1: Aprobados Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(21, 128, 61); // Green
    doc.text(`1. TABLA DE ASPIRANTES APROBADOS (ADMITIDOS) — Total: ${aprobadosList.length}`, marginX, currentY);
    currentY += 2.5;

    const aprobadosBody =
      aprobadosList.length > 0
        ? aprobadosList.map((r, i) => buildResultRow(r, i + 1))
        : [['-', 'Sin aspirantes registrados en esta categoría', '-', '-', '-', '-', '-', '-', '-', '-', '-']];

    autoTable(doc, {
      startY: currentY,
      head: baseTableHead,
      body: aprobadosBody,
      theme: 'grid',
      headStyles: {
        fillColor: [57, 169, 0], // SENA Green
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 7.2,
        cellPadding: 1.6,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244], // very light green
      },
      columnStyles: getColumnStyles(isLandscape),
      margin: { left: marginX, right: marginX },
      pageBreak: 'auto',
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // Check space on page or add page break for Section 2
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 20;
    }

    // Section 2: Lista de Espera Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(180, 83, 9); // Amber
    doc.text(`2. TABLA DE ASPIRANTES EN LISTA DE ESPERA — Total: ${esperaList.length}`, marginX, currentY);
    currentY += 2.5;

    const esperaBody =
      esperaList.length > 0
        ? esperaList.map((r, i) => buildResultRow(r, i + 1))
        : [['-', 'Sin aspirantes registrados en esta categoría', '-', '-', '-', '-', '-', '-', '-', '-', '-']];

    autoTable(doc, {
      startY: currentY,
      head: baseTableHead,
      body: esperaBody,
      theme: 'grid',
      headStyles: {
        fillColor: [217, 119, 6], // Warm Amber
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 7.2,
        cellPadding: 1.6,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [254, 243, 199], // light amber
      },
      columnStyles: getColumnStyles(isLandscape),
      margin: { left: marginX, right: marginX },
      pageBreak: 'auto',
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // Check space on page or add page break for Section 3
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 20;
    }

    // Section 3: Desaprobados Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(185, 28, 28); // Red
    doc.text(`3. TABLA DE ASPIRANTES DESAPROBADOS (NO ADMITIDOS) — Total: ${desaprobadosList.length}`, marginX, currentY);
    currentY += 2.5;

    const desaprobadosBody =
      desaprobadosList.length > 0
        ? desaprobadosList.map((r, i) => buildResultRow(r, i + 1))
        : [['-', 'Sin aspirantes registrados en esta categoría', '-', '-', '-', '-', '-', '-', '-', '-', '-']];

    autoTable(doc, {
      startY: currentY,
      head: baseTableHead,
      body: desaprobadosBody,
      theme: 'grid',
      headStyles: {
        fillColor: [75, 85, 99], // Charcoal slate with subtle red undertone for professional look
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 7.2,
        cellPadding: 1.6,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242], // light rose
      },
      columnStyles: getColumnStyles(isLandscape),
      margin: { left: marginX, right: marginX },
      pageBreak: 'auto',
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;
  } else {
    // -------------------------------------------------------------
    // CONSOLIDATED RANKING TABLE (1 to N)
    // -------------------------------------------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(6, 95, 70);
    doc.text(`TABLA GENERAL CONSOLIDADA DE ASPIRANTES (RANKING DE MÉRITO) — Total: ${filteredResults.length}`, marginX, currentY);
    currentY += 2.5;

    const consolidatedBody =
      filteredResults.length > 0
        ? filteredResults.map((r) => buildResultRow(r))
        : [['-', 'Sin registros que coincidan con la búsqueda', '-', '-', '-', '-', '-', '-', '-', '-', '-']];

    autoTable(doc, {
      startY: currentY,
      head: baseTableHead,
      body: consolidatedBody,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 95, 70], // Emerald
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 7.2,
        cellPadding: 1.6,
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: getColumnStyles(isLandscape),
      margin: { left: marginX, right: marginX },
      didParseCell: (data) => {
        // Highlight Classification Column (Col 6)
        if (data.section === 'body' && data.column.index === 6) {
          const val = String(data.cell.raw);
          if (val === 'APROBADO') {
            data.cell.styles.textColor = [21, 128, 61];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'LISTA DE ESPERA') {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'DESAPROBADO') {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      pageBreak: 'auto',
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // Check if signatures fit on current page or require new page
  if (currentY > pageHeight - 32) {
    doc.addPage();
    currentY = 25;
  }

  // Signatures Section
  const signatureY = currentY + 10;
  const col1X = marginX + 30;
  const col2X = pageWidth - marginX - 90;

  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.4);

  // Line 1
  doc.line(col1X, signatureY, col1X + 60, signatureY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  doc.text('Comité de Selección y Admisión', col1X + 30, signatureY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Centro de Formación SENA', col1X + 30, signatureY + 7.5, { align: 'center' });

  // Line 2
  doc.line(col2X, signatureY, col2X + 60, signatureY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  doc.text('Coordinación Académica ADSO', col2X + 30, signatureY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text('Programa Análisis y Desarrollo de Software', col2X + 30, signatureY + 7.5, { align: 'center' });

  // Add Page Numbers to ALL pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Bottom subtle line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(marginX, pageHeight - 10, pageWidth - marginX, pageHeight - 10);

    // Footer Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      'SENA · Sistema Automatizado de Evaluación Fase 2 ADSO · Documento Oficial con Validez Institucional',
      marginX,
      pageHeight - 6
    );

    // Page Number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 6, { align: 'right' });
  }

  return doc;
}
