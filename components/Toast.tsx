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
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    info: <Info className="w-5 h-5 text-amber-600" />,
    error: <XCircle className="w-5 h-5 text-red-500" />
  };

  const bgColors = {
    success: 'bg-white border-emerald-100 text-stone-700',
    info: 'bg-white border-amber-100 text-stone-700',
    error: 'bg-white border-red-100 text-stone-700'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl animate-slide-in backdrop-blur-md ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
};

export default Toast;