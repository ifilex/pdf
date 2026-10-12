import React from 'react';
import { 
  Layers, 
  MessageSquare, 
  ShieldCheck, 
  Stamp, 
  RotateCw, 
  Trash2, 
  Plus, 
  Lock, 
  Check, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { Annotation, Language, PdfDocument, SecurityAuditLog } from '../types';
import { translations } from '../i18n/translations';
import { DOCUMENT_TEMPLATES_CONTENT } from '../data/sampleDocuments';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: 'thumbnails' | 'annotations' | 'audit' | 'stamps' | 'vault';
  onTabChange: (tab: 'thumbnails' | 'annotations' | 'audit' | 'stamps' | 'vault') => void;
  language: Language;
  currentDoc?: PdfDocument | null;
  currentPage: number;
  onSelectPage: (page: number) => void;
  onRotatePage: (page: number) => void;
  onDeletePage: (page: number) => void;
  onAddPage: () => void;
  onInsertStamp: (type: 'APPROVED' | 'CONFIDENTIAL' | 'SIGNED' | 'REJECTED' | 'URGENT' | 'PAID' | 'VERIFIED') => void;
  onDeleteAnnotation: (id: string) => void;
  auditLogs: SecurityAuditLog[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  language,
  currentDoc,
  currentPage,
  onSelectPage,
  onRotatePage,
  onDeletePage,
  onAddPage,
  onInsertStamp,
  onDeleteAnnotation,
  auditLogs
}) => {
  const t = translations[language];
  const templatePages = currentDoc ? DOCUMENT_TEMPLATES_CONTENT[currentDoc.id] : undefined;
  const pageCount = currentDoc ? (templatePages ? templatePages.length : currentDoc.pageCount) : 0;

  const stampsList: Array<{ type: 'APPROVED' | 'CONFIDENTIAL' | 'SIGNED' | 'REJECTED' | 'URGENT' | 'PAID' | 'VERIFIED'; label: string; color: string }> = [
    { type: 'APPROVED', label: 'APROBADO / APPROVED', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40' },
    { type: 'CONFIDENTIAL', label: 'CONFIDENCIAL', color: 'border-rose-500 text-rose-400 bg-rose-950/40' },
    { type: 'SIGNED', label: 'FIRMADO DIGITALMENTE', color: 'border-indigo-500 text-indigo-400 bg-indigo-950/40' },
    { type: 'PAID', label: 'PAGADO / CONCILIADO', color: 'border-teal-500 text-teal-400 bg-teal-950/40' },
    { type: 'URGENT', label: 'URGENTE / PRIORITARIO', color: 'border-amber-500 text-amber-400 bg-amber-950/40' },
    { type: 'VERIFIED', label: 'VERIFICADO SHA-256', color: 'border-blue-500 text-blue-400 bg-blue-950/40' },
    { type: 'REJECTED', label: 'RECHAZADO', color: 'border-slate-500 text-slate-400 bg-slate-900' }
  ];

  if (!isOpen) {
    return (
      <button
        id="btn-expand-sidebar"
        onClick={onToggle}
        className="fixed left-2 top-24 z-20 p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-xl transition"
        title="Mostrar panel lateral"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside 
      id="main-sidebar"
      className="w-64 md:w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col h-[calc(100vh-100px)] select-none shrink-0 z-20 transition-all"
    >
      {/* Sidebar Header & Tab Switcher */}
      <div className="p-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 w-full overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-thumbnails"
            onClick={() => onTabChange('thumbnails')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activeTab === 'thumbnails' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title={t.thumbnails}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            id="tab-btn-annotations"
            onClick={() => onTabChange('annotations')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activeTab === 'annotations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title={t.annotationsList}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[10px]">{currentDoc?.annotations?.length || 0}</span>
          </button>
          <button
            id="tab-btn-stamps"
            onClick={() => onTabChange('stamps')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activeTab === 'stamps' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title={t.stampsGallery}
          >
            <Stamp className="w-3.5 h-3.5" />
          </button>
          <button
            id="tab-btn-audit"
            onClick={() => onTabChange('audit')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title={t.auditTrail}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          id="btn-collapse-sidebar"
          onClick={onToggle}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-1 shrink-0"
          title="Ocultar barra"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Tab 1: Page Thumbnails */}
        {activeTab === 'thumbnails' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>{t.thumbnails} ({pageCount})</span>
              <button
                onClick={onAddPage}
                disabled={!currentDoc}
                className="text-indigo-400 hover:underline flex items-center gap-0.5 text-xs font-medium disabled:opacity-30"
              >
                <Plus className="w-3 h-3" /> {t.addPage}
              </button>
            </div>

            {!currentDoc || pageCount === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hay documento abierto.
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: pageCount }).map((_, idx) => {
                  const isSelected = idx === currentPage;
                  const tmpl = templatePages?.[idx];
                  const rotation = currentDoc.pagesRotation[idx] || 0;

                  return (
                    <div
                      key={idx}
                      className={`relative p-2 rounded-xl border transition group cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/40'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                      onClick={() => onSelectPage(idx)}
                    >
                      {/* Page Thumbnail Mini Preview */}
                      <div 
                        className="w-full h-32 bg-white text-slate-900 rounded-lg p-2 overflow-hidden shadow-inner text-[7px] leading-tight flex flex-col justify-between transition-transform"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                        <div className="font-bold border-b border-slate-200 pb-1 text-[8px] text-slate-800 truncate">
                          {tmpl?.header.title || `Página ${idx + 1}`}
                        </div>
                        <div className="text-slate-500 line-clamp-3">
                          {tmpl?.sections[0]?.paragraphs?.[0] || 'Contenido del documento PDF...'}
                        </div>
                        <div className="text-[6px] text-slate-400 border-t border-slate-100 pt-0.5 flex justify-between">
                          <span>OmniPDF</span>
                          <span>Pág. {idx + 1}</span>
                        </div>
                      </div>

                      {/* Page Control Bar */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-semibold">
                          {t.page} {idx + 1}
                        </span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRotatePage(idx);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                            title={t.rotatePage}
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePage(idx);
                            }}
                            disabled={pageCount <= 1}
                            className="p-1 rounded hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 disabled:opacity-20"
                            title={t.deletePage}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Annotations List */}
        {activeTab === 'annotations' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {t.annotationsList} ({currentDoc?.annotations?.length || 0})
            </div>

            {!currentDoc || currentDoc.annotations.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hay anotaciones aún. Usa la barra superior para agregar firmas, resaltados o notas.
              </div>
            ) : (
              currentDoc.annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ann.color }} />
                      <span className="font-bold text-slate-200 uppercase text-[10px]">
                        {ann.type} (Pág. {ann.pageIndex + 1})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {ann.content || ann.signatureMeta?.signerName || ann.stampType || 'Trazo / Resaltado'}
                    </p>
                    <span className="text-[9px] text-slate-500">
                      {new Date(ann.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteAnnotation(ann.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Digital Stamps Gallery */}
        {activeTab === 'stamps' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {t.stampsGallery}
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Haz clic para estampar en la página actual:
            </p>

            <div className="space-y-2">
              {stampsList.map((st) => (
                <button
                  key={st.type}
                  onClick={() => onInsertStamp(st.type)}
                  className={`w-full py-2.5 px-3 rounded-xl border-2 font-bold text-xs tracking-wider transition hover:scale-[1.02] shadow-sm flex items-center justify-between ${st.color}`}
                >
                  <span>★ {st.label} ★</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Security Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>{t.auditTrail}</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Verificado
              </span>
            </div>

            <div className="space-y-2">
              {auditLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold uppercase ${
                      log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {log.details}
                  </p>
                  <div className="text-[9px] text-slate-500 flex items-center justify-between">
                    <span>{log.device}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
