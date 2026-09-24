import React, { useState, useMemo } from 'react';
import { ExamResult } from '../../types';
import {
  X,
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Award,
  ArrowUpDown,
  FileText,
  Loader2,
  Table,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { SenaLogo } from '../SenaLogo';
import { generateClassifiedPdfReport } from '../../utils/pdfReportGenerator';

export type StudentClassification = 'APROBADO' | 'LISTA_ESPERA' | 'DESAPROBADO';

export interface ClassificationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ExamResult[];
}

export function getStudentClassification(r: ExamResult): StudentClassification {
  if (r.admissionDecision === 'LISTA_ESPERA') {
    return 'LISTA_ESPERA';
  }
  if (r.admissionDecision === 'ADMITIDO') {
    return 'APROBADO';
  }
  if (r.admissionDecision === 'NO_ADMITIDO') {
    return 'DESAPROBADO';
  }
  // Default based on overall score (threshold 70%)
  return (r.status === 'APROBADO' || r.overallScore >= 70) ? 'APROBADO' : 'DESAPROBADO';
}

export const ClassificationReportModal: React.FC<ClassificationReportModalProps> = ({
  isOpen,
  onClose,
  results,
}) => {
  const [filterClassification, setFilterClassification] = useState<'ALL' | StudentClassification>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // PDF Export & Display Configuration
  const [exportMode, setExportMode] = useState<'grouped' | 'consolidated'>('grouped');
  const [exportOrientation, setExportOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [viewMode, setViewMode] = useState<'grouped' | 'consolidated'>('grouped');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessNotice, setPdfSuccessNotice] = useState(false);

  // 1. Sort all results strictly by overallScore descending (ranking)
  const rankedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      // Secondary sort: logic score
      const bLogica = b.scores.logica?.percentage ?? 0;
      const aLogica = a.scores.logica?.percentage ?? 0;
      if (bLogica !== aLogica) {
        return bLogica - aLogica;
      }
      return a.candidate.fullName.localeCompare(b.candidate.fullName);
    });
  }, [results]);

  // Overall Statistics across ALL candidates
  const totalStats = useMemo(() => {
    let aprobados = 0;
    let enEspera = 0;
    let desaprobados = 0;
    let sumScore = 0;

    rankedResults.forEach((r) => {
      const cls = getStudentClassification(r);
      if (cls === 'APROBADO') aprobados++;
      else if (cls === 'LISTA_ESPERA') enEspera++;
      else desaprobados++;
      sumScore += r.overallScore;
    });

    const total = rankedResults.length;
    const avg = total > 0 ? Math.round(sumScore / total) : 0;

    return {
      total,
      aprobados,
      enEspera,
      desaprobados,
      averageScore: avg,
      aprobadosPct: total > 0 ? Math.round((aprobados / total) * 100) : 0,
      enEsperaPct: total > 0 ? Math.round((enEspera / total) * 100) : 0,
      desaprobadosPct: total > 0 ? Math.round((desaprobados / total) * 100) : 0,
    };
  }, [rankedResults]);

  // Filtered List based on user selection
  const filteredList = useMemo(() => {
    return rankedResults.filter((r) => {
      const cls = getStudentClassification(r);

      if (filterClassification !== 'ALL' && cls !== filterClassification) {
        return false;
      }

      if (filterGroup !== 'ALL' && r.candidate.assignedGroup !== filterGroup) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = r.candidate.fullName.toLowerCase().includes(query);
        const matchDoc = r.candidate.documentNumber.toLowerCase().includes(query);
        const matchEmail = r.candidate.email.toLowerCase().includes(query);
        if (!matchName && !matchDoc && !matchEmail) return false;
      }

      return true;
    });
  }, [rankedResults, filterClassification, filterGroup, searchTerm]);

  // Subdivided lists for grouped table views
  const aprobadosGrouped = useMemo(
    () => filteredList.filter((r) => getStudentClassification(r) === 'APROBADO'),
    [filteredList]
  );
  const esperaGrouped = useMemo(
    () => filteredList.filter((r) => getStudentClassification(r) === 'LISTA_ESPERA'),
    [filteredList]
  );
  const desaprobadosGrouped = useMemo(
    () => filteredList.filter((r) => getStudentClassification(r) === 'DESAPROBADO'),
    [filteredList]
  );

  if (!isOpen) return null;

  // Direct PDF Export Handler (downloads real .pdf file)
  const handleDownloadPdf = async (customMode?: 'grouped' | 'consolidated') => {
    try {
      setIsGeneratingPdf(true);
      const targetMode = customMode || exportMode;
      const doc = generateClassifiedPdfReport(results, {
        orientation: exportOrientation,
        mode: targetMode,
        filterGroup,
        filterClassification,
        searchTerm,
        reportTitle:
          targetMode === 'grouped'
            ? 'Reporte Oficial de Aspirantes Clasificados en Tablas por Criterio'
            : 'Reporte General Consolidado de Aspirantes por Ranking de Mérito',
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const filename = `Reporte-Clasificacion-Estudiantes-SENA-ADSO-${targetMode}-${todayStr}.pdf`;
      doc.save(filename);

      setPdfSuccessNotice(true);
      setTimeout(() => setPdfSuccessNotice(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Ocurrió un error al generar el archivo PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export CSV Handler (UTF-8 BOM for Microsoft Excel)
  const handleExportCsv = () => {
    if (filteredList.length === 0) {
      alert('No hay registros para exportar en este criterio.');
      return;
    }

    const headers = [
      'Puesto_Ranking',
      'Clasificacion_Final',
      'Puntaje_Global_%',
      'Estado_Examen',
      'Aspirante',
      'Tipo_Documento',
      'Numero_Documento',
      'Correo_Electronico',
      'Grupo_Estudiantes',
      'Logica_%',
      'Matematicas_%',
      'Comprension_Lectora_%',
      'Test_Psicologico_%',
      'Fecha_Evaluacion',
      'ID_Registro'
    ];

    const rows = filteredList.map((r) => {
      const globalRank = rankedResults.findIndex((x) => x.id === r.id) + 1;
      const cls = getStudentClassification(r);
      const clsLabel =
        cls === 'APROBADO'
          ? 'APROBADO (ADMITIDO)'
          : cls === 'LISTA_ESPERA'
          ? 'EN LISTA DE ESPERA'
          : 'DESAPROBADO (NO ADMITIDO)';

      return [
        globalRank,
        `"${clsLabel}"`,
        r.overallScore,
        `"${r.status}"`,
        `"${r.candidate.fullName.replace(/"/g, '""')}"`,
        `"${r.candidate.documentType}"`,
        `"${r.candidate.documentNumber}"`,
        `"${r.candidate.email}"`,
        `"Grupo ${r.candidate.assignedGroup}"`,
        r.scores.logica?.percentage ?? 0,
        r.scores.matematicas?.percentage ?? 0,
        r.scores.comprension?.percentage ?? 0,
        r.scores.psicologico?.percentage ?? 0,
        `"${new Date(r.completedAt).toLocaleString('es-CO')}"`,
        `"${r.id}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-estudiantes-adso-clasificado-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export / Print PDF Handler via Browser
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor autorice las ventanas emergentes para generar la impresión del reporte.');
      return;
    }

    const todayDate = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const renderTableHtml = (list: ExamResult[], tableTitle: string, headerBg: string) => {
      if (list.length === 0) {
        return `
        <div style="margin-top:16px;margin-bottom:20px;">
          <div style="background:${headerBg};color:#fff;padding:6px 12px;border-radius:6px;font-weight:bold;font-size:12px;text-transform:uppercase;">
            ${tableTitle} (0 registros)
          </div>
          <p style="font-size:11px;color:#666;font-style:italic;padding:8px 0;">No hay aspirantes registrados en esta clasificación para los filtros aplicados.</p>
        </div>`;
      }

      const rows = list
        .map((r, idx) => {
          const globalRank = rankedResults.findIndex((x) => x.id === r.id) + 1;
          const cls = getStudentClassification(r);
          const clsBadge =
            cls === 'APROBADO'
              ? '<span style="background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7;padding:2px 7px;border-radius:10px;font-weight:bold;font-size:9.5px;">APROBADO</span>'
              : cls === 'LISTA_ESPERA'
              ? '<span style="background:#fff8e1;color:#b78103;border:1px solid #ffe082;padding:2px 7px;border-radius:10px;font-weight:bold;font-size:9.5px;">LISTA ESPERA</span>'
              : '<span style="background:#ffebee;color:#b71c1c;border:1px solid #ffcdd2;padding:2px 7px;border-radius:10px;font-weight:bold;font-size:9.5px;">DESAPROBADO</span>';

          return `
          <tr>
            <td style="text-align:center;font-weight:bold;padding:6px 4px;">#${idx + 1} <span style="font-size:9px;color:#777;">(Gral #${globalRank})</span></td>
            <td style="padding:6px 8px;">
              <strong>${r.candidate.fullName}</strong><br/>
              <span style="font-size:9.5px;color:#555;">${r.candidate.documentType} ${r.candidate.documentNumber} &bull; ${r.candidate.email}</span>
            </td>
            <td style="text-align:center;padding:6px;">Grupo ${r.candidate.assignedGroup}</td>
            <td style="text-align:center;font-weight:bold;font-size:12px;padding:6px;">${r.overallScore}%</td>
            <td style="text-align:center;padding:6px;">${clsBadge}</td>
            <td style="text-align:center;padding:6px;font-size:10px;">${r.scores.logica?.percentage ?? 0}%</td>
            <td style="text-align:center;padding:6px;font-size:10px;">${r.scores.matematicas?.percentage ?? 0}%</td>
            <td style="text-align:center;padding:6px;font-size:10px;">${r.scores.comprension?.percentage ?? 0}%</td>
            <td style="text-align:center;padding:6px;font-size:10px;">${r.scores.psicologico?.percentage ?? 0}%</td>
          </tr>`;
        })
        .join('');

      return `
      <div style="margin-top:18px;margin-bottom:20px;page-break-inside:avoid;">
        <div style="background:${headerBg};color:#fff;padding:6px 12px;border-radius:6px;font-weight:bold;font-size:12px;text-transform:uppercase;margin-bottom:6px;">
          ${tableTitle} — Total: ${list.length} aspirantes
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:10.5px;">
          <thead>
            <tr>
              <th style="width:65px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px 4px;border:1px solid #d1d5db;text-align:center;">Puesto</th>
              <th style="background:#f3f4f6;color:#374151;font-weight:bold;padding:6px 8px;border:1px solid #d1d5db;text-align:left;">Aspirante / Documento</th>
              <th style="width:70px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px;border:1px solid #d1d5db;text-align:center;">Grupo</th>
              <th style="width:65px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px;border:1px solid #d1d5db;text-align:center;">Puntaje</th>
              <th style="width:95px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px;border:1px solid #d1d5db;text-align:center;">Clasificación</th>
              <th style="width:45px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px;border:1px solid #d1d5db;text-align:center;">Lógica</th>
              <th style="width:45px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px;border:1px solid #d1d5db;text-align:center;">Matem.</th>
              <th style="width:45px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px;border:1px solid #d1d5db;text-align:center;">Lectura</th>
              <th style="width:45px;background:#f3f4f6;color:#374151;font-weight:bold;padding:6px;border:1px solid #d1d5db;text-align:center;">Psicol.</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>`;
    };

    let tablesHtml = '';
    if (exportMode === 'grouped') {
      tablesHtml += renderTableHtml(aprobadosGrouped, '1. TABLA DE ASPIRANTES APROBADOS (ADMITIDOS)', '#39A900');
      tablesHtml += renderTableHtml(esperaGrouped, '2. TABLA DE ASPIRANTES EN LISTA DE ESPERA', '#d97706');
      tablesHtml += renderTableHtml(desaprobadosGrouped, '3. TABLA DE ASPIRANTES DESAPROBADOS (NO ADMITIDOS)', '#4b5563');
    } else {
      tablesHtml += renderTableHtml(filteredList, 'TABLA GENERAL CONSOLIDADA DE ASPIRANTES (RANKING DE MÉRITO)', '#065f46');
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Reporte Oficial Clasificado en Tablas - SENA ADSO Fase 2</title>
  <style>
    @page { size: landscape; margin: 10mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1f2937; margin: 15px; line-height: 1.4; }
    .header-box { display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #39A900; padding-bottom: 12px; margin-bottom: 14px; }
    .header-title h1 { margin: 0; font-size: 17px; color: #065f46; text-transform: uppercase; }
    .header-title p { margin: 2px 0 0; font-size: 11.5px; color: #4b5563; }
    .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 14px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 7px 10px; text-align: center; }
    .summary-card strong { display: block; font-size: 15px; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    th { border: 1px solid #d1d5db; }
    td { border: 1px solid #e5e7eb; }
    tr:nth-child(even) { background-color: #fafafa; }
    .footer { margin-top: 30px; display: flex; justify-content: space-around; font-size: 11px; text-align: center; page-break-inside: avoid; }
    .signature-line { width: 220px; border-top: 1px solid #9ca3af; margin: 36px auto 4px; }
    @media print {
      body { margin: 8mm; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="header-title">
      <h1>Servicio Nacional de Aprendizaje - SENA</h1>
      <p><strong>Tecnología en Análisis y Desarrollo de Software (ADSO) · Fase 2</strong></p>
      <p><strong>Reporte Oficial de Aspirantes Clasificados Ordenados por Puntaje en Tablas</strong></p>
    </div>
    <div style="text-align: right; font-size: 10.5px; color: #6b7280;">
      <div>Fecha de Emisión:</div>
      <strong>${todayDate}</strong>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <span style="font-size:9.5px;color:#6b7280;text-transform:uppercase;">Total Evaluados</span>
      <strong style="color:#111827;">${totalStats.total}</strong>
    </div>
    <div class="summary-card" style="background:#f0fdf4;border-color:#bbf7d0;">
      <span style="font-size:9.5px;color:#166534;text-transform:uppercase;">Aprobados (Admitidos)</span>
      <strong style="color:#15803d;">${totalStats.aprobados} (${totalStats.aprobadosPct}%)</strong>
    </div>
    <div class="summary-card" style="background:#fffbeb;border-color:#fde68a;">
      <span style="font-size:9.5px;color:#854d0e;text-transform:uppercase;">Lista de Espera</span>
      <strong style="color:#b45309;">${totalStats.enEspera} (${totalStats.enEsperaPct}%)</strong>
    </div>
    <div class="summary-card" style="background:#fef2f2;border-color:#fecaca;">
      <span style="font-size:9.5px;color:#991b1b;text-transform:uppercase;">Desaprobados</span>
      <strong style="color:#b91c1c;">${totalStats.desaprobados} (${totalStats.desaprobadosPct}%)</strong>
    </div>
    <div class="summary-card">
      <span style="font-size:9.5px;color:#6b7280;text-transform:uppercase;">Promedio General</span>
      <strong style="color:#0f172a;">${totalStats.averageScore}%</strong>
    </div>
  </div>

  ${tablesHtml}

  <div class="footer">
    <div>
      <div class="signature-line"></div>
      <strong>Comité de Selección y Admisión</strong><br/>
      Centro de Formación SENA
    </div>
    <div>
      <div class="signature-line"></div>
      <strong>Coordinación Académica</strong><br/>
      Tecnología ADSO
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Helper row renderer for on-screen tables
  const renderRow = (r: ExamResult, customIndex?: number) => {
    const globalRank = rankedResults.findIndex((x) => x.id === r.id) + 1;
    const cls = getStudentClassification(r);

    return (
      <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors border-b border-gray-100">
        {/* Puesto */}
        <td className="py-2.5 px-3 text-center w-16">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black ${
              customIndex === 1 || (!customIndex && globalRank === 1)
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : customIndex === 2 || (!customIndex && globalRank === 2)
                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                : customIndex === 3 || (!customIndex && globalRank === 3)
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            #{customIndex ?? globalRank}
          </span>
          {customIndex && customIndex !== globalRank && (
            <span className="block text-[9px] text-gray-400 mt-0.5">Gral #{globalRank}</span>
          )}
        </td>

        {/* Aspirante */}
        <td className="py-2.5 px-4">
          <div className="font-bold text-gray-900 text-xs sm:text-[13px]">
            {r.candidate.fullName}
          </div>
          <div className="text-[11px] text-gray-500">
            {r.candidate.documentType} {r.candidate.documentNumber} · {r.candidate.email}
          </div>
        </td>

        {/* Grupo */}
        <td className="py-2.5 px-3 text-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Grupo {r.candidate.assignedGroup}
          </span>
        </td>

        {/* Puntaje Global */}
        <td className="py-2.5 px-3 text-center">
          <div className="inline-flex flex-col items-center">
            <span className="text-sm font-black text-gray-900">
              {r.overallScore}%
            </span>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full ${
                  r.overallScore >= 70
                    ? 'bg-emerald-600'
                    : r.overallScore >= 60
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${r.overallScore}%` }}
              />
            </div>
          </div>
        </td>

        {/* Clasificación Badge */}
        <td className="py-2.5 px-3 text-center">
          {cls === 'APROBADO' ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>APROBADO</span>
            </span>
          ) : cls === 'LISTA_ESPERA' ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="w-3 h-3 text-amber-700" />
              <span>LISTA DE ESPERA</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-100 text-red-800 border border-red-300">
              <XCircle className="w-3 h-3 text-red-700" />
              <span>DESAPROBADO</span>
            </span>
          )}
        </td>

        {/* Desglose de Competencias */}
        <td className="py-2.5 px-2 text-center font-bold text-blue-700 text-xs">
          {r.scores.logica?.percentage ?? 0}%
        </td>
        <td className="py-2.5 px-2 text-center font-bold text-purple-700 text-xs">
          {r.scores.matematicas?.percentage ?? 0}%
        </td>
        <td className="py-2.5 px-2 text-center font-bold text-amber-700 text-xs">
          {r.scores.comprension?.percentage ?? 0}%
        </td>
        <td className="py-2.5 px-2 text-center font-bold text-emerald-700 text-xs">
          {r.scores.psicologico?.percentage ?? 0}%
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Oficial */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <SenaLogo className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-700/70 text-emerald-100 mb-1">
                <Award className="w-3 h-3 text-emerald-300" />
                <span>Reporte Oficial de Clasificación · Fase 2 ADSO</span>
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight">
                Exportación de Aspirantes Clasificados en PDF
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 mt-0.5">
                Organizado de forma legible en tablas separadas por <strong>Aprobados (Admitidos)</strong>, <strong>En Lista de Espera</strong> y <strong>Desaprobados</strong>, ordenados descendentemente por puntaje.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 sm:p-4 bg-gray-50 border-b border-gray-200 text-xs shrink-0">
          {/* Total Evaluados */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Total Evaluados
            </span>
            <span className="text-base sm:text-lg font-black text-gray-900 mt-0.5 block">
              {totalStats.total}
            </span>
            <span className="text-[10px] text-gray-500">Aspirantes evaluados</span>
          </div>

          {/* Aprobados */}
          <div
            onClick={() => setFilterClassification(filterClassification === 'APROBADO' ? 'ALL' : 'APROBADO')}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
              filterClassification === 'APROBADO'
                ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500'
                : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Aprobados</span>
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-700 mt-0.5 block">
              {totalStats.aprobados}{' '}
              <span className="text-[11px] font-semibold text-emerald-600">
                ({totalStats.aprobadosPct}%)
              </span>
            </span>
            <span className="text-[10px] text-emerald-700">Puntaje ≥ 70% / Admitidos</span>
          </div>

          {/* En Lista de Espera */}
          <div
            onClick={() => setFilterClassification(filterClassification === 'LISTA_ESPERA' ? 'ALL' : 'LISTA_ESPERA')}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
              filterClassification === 'LISTA_ESPERA'
                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-500'
                : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Lista de Espera</span>
            </span>
            <span className="text-base sm:text-lg font-black text-amber-700 mt-0.5 block">
              {totalStats.enEspera}{' '}
              <span className="text-[11px] font-semibold text-amber-600">
                ({totalStats.enEsperaPct}%)
              </span>
            </span>
            <span className="text-[10px] text-amber-700">Pendientes de cupo</span>
          </div>

          {/* Desaprobados */}
          <div
            onClick={() => setFilterClassification(filterClassification === 'DESAPROBADO' ? 'ALL' : 'DESAPROBADO')}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
              filterClassification === 'DESAPROBADO'
                ? 'bg-red-100 border-red-400 ring-2 ring-red-500'
                : 'bg-red-50/50 border-red-200 hover:bg-red-50'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-red-800 flex items-center space-x-1">
              <XCircle className="w-3 h-3 text-red-600" />
              <span>Desaprobados</span>
            </span>
            <span className="text-base sm:text-lg font-black text-red-700 mt-0.5 block">
              {totalStats.desaprobados}{' '}
              <span className="text-[11px] font-semibold text-red-600">
                ({totalStats.desaprobadosPct}%)
              </span>
            </span>
            <span className="text-[10px] text-red-700">Puntaje &lt; 70%</span>
          </div>

          {/* Promedio General */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Promedio Cohorte
            </span>
            <span className="text-base sm:text-lg font-black text-slate-800 mt-0.5 block">
              {totalStats.averageScore}%
            </span>
            <span className="text-[10px] text-gray-500">Nota global promedio</span>
          </div>
        </div>

        {/* PDF Configuration & Action Toolbar */}
        <div className="p-3 sm:p-3.5 bg-white border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 text-xs">
          {/* Left: Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por aspirante, cédula..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Classification Filter Select */}
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value as any)}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="APROBADO">Aprobados ({totalStats.aprobados})</option>
              <option value="LISTA_ESPERA">En Lista de Espera ({totalStats.enEspera})</option>
              <option value="DESAPROBADO">Desaprobados ({totalStats.desaprobados})</option>
            </select>

            {/* Group Filter Select */}
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="ALL">Todos los Grupos</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
              <option value="C">Grupo C</option>
            </select>

            {/* View Mode Toggle (Tablas separadas vs Ranking consolidado) */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all ${
                  viewMode === 'grouped'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Ver tablas separadas por cada clasificación"
              >
                <Layers className="w-3 h-3" />
                <span>Tablas Clasificadas</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('consolidated')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1 transition-all ${
                  viewMode === 'consolidated'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Ver tabla única con todo el ranking consolidado"
              >
                <Table className="w-3 h-3" />
                <span>Tabla General</span>
              </button>
            </div>
          </div>

          {/* Right: PDF Export Options & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* PDF Format options */}
            <div className="flex items-center space-x-1.5 bg-emerald-50/70 border border-emerald-200/80 px-2 py-1 rounded-lg">
              <span className="text-[10.5px] font-bold text-emerald-900">PDF:</span>
              <select
                value={exportMode}
                onChange={(e) => setExportMode(e.target.value as any)}
                className="bg-white border border-emerald-300 rounded text-[11px] font-medium text-emerald-950 px-1.5 py-0.5 focus:outline-none"
                title="Estructura de tablas para el documento PDF"
              >
                <option value="grouped">Tablas Separadas</option>
                <option value="consolidated">Tabla Única General</option>
              </select>
              <select
                value={exportOrientation}
                onChange={(e) => setExportOrientation(e.target.value as any)}
                className="bg-white border border-emerald-300 rounded text-[11px] font-medium text-emerald-950 px-1.5 py-0.5 focus:outline-none"
                title="Orientación de hoja para el documento PDF"
              >
                <option value="landscape">Horizontal (A4)</option>
                <option value="portrait">Vertical (A4)</option>
              </select>
            </div>

            {/* MAIN PDF EXPORT BUTTON */}
            <button
              id="export-pdf-classified-btn"
              type="button"
              disabled={isGeneratingPdf}
              onClick={() => handleDownloadPdf()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 active:scale-98 text-white font-bold shadow-xs transition-all disabled:opacity-50"
              title="Descargar archivo PDF oficial con las tablas ordenadas por puntaje"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <FileText className="w-4 h-4 text-red-200" />
              )}
              <span>{isGeneratingPdf ? 'Generando...' : 'Exportar PDF'}</span>
            </button>

            {/* Print / Save as PDF Button */}
            <button
              id="print-report-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold shadow-2xs transition-colors"
              title="Imprimir o previsualizar documento PDF del navegador"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-700" />
              <span>Imprimir</span>
            </button>

            {/* Export CSV Button */}
            <button
              id="export-report-csv-btn"
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold shadow-2xs transition-colors"
              title="Exportar archivo Excel / CSV ordenado"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Success Alert when PDF is downloaded */}
        {pdfSuccessNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-900 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>¡Reporte oficial en PDF generado y descargado exitosamente con tablas ordenadas por puntaje!</span>
            </div>
            <button
              type="button"
              onClick={() => setPdfSuccessNotice(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Table Content (Scrollable) */}
        <div className="overflow-y-auto flex-1 p-4 bg-gray-50/50 space-y-6">
          {viewMode === 'grouped' ? (
            /* -------------------------------------------------------------
               VIEW MODE: SEPARATE CLASSIFICATION TABLES
            ------------------------------------------------------------- */
            <>
              {/* Tabla 1: Aspirantes Aprobados */}
              {(filterClassification === 'ALL' || filterClassification === 'APROBADO') && (
                <div className="bg-white rounded-xl border border-emerald-200 shadow-xs overflow-hidden">
                  <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                        1. Tabla de Aspirantes Aprobados (Admitidos)
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-[11px] font-bold text-emerald-100">
                        {aprobadosGrouped.length} admitidos ({totalStats.aprobadosPct}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf('grouped')}
                        className="text-[11px] text-emerald-100 hover:text-white underline font-semibold flex items-center space-x-1"
                        title="Exportar en PDF con tablas separadas"
                      >
                        <FileText className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-emerald-50/80 border-b border-emerald-100 text-emerald-950 uppercase font-semibold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-16">Puesto</th>
                          <th className="py-2.5 px-4">Aspirante / Documento</th>
                          <th className="py-2.5 px-3 text-center">Grupo</th>
                          <th className="py-2.5 px-3 text-center font-bold text-gray-900">Puntaje Global</th>
                          <th className="py-2.5 px-3 text-center">Clasificación</th>
                          <th className="py-2.5 px-2 text-center text-blue-800">Lógica</th>
                          <th className="py-2.5 px-2 text-center text-purple-800">Matemáticas</th>
                          <th className="py-2.5 px-2 text-center text-amber-800">Lectura</th>
                          <th className="py-2.5 px-2 text-center text-emerald-800">Psicológico</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {aprobadosGrouped.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-6 text-center text-gray-500 italic text-xs">
                              No hay aspirantes aprobados que coincidan con la búsqueda o filtro aplicado.
                            </td>
                          </tr>
                        ) : (
                          aprobadosGrouped.map((r, i) => renderRow(r, i + 1))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tabla 2: Aspirantes en Lista de Espera */}
              {(filterClassification === 'ALL' || filterClassification === 'LISTA_ESPERA') && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                  <div className="bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-200" />
                      <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                        2. Tabla de Aspirantes en Lista de Espera
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-700 text-[11px] font-bold text-amber-100">
                      {esperaGrouped.length} en espera ({totalStats.enEsperaPct}%)
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-amber-50/80 border-b border-amber-100 text-amber-950 uppercase font-semibold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-16">Puesto</th>
                          <th className="py-2.5 px-4">Aspirante / Documento</th>
                          <th className="py-2.5 px-3 text-center">Grupo</th>
                          <th className="py-2.5 px-3 text-center font-bold text-gray-900">Puntaje Global</th>
                          <th className="py-2.5 px-3 text-center">Clasificación</th>
                          <th className="py-2.5 px-2 text-center text-blue-800">Lógica</th>
                          <th className="py-2.5 px-2 text-center text-purple-800">Matemáticas</th>
                          <th className="py-2.5 px-2 text-center text-amber-800">Lectura</th>
                          <th className="py-2.5 px-2 text-center text-emerald-800">Psicológico</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {esperaGrouped.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-6 text-center text-gray-500 italic text-xs">
                              No hay aspirantes en lista de espera que coincidan con la búsqueda o filtro aplicado.
                            </td>
                          </tr>
                        ) : (
                          esperaGrouped.map((r, i) => renderRow(r, i + 1))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tabla 3: Aspirantes Desaprobados */}
              {(filterClassification === 'ALL' || filterClassification === 'DESAPROBADO') && (
                <div className="bg-white rounded-xl border border-red-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-700 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-300" />
                      <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                        3. Tabla de Aspirantes Desaprobados (No Admitidos)
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-200">
                      {desaprobadosGrouped.length} no admitidos ({totalStats.desaprobadosPct}%)
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 uppercase font-semibold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-16">Puesto</th>
                          <th className="py-2.5 px-4">Aspirante / Documento</th>
                          <th className="py-2.5 px-3 text-center">Grupo</th>
                          <th className="py-2.5 px-3 text-center font-bold text-gray-900">Puntaje Global</th>
                          <th className="py-2.5 px-3 text-center">Clasificación</th>
                          <th className="py-2.5 px-2 text-center text-blue-800">Lógica</th>
                          <th className="py-2.5 px-2 text-center text-purple-800">Matemáticas</th>
                          <th className="py-2.5 px-2 text-center text-amber-800">Lectura</th>
                          <th className="py-2.5 px-2 text-center text-emerald-800">Psicológico</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {desaprobadosGrouped.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-6 text-center text-gray-500 italic text-xs">
                              No hay aspirantes desaprobados que coincidan con la búsqueda o filtro aplicado.
                            </td>
                          </tr>
                        ) : (
                          desaprobadosGrouped.map((r, i) => renderRow(r, i + 1))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* -------------------------------------------------------------
               VIEW MODE: CONSOLIDATED UNIFIED RANKING TABLE
            ------------------------------------------------------------- */
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                    Tabla General Consolidada · Ranking por Orden de Mérito
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[11px] font-bold text-slate-200">
                  {filteredList.length} aspirantes ordenados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-100/95 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-16">
                        <div className="flex items-center justify-center space-x-1">
                          <span>Puesto</span>
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </th>
                      <th className="py-2.5 px-4">Aspirante / Documento</th>
                      <th className="py-2.5 px-3 text-center">Grupo</th>
                      <th className="py-2.5 px-3 text-center font-bold text-gray-900">Puntaje Global</th>
                      <th className="py-2.5 px-3 text-center">Clasificación</th>
                      <th className="py-2.5 px-2 text-center text-blue-800">Lógica</th>
                      <th className="py-2.5 px-2 text-center text-purple-800">Matemáticas</th>
                      <th className="py-2.5 px-2 text-center text-amber-800">Lectura</th>
                      <th className="py-2.5 px-2 text-center text-emerald-800">Psicológico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-500">
                          No se encontraron aspirantes evaluados con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((r) => renderRow(r))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-gray-500 text-[11px] sm:text-xs">
            <strong>Criterio institucional SENA:</strong> Aprobados (≥ 70% o admitidos). Lista de espera (gestión de cupos). Desaprobados (&lt; 70%).
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={() => handleDownloadPdf()}
              className="px-3.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold flex items-center space-x-1.5 shadow-2xs transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>Descargar PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors"
            >
              Descargar CSV
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
