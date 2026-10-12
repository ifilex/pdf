import React, { useState } from 'react';
import { 
  Cloud, 
  Laptop, 
  Smartphone, 
  Tablet, 
  RefreshCw, 
  CheckCircle2, 
  History, 
  Database, 
  HardDrive, 
  X, 
  ShieldCheck,
  Check,
  Server
} from 'lucide-react';
import { DeviceInfo, Language, PdfDocument } from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storage';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentDoc?: PdfDocument | null;
  onRestoreVersion?: (ver: number) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  language,
  currentDoc,
  onRestoreVersion
}) => {
  const t = translations[language];
  const [devices, setDevices] = useState<DeviceInfo[]>(() => storageService.getDevices());
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'omnicloud' | 'gdrive' | 'dropbox'>('omnicloud');

  if (!isOpen) return null;

  const handleForceSync = async () => {
    setIsSyncingNow(true);
    setSyncSuccessMessage(false);

    // Simulate multi-region cloud sync
    await new Promise(resolve => setTimeout(resolve, 1200));

    storageService.addAuditLog({
      action: 'cloud_sync',
      status: 'success',
      documentTitle: currentDoc?.title || 'Todos los archivos',
      details: 'Sincronización multi-dispositivo forzada exitosamente en tiempo real',
      device: 'OmniCloud Sync Engine',
      ip: '10.0.8.99 (Encrypted TLS 1.3)'
    });

    setIsSyncingNow(false);
    setSyncSuccessMessage(true);

    setTimeout(() => {
      setSyncSuccessMessage(false);
    }, 4000);
  };

  const handleToggleDeviceSync = (id: string) => {
    const updated = devices.map(d => d.id === id ? { ...d, syncEnabled: !d.syncEnabled } : d);
    setDevices(updated);
    storageService.saveDevices(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="cloud-sync-modal-dialog"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                {t.cloudSyncTitle}
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Nube Activa
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.autoSaveDesc}
              </p>
            </div>
          </div>
          <button
            id="btn-close-cloud-sync-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Cloud Status Banner & Trigger */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Server className="w-4 h-4 text-blue-400" />
                <span>OmniCloud Engine v4.2</span>
              </div>
              <p className="text-xs text-slate-300">
                {t.lastSync}: <span className="text-blue-300 font-mono">Hace 12 segundos</span> • Cifrado AES-GCM
              </p>
            </div>

            <button
              id="btn-trigger-force-sync"
              onClick={handleForceSync}
              disabled={isSyncingNow}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-900/40 transition active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin' : ''}`} />
              <span>{isSyncingNow ? t.saving : t.forceSync}</span>
            </button>
          </div>

          {syncSuccessMessage && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Todos los documentos y firmas se sincronizaron con éxito en tus 4 dispositivos conectados.</span>
            </div>
          )}

          {/* Cloud Storage Providers */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Proveedor de Almacenamiento
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'omnicloud', name: 'OmniCloud Vault', badge: 'Primario', icon: Server },
                { id: 'gdrive', name: 'Google Drive', badge: 'Conectado', icon: HardDrive },
                { id: 'dropbox', name: 'Dropbox Sync', badge: 'Respaldado', icon: Database }
              ].map((prov) => {
                const Icon = prov.icon;
                return (
                  <div
                    key={prov.id}
                    onClick={() => setSelectedProvider(prov.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between h-20 ${
                      selectedProvider === prov.id
                        ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {prov.badge}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{prov.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multiplatform Synced Devices */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.connectedDevices} ({devices.length})
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Acceso Multiplataforma Fluido
              </span>
            </div>

            <div className="space-y-2">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                      {dev.type === 'desktop' ? (
                        <Laptop className="w-4 h-4 text-blue-400" />
                      ) : dev.type === 'tablet' ? (
                        <Tablet className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{dev.name}</span>
                        {dev.isCurrentDevice && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-700 text-[9px] font-semibold text-indigo-300">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {dev.os} • {dev.browser} • <span className="text-slate-500">{dev.lastActive}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleDeviceSync(dev.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                        dev.syncEnabled
                          ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {dev.syncEnabled ? 'Sincronizado' : 'Pausado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version History of Active Document */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <History className="w-4 h-4 text-indigo-400" />
              {t.versionHistory} {currentDoc ? `- ${currentDoc.title}` : ''}
            </div>

            <div className="space-y-1.5">
              {[
                { ver: 3, label: 'Versión 3 (Actual)', time: 'Hoy, 18:45', note: 'Firmas digitales aplicadas y selladas' },
                { ver: 2, label: 'Versión 2', time: 'Ayer, 11:20', note: 'Anotaciones de auditoría agregadas' },
                { ver: 1, label: 'Versión 1', time: '26 Agosto 2026', note: 'Creación original del documento' }
              ].map((v) => (
                <div
                  key={v.ver}
                  className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{v.label}</span>
                    <p className="text-[11px] text-slate-400">{v.time} • {v.note}</p>
                  </div>
                  {v.ver === 3 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-indigo-300 font-semibold">
                      {t.currentVersion}
                    </span>
                  ) : (
                    <button
                      onClick={() => onRestoreVersion?.(v.ver)}
                      className="text-[11px] text-indigo-400 hover:underline font-medium"
                    >
                      {t.restoreVersion}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sincronización encriptada de extremo a extremo
          </span>
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
