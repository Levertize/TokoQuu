import React from 'react';
import { 
  IconCircleCheck, 
  IconCircleX, 
  IconAlertCircle, 
  IconInfoCircle 
} from '@tabler/icons-react';
import { useToastStore } from '../../stores/useToastStore';

const iconMap = {
  success: { icon: IconCircleCheck, color: 'text-green border-l-green' },
  error: { icon: IconCircleX, color: 'text-danger border-l-danger' },
  warning: { icon: IconAlertCircle, color: 'text-amber-500 border-l-amber-500' },
  info: { icon: IconInfoCircle, color: 'text-blue-500 border-l-blue-500' }
};

/**
 * Toast notifications container component. Renders active float popups in the top right.
 * @returns {React.ReactElement}
 */
export function Toast() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-6 right-6 flex flex-col gap-2.5 z-[9999] pointer-events-none">
      {toasts.map((t) => {
        const typeConfig = iconMap[t.type] || iconMap.success;
        const Icon = typeConfig.icon;

        return (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto bg-surface shadow-toast px-5 py-3.5 rounded flex items-center gap-3 text-text text-[13px] font-semibold min-w-[250px] max-w-[380px] border border-border border-l-4 border-l-primary cursor-pointer transition-all duration-300 animate-[toast-slide-in_0.3s_cubic-bezier(0.16,1,0.3,1)]`}
            style={{ borderLeftColor: `var(--${t.type === 'error' ? 'danger' : t.type === 'warning' ? 'primary' : t.type === 'info' ? 'blue' : 'green'})` }}
          >
            <div className="flex items-center" style={{ color: `var(--${t.type === 'error' ? 'danger' : t.type === 'warning' ? 'primary' : t.type === 'info' ? 'blue' : 'green'})` }}>
              <Icon size={18} />
            </div>
            <div>{t.message}</div>
          </div>
        );
      })}
    </div>
  );
}
export default Toast;
