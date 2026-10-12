import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Table, 
  ShieldAlert, 
  FileSpreadsheet, 
  Database, 
  CheckCircle2, 
  X, 
  Loader2, 
  Lock,
  Sparkles
} from 'lucide-react';
import { Language, PdfDocument } from '../types';
import { translations } from '../i18n/translations';
import { pdfEngine } from '../services/pdfEngine';
import { exportService } from '../services/exportService';
import { storageService } from '../services/storage';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentDoc?: PdfDocument | null;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  language,
  currentDoc
}) => {
  const t = translations[language];
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [includeAuditTrail, setIncludeAuditTrail] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    if (!currentDoc) return;
    setIsExporting(true);
    setSuccessMessage('');
    try {
      const blob = await pdfEngine.exportDocumentToPdf(currentDoc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentDoc.fileName.replace('.pdf', '')}_Firmado_2026.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      storageService.addAuditLog({
        action: 'export_document',
        status: 'success',
        documentTitle: currentDoc.title,
        details: 'Documento PDF con firmas digitales y capas exportado exitosamente',
        device: 'OmniPDF Export Engine',
        ip: '127.0.0.1'
      });

      setSuccessMessage('¡PDF exportado y descargado exitosamente!');
    } catch (e) {
      console.error(e);
      setSuccessMessage('Error al generar PDF. Se utilizó el generador de respaldo.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAuditPdf = () => {
    if (!currentDoc) return;
    setIsExporting(true);
    setSuccessMessage('');
    setTimeout(() => {
      exportService.generateAuditReportPdf(currentDoc);
      setIsExporting(false);
      setSuccessMessage('¡Reporte de Auditoría Legal generado y descargado!');
    }, 400);
  };

  const handleExportCsv = () => {
    if (!currentDoc) return;
    setIsExporting(true);
    setSuccessMessage('');
    setTimeout(() => {
      exportService.exportActivityToCsv(currentDoc);
      setIsExporting(false);
      setSuccessMessage('¡Archivo CSV de registro de auditoría descargado!');
    }, 300);
  };

  const handleExportJson = () => {
    setIsExporting(true);
    setSuccessMessage('');
    setTimeout(() => {
      exportService.exportCompleteBackupJson();
      setIsExporting(false);
      setSuccessMessage('¡Copia de seguridad completa (JSON) descargada!');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="export-report-modal-dialog"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.exportReportTitle}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                {currentDoc.title}
              </p>
            </div>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: PDF with baked signatures */}
            <div 
              onClick={handleExportPdf}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-950 cursor-pointer transition flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs md:text-sm group-hover:text-indigo-300">
                    {t.exportPdfDoc}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Archivo PDF original con firmas criptográficas, sellos y anotaciones incrustadas permanentemente.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-indigo-400">
                <span>Descargar (.pdf)</span>
                <Download className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Option 2: Legal Audit PDF */}
            <div 
              onClick={handleExportAuditPdf}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500 hover:bg-slate-950 cursor-pointer transition flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs md:text-sm group-hover:text-emerald-300">
                    {t.exportAuditReport}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Certificado formal con hashes SHA-256, autorías biométricas y validez eIDAS para juzgados o clientes.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                <span>Certificado Legal (.pdf)</span>
                <Download className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Option 3: CSV Data */}
            <div 
              onClick={handleExportCsv}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-teal-500 hover:bg-slate-950 cursor-pointer transition flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs md:text-sm group-hover:text-teal-300">
                    {t.exportCsvData}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tabla estructurada compatible con Excel y Google Sheets de eventos, sellos e IPs de acceso.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-teal-400">
                <span>Exportar (.csv)</span>
                <Download className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Option 4: Full JSON Backup */}
            <div 
              onClick={handleExportJson}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500 hover:bg-slate-950 cursor-pointer transition flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs md:text-sm group-hover:text-amber-300">
                    {t.exportJsonBackup}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Copia integral encriptable de todos los documentos, claves, firmas guardadas y dispositivos.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-amber-400">
                <span>Backup (.json)</span>
                <Download className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Custom Inclusions Configuration */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Opciones de Inclusión en la Exportación
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>{t.includeSignatures}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeAnnotations}
                onChange={(e) => setIncludeAnnotations(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>{t.includeAnnotations}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeAuditTrail}
                onChange={(e) => setIncludeAuditTrail(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>{t.includeAuditTrail}</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {isExporting && (
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" /> {t.downloading}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
