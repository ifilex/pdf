import React, { useState, useEffect, useCallback } from 'react';
import { 
  PdfDocument, 
  Language, 
  ReadingMode, 
  ToolType, 
  Annotation, 
  SecurityAuditLog, 
  ReminderNotification 
} from './types';
import { INITIAL_DOCUMENTS } from './data/sampleDocuments';
import { translations } from './i18n/translations';
import { storageService } from './services/storage';
import { notificationService } from './services/notificationService';
import { biometricService } from './services/biometrics';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { PdfViewer } from './components/PdfViewer';
import { SignatureModal } from './components/SignatureModal';
import { BiometricModal } from './components/BiometricModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { RemindersModal } from './components/RemindersModal';
import { ExportReportModal } from './components/ExportReportModal';
import { DocumentManagerModal } from './components/DocumentManagerModal';

export default function App() {
  // 1. Core State
  const [documents, setDocuments] = useState<PdfDocument[]>(() => storageService.getDocuments());
  const [activeDocId, setActiveDocId] = useState<string>(() => storageService.getActiveDocumentId());
  const [language, setLanguage] = useState<Language>('es');
  const [readingMode, setReadingMode] = useState<ReadingMode>('light');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  
  // 2. Active Editing Tools State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeColor, setActiveColor] = useState<string>('#facc15'); // Yellow highlighter
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  
  // 3. Undo / Redo History Stack
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // 4. Synchronization & Offline State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<number>(Date.now());

  // 5. Security & Biometrics Vault State
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => storageService.getAuditLogs());

  // 6. Modals State
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [showCloudModal, setShowCloudModal] = useState<boolean>(false);
  const [showRemindersModal, setShowRemindersModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showDocManagerModal, setShowDocManagerModal] = useState<boolean>(false);

  // 7. Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'thumbnails' | 'annotations' | 'audit' | 'stamps' | 'vault'>('thumbnails');

  // 8. Pending Signature to place on click
  const [pendingSignature, setPendingSignature] = useState<{
    dataUrl: string;
    text?: string;
    type: 'draw' | 'type' | 'image';
    metadata: any;
  } | null>(null);

  // 9. Unread Notifications Count
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(() => {
    return storageService.getNotifications().filter(n => !n.isRead).length;
  });

  // Current Active Document (strictly null if no active document or list is empty)
  const currentDoc: PdfDocument | null = (activeDocId ? documents.find(d => d.id === activeDocId) : null) || (documents.length > 0 ? documents[0] : null);

  // Monitor Online/Offline Status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process offline queue
      const queue = storageService.getOfflineQueue();
      if (queue.length > 0) {
        setIsSaving(true);
        setTimeout(() => {
          storageService.clearOfflineQueue();
          setIsSaving(false);
          notificationService.triggerNotification(
            'Conexión Restaurada',
            `Se han sincronizado ${queue.length} cambios pendientes en la nube.`
          );
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      notificationService.triggerNotification(
        'Modo Sin Conexión Activado',
        'OmniPDF continuará funcionando offline. Tus cambios se guardarán localmente.',
        { priority: 'medium' }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to live notification events
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((_notif) => {
      setUnreadNotifsCount(storageService.getNotifications().filter(n => !n.isRead).length);
    });
    return unsubscribe;
  }, []);

  // Save documents whenever updated (Auto-Save)
  const saveDocumentsToStorage = useCallback((updatedDocs: PdfDocument[]) => {
    setDocuments(updatedDocs);
    storageService.saveDocuments(updatedDocs);
    
    // Trigger auto-save visual indicator
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastAutoSaveTime(Date.now());
    }, 600);

    if (!isOnline) {
      storageService.addToOfflineQueue({
        docId: activeDocId,
        action: 'auto_save_update'
      });
    }
  }, [activeDocId, isOnline]);

  // Set active document
  const handleSelectDoc = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;

    if (doc.isLocked && isVaultLocked) {
      setShowBiometricModal(true);
      return;
    }

    setActiveDocId(id);
    storageService.setActiveDocumentId(id);
    setCurrentPage(0);
    setHistory([]);
    setHistoryIndex(-1);
  };

  // Add Annotation
  const handleAddAnnotation = (ann: Annotation) => {
    if (!currentDoc) return;
    const currentAnns = currentDoc.annotations || [];
    const nextAnns = [...currentAnns, ann];

    // Push to undo history
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextAnns);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);

    const updatedDoc: PdfDocument = {
      ...currentDoc,
      annotations: nextAnns,
      updatedAt: Date.now()
    };

    const updatedDocs = documents.map(d => d.id === currentDoc.id ? updatedDoc : d);
    saveDocumentsToStorage(updatedDocs);

    // If signature was placed, add to security audit log
    if (ann.type === 'signature') {
      storageService.addAuditLog({
        action: 'sign_document',
        status: 'success',
        documentTitle: currentDoc.title,
        details: `Firma digital criptográfica aplicada en la página ${ann.pageIndex + 1}`,
        device: 'OmniPDF Web Client',
        ip: '192.168.1.100'
      });
      setAuditLogs(storageService.getAuditLogs());
    }
  };

  // Delete Annotation
  const handleDeleteAnnotation = (id: string) => {
    if (!currentDoc) return;
    const nextAnns = (currentDoc.annotations || []).filter(a => a.id !== id);
    const updatedDoc: PdfDocument = {
      ...currentDoc,
      annotations: nextAnns,
      updatedAt: Date.now()
    };
    const updatedDocs = documents.map(d => d.id === currentDoc.id ? updatedDoc : d);
    saveDocumentsToStorage(updatedDocs);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (!currentDoc) return;
    if (historyIndex > 0) {
      const prevAnns = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      const updatedDoc = { ...currentDoc, annotations: prevAnns };
      saveDocumentsToStorage(documents.map(d => d.id === currentDoc.id ? updatedDoc : d));
    }
  };

  const handleRedo = () => {
    if (!currentDoc) return;
    if (historyIndex < history.length - 1) {
      const nextAnns = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      const updatedDoc = { ...currentDoc, annotations: nextAnns };
      saveDocumentsToStorage(documents.map(d => d.id === currentDoc.id ? updatedDoc : d));
    }
  };

  // Page Operations
  const handleRotateCurrentPage = (pageIdx: number = currentPage) => {
    if (!currentDoc) return;
    const currentRotations = [...(currentDoc.pagesRotation || [])];
    while (currentRotations.length <= pageIdx) currentRotations.push(0);
    currentRotations[pageIdx] = (currentRotations[pageIdx] + 90) % 360;

    const updatedDoc = { ...currentDoc, pagesRotation: currentRotations, updatedAt: Date.now() };
    saveDocumentsToStorage(documents.map(d => d.id === currentDoc.id ? updatedDoc : d));
  };

  const handleDeleteCurrentPage = (pageIdx: number = currentPage) => {
    if (!currentDoc || currentDoc.pageCount <= 1) return;
    const updatedDoc: PdfDocument = {
      ...currentDoc,
      pageCount: currentDoc.pageCount - 1,
      annotations: (currentDoc.annotations || []).filter(a => a.pageIndex !== pageIdx),
      pagesRotation: (currentDoc.pagesRotation || []).filter((_, i) => i !== pageIdx),
      updatedAt: Date.now()
    };
    saveDocumentsToStorage(documents.map(d => d.id === currentDoc.id ? updatedDoc : d));
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleAddPage = () => {
    if (!currentDoc) return;
    const updatedDoc: PdfDocument = {
      ...currentDoc,
      pageCount: currentDoc.pageCount + 1,
      pagesRotation: [...(currentDoc.pagesRotation || []), 0],
      updatedAt: Date.now()
    };
    saveDocumentsToStorage(documents.map(d => d.id === currentDoc.id ? updatedDoc : d));
    setCurrentPage(currentDoc.pageCount);
  };

  // Digital Signature Prepared
  const handleSignaturePrepared = (signatureData: {
    dataUrl: string;
    text?: string;
    type: 'draw' | 'type' | 'image';
    metadata: any;
  }) => {
    setPendingSignature(signatureData);
    notificationService.triggerNotification(
      'Firma Lista para Insertar',
      'Haz clic en cualquier lugar del documento para estampar tu firma criptográfica.',
      { priority: 'low' }
    );
  };

  // Insert Stamp directly
  const handleInsertStamp = (type: 'APPROVED' | 'CONFIDENTIAL' | 'SIGNED' | 'REJECTED' | 'URGENT' | 'PAID' | 'VERIFIED') => {
    if (!currentDoc) return;
    const newStamp: Annotation = {
      id: 'ann-stamp-' + Date.now(),
      pageIndex: currentPage,
      type: 'stamp',
      stampType: type,
      x: 200,
      y: 350,
      color: type === 'APPROVED' ? '#10b981' : type === 'CONFIDENTIAL' ? '#ef4444' : '#6366f1',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    handleAddAnnotation(newStamp);
  };

  // Toggle Vault Lock
  const handleToggleVault = () => {
    if (isVaultLocked) {
      setShowBiometricModal(true);
    } else {
      setIsVaultLocked(true);
      storageService.addAuditLog({
        action: 'lock_vault',
        status: 'success',
        details: 'Bóveda de seguridad bloqueada manualmente por el usuario',
        device: 'OmniPDF Web Client',
        ip: '127.0.0.1'
      });
      setAuditLogs(storageService.getAuditLogs());
    }
  };

  // Upload Custom PDF / Image
  const handleUploadCustomFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newDocId = 'doc-user-' + Date.now();
      const newDoc: PdfDocument = {
        id: newDocId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: file.size,
        pageCount: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isLocked: false,
        isFavorite: false,
        tags: ['Personal', 'Subido'],
        pagesRotation: [0],
        annotations: [],
        dataUrl: dataUrl,
        cloudSyncStatus: 'synced',
        version: 1,
        category: 'general'
      };

      const updated = [newDoc, ...documents];
      saveDocumentsToStorage(updated);
      setActiveDocId(newDocId);
      storageService.setActiveDocumentId(newDocId);
      setCurrentPage(0);
      notificationService.triggerNotification(
        'Archivo Cargado y Sincronizado',
        `El documento "${file.name}" está listo para editar y firmar.`
      );
    };
    reader.readAsDataURL(file);
  };

  // Create New Blank Document or Instantiate from Template
  const handleCreateNewDoc = (templateKey?: string) => {
    let newDoc: PdfDocument;
    if (templateKey) {
      const templateDoc = INITIAL_DOCUMENTS.find(d => d.id === templateKey);
      if (templateDoc) {
        newDoc = {
          ...templateDoc,
          id: `${templateKey}-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      } else {
        newDoc = {
          id: `doc-blank-${Date.now()}`,
          title: 'Documento en Blanco',
          fileName: 'nuevo_documento.pdf',
          fileSize: 45000,
          pageCount: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isLocked: false,
          isFavorite: false,
          tags: ['Nuevo'],
          pagesRotation: [0],
          annotations: [],
          cloudSyncStatus: 'synced',
          version: 1,
          category: 'general'
        };
      }
    } else {
      newDoc = {
        id: `doc-blank-${Date.now()}`,
        title: 'Documento en Blanco',
        fileName: 'nuevo_documento.pdf',
        fileSize: 45000,
        pageCount: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isLocked: false,
        isFavorite: false,
        tags: ['Nuevo'],
        pagesRotation: [0],
        annotations: [],
        cloudSyncStatus: 'synced',
        version: 1,
        category: 'general'
      };
    }

    const updated = [newDoc, ...documents];
    saveDocumentsToStorage(updated);
    setActiveDocId(newDoc.id);
    storageService.setActiveDocumentId(newDoc.id);
    setCurrentPage(0);
    notificationService.triggerNotification(
      'Documento Creado',
      `"${newDoc.title}" listo en el visor.`
    );
  };

  return (
    <div id="omnipdf-root-layout" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 1. Top Navigation Bar */}
      <Navbar
        currentDoc={currentDoc}
        documents={documents}
        language={language}
        onLanguageChange={setLanguage}
        readingMode={readingMode}
        onReadingModeChange={setReadingMode}
        isOnline={isOnline}
        isSaving={isSaving}
        isVaultLocked={isVaultLocked}
        onToggleVault={handleToggleVault}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setShowRemindersModal(true)}
        onOpenDevices={() => setShowCloudModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        onOpenDocManager={() => setShowDocManagerModal(true)}
        onOpenCloudModal={() => setShowCloudModal(true)}
        onSelectDoc={handleSelectDoc}
      />

      {/* 2. Tool & Annotation Actions Bar */}
      <Toolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        language={language}
        zoom={zoom}
        onZoomChange={setZoom}
        currentPage={currentPage}
        totalPages={currentDoc?.pageCount || 0}
        onPageChange={setCurrentPage}
        onRotateCurrentPage={() => handleRotateCurrentPage(currentPage)}
        onDeleteCurrentPage={() => handleDeleteCurrentPage(currentPage)}
        onAddPage={handleAddPage}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onOpenSignatureModal={() => setShowSignatureModal(true)}
        onOpenStampMenu={() => {
          setIsSidebarOpen(true);
          setSidebarTab('stamps');
        }}
      />

      {/* Pending Signature Banner if waiting to drop */}
      {pendingSignature && (
        <div className="bg-indigo-600 px-4 py-2 text-white text-xs font-semibold flex items-center justify-between shadow-md z-30 animate-in slide-in-from-top">
          <span>
            📍 <strong>Firma Lista:</strong> Haz clic en la posición exacta del documento donde deseas estampar la firma.
          </span>
          <button
            onClick={() => setPendingSignature(null)}
            className="px-2 py-0.5 rounded bg-indigo-700 hover:bg-indigo-800 text-[11px] transition"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* 3. Main Workspace Layout (Sidebar + PDF Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          language={language}
          currentDoc={currentDoc}
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onRotatePage={handleRotateCurrentPage}
          onDeletePage={handleDeleteCurrentPage}
          onAddPage={handleAddPage}
          onInsertStamp={handleInsertStamp}
          onDeleteAnnotation={handleDeleteAnnotation}
          auditLogs={auditLogs}
        />

        {/* Center PDF Canvas Viewport */}
        <PdfViewer
          currentDoc={currentDoc}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          zoom={zoom}
          readingMode={readingMode}
          activeTool={activeTool}
          activeColor={activeColor}
          strokeWidth={strokeWidth}
          language={language}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={(ann) => {
            if (!currentDoc) return;
            const nextAnns = (currentDoc.annotations || []).map(a => a.id === ann.id ? ann : a);
            saveDocumentsToStorage(documents.map(d => d.id === currentDoc.id ? { ...currentDoc, annotations: nextAnns } : d));
          }}
          onDeleteAnnotation={handleDeleteAnnotation}
          pendingSignature={pendingSignature}
          onSignaturePlaced={() => setPendingSignature(null)}
          isVaultLocked={isVaultLocked}
          onOpenFile={() => setShowDocManagerModal(true)}
          onCreateBlankDoc={() => handleCreateNewDoc()}
          onOpenDocManager={() => setShowDocManagerModal(true)}
          onFileUpload={handleUploadCustomFile}
        />
      </div>

      {/* 4. Interactive Modals */}
      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        language={language}
        onApplySignature={handleSignaturePrepared}
      />

      {/* Biometric High-Security Modal */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        language={language}
        onUnlockSuccess={() => {
          setIsVaultLocked(false);
          setAuditLogs(storageService.getAuditLogs());
        }}
      />

      {/* Multiplatform Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
        language={language}
        currentDoc={currentDoc}
      />

      {/* Push Reminders & Notifications Center */}
      <RemindersModal
        isOpen={showRemindersModal}
        onClose={() => setShowRemindersModal(false)}
        language={language}
        currentDoc={currentDoc}
        onNotificationCountChange={() => {
          setUnreadNotifsCount(storageService.getNotifications().filter(n => !n.isRead).length);
        }}
      />

      {/* Export & Custom Reports Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        language={language}
        currentDoc={currentDoc}
      />

      {/* Document Gallery & Upload Manager Modal */}
      <DocumentManagerModal
        isOpen={showDocManagerModal}
        onClose={() => setShowDocManagerModal(false)}
        language={language}
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={handleSelectDoc}
        onCreateNewDoc={handleCreateNewDoc}
        onUploadCustomFile={handleUploadCustomFile}
        onDeleteDoc={(id) => {
          const next = documents.filter(d => d.id !== id);
          saveDocumentsToStorage(next);
          if (activeDocId === id) {
            const nextActive = next.length > 0 ? next[0].id : '';
            setActiveDocId(nextActive);
            storageService.setActiveDocumentId(nextActive);
          }
        }}
        onToggleLock={(id) => {
          const next = documents.map(d => d.id === id ? { ...d, isLocked: !d.isLocked } : d);
          saveDocumentsToStorage(next);
        }}
        onToggleFavorite={(id) => {
          const next = documents.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d);
          saveDocumentsToStorage(next);
        }}
      />
    </div>
  );
}
