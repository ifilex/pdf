import React, { useRef, useState, useEffect } from 'react';
import { 
  Annotation, 
  Language, 
  PdfDocument, 
  ReadingMode, 
  ToolType, 
  AnnotationPoint 
} from '../types';
import { DOCUMENT_TEMPLATES_CONTENT } from '../data/sampleDocuments';
import { 
  Lock, 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  MessageSquare, 
  FileSignature, 
  AlertTriangle,
  Move,
  CheckCircle2,
  UploadCloud,
  FilePlus,
  FileText,
  Sparkles,
  FolderOpen,
  Cloud,
  Layers,
  LockKeyhole
} from 'lucide-react';
import { translations } from '../i18n/translations';

interface PdfViewerProps {
  currentDoc?: PdfDocument | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  readingMode: ReadingMode;
  activeTool: ToolType;
  activeColor: string;
  strokeWidth: number;
  language: Language;
  onAddAnnotation: (ann: Annotation) => void;
  onUpdateAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  pendingSignature?: {
    dataUrl: string;
    text?: string;
    type: 'draw' | 'type' | 'image';
    metadata: any;
  } | null;
  onSignaturePlaced?: () => void;
  isVaultLocked?: boolean;
  onOpenFile?: () => void;
  onCreateBlankDoc?: () => void;
  onOpenDocManager?: () => void;
  onFileUpload?: (file: File) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  currentDoc,
  currentPage,
  onPageChange,
  zoom,
  readingMode,
  activeTool,
  activeColor,
  strokeWidth,
  language,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  pendingSignature,
  onSignaturePlaced,
  isVaultLocked,
  onOpenFile,
  onCreateBlankDoc,
  onOpenDocManager,
  onFileUpload
}) => {
  const t = translations[language];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasLayerRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Freehand drawing state on canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<AnnotationPoint[]>([]);

  // Selected annotation for editing/moving/deleting
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const templatePages = currentDoc ? DOCUMENT_TEMPLATES_CONTENT[currentDoc.id] : undefined;
  const template = templatePages?.[currentPage];
  const pageRotation = currentDoc?.pagesRotation?.[currentPage] || 0;

  // Filter annotations for current page
  const pageAnnotations = currentDoc?.annotations?.filter(a => a.pageIndex === currentPage) || [];

  // Initialize or handle drawing canvas
  useEffect(() => {
    if (!currentDoc) return;
    const canvas = canvasLayerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw all drawn strokes on this page
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawAnns = pageAnnotations.filter(a => a.type === 'draw' && a.points && a.points.length > 1);
    for (const d of drawAnns) {
      if (!d.points || d.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = d.color;
      ctx.lineWidth = d.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(d.points[0].x, d.points[0].y);
      for (let i = 1; i < d.points.length; i++) {
        ctx.lineTo(d.points[i].x, d.points[i].y);
      }
      ctx.stroke();
    }
  }, [currentDoc, pageAnnotations, currentPage, zoom]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload?.(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload?.(e.target.files[0]);
    }
  };

  // If no document is active / loaded, render a pristine empty state
  if (!currentDoc) {
    return (
      <div 
        id="empty-pdf-workspace"
        className="flex-1 bg-slate-950/60 overflow-y-auto p-4 md:p-8 flex items-center justify-center min-h-[600px]"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx" 
          className="hidden" 
        />

        <div className="max-w-2xl w-full mx-auto text-center space-y-6">
          {/* Main Drop Zone Card */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 md:p-12 transition-all cursor-pointer group flex flex-col items-center justify-center gap-4 ${
              isDragOver 
                ? 'border-indigo-500 bg-indigo-950/40 scale-[1.01]' 
                : 'border-slate-800 bg-slate-900/60 hover:border-indigo-500/60 hover:bg-slate-900/90'
            }`}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition shadow-xl shadow-indigo-950/50">
              <UploadCloud className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {t.appName}
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {t.dragAndDrop}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition active:scale-95"
              >
                <FolderOpen className="w-4 h-4" />
                {t.uploadCustomPdf}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateBlankDoc?.();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs md:text-sm flex items-center gap-2 border border-slate-700 transition active:scale-95"
              >
                <FilePlus className="w-4 h-4 text-emerald-400" />
                Documento en Blanco
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDocManager?.();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs md:text-sm flex items-center gap-2 border border-slate-700/60 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t.sampleContracts}
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Formatos soportados: PDF, PNG, JPG, WEBP • Hasta 50 MB
            </span>
          </div>

          {/* Quick Capability Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <FileSignature className="w-4 h-4" />
                <span>Firmas Digitales</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Certificados SHA-256 válidos legalmente.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <LockKeyhole className="w-4 h-4" />
                <span>Biometría</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Touch ID / Face ID y PIN criptográfico.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <Cloud className="w-4 h-4" />
                <span>Nube & Offline</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Acceso multiplataforma sin conexión.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Layers className="w-4 h-4" />
                <span>Edición Total</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Anotaciones, estampas y censuras.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle pointer down on page canvas
  const handlePageClickOrStartDraw = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVaultLocked) return;

    const pageElement = e.currentTarget;
    const rect = pageElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // 1. Pending Digital Signature Placement
    if (pendingSignature) {
      const newSigAnn: Annotation = {
        id: 'ann-sig-' + Date.now(),
        pageIndex: currentPage,
        type: 'signature',
        x: Math.max(10, x - 90),
        y: Math.max(10, y - 35),
        width: 180,
        height: 70,
        color: '#1e40af',
        signatureDataUrl: pendingSignature.dataUrl,
        content: pendingSignature.text,
        signatureMeta: pendingSignature.metadata,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAddAnnotation(newSigAnn);
      onSignaturePlaced?.();
      return;
    }

    // 2. Add Text Annotation
    if (activeTool === 'text') {
      const newTextAnn: Annotation = {
        id: 'ann-txt-' + Date.now(),
        pageIndex: currentPage,
        type: 'text',
        x,
        y,
        content: 'Escribe aquí tu texto...',
        color: activeColor,
        fontSize: 14,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAddAnnotation(newTextAnn);
      setSelectedAnnId(newTextAnn.id);
      return;
    }

    // 3. Add Sticky Note
    if (activeTool === 'note') {
      const newNoteAnn: Annotation = {
        id: 'ann-note-' + Date.now(),
        pageIndex: currentPage,
        type: 'note',
        x,
        y,
        content: 'Nota de revisión: Verificar datos antes de archivar.',
        color: '#fef08a',
        author: 'Usuario',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAddAnnotation(newNoteAnn);
      setEditingNoteId(newNoteAnn.id);
      return;
    }

    // 4. Add Highlight
    if (activeTool === 'highlight') {
      const newHighlight: Annotation = {
        id: 'ann-hl-' + Date.now(),
        pageIndex: currentPage,
        type: 'highlight',
        x: 40,
        y: Math.max(20, y - 10),
        width: 520,
        height: 22,
        color: activeColor,
        opacity: 0.35,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAddAnnotation(newHighlight);
      return;
    }

    // 5. Add Redaction Blackout
    if (activeTool === 'redact') {
      const newRedact: Annotation = {
        id: 'ann-redact-' + Date.now(),
        pageIndex: currentPage,
        type: 'redact',
        x: Math.max(20, x - 70),
        y: Math.max(20, y - 12),
        width: 160,
        height: 24,
        color: '#0f172a',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAddAnnotation(newRedact);
      return;
    }

    // 6. Add Shape Box
    if (activeTool === 'shape') {
      const newBox: Annotation = {
        id: 'ann-box-' + Date.now(),
        pageIndex: currentPage,
        type: 'rect',
        x: Math.max(20, x - 60),
        y: Math.max(20, y - 40),
        width: 140,
        height: 80,
        color: activeColor,
        strokeWidth: strokeWidth,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAddAnnotation(newBox);
      return;
    }

    // 7. Freehand Drawing Mode
    if (activeTool === 'draw') {
      setIsDrawing(true);
      setCurrentStroke([{ x, y }]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== 'draw') return;
    const canvas = canvasLayerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const newStroke = [...currentStroke, { x, y }];
    setCurrentStroke(newStroke);

    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (currentStroke.length > 0) {
      const prev = currentStroke[currentStroke.length - 1];
      ctx.moveTo(prev.x * zoom, prev.y * zoom);
      ctx.lineTo(x * zoom, y * zoom);
      ctx.stroke();
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && currentStroke.length > 1) {
      const newDrawAnn: Annotation = {
        id: 'ann-draw-' + Date.now(),
        pageIndex: currentPage,
        type: 'draw',
        x: currentStroke[0].x,
        y: currentStroke[0].y,
        points: currentStroke,
        color: activeColor,
        strokeWidth: strokeWidth,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onAddAnnotation(newDrawAnn);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  // Get CSS Reading Mode Filter Class
  const getReadingModeFilter = () => {
    switch (readingMode) {
      case 'dark':
        return 'bg-slate-900 text-slate-100 border-slate-800 shadow-2xl';
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#433422] border-[#e2d5ba] shadow-xl';
      case 'inverted':
        return 'bg-slate-950 text-emerald-400 border-slate-800 invert-[0.9] shadow-2xl';
      case 'night-warm':
        return 'bg-[#fcf8f0] text-slate-900 border-[#e8dfcf] filter brightness-95 sepia-[0.35] shadow-xl';
      case 'light':
      default:
        return 'bg-white text-slate-900 border-slate-200 shadow-2xl';
    }
  };

  return (
    <div 
      ref={containerRef}
      id="pdf-viewport-container"
      className="flex-1 bg-slate-950/90 overflow-auto p-4 md:p-8 flex items-center justify-center relative select-none"
    >
      {/* Vault Locked Overlay if document is confidential and locked */}
      {isVaultLocked && currentDoc.isLocked && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-white">Documento Protegido en Bóveda Criptográfica</h3>
            <p className="text-xs text-slate-400">
              Este archivo contiene secretos industriales o información sensible. Requiere autenticación biométrica (Touch ID / Face ID o PIN) para su visualización.
            </p>
          </div>
        </div>
      )}

      {/* Main Page Container (Standard A4 Proportions: 595 x 842 pt scaled) */}
      <div 
        id={`pdf-page-${currentPage}`}
        onClick={handlePageClickOrStartDraw}
        style={{
          width: `${595 * zoom}px`,
          minHeight: `${842 * zoom}px`,
          transform: `rotate(${pageRotation}deg)`,
          transformOrigin: 'center center'
        }}
        className={`relative rounded-xl border transition-all duration-150 p-6 md:p-10 ${getReadingModeFilter()} ${
          pendingSignature ? 'cursor-copy ring-2 ring-indigo-500' : activeTool === 'draw' ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* Page Content Layout: Template, Uploaded Media, or Blank Sheet */}
        {template ? (
          <div className="space-y-6 select-text pointer-events-none">
            {/* Header */}
            <div className="border-b-2 border-indigo-600/30 pb-3 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-extrabold text-sm md:text-base tracking-tight leading-tight">
                  {template.header.title}
                </h1>
                {template.header.subtitle && (
                  <p className="text-[11px] opacity-70 mt-0.5 font-medium">
                    {template.header.subtitle}
                  </p>
                )}
                {template.header.docNumber && (
                  <p className="text-[9px] font-mono opacity-50 mt-0.5">
                    {template.header.docNumber}
                  </p>
                )}
              </div>
              {template.header.badge && (
                <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] uppercase tracking-wider shrink-0">
                  {template.header.badge}
                </span>
              )}
            </div>

            {/* Sections */}
            {template.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-2 text-xs leading-relaxed">
                {sec.heading && (
                  <h2 className="font-bold text-xs uppercase tracking-wide opacity-90">
                    {sec.heading}
                  </h2>
                )}

                {sec.paragraphs?.map((p, pIdx) => (
                  <p key={pIdx} className="opacity-80 text-[11px] leading-relaxed text-justify">
                    {p}
                  </p>
                ))}

                {sec.bulletPoints && (
                  <ul className="list-disc pl-5 space-y-1 text-[11px] opacity-80">
                    {sec.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx}>{bp}</li>
                    ))}
                  </ul>
                )}

                {/* Table if present */}
                {sec.table && (
                  <div className="my-2 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-[10px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold opacity-90">
                        <tr>
                          {sec.table.headers.map((th, thIdx) => (
                            <th key={thIdx} className="p-2 border-b border-slate-200 dark:border-slate-800">{th}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sec.table.rows.map((tr, trIdx) => (
                          <tr key={trIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            {tr.map((td, tdIdx) => (
                              <td key={tdIdx} className="p-2">{td}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Callouts */}
                {sec.callout && (
                  <div className={`p-3 rounded-lg border text-[10px] my-2 font-medium flex items-start gap-2 ${
                    sec.callout.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-300'
                      : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-900 dark:text-blue-300'
                  }`}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{sec.callout.text}</span>
                  </div>
                )}

                {/* Signature Placeholder Blocks */}
                {sec.signatureBoxes && (
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {sec.signatureBoxes.map((sBox, bIdx) => (
                      <div 
                        key={bIdx}
                        className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between h-24"
                      >
                        <span className="text-[9px] font-bold uppercase opacity-60">{sBox.role}</span>
                        <div className="border-t border-slate-300 dark:border-slate-700 pt-1">
                          <span className="text-[10px] font-bold block">{sBox.name}</span>
                          {sBox.idNumber && <span className="text-[8px] opacity-60 font-mono">{sBox.idNumber}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Footer */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] opacity-60">
              <span>{template.footer.text}</span>
              <span className="font-bold">{template.footer.pageLabel}</span>
            </div>
          </div>
        ) : currentDoc.dataUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {currentDoc.dataUrl.startsWith('data:image/') ? (
              <img 
                src={currentDoc.dataUrl} 
                alt={currentDoc.title} 
                className="w-full h-auto max-h-[760px] object-contain rounded-lg pointer-events-none select-none" 
              />
            ) : currentDoc.dataUrl.startsWith('data:application/pdf') ? (
              <iframe 
                src={`${currentDoc.dataUrl}#toolbar=0&navpanes=0`} 
                className="w-full h-[760px] border-0 rounded-lg pointer-events-auto" 
                title={currentDoc.title} 
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-12 h-12 mx-auto text-indigo-400 opacity-60" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentDoc.title}</h3>
                <p className="text-xs text-slate-500">Documento cargado correctamente. Listo para firmar y anotar.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col justify-between py-4 select-text">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{currentDoc.title}</h2>
                <p className="text-[10px] text-slate-400">{new Date(currentDoc.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                Pág. {currentPage + 1}/{currentDoc.pageCount}
              </span>
            </div>
            
            <div className="flex-1 my-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800/80 p-6 flex flex-col items-center justify-center text-center space-y-2 opacity-60 hover:opacity-100 transition">
              <p className="text-xs text-slate-400 font-medium">Lienzo en blanco</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Utiliza las herramientas superiores para añadir texto, firmas biométricas, estampas, dibujos y resaltados.
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between text-[9px] text-slate-400">
              <span>OmniPDF Enterprise Document</span>
              <span>Página {currentPage + 1}</span>
            </div>
          </div>
        )}

        {/* Freehand Drawing Overlay Canvas */}
        <canvas
          ref={canvasLayerRef}
          width={595 * zoom}
          height={842 * zoom}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="absolute inset-0 pointer-events-auto z-10"
        />

        {/* Interactive Annotations & Signatures Layer */}
        <div className="absolute inset-0 pointer-events-auto z-20 overflow-hidden">
          {pageAnnotations.map((ann) => {
            const isSelected = selectedAnnId === ann.id;

            // Highlight Annotation
            if (ann.type === 'highlight') {
              return (
                <div
                  key={ann.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnId(ann.id); }}
                  style={{
                    left: `${ann.x * zoom}px`,
                    top: `${ann.y * zoom}px`,
                    width: `${(ann.width || 200) * zoom}px`,
                    height: `${(ann.height || 20) * zoom}px`,
                    backgroundColor: ann.color,
                    opacity: ann.opacity || 0.35
                  }}
                  className={`absolute rounded transition group hover:ring-2 hover:ring-indigo-500 cursor-pointer ${
                    isSelected ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(ann.id); }}
                      className="absolute -top-3 -right-3 p-1 rounded-full bg-rose-600 text-white shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            }

            // Redaction Block
            if (ann.type === 'redact') {
              return (
                <div
                  key={ann.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnId(ann.id); }}
                  style={{
                    left: `${ann.x * zoom}px`,
                    top: `${ann.y * zoom}px`,
                    width: `${(ann.width || 160) * zoom}px`,
                    height: `${(ann.height || 24) * zoom}px`,
                  }}
                  className="absolute bg-slate-950 rounded flex items-center justify-center text-[9px] font-mono text-slate-500 uppercase tracking-widest cursor-pointer shadow group hover:ring-2 hover:ring-rose-500"
                >
                  <span>[CENSURADO]</span>
                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(ann.id); }}
                      className="absolute -top-3 -right-3 p-1 rounded-full bg-rose-600 text-white shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            }

            // Sticky Note
            if (ann.type === 'note') {
              return (
                <div
                  key={ann.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnId(ann.id); setEditingNoteId(ann.id); }}
                  style={{
                    left: `${ann.x * zoom}px`,
                    top: `${ann.y * zoom}px`,
                    width: `${170 * zoom}px`
                  }}
                  className="absolute p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs shadow-lg cursor-pointer transition hover:scale-105 group"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-amber-600" />
                      {ann.author || 'Nota'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(ann.id); }}
                      className="text-amber-700 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] leading-tight font-medium">
                    {ann.content}
                  </p>
                </div>
              );
            }

            // Stamp Annotation
            if (ann.type === 'stamp') {
              return (
                <div
                  key={ann.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnId(ann.id); }}
                  style={{
                    left: `${ann.x * zoom}px`,
                    top: `${ann.y * zoom}px`,
                    transform: 'rotate(-4deg)'
                  }}
                  className={`absolute px-4 py-2 rounded-xl border-2 font-extrabold text-xs tracking-wider shadow-lg bg-white/90 dark:bg-slate-900/90 cursor-pointer group flex items-center gap-2 ${
                    ann.stampType === 'APPROVED' ? 'border-emerald-600 text-emerald-600' :
                    ann.stampType === 'CONFIDENTIAL' ? 'border-rose-600 text-rose-600' :
                    ann.stampType === 'PAID' ? 'border-teal-600 text-teal-600' : 'border-indigo-600 text-indigo-600'
                  }`}
                >
                  <span>★ {ann.stampType || 'VERIFIED'} ★</span>
                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(ann.id); }}
                      className="p-0.5 rounded text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            }

            // Digital Signature Block with Cryptographic Certificate Seal
            if (ann.type === 'signature') {
              return (
                <div
                  key={ann.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnId(ann.id); }}
                  style={{
                    left: `${ann.x * zoom}px`,
                    top: `${ann.y * zoom}px`,
                    width: `${210 * zoom}px`
                  }}
                  className="absolute p-2.5 rounded-xl bg-blue-50/95 dark:bg-slate-900/95 border-2 border-indigo-500 shadow-xl cursor-pointer group transition hover:scale-105"
                >
                  <div className="flex items-center justify-between pb-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1">
                      <FileSignature className="w-3.5 h-3.5" /> Firma Criptográfica
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(ann.id); }}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Render Signature (Image or Text) */}
                  <div className="py-1 text-center">
                    {ann.signatureDataUrl ? (
                      <img
                        src={ann.signatureDataUrl}
                        alt="Firma Digital"
                        className="max-h-12 mx-auto object-contain"
                      />
                    ) : (
                      <span className="italic font-serif text-lg font-bold text-indigo-900 dark:text-indigo-200">
                        {ann.content || 'Firma Electrónica'}
                      </span>
                    )}
                  </div>

                  {/* Legal Certificate Meta Stamp */}
                  <div className="mt-1 pt-1 border-t border-indigo-200 dark:border-slate-800 text-[8px] leading-tight text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Sellado SHA-256
                      </span>
                      <span>Biométrico OK</span>
                    </div>
                    <p className="font-mono truncate">
                      {ann.signatureMeta?.documentChecksum ? ann.signatureMeta.documentChecksum.substring(0, 18) + '...' : 'HASH: 8F92AC44B012...'}
                    </p>
                    <p className="text-[7.5px] opacity-75">
                      {ann.signatureMeta?.signerName || 'Sofía Valenzuela'} • {new Date(ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            }

            // Text Annotation
            if (ann.type === 'text') {
              return (
                <div
                  key={ann.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnId(ann.id); }}
                  style={{
                    left: `${ann.x * zoom}px`,
                    top: `${ann.y * zoom}px`,
                    color: ann.color,
                    fontSize: `${(ann.fontSize || 13) * zoom}px`
                  }}
                  className={`absolute font-semibold p-1 rounded transition cursor-pointer ${
                    isSelected ? 'ring-2 ring-indigo-500 bg-white/70 dark:bg-slate-900/70 shadow' : ''
                  }`}
                >
                  <span>{ann.content}</span>
                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(ann.id); }}
                      className="ml-2 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3 h-3 inline" />
                    </button>
                  )}
                </div>
              );
            }

            // Rectangle Box
            if (ann.type === 'rect') {
              return (
                <div
                  key={ann.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedAnnId(ann.id); }}
                  style={{
                    left: `${ann.x * zoom}px`,
                    top: `${ann.y * zoom}px`,
                    width: `${(ann.width || 120) * zoom}px`,
                    height: `${(ann.height || 60) * zoom}px`,
                    borderColor: ann.color,
                    borderWidth: `${(ann.strokeWidth || 2) * zoom}px`
                  }}
                  className="absolute border-2 rounded-lg bg-transparent cursor-pointer shadow-sm group hover:ring-2 hover:ring-indigo-400"
                >
                  {isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteAnnotation(ann.id); }}
                      className="absolute -top-3 -right-3 p-1 rounded-full bg-rose-600 text-white shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};
