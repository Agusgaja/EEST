import { useState, useEffect } from "react";
import { CheckCircle2, Copy, KeyRound, X } from "lucide-react";

export default function PasswordModal({ isOpen, onClose, password, userName }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-overlay">
      <div 
        className="glass-card animate-slide-up relative w-full max-w-sm overflow-hidden rounded-2xl bg-white/95 shadow-2xl dark:bg-slate-900/95 text-center"
        role="dialog"
      >
        <div className="p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
            <KeyRound size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Contraseña Restablecida</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            La nueva contraseña temporal para <strong>{userName}</strong> ha sido generada con éxito. Por favor copiala ahora.
          </p>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20 mb-6 group transition-colors hover:border-violet-300 dark:hover:border-violet-500/30">
            <span className="font-mono text-lg font-medium text-slate-800 dark:text-slate-200 tracking-wider">
              {password}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center justify-center rounded-lg p-2 transition-all ${
                copied 
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
                  : "bg-white text-slate-500 shadow-sm hover:bg-violet-50 hover:text-violet-600 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-violet-500/20 dark:hover:text-violet-400"
              }`}
              title="Copiar al portapapeles"
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-colors hover:bg-violet-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
