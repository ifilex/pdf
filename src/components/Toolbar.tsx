import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  Highlighter,
  PenTool,
  Type,
  FileSignature,
  Stamp,
  MessageSquare,
  Square,
  EyeOff,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ToolType, Language } from '../types';
import { translations } from '../i18n/translations';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  language: Language;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRotateCurrentPage: () => void;
  onDeleteCurrentPage: () => void;
  onAddPage: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (w: number) => void;
  onOpenSignatureModal: () => void;
  onOpenStampMenu: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  language,
  zoom,
  onZoomChange,
  currentPage,
  totalPages,
  onPageChange,
  onRotateCurrentPage,
  onDeleteCurrentPage,
  onAddPage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  activeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onOpenSignatureModal
}) => {
  const t = translations[language];
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = [
    '#facc15', // Yellow
    '#22c55e', // Green
    '#38bdf8', // Blue/Cyan
    '#ec4899', // Pink
    '#f97316', // Orange
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#0f172a'  // Dark Black
  ];

  return (
    <div id="main-editor-toolbar" className="bg-slate-800/95 backdrop-blur border-b border-slate-700/80 px-2 md:px-4 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-slate-200 select-none z-30">
      {/* Primary Editing Tools Group */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
        {/* Select / Cursor */}
        <button
          id="tool-btn-select"
          onClick={() => onSelectTool('select')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'select'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.select}
        >
          <MousePointer className="w-4 h-4" />
          <span className="hidden xl:inline">{t.select}</span>
        </button>

        {/* Pan / Hand */}
        <button
          id="tool-btn-hand"
          onClick={() => onSelectTool('hand')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'hand'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.hand}
        >
          <Hand className="w-4 h-4" />
          <span className="hidden xl:inline">{t.hand}</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700 mx-1" />

        {/* Highlighter */}
        <button
          id="tool-btn-highlight"
          onClick={() => onSelectTool('highlight')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'highlight'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.highlight}
        >
          <Highlighter className="w-4 h-4" />
          <span className="hidden lg:inline">{t.highlight}</span>
        </button>

        {/* Freehand Draw */}
        <button
          id="tool-btn-draw"
          onClick={() => onSelectTool('draw')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'draw'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.draw}
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden lg:inline">{t.draw}</span>
        </button>

        {/* Add Text */}
        <button
          id="tool-btn-text"
          onClick={() => onSelectTool('text')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'text'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.text}
        >
          <Type className="w-4 h-4" />
          <span className="hidden lg:inline">{t.text}</span>
        </button>

        {/* Digital Signature Studio Button */}
        <button
          id="tool-btn-signature"
          onClick={() => {
            onSelectTool('signature');
            onOpenSignatureModal();
          }}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
            activeTool === 'signature'
              ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-900/50'
              : 'bg-indigo-950/70 border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/80'
          }`}
          title={t.signature}
        >
          <FileSignature className="w-4 h-4 text-indigo-300" />
          <span>{t.signature}</span>
        </button>

        {/* Stamp Tool */}
        <button
          id="tool-btn-stamp"
          onClick={() => onSelectTool('stamp')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'stamp'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.stamp}
        >
          <Stamp className="w-4 h-4" />
          <span className="hidden xl:inline">{t.stamp}</span>
        </button>

        {/* Sticky Note */}
        <button
          id="tool-btn-note"
          onClick={() => onSelectTool('note')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'note'
              ? 'bg-amber-400 text-slate-900 font-semibold shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.note}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden xl:inline">{t.note}</span>
        </button>

        {/* Shapes / Rectangles */}
        <button
          id="tool-btn-shape"
          onClick={() => onSelectTool('shape')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'shape'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.shape}
        >
          <Square className="w-4 h-4" />
        </button>

        {/* Redact / Blackout */}
        <button
          id="tool-btn-redact"
          onClick={() => onSelectTool('redact')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'redact'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.redact}
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* Eraser */}
        <button
          id="tool-btn-eraser"
          onClick={() => onSelectTool('eraser')}
          className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            activeTool === 'eraser'
              ? 'bg-slate-600 text-white shadow-sm'
              : 'hover:bg-slate-700/80 text-slate-300'
          }`}
          title={t.eraser}
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Color Palette Popover for Draw/Highlight/Text */}
        <div className="relative">
          <button
            id="btn-color-palette-picker"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-700/60 flex items-center gap-1"
            title="Color del trazo / texto"
          >
            <div
              className="w-4 h-4 rounded-full border border-white/40 shadow-inner"
              style={{ backgroundColor: activeColor }}
            />
          </button>

          {showColorPicker && (
            <div className="absolute left-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 flex flex-col gap-2 w-40">
              <div className="text-[10px] uppercase font-bold text-slate-400">Color</div>
              <div className="grid grid-cols-4 gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onColorChange(c);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition shadow"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Grosor</div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={strokeWidth}
                  onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-xs font-mono text-slate-300 w-4">{strokeWidth}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center/Right: Undo, Redo, Zoom, Page Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-slate-900/60 rounded-lg p-0.5 border border-slate-700/60">
          <button
            id="btn-undo"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition"
            title={t.undo}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-redo"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition"
            title={t.redo}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg px-1.5 py-0.5 border border-slate-700/60 text-xs">
          <button
            id="btn-zoom-out"
            onClick={() => onZoomChange(Math.max(0.5, zoom - 0.15))}
            className="p-1 rounded hover:bg-slate-800 text-slate-300"
            title={t.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-slate-300 w-11 text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            id="btn-zoom-in"
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.15))}
            className="p-1 rounded hover:bg-slate-800 text-slate-300"
            title={t.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-zoom-fit-width"
            onClick={() => onZoomChange(1.0)}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hidden md:inline"
            title={t.fitWidth}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page Navigation & Page Manipulation */}
        <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg px-2 py-1 border border-slate-700/60 text-xs font-medium">
          <button
            id="btn-page-prev"
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || totalPages === 0}
            className="p-0.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-300">
            {t.page} <span className="font-bold text-white">{totalPages > 0 ? currentPage + 1 : 0}</span> {t.of}{' '}
            <span className="text-slate-400">{totalPages}</span>
          </span>
          <button
            id="btn-page-next"
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={totalPages === 0 || currentPage >= totalPages - 1}
            className="p-0.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Page Actions: Rotate, Add, Delete */}
        <div className="hidden lg:flex items-center gap-0.5">
          <button
            id="btn-page-rotate"
            onClick={onRotateCurrentPage}
            disabled={totalPages === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30 transition"
            title={t.rotatePage}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-page-add"
            onClick={onAddPage}
            disabled={totalPages === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30 transition"
            title={t.addPage}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-page-delete"
            onClick={onDeleteCurrentPage}
            disabled={totalPages <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 border border-slate-700 disabled:opacity-30 transition"
            title={t.deletePage}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
