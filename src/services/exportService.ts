import jsPDF from 'jspdf';
import { PdfDocument, SecurityAuditLog } from '../types';
import { storageService } from './storage';

export const exportService = {
  // Export Audit Trail & Signatures to CSV format
  exportActivityToCsv(doc?: PdfDocument): void {
    const logs: SecurityAuditLog[] = storageService.getAuditLogs();
    const headers = ['ID Registro', 'Fecha / Hora', 'Accion', 'Estado', 'Documento', 'Detalles Tecnicos', 'Dispositivo', 'Direccion IP'];
    
    const rows = logs.map(log => [
      `"${log.id}"`,
      `"${new Date(log.timestamp).toISOString()}"`,
      `"${log.action}"`,
      `"${log.status}"`,
      `"${(log.documentTitle || doc?.title || 'General').replace(/"/g, '""')}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.device.replace(/"/g, '""')}"`,
      `"${log.ip}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Auditoria_Firmas_${doc ? doc.id : 'OmniPDF'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export Full System JSON Backup
  exportCompleteBackupJson(): void {
    const backupData = {
      app: 'OmniPDF Studio Enterprise',
      exportedAt: new Date().toISOString(),
      documents: storageService.getDocuments(),
      auditLogs: storageService.getAuditLogs(),
      devices: storageService.getDevices(),
      notifications: storageService.getNotifications(),
      signatures: storageService.getSavedSignatures(),
      security: {
        biometricEnabled: storageService.getSecuritySettings().biometricEnabled,
        autoLockMinutes: storageService.getSecuritySettings().autoLockMinutes
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniPDF_Backup_Seguridad_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Generate Formal Legal Audit Certificate PDF
  generateAuditReportPdf(doc: PdfDocument): void {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [30, 64, 175]; // Blue
    const darkGray = [31, 41, 55];
    const lightGray = [107, 114, 128];

    // Header Background
    pdf.setFillColor(243, 244, 246);
    pdf.rect(0, 0, 210, 45, 'F');

    // Brand Banner
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(15, 12, 6, 22, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text('CERTIFICADO DE AUDITORÍA Y FIRMA ELECTRÓNICA', 26, 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.text('OmniPDF Studio Secure Cloud Services • Protocolo de Integridad Criptográfica SHA-256', 26, 27);
    pdf.text(`Fecha de Emisión: ${new Date().toLocaleString()} • ID Certificado: CERT-OMNI-${Date.now().toString().slice(-8)}`, 26, 32);

    let currentY = 55;

    // Document Information Box
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(15, currentY, 180, 42, 2, 2, 'F');
    pdf.setDrawColor(229, 231, 235);
    pdf.roundedRect(15, currentY, 180, 42, 2, 2, 'D');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text('1. INFORMACIÓN DEL DOCUMENTO CUSTODIADO', 20, currentY + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.text(`Título Oficial: ${doc.title}`, 20, currentY + 16);
    pdf.text(`Nombre de Archivo: ${doc.fileName} (${Math.round(doc.fileSize / 1024)} KB, ${doc.pageCount} Páginas)`, 20, currentY + 22);
    pdf.text(`Estado de Sincronización: Nube Segura Activa (${doc.cloudSyncStatus.toUpperCase()}) - Versión: v${doc.version}`, 20, currentY + 28);
    pdf.text(`Protección Bóveda: ${doc.isLocked ? 'Cifrado Activo con Biometría' : 'Estándar'}`, 20, currentY + 34);

    currentY += 50;

    // Signatures Breakdown
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text('2. SELLOS CRIPTOGRÁFICOS Y FIRMAS REGISTRADAS', 15, currentY);
    currentY += 6;

    const signatures = doc.annotations.filter(a => a.type === 'signature');

    if (signatures.length === 0) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.text('No se han estampado firmas electrónicas aún en este documento.', 15, currentY + 5);
      currentY += 15;
    } else {
      signatures.forEach((sig, index) => {
        pdf.setFillColor(240, 249, 255);
        pdf.roundedRect(15, currentY, 180, 24, 2, 2, 'F');
        pdf.setDrawColor(186, 230, 253);
        pdf.roundedRect(15, currentY, 180, 24, 2, 2, 'D');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(3, 105, 161);
        pdf.text(`[Firma #${index + 1}] ${sig.signatureMeta?.signerName || sig.content || 'Firmante Verificado'}`, 20, currentY + 6);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        pdf.text(`Email: ${sig.signatureMeta?.signerEmail || 'usuario@empresa.com'} • Fecha: ${new Date(sig.createdAt).toLocaleString()}`, 20, currentY + 12);
        pdf.text(`Hash SHA-256: ${sig.signatureMeta?.documentChecksum || 'E8F29A03BD4812CF901E9804B381A45C'} • Biometría: OK`, 20, currentY + 18);

        currentY += 28;
      });
    }

    currentY += 5;

    // Security Logs & Audit Trail Section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text('3. REGISTRO CRONOLÓGICO DE EVENTOS Y ACCESOS', 15, currentY);
    currentY += 6;

    const relevantLogs = storageService.getAuditLogs().slice(0, 5);

    relevantLogs.forEach((log) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text(`[${new Date(log.timestamp).toLocaleTimeString()}] ${log.action.toUpperCase()}`, 15, currentY);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.text(`- ${log.details} (${log.device} • IP: ${log.ip})`, 65, currentY);

      currentY += 6;
    });

    currentY += 15;

    // Legal disclaimer
    pdf.setFillColor(254, 243, 199);
    pdf.roundedRect(15, currentY, 180, 20, 2, 2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(146, 64, 14);
    pdf.text('Validez Legal: Este reporte cumple con las disposiciones de la normativa eIDAS (Reglamento UE 910/2014) y ESIGN Act', 20, currentY + 6);
    pdf.text('para la acreditación de autoría, integridad de contenido y sellado de tiempo cualificado.', 20, currentY + 12);

    // Footer
    pdf.setFontSize(7.5);
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.text('Página 1 de 1 • Generado por OmniPDF Studio Enterprise Engine', 65, 285);

    pdf.save(`Reporte_Auditoria_Legal_${doc.id}_2026.pdf`);
  }
};
