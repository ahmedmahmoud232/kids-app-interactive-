import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

type NotificationType = 'info' | 'success' | 'error';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto bento-card p-4 flex gap-4 items-start border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                n.type === 'success' ? "bg-brand-green" : 
                n.type === 'error' ? "bg-brand-red text-white" : 
                "bg-white"
              )}
            >
              <div className="mt-1">
                {n.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                {n.type === 'error' && <AlertCircle className="w-6 h-6" />}
                {n.type === 'info' && <Info className="w-6 h-6 text-brand-blue" />}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-lg leading-none">{n.title}</h4>
                <p className="font-bold text-sm opacity-90">{n.message}</p>
              </div>
              <button 
                onClick={() => removeNotification(n.id)}
                className="p-1 hover:bg-black/10 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
