import { ErrorMessage, Field, Form, Formik } from 'formik';
import FormField from './FormField.jsx';
import {
  checkoutSchema,
  freeCheckoutSchema,
  formatCardNumber,
  formatExpiry,
  formatCvv,
} from '../utils/checkoutSchema.js';
import { formatPrice } from '../utils/format.js';

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  acceptTerms: false,
};

export default function CheckoutForm({ total, onBack, onPay }) {
  const needsCard = total > 0;

  const handleSubmit = async (values) => {
    // Simula el tiempo que tarda una pasarela de pago real
    await new Promise((resolve) => setTimeout(resolve, 1200));
    onPay(values);
  };

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      validationSchema={needsCard ? checkoutSchema : freeCheckoutSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="checkout" noValidate>
          <h2>Datos de pago</h2>

          <FormField
            name="fullName"
            label="Nombre completo"
            type="text"
            placeholder="Tu nombre y apellido"
            autoComplete="name"
          />
          <FormField
            name="email"
            label="Correo electrónico"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
          />

          {needsCard ? (
            <>
              <FormField
                name="cardNumber"
                label="Número de tarjeta"
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                autoComplete="cc-number"
                format={formatCardNumber}
              />
              <div className="field-row">
                <FormField
                  name="expiry"
                  label="Vencimiento"
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  autoComplete="cc-exp"
                  format={formatExpiry}
                />
                <FormField
                  name="cvv"
                  label="CVV"
                  type="password"
                  inputMode="numeric"
                  placeholder="123"
                  autoComplete="cc-csc"
                  format={formatCvv}
                />
              </div>
              <p className="field-hint">
                Es una simulación: usa la tarjeta 4111 1111 1111 1111, una fecha futura (por
                ejemplo 12/30) y un CVV de 3 dígitos. No se guarda ningún dato de la tarjeta.
              </p>
            </>
          ) : (
            <p className="field-hint">Tu carrito es gratuito: solo necesitamos tus datos.</p>
          )}

          <div className="field">
            <label className="checkbox">
              <Field type="checkbox" name="acceptTerms" />
              <span>Acepto los términos y entiendo que esta compra es una simulación.</span>
            </label>
            <ErrorMessage name="acceptTerms" component="p" className="field-error" />
          </div>

          <div className="checkout-actions">
            <button type="button" className="btn btn-ghost" onClick={onBack} disabled={isSubmitting}>
              ← Volver al carrito
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? 'Procesando…'
                : total > 0
                  ? `Pagar ${formatPrice(total)}`
                  : 'Obtener juegos gratis'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}