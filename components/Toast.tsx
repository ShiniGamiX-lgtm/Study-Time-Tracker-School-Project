import React, { useEffect } from 'react';
import { CheckCircle, Info, XCircle } from 'lucide-react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-lime-400" />,
    info: <Info className="w-5 h-5 text-teal-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />
  };

  const bgColors = {
    success: 'glass-panel-dark border-lime-500/30',
    info: 'glass-panel-dark border-teal-500/30',
    error: 'glass-panel-dark border-red-500/30'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-slide-in backdrop-blur-md ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <span className="text-sm font-medium text-emerald-50">{toast.message}</span>
    </div>
  );
};

export default Toast;