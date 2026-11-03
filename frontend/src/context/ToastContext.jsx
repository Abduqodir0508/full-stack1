import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
      error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
      info: (message, title = 'Info') => addToast({ type: 'info', title, message }),
      warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    }),
    [addToast]
  );

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-950/80',
          text: 'text-emerald-200',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          border: 'border-rose-500/30',
          bg: 'bg-rose-950/80',
          text: 'text-rose-200',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          border: 'border-amber-500/30',
          bg: 'bg-amber-950/80',
          text: 'text-amber-200',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          border: 'border-sky-500/30',
          bg: 'bg-slate-900/90',
          text: 'text-slate-200',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, addToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const style = getToastStyle(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border ${style.border} ${style.bg} transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in`}
            >
              {style.icon}
              <div className="flex-1 min-w-0">
                {t.title && <h4 className="text-sm font-semibold text-white mb-0.5">{t.title}</h4>}
                <p className={`text-xs leading-relaxed ${style.text}`}>{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition-colors p-0.5 -mr-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

