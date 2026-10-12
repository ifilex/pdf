export type Language = 'es' | 'en' | 'fr' | 'de' | 'pt';

export type ToolType = 
  | 'select'
  | 'hand'
  | 'highlight'
  | 'draw'
  | 'text'
  | 'signature'
  | 'stamp'
  | 'note'
  | 'shape'
  | 'redact'
  | 'eraser';

export type ReadingMode = 'light' | 'dark' | 'sepia' | 'inverted' | 'night-warm';

export type CloudProvider = 'omnicloud' | 'gdrive' | 'dropbox' | 'onedrive';

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  pageIndex: number;
  type: 'highlight' | 'draw' | 'text' | 'signature' | 'stamp' | 'note' | 'rect' | 'arrow' | 'redact';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: AnnotationPoint[]; // For drawing
  content?: string; // For text, notes, stamps
  color: string;
  opacity?: number;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  signatureDataUrl?: string;
  signatureMeta?: SignatureMetadata;
  stampType?: 'APPROVED' | 'CONFIDENTIAL' | 'SIGNED' | 'REJECTED' | 'URGENT' | 'PAID' | 'VERIFIED';
  author?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SignatureMetadata {
  signerName: string;
  signerEmail: string;
  signedAt: string;
  certificateId: string;
  hashAlgorithm: string;
  documentChecksum: string;
  biometricVerified: boolean;
  ipAddress: string;
  deviceInfo: string;
}

export interface PdfDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
  isLocked: boolean;
  isFavorite: boolean;
  tags: string[];
  annotations: Annotation[];
  pagesRotation: number[]; // e.g. [0, 90, 0]
  dataUrl?: string; // PDF base64 or object url
  originalPdfBytes?: Uint8Array;
  cloudSyncStatus: 'synced' | 'syncing' | 'pending' | 'offline' | 'error';
  version: number;
  category: 'contracts' | 'invoices' | 'legal' | 'medical' | 'personal' | 'general';
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  lastActive: string;
  isCurrentDevice: boolean;
  syncEnabled: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: number;
  action: 'unlock_biometric' | 'unlock_pin' | 'lock_vault' | 'sign_document' | 'export_document' | 'cloud_sync' | 'failed_auth';
  status: 'success' | 'failed' | 'warning';
  documentTitle?: string;
  details: string;
  device: string;
  ip: string;
}

export interface ReminderNotification {
  id: string;
  documentId?: string;
  documentTitle?: string;
  title: string;
  message: string;
  scheduledTime: number;
  isRead: boolean;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface SavedSignature {
  id: string;
  title: string;
  type: 'draw' | 'type' | 'image';
  dataUrl: string;
  signerName: string;
  createdAt: number;
  isDefault: boolean;
}

export interface UserSecuritySettings {
  biometricEnabled: boolean;
  requirePinOnStart: boolean;
  pinHash: string; // Stored hash or simple pin
  autoLockMinutes: number; // 0 = never, 1, 5, 15, 30
  lastUnlockTime: number;
  isVaultLocked: boolean;
  twoFactorEnabled: boolean;
}
