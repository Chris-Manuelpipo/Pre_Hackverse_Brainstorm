import { useCallback, useRef, useState } from 'react';

let toastId = 0;

/**
 * Hook simple de gestion des toasts.
 * Retourne { toasts, toast } où toast(message, type) ajoute un toast.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const success = useCallback((msg) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg) => toast(msg, 'error'), [toast]);
  const info = useCallback((msg) => toast(msg, 'info'), [toast]);

  return { toasts, toast, success, error, info, dismiss };
}
