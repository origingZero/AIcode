import type { ToastState } from '../../types';
import { CheckCircleIcon } from '../Icons';
import styles from './Toast.module.css';

interface Props {
  toast: ToastState;
}

export default function Toast({ toast }: Props) {
  if (!toast.visible) return null;
  return (
    <div
      className={`${styles.toast} ${toast.type === 'success' ? styles.success : ''}`}
      role="status"
      aria-live="polite"
    >
      {toast.type === 'success' && <CheckCircleIcon />}
      {toast.message}
    </div>
  );
}
