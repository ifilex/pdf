import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Calendar, 
  Check, 
  Trash2, 
  X, 
  AlertCircle, 
  Clock, 
  Send,
  Sparkles
} from 'lucide-react';
import { Language, PdfDocument, ReminderNotification } from '../types';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storage';
import { notificationService } from '../services/notificationService';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentDoc?: PdfDocument | null;
  onNotificationCountChange?: () => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  language,
  currentDoc,
  onNotificationCountChange
}) => {
  const t = translations[language];
  const [notifications, setNotifications] = useState<ReminderNotification[]>(() => storageService.getNotifications());
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  
  // New reminder form
  const [newTitle, setNewTitle] = useState(currentDoc ? `Revisar y firmar: ${currentDoc.title}` : 'Revisar y firmar documento');
  const [newMessage, setNewMessage] = useState('Verificar cláusulas legales y proceder con la firma digital.');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [scheduledDate, setScheduledDate] = useState('2026-08-30');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  
  const [pushStatus, setPushStatus] = useState<boolean>(() => notificationService.hasPushPermission());

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    const granted = await notificationService.requestPushPermission();
    setPushStatus(granted);
    if (granted) {
      notificationService.triggerNotification(
        'Notificaciones OmniPDF Habilitadas',
        'Recibirás recordatorios importantes y alertas de sincronización.',
        { priority: 'low' }
      );
      refreshList();
    }
  };

  const refreshList = () => {
    const all = storageService.getNotifications();
    setNotifications(all);
    onNotificationCountChange?.();
  };

  const handleCreateReminder = () => {
    if (!newTitle.trim()) return;

    notificationService.triggerNotification(newTitle, newMessage, {
      documentId: currentDoc?.id,
      documentTitle: currentDoc?.title,
      priority
    });

    refreshList();
    setActiveTab('list');
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    storageService.saveNotifications(updated);
    onNotificationCountChange?.();
  };

  const handleDeleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    storageService.saveNotifications(updated);
    onNotificationCountChange?.();
  };

  const handleTriggerTest = () => {
    notificationService.triggerNotification(
      'Alerta de Firma Requerida',
      currentDoc ? `El documento "${currentDoc.title}" requiere firma digital hoy.` : 'Un documento pendiente requiere tu atención hoy.',
      { documentId: currentDoc?.id, documentTitle: currentDoc?.title, priority: 'high' }
    );
    refreshList();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="reminders-modal-dialog"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.notificationCenter}
              </h3>
              <p className="text-xs text-slate-400">
                Recordatorios programados y alertas automáticas
              </p>
            </div>
          </div>
          <button
            id="btn-close-reminders-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mis Recordatorios ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                activeTab === 'create' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addReminder}
            </button>
          </div>

          <button
            onClick={handleTriggerTest}
            className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Probar Alerta
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Push Permission Toggle Banner */}
          {!pushStatus ? (
            <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-700/60 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-200">
                <span className="font-semibold text-indigo-300 block">Notificaciones del Sistema</span>
                Permite que OmniPDF te envíe recordatorios en tu navegador.
              </div>
              <button
                onClick={handleRequestPush}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 transition"
              >
                {t.enablePush}
              </button>
            </div>
          ) : (
            <div className="px-3 py-2 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.pushEnabled}</span>
            </div>
          )}

          {/* Tab 1: Notifications List */}
          {activeTab === 'list' && (
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  <span>{t.noNotifications}</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                      !n.isRead
                        ? 'bg-slate-950/90 border-indigo-900/60 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          n.priority === 'high' ? 'bg-rose-500' : n.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                        <span className="text-xs font-bold text-slate-200">{n.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{n.message}</p>
                      {n.documentTitle && (
                        <p className="text-[10px] text-indigo-300 font-medium">Doc: {n.documentTitle}</p>
                      )}
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                          title={t.markAsRead}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Create Scheduled Reminder */}
          {activeTab === 'create' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t.reminderTitle}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Mensaje / Instrucciones
                </label>
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hora</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t.priority}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: t.lowPriority, color: 'text-blue-400' },
                    { id: 'medium', label: t.mediumPriority, color: 'text-amber-400' },
                    { id: 'high', label: t.highPriority, color: 'text-rose-400' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as any)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                        priority === p.id
                          ? 'bg-indigo-950 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateReminder}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 transition mt-2"
              >
                <Send className="w-4 h-4" />
                Programar Recordatorio
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
