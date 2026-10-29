export const formatPrice = (p) => (p === 0 ? 'Gratis' : `$${p.toFixed(2)}`);

export const normalize = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');