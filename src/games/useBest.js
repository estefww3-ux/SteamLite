import { useCallback, useRef, useState } from 'react';

// Récord guardado en localStorage.
// mode 'max': gana el número más alto. mode 'min': gana el más bajo.
export default function useBest(key, mode = 'max') {
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch {
      return 0;
    }
  });
  const ref = useRef(best);

  const submit = useCallback(
    (score) => {
      const current = ref.current;
      const better = mode === 'min' ? current === 0 || score < current : score > current;
      if (!better) return;
      ref.current = score;
      setBest(score);
      try {
        localStorage.setItem(key, String(score));
      } catch {
        /* sin almacenamiento: no pasa nada */
      }
    },
    [key, mode]
  );

  // Suma 1 al récord (sirve para contar victorias)
  const add = useCallback(() => submit(ref.current + 1), [submit]);

  return [best, submit, add];
}