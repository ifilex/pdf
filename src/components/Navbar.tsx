import React, { useState } from 'react';
import { 
  FileText, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Moon, 
  Sun, 
  Eye, 
  Globe, 
  Bell, 
  Download, 
  Laptop, 
  Plus, 
  FolderOpen, 
  ShieldCheck,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { PdfDocument, Language, ReadingMode } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  currentDoc?: PdfDocument | null;
  documents: PdfDocument[];
  language: Language;
  onLanguageChange: (lang: Language) => void;
  readingMode: ReadingMode;
  onReadingModeChange: (mode: ReadingMode) => void;
  isOnline: boolean;
  isSaving: boolean;
  isVaultLocked: boolean;
  onToggleVault: () => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenDevices: () => void;
  onOpenExportModal: () => void;
  onOpenDocManager: () => void;
  onOpenCloudModal: () => void;
  onSelectDoc: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDoc,
  documents,
  language,
  onLanguageChange,
  readingMode,
  onReadingModeChange,
  isOnline,
  isSaving,
  isVaultLocked,
  onToggleVault,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenDevices,
  onOpenExportModal,
  onOpenDocManager,
  onOpenCloudModal,
  onSelectDoc
}) => {
  const t = translations[language];
  const [showDocDropdown, setShowDocDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const langNames: Record<Language, { label: string; flag: string }> = {
    es: { label: 'Español', flag: '🇪🇸' },
    en: { label: 'English', flag: '🇺🇸' },
    fr: { label: 'Français', flag: '🇫🇷' },
    de: { label: 'Deutsch', flag: '🇩🇪' },
    pt: { label: 'Português', flag: '🇧🇷' }
  };

  return (
    <header id="main-navbar" className="bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 px-3 md:px-4 py-2.5 flex items-center justify-between gap-2 select-none sticky top-0 z-40 transition-colors">
      {/* Left: Brand & Document Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          id="btn-doc-manager-brand"
          onClick={onOpenDocManager}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 transition text-indigo-300 font-semibold text-sm group"
          title={t.allDocuments}
        >
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/50 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline font-bold tracking-tight text-white">{t.appName}</span>
        </button>

        {/* Document Switcher Dropdown */}
        <div className="relative">
          <button
            id="btn-doc-switcher"
            onClick={() => setShowDocDropdown(!showDocDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs md:text-sm font-medium text-slate-200 transition max-w-[200px] md:max-w-[320px] truncate"
          >
            <span className="truncate">{currentDoc ? currentDoc.title : t.allDocuments}</span>
            {currentDoc?.isLocked && (
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showDocDropdown && (
            <div className="absolute left-0 mt-1.5 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>{t.documents} ({documents.length})</span>
                <button 
                  onClick={() => { setShowDocDropdown(false); onOpenDocManager(); }}
                  className="text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <FolderOpen className="w-3 h-3" /> {t.openFile}
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-700/50">
                {documents.length === 0 ? (
                  <div className="px-3 py-3 text-center text-xs text-slate-400">
                    No hay documentos abiertos
                  </div>
                ) : (
                  documents.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDoc(d.id);
                        setShowDocDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-slate-700/60 transition ${
                        currentDoc && d.id === currentDoc.id ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{d.title}</span>
                      </div>
                      {d.isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
              <div className="p-1.5 border-t border-slate-700">
                <button
                  onClick={() => { setShowDocDropdown(false); onOpenDocManager(); }}
                  className="w-full text-center py-1.5 text-xs text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 rounded-lg flex items-center justify-center gap-1.5 font-medium border border-indigo-700/40"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.newDocument}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Cloud Sync & Offline Indicator */}
        <button
          id="btn-cloud-sync-status"
          onClick={onOpenCloudModal}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
            !isOnline
              ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
              : isSaving
              ? 'bg-blue-950/60 border-blue-800/80 text-blue-300 animate-pulse'
              : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
          }`}
          title={isOnline ? t.cloudSynced : t.offlineMode}
        >
          {!isOnline ? (
            <>
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.offlineMode}</span>
            </>
          ) : isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>{t.saving}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.cloudSynced}</span>
            </>
          )}
        </button>
      </div>

      {/* Right Controls: Reading Mode, Language, Biometric Vault, Notifications, Devices, Export */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Reading Mode Selector */}
        <div className="relative">
          <button
            id="btn-reading-mode-selector"
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            title={t.readingMode}
          >
            {readingMode === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : readingMode === 'sepia' ? (
              <Eye className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
          </button>

          {showModeDropdown && (
            <div className="absolute right-0 mt-1.5 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs divide-y divide-slate-700/50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400">
                {t.readingMode}
              </div>
              <button
                onClick={() => { onReadingModeChange('light'); setShowModeDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-700 ${
                  readingMode === 'light' ? 'text-indigo-400 font-semibold bg-indigo-950/30' : 'text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" /> {t.modeLight}
              </button>
              <button
                onClick={() => { onReadingModeChange('dark'); setShowModeDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-700 ${
                  readingMode === 'dark' ? 'text-indigo-400 font-semibold bg-indigo-950/30' : 'text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> {t.modeDark}
              </button>
              <button
                onClick={() => { onReadingModeChange('sepia'); setShowModeDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-700 ${
                  readingMode === 'sepia' ? 'text-indigo-400 font-semibold bg-indigo-950/30' : 'text-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-500" /> {t.modeSepia}
              </button>
              <button
                onClick={() => { onReadingModeChange('inverted'); setShowModeDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-700 ${
                  readingMode === 'inverted' ? 'text-indigo-400 font-semibold bg-indigo-950/30' : 'text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-teal-400" /> {t.modeInverted}
              </button>
              <button
                onClick={() => { onReadingModeChange('night-warm'); setShowModeDropdown(false); }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-700 ${
                  readingMode === 'night-warm' ? 'text-indigo-400 font-semibold bg-indigo-950/30' : 'text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-orange-400" /> {t.modeWarm}
              </button>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <button
            id="btn-language-selector"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            title="Idioma / Language"
          >
            <Globe className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline font-medium uppercase">{language}</span>
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-1.5 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
              {(Object.keys(langNames) as Language[]).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => {
                    onLanguageChange(langKey);
                    setShowLangDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-700 ${
                    language === langKey ? 'text-indigo-400 font-semibold bg-indigo-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>{langNames[langKey].flag}</span>
                  <span>{langNames[langKey].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Connected Devices */}
        <button
          id="btn-open-devices"
          onClick={onOpenDevices}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition relative"
          title={t.devices}
        >
          <Laptop className="w-4 h-4" />
        </button>

        {/* Notifications & Reminders Bell */}
        <button
          id="btn-open-notifications"
          onClick={onOpenNotifications}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition relative"
          title={t.notifications}
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Biometric Security Vault Button */}
        <button
          id="btn-toggle-vault-lock"
          onClick={onToggleVault}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shadow-sm ${
            isVaultLocked
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-amber-900/40 animate-pulse'
              : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border-emerald-700/60'
          }`}
          title={isVaultLocked ? t.unlockApp : t.lockApp}
        >
          {isVaultLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline">{t.unlockApp}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{t.securityVault}</span>
            </>
          )}
        </button>

        {/* Export / Reports Button */}
        <button
          id="btn-open-export-modal"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs border border-indigo-400/30 shadow-md shadow-indigo-900/30 transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.export}</span>
        </button>
      </div>
    </header>
  );
};
