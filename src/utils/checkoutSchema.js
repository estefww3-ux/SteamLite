import * as Yup from 'yup';

// ---------- Formateadores (mientras el usuario escribe) ----------
export const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

export const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export const formatCvv = (v) => v.replace(/\D/g, '').slice(0, 4);

// ---------- Ayudas de validación ----------
// Algoritmo de Luhn: comprueba que el número de tarjeta sea matemáticamente válido
function passesLuhn(num) {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = Number(num[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

// La tarjeta vale hasta el último día del mes de vencimiento
function notExpired(value) {
  const [mm, yy] = value.split('/').map(Number);
  const now = new Date();
  const year = 2000 + yy;
  return year > now.getFullYear() || (year === now.getFullYear() && mm >= now.getMonth() + 1);
}

// ---------- Esquemas ----------
const baseShape = {
  fullName: Yup.string()
    .trim()
    .required('El nombre es obligatorio')
    .min(3, 'Escribe al menos 3 caracteres')
    .max(60, 'Máximo 60 caracteres')
    .matches(/^[\p{L}\s'.-]+$/u, 'Usa solo letras y espacios'),
  email: Yup.string()
    .trim()
    .required('El correo es obligatorio')
    .email('Escribe un correo válido, por ejemplo nombre@correo.com'),
  acceptTerms: Yup.boolean().oneOf([true], 'Debes aceptar los términos para continuar'),
};

const cardShape = {
  cardNumber: Yup.string()
    .required('Ingresa el número de tarjeta')
    .test('length', 'El número debe tener 16 dígitos', (v) => (v || '').replace(/\s/g, '').length === 16)
    .test('luhn', 'El número de tarjeta no es válido', (v) => passesLuhn((v || '').replace(/\s/g, ''))),
  expiry: Yup.string()
    .required('Ingresa la fecha de vencimiento')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Usa el formato MM/AA, por ejemplo 12/30')
    .test('not-expired', 'La tarjeta está vencida', (v) => !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v || '') || notExpired(v)),
  cvv: Yup.string()
    .required('Ingresa el CVV')
    .matches(/^\d{3,4}$/, 'El CVV tiene 3 o 4 dígitos'),
};

// Compra normal: datos personales + tarjeta
export const checkoutSchema = Yup.object({ ...baseShape, ...cardShape });

// Carrito 100 % gratuito: no se pide tarjeta
export const freeCheckoutSchema = Yup.object(baseShape);