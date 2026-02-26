import { useState, useCallback, useRef } from 'react';
import type { ToastState } from '../types';

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((message: string, type: ToastState['type'] = 'info') => {
    clearTimeout(timerRef.current);
    setToast({ message, type, visible: true });
    timerRef.current = setTimeout(() => setToast((s) => ({ ...s, visible: false })), 2400);
  }, []);

  return { toast, showToast: show };
}
