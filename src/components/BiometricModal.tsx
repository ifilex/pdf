import React, { useState } from 'react';
import { 
  Fingerprint, 
  ScanFace, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Lock,
  Clock
} from 'lucide-react';
import { Language, UserSecuritySettings } from '../types';
import { translations } from '../i18n/translations';
import { biometricService } from '../services/biometrics';
import { storageService } from '../services/storage';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onUnlockSuccess: () => void;
  mode?: 'unlock' | 'settings';
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  language,
  onUnlockSuccess,
  mode = 'unlock'
}) => {
  const t = translations[language];
  const [authMethod, setAuthMethod] = useState<'fingerprint' | 'faceid' | 'pin'>('fingerprint');
  const [isScanning, setIsScanning] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pinInput, setPinInput] = useState('');
  
  // Security settings state
  const [settings, setSettings] = useState<UserSecuritySettings>(() => storageService.getSecuritySettings());

  if (!isOpen) return null;

  const handleStartBiometricScan = async () => {
    setIsScanning(true);
    setAuthStatus('scanning');
    setErrorMessage('');

    try {
      const result = await biometricService.authenticateBiometric(
        mode === 'unlock' ? 'Desbloqueo de Bóveda Confidencial' : 'Configuración de Seguridad'
      );

      if (result.success) {
        setAuthStatus('success');
        setTimeout(() => {
          setIsScanning(false);
          onUnlockSuccess();
          onClose();
        }, 600);
      } else {
        setAuthStatus('failed');
        setErrorMessage(result.error || t.biometricFailed);
        setIsScanning(false);
      }
    } catch {
      setAuthStatus('failed');
      setErrorMessage(t.biometricFailed);
      setIsScanning(false);
    }
  };

  const handlePinSubmit = () => {
    if (!pinInput) return;
    const isValid = biometricService.verifyPin(pinInput);
    if (isValid) {
      setAuthStatus('success');
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 500);
    } else {
      setAuthStatus('failed');
      setErrorMessage('PIN incorrecto. El PIN por defecto es 1234.');
      setPinInput('');
    }
  };

  const handleUpdateAutoLock = (mins: number) => {
    const updated = { ...settings, autoLockMinutes: mins };
    setSettings(updated);
    storageService.saveSecuritySettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="biometric-auth-modal"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.biometricTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.biometricSubtitle}
              </p>
            </div>
          </div>
          <button
            id="btn-close-biometric-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* Method Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 w-full">
            <button
              onClick={() => { setAuthMethod('fingerprint'); setAuthStatus('idle'); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                authMethod === 'fingerprint'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              Touch ID
            </button>
            <button
              onClick={() => { setAuthMethod('faceid'); setAuthStatus('idle'); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                authMethod === 'faceid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScanFace className="w-3.5 h-3.5" />
              Face ID
            </button>
            <button
              onClick={() => { setAuthMethod('pin'); setAuthStatus('idle'); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                authMethod === 'pin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              PIN
            </button>
          </div>

          {/* Biometric Interactive Scanner Graphic */}
          {(authMethod === 'fingerprint' || authMethod === 'faceid') && (
            <div className="flex flex-col items-center space-y-4 py-2 w-full">
              <button
                id="btn-trigger-biometric-scan"
                onClick={handleStartBiometricScan}
                disabled={isScanning}
                className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all group ${
                  authStatus === 'success'
                    ? 'border-emerald-400 bg-emerald-950/60 text-emerald-400 ring-4 ring-emerald-500/20'
                    : authStatus === 'failed'
                    ? 'border-rose-500 bg-rose-950/60 text-rose-400 ring-4 ring-rose-500/20'
                    : authStatus === 'scanning'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 animate-pulse ring-4 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-950 hover:border-emerald-500/80 text-slate-400 hover:text-emerald-400'
                }`}
              >
                {authMethod === 'fingerprint' ? (
                  <Fingerprint className="w-14 h-14 transition-transform group-hover:scale-105" />
                ) : (
                  <ScanFace className="w-14 h-14 transition-transform group-hover:scale-105" />
                )}

                {/* Animated Laser Scanning Line */}
                {authStatus === 'scanning' && (
                  <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce top-1/2" />
                )}
              </button>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  {authStatus === 'scanning'
                    ? 'Verificando sensor biométrico...'
                    : authStatus === 'success'
                    ? t.biometricSuccess
                    : authMethod === 'fingerprint'
                    ? t.scanFingerprint
                    : t.useFaceId}
                </p>
                <p className="text-xs text-slate-400">
                  {authStatus === 'idle' && 'Toca el sensor para autorizar acceso'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Backup PIN Keypad */}
          {authMethod === 'pin' && (
            <div className="w-full space-y-4 py-2">
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-white">{t.enterPin}</p>
                <p className="text-xs text-slate-400">PIN de demostración: <strong className="text-emerald-400 font-mono">1234</strong></p>
              </div>

              {/* PIN Display Dots */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      pinInput.length > idx
                        ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-400/50'
                        : 'border-slate-700 bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* PIN Number Grid */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (pinInput.length < 6) setPinInput(prev => prev + num.toString());
                    }}
                    className="h-11 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-emerald-600 active:text-white border border-slate-700/80 text-white font-bold text-base transition"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPinInput('')}
                  className="h-11 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition"
                >
                  C
                </button>
                <button
                  onClick={() => {
                    if (pinInput.length < 6) setPinInput(prev => prev + '0');
                  }}
                  className="h-11 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-base transition"
                >
                  0
                </button>
                <button
                  onClick={handlePinSubmit}
                  className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center transition"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Security Vault Preferences (Auto-Lock Timer) */}
          <div className="w-full pt-3 border-t border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {t.autoLockTimer}
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: '1m', val: 1 },
                  { label: '5m', val: 5 },
                  { label: '15m', val: 15 }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleUpdateAutoLock(item.val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      settings.autoLockMinutes === item.val
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" /> Enclave Seguro AES-256
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
