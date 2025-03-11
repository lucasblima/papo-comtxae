import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
  icon?: string | React.ReactNode;
}

interface ToastContextType {
  showToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const showToast = useCallback(({ title, description = '', type, duration = 3000, icon }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type, duration, icon }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  // Only run on client side
  const [isMounted, setIsMounted] = useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const getAlertClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isMounted && document.body
        ? createPortal(
            <div className="toast toast-top toast-end z-50">
              {toasts.map((toast) => (
                <div
                  key={toast.id}
                  className={`alert ${getAlertClass(toast.type)} shadow-lg`}
                >
                  <div>
                    {!toast.icon && toast.type === 'success' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {!toast.icon && toast.type === 'error' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {!toast.icon && toast.type === 'warning' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    )}
                    {!toast.icon && toast.type === 'info' && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                    {toast.icon && (
                      <div className="toast-icon shrink-0 h-6 w-6 flex items-center justify-center">
                        {typeof toast.icon === 'string' ? toast.icon : toast.icon}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{toast.title}</h3>
                      {toast.description && <div className="text-xs">{toast.description}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
} 