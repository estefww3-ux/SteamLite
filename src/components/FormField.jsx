import { useField } from 'formik';

export default function FormField({ name, label, format, ...inputProps }) {
  const [field, meta, helpers] = useField(name);
  const error = meta.touched && meta.error;

  // Si hay "format", se aplica mientras el usuario escribe
  const handleChange = (e) => {
    const raw = e.target.value;
    helpers.setValue(format ? format(raw) : raw);
  };

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        className="input"
        {...field}
        {...inputProps}
        onChange={handleChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p className="field-error" id={`${name}-error`} role="alert">
          {meta.error}
        </p>
      )}
    </div>
  );
}