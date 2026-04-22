import { useEffect, useState } from 'react';

/**
 * Retarde la mise à jour d'une valeur d'un délai donné (ms).
 * Utile pour éviter des appels API à chaque frappe.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
