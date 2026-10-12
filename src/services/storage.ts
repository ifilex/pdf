import { PdfDocument, DeviceInfo, SecurityAuditLog, ReminderNotification, SavedSignature, UserSecuritySettings } from '../types';
import { INITIAL_DOCUMENTS } from '../data/sampleDocuments';

const STORAGE_KEYS = {
  DOCUMENTS: 'omnipdf_user_documents_v2',
  ACTIVE_DOC_ID: 'omnipdf_user_active_doc_id_v2',
  DEVICES: 'omnipdf_devices_v1',
  SECURITY_SETTINGS: 'omnipdf_security_settings_v1',
  SECURITY_AUDIT: 'omnipdf_security_audit_v1',
  NOTIFICATIONS: 'omnipdf_notifications_v1',
  SIGNATURES: 'omnipdf_saved_signatures_v1',
  OFFLINE_QUEUE: 'omnipdf_offline_queue_v1',
  APP_LANGUAGE: 'omnipdf_language_v1',
  READING_THEME: 'omnipdf_reading_theme_v1'
};

const DEFAULT_DEVICES: DeviceInfo[] = [
  {
    id: 'dev-curr',
    name: 'OmniPDF Web Client (Este Dispositivo)',
    type: 'desktop',
    os: navigator.userAgent.includes('Mac') ? 'macOS Ventura' : navigator.userAgent.includes('Win') ? 'Windows 11' : 'Linux / ChromeOS',
    browser: 'Chrome / Web Engine 128',
    lastActive: 'Activo ahora',
    isCurrentDevice: true,
    syncEnabled: true
  },
  {
    id: 'dev-ipad',
    name: 'iPad Pro 12.9" M2 (Oficina)',
    type: 'tablet',
    os: 'iPadOS 17.5',
    browser: 'OmniPDF Native / Safari',
    lastActive: 'Hace 8 minutos',
    isCurrentDevice: false,
    syncEnabled: true
  },
  {
    id: 'dev-iphone',
    name: 'iPhone 15 Pro Max (Móvil)',
    type: 'mobile',
    os: 'iOS 17.5.1',
    browser: 'OmniPDF Mobile App',
    lastActive: 'Hace 23 minutos',
    isCurrentDevice: false,
    syncEnabled: true
  },
  {
    id: 'dev-win',
    name: 'ThinkPad Workstation (Despacho)',
    type: 'desktop',
    os: 'Windows 11 Pro Enterprise',
    browser: 'Edge Workstation',
    lastActive: 'Ayer, 18:42',
    isCurrentDevice: false,
    syncEnabled: true
  }
];

const DEFAULT_SECURITY: UserSecuritySettings = {
  biometricEnabled: true,
  requirePinOnStart: false,
  pinHash: '1234', // Default demo PIN
  autoLockMinutes: 5,
  lastUnlockTime: Date.now(),
  isVaultLocked: false,
  twoFactorEnabled: true
};

const DEFAULT_NOTIFICATIONS: ReminderNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Bienvenido a OmniPDF Studio',
    message: 'Tu entorno seguro para visualizar, editar y firmar documentos PDF con autenticación biométrica y nube en tiempo real.',
    scheduledTime: Date.now(),
    isRead: false,
    isCompleted: false,
    priority: 'low',
    createdAt: Date.now()
  }
];

const DEFAULT_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'audit-init',
    timestamp: Date.now(),
    action: 'cloud_sync',
    status: 'success',
    details: 'Sesión iniciada con cifrado de extremo a extremo y soporte offline activado',
    device: 'OmniPDF Client Engine',
    ip: '127.0.0.1'
  }
];

export const storageService = {
  getDocuments(): PdfDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock sample documents
          return parsed.filter(d => !d.id.startsWith('doc-nda-001') && !d.id.startsWith('doc-service-002') && !d.id.startsWith('doc-invoice-003') && !d.id.startsWith('doc-bylaws-004'));
        }
      }
    } catch (e) {
      console.warn('Error reading documents from localStorage', e);
    }
    return [];
  },

  saveDocuments(docs: PdfDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.warn('Error saving documents to localStorage', e);
    }
  },

  getActiveDocumentId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID) || '';
  },

  setActiveDocumentId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
  },

  getDevices(): DeviceInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEVICES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
    return DEFAULT_DEVICES;
  },

  saveDevices(devices: DeviceInfo[]): void {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  },

  getSecuritySettings(): UserSecuritySettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SECURITY_SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(STORAGE_KEYS.SECURITY_SETTINGS, JSON.stringify(DEFAULT_SECURITY));
    return DEFAULT_SECURITY;
  },

  saveSecuritySettings(settings: UserSecuritySettings): void {
    localStorage.setItem(STORAGE_KEYS.SECURITY_SETTINGS, JSON.stringify(settings));
  },

  getAuditLogs(): SecurityAuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SECURITY_AUDIT);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(STORAGE_KEYS.SECURITY_AUDIT, JSON.stringify(DEFAULT_AUDIT_LOGS));
    return DEFAULT_AUDIT_LOGS;
  },

  addAuditLog(entry: Omit<SecurityAuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: SecurityAuditLog = {
      ...entry,
      id: 'audit-' + Date.now(),
      timestamp: Date.now()
    };
    const updated = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.SECURITY_AUDIT, JSON.stringify(updated));
  },

  getNotifications(): ReminderNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  },

  saveNotifications(notifs: ReminderNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  getSavedSignatures(): SavedSignature[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SIGNATURES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return [];
  },

  saveSignature(sig: SavedSignature): void {
    const signatures = this.getSavedSignatures();
    const updated = [sig, ...signatures.filter(s => s.id !== sig.id)];
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(updated));
  },

  getOfflineQueue(): Array<{ docId: string; timestamp: number; action: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return [];
  },

  addToOfflineQueue(item: { docId: string; action: string }): void {
    const queue = this.getOfflineQueue();
    queue.push({ ...item, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  clearOfflineQueue(): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }
};
