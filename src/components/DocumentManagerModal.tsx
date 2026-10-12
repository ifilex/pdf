import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Upload, 
  Star, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  Search, 
  Folder, 
  ShieldCheck, 
  X, 
  Check,
  Tag
} from 'lucide-react';
import { Language, PdfDocument } from '../types';
import { translations } from '../i18n/translations';
import { INITIAL_DOCUMENTS } from '../data/sampleDocuments';

interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  documents: PdfDocument[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateNewDoc: (templateKey?: string) => void;
  onUploadCustomFile: (file: File) => void;
  onDeleteDoc: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  language,
  documents,
  activeDocId,
  onSelectDoc,
  onCreateNewDoc,
  onUploadCustomFile,
  onDeleteDoc,
  onToggleLock,
  onToggleFavorite
}) => {
  const t = translations[language];
  const [filterCategory, setFilterCategory] = useState<'all' | 'legal' | 'contracts' | 'invoices' | 'medical' | 'favorites' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const filteredDocs = documents.filter((doc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchTag = doc.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchTag) return false;
    }

    if (filterCategory === 'favorites') return doc.isFavorite;
    if (filterCategory === 'locked') return doc.isLocked;
    if (filterCategory === 'legal') return doc.category === 'legal';
    if (filterCategory === 'contracts') return doc.category === 'contracts';
    if (filterCategory === 'invoices') return doc.category === 'invoices';
    if (filterCategory === 'medical') return doc.category === 'medical';
    return true;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUploadCustomFile(files[0]);
      onClose();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadCustomFile(files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="doc-manager-modal-dialog"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.allDocuments} & Bóveda Cloud
              </h3>
              <p className="text-xs text-slate-400">
                Gestiona, firma, protege y sincroniza tus archivos PDF
              </p>
            </div>
          </div>
          <button
            id="btn-close-doc-manager-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Search & Categories */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {[
              { id: 'all', label: t.allDocuments },
              { id: 'favorites', label: t.favorites, icon: Star },
              { id: 'locked', label: t.lockedDocs, icon: Lock },
              { id: 'legal', label: 'Legal' },
              { id: 'contracts', label: 'Contratos' },
              { id: 'invoices', label: 'Facturas' }
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                    filterCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Drag & Drop File Upload Banner */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-5 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
                : 'border-slate-700/80 bg-slate-950/60 hover:border-slate-600 text-slate-400'
            }`}
          >
            <Upload className="w-8 h-8 text-indigo-400 mb-2" />
            <p className="text-xs font-semibold text-slate-200">{t.dragAndDrop}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Soporta archivos .pdf, imágenes .png, .jpg y escaneos</p>
            <label className="mt-2.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-md transition">
              {t.openFile}
              <input
                type="file"
                accept="application/pdf, image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick Create from Templates */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{t.sampleContracts} & Plantillas Oficiales</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div
                onClick={() => {
                  onCreateNewDoc();
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500 hover:bg-slate-950 cursor-pointer transition flex flex-col justify-between h-24 group"
              >
                <div className="flex items-center justify-between">
                  <Plus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/40">
                    Nuevo
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-200 line-clamp-2 group-hover:text-emerald-300">
                  Documento en Blanco
                </span>
              </div>

              {[
                { key: 'doc-nda-001', label: t.templateNDA, tag: 'Legal / NDA' },
                { key: 'doc-service-002', label: t.templateService, tag: 'Contratos' },
                { key: 'doc-invoice-003', label: t.templateInvoice, tag: 'Finanzas' },
                { key: 'doc-med-004', label: t.templateMedical, tag: 'Médico' }
              ].map((tmpl) => (
                <div
                  key={tmpl.key}
                  onClick={() => {
                    onCreateNewDoc(tmpl.key);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500 hover:bg-slate-950 cursor-pointer transition flex flex-col justify-between h-24 group"
                >
                  <div className="flex items-center justify-between">
                    <FileText className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/40">
                      {tmpl.tag}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-200 line-clamp-2 group-hover:text-indigo-300">
                    {tmpl.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User's Documents List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tus Archivos ({filteredDocs.length})</span>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl text-xs text-slate-400 space-y-1">
                <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                <p className="font-semibold text-slate-300">No hay archivos en esta categoría</p>
                <p className="text-slate-500">Sube un archivo PDF o crea uno nuevo usando las opciones superiores.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredDocs.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <div
                      key={doc.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div 
                        onClick={() => {
                          onSelectDoc(doc.id);
                          onClose();
                        }}
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">
                            {doc.title}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {doc.pageCount} págs • {Math.round(doc.fileSize / 1024)} KB • {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {doc.tags.slice(0, 2).map((tg) => (
                              <span key={tg} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                                {tg}
                              </span>
                            ))}
                            {doc.isLocked && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 font-medium flex items-center gap-0.5 border border-amber-800/60">
                                <Lock className="w-2.5 h-2.5" /> Bóveda
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Item Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onToggleFavorite(doc.id)}
                          className={`p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition ${
                            doc.isFavorite ? 'text-amber-400' : ''
                          }`}
                          title="Favorito"
                        >
                          <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleLock(doc.id)}
                          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ${
                            doc.isLocked ? 'text-amber-400' : ''
                          }`}
                          title={doc.isLocked ? 'Desproteger' : 'Proteger con Bóveda'}
                        >
                          {doc.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{documents.length} documentos almacenados y sincronizados</span>
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
