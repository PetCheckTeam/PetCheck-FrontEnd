function AuthInput({
  label,
  error,
  id,
  className = '',
  ...inputProps
}) {
  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`auth-field__input ${error ? 'auth-field__input--error' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p className="auth-field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthInput;
