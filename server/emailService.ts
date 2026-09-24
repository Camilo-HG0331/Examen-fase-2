import nodemailer, { Transporter } from 'nodemailer';
import { ExamResult } from '../src/types';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export function generateEmailHtml(result: ExamResult): string {
  const { candidate, scores, overallScore, status, completedAt, id } = result;

  const isApproved = status === 'APROBADO' || overallScore >= 70;
  const statusColor = isApproved ? '#10b981' : '#ef4444';
  const statusLabel = isApproved ? 'APROBADO' : 'DESAPROBADO';
  const statusSubLabel = isApproved
    ? 'Cumple satisfactoriamente con el perfil requerido (Umbral ≥ 70%)'
    : 'No alcanza el puntaje mínimo de aprobación (Umbral requerido: 70%)';

  const formattedDate = new Date(completedAt).toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultados Examen Fase 2 ADSO</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #1f2937; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; }
    .header { background: #047857; color: #ffffff; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
    .badge-bar { background: #065f46; color: #a7f3d0; padding: 8px 16px; font-size: 12px; text-align: center; font-weight: 600; }
    .content { padding: 28px 24px; }
    .card-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
    .info-label { color: #6b7280; font-size: 11px; text-transform: uppercase; font-weight: 600; }
    .info-val { font-weight: 600; color: #111827; }
    .score-banner { text-align: center; padding: 20px; background: ${statusColor}12; border: 2px solid ${statusColor}40; border-radius: 10px; margin-bottom: 24px; }
    .score-number { font-size: 42px; font-weight: 800; color: ${statusColor}; line-height: 1; margin: 8px 0; }
    .tier-badge { display: inline-block; background: ${statusColor}; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 800; letter-spacing: 0.05em; }
    .table-results { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .table-results th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
    .table-results td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
    .progress-bar-bg { background: #e5e7eb; border-radius: 999px; height: 8px; width: 100%; overflow: hidden; }
    .progress-bar-fill { background: #047857; height: 8px; border-radius: 999px; }
    .feedback-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 4px; font-size: 13px; line-height: 1.5; color: #1e3a8a; margin-bottom: 24px; }
    .footer { background: #f9fafb; padding: 20px 24px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SENA · Examen de Selección Fase 2</h1>
      <p>Tecnología en Análisis y Desarrollo de Software (ADSO)</p>
    </div>
    <div class="badge-bar">
      CONVOCATORIA ADSO · GRUPO DE ESTUDIANTES: ${candidate.assignedGroup} (MÁX. 30 ESTUDIANTES) · REF: ${id.substring(0, 8).toUpperCase()}
    </div>

    <div class="content">
      <div class="card-info">
        <div class="info-grid">
          <div>
            <div class="info-label">Aspirante</div>
            <div class="info-val">${candidate.fullName}</div>
          </div>
          <div>
            <div class="info-label">Documento</div>
            <div class="info-val">${candidate.documentType} ${candidate.documentNumber}</div>
          </div>
          <div>
            <div class="info-label">Grupo de Estudiantes</div>
            <div class="info-val">Grupo ${candidate.assignedGroup} (Cohorte máx. 30)</div>
          </div>
          <div>
            <div class="info-label">Fecha y Hora</div>
            <div class="info-val">${formattedDate}</div>
          </div>
        </div>
      </div>

      <div class="score-banner">
        <span class="info-label">Calificación Global Obtenida</span>
        <div class="score-number">${overallScore}%</div>
        <div class="tier-badge">${statusLabel}</div>
        <div style="font-size: 12px; color: #4b5563; margin-top: 8px;">${statusSubLabel}</div>
      </div>

      <table class="table-results">
        <thead>
          <tr>
            <th>Componente Evaluado</th>
            <th style="text-align: center;">Respuestas</th>
            <th style="text-align: right;">Puntaje</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong style="color: #111827;">Lógica de Programación</strong>
              <div class="progress-bar-bg" style="margin-top: 4px;">
                <div class="progress-bar-fill" style="width: ${scores.logica.percentage}%;"></div>
              </div>
            </td>
            <td style="text-align: center;">${scores.logica.correct} / ${scores.logica.total}</td>
            <td style="text-align: right; font-weight: 700;">${scores.logica.percentage}%</td>
          </tr>
          <tr>
            <td>
              <strong style="color: #111827;">Análisis Matemático</strong>
              <div class="progress-bar-bg" style="margin-top: 4px;">
                <div class="progress-bar-fill" style="width: ${scores.matematicas.percentage}%;"></div>
              </div>
            </td>
            <td style="text-align: center;">${scores.matematicas.correct} / ${scores.matematicas.total}</td>
            <td style="text-align: right; font-weight: 700;">${scores.matematicas.percentage}%</td>
          </tr>
          <tr>
            <td>
              <strong style="color: #111827;">Comprensión Lectora</strong>
              <div class="progress-bar-bg" style="margin-top: 4px;">
                <div class="progress-bar-fill" style="width: ${scores.comprension.percentage}%;"></div>
              </div>
            </td>
            <td style="text-align: center;">${scores.comprension.correct} / ${scores.comprension.total}</td>
            <td style="text-align: right; font-weight: 700;">${scores.comprension.percentage}%</td>
          </tr>
          <tr>
            <td>
              <strong style="color: #111827;">Test Psicológico y Perfil Vocacional</strong>
              <div class="progress-bar-bg" style="margin-top: 4px;">
                <div class="progress-bar-fill" style="width: ${scores.psicologico.percentage}%;"></div>
              </div>
            </td>
            <td style="text-align: center;">${scores.psicologico.correct} / ${scores.psicologico.total}</td>
            <td style="text-align: right; font-weight: 700;">${scores.psicologico.percentage}%</td>
          </tr>
        </tbody>
      </table>

      ${
        result.aiFeedback
          ? `
      <div class="feedback-box">
        <strong style="display: block; margin-bottom: 4px; color: #1e40af;">Diagnóstico y Retroalimentación Pedagógica:</strong>
        ${result.aiFeedback}
      </div>`
          : ''
      }

      <div style="font-size: 12px; color: #4b5563; line-height: 1.5; border-top: 1px solid #e5e7eb; padding-top: 14px;">
        <strong>Siguientes pasos:</strong> ${
          isApproved
            ? `Felicitaciones, ha <strong>APROBADO</strong> el examen de selección Fase 2 ADSO con el <strong>Grupo ${candidate.assignedGroup}</strong>. En las próximas 48 horas se le informará el cronograma de matrícula e inducción.`
            : `El estado final es <strong>DESAPROBADO</strong> al no haber superado el umbral del 70%. Lo invitamos a seguir fortaleciendo sus competencias en programación y matemáticas para las próximas convocatorias.`
        }
      </div>
    </div>

    <div class="footer">
      Sistema Automatizado de Evaluación Fase 2 ADSO · Servicio de Selección y Admisiones<br>
      Este es un correo generado automáticamente. Por favor no responda directamente a este remitente.
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendExamNotificationEmail(result: ExamResult): Promise<{
  success: boolean;
  message: string;
  sentAt: string;
  previewHtml: string;
}> {
  const previewHtml = generateEmailHtml(result);
  const sentAt = new Date().toISOString();

  const client = getTransporter();
  const recipient = result.candidate.email?.trim();

  if (!recipient || !recipient.includes('@')) {
    return {
      success: false,
      message: `Dirección de correo no válida: ${recipient}`,
      sentAt,
      previewHtml,
    };
  }

  if (client) {
    try {
      const fromSender = process.env.EMAIL_FROM || `"Convocatoria ADSO Fase 2" <${process.env.SMTP_USER}>`;
      const subject = `Comprobante y Resultados Examen Fase 2 ADSO - ${result.candidate.fullName} · ${result.status} (${result.overallScore}%) · Grupo ${result.candidate.assignedGroup}`;

      await client.sendMail({
        from: fromSender,
        to: recipient,
        subject,
        html: previewHtml,
      });

      console.log(`[EMAIL DISPATCH SUCCESS] Real email delivered to: ${recipient} | Score: ${result.overallScore}% | Status: ${result.status}`);
      return {
        success: true,
        message: `Correo enviado exitosamente a ${recipient} a través de SMTP (${process.env.SMTP_HOST || 'smtp.gmail.com'})`,
        sentAt,
        previewHtml,
      };
    } catch (err: any) {
      console.error(`[EMAIL DISPATCH ERROR] Failed to send email to ${recipient}:`, err);
      return {
        success: false,
        message: `Error al enviar correo vía SMTP: ${err?.message || 'Fallo de autenticación o conexión'}`,
        sentAt,
        previewHtml,
      };
    }
  }

  // Fallback if credentials are not configured yet
  console.log(`[EMAIL SIMULATED] SMTP credentials not set. Simulated delivery to: ${recipient}`);
  return {
    success: true,
    message: `Notificación generada para ${recipient} (Modo simulado: configure SMTP_USER y SMTP_PASS para envío real)`,
    sentAt,
    previewHtml,
  };
}

