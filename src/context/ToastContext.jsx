import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 5000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-[calc(100vw-3rem)] pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon =
              t.type === 'error'
                ? AlertTriangle
                : t.type === 'success'
                ? CheckCircle2
                : Info;
            return (
              <motion.div
                key={t.id}
                role="status"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto bg-[#16294D] border border-[#D9C08B]/45 text-[#F4EEDF] px-5 py-4 shadow-2xl flex items-start gap-3.5"
              >
                <Icon
                  aria-hidden="true"
                  className="w-5 h-5 text-[#D9C08B] shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <p className="text-sm font-semibold tracking-wide text-[#D9C08B]">
                      {t.title}
                    </p>
                  )}
                  {t.message && (
                    <p className="text-sm text-[#F4EEDF]/90 mt-0.5 leading-relaxed">
                      {t.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  aria-label="Dismiss notification"
                  className="text-[#F4EEDF]/60 hover:text-[#D9C08B] transition-colors p-1 -mr-1"
                >
                  <X aria-hidden="true" className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
