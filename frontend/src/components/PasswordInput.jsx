import { useState } from 'react';

function PasswordInput({
  label,
  error,
  id,
  className = '',
  ...inputProps
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="password-field">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          className={`auth-field__input password-field__input ${error ? 'auth-field__input--error' : ''} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        <button
          className="password-field__toggle"
          type="button"
          onClick={() => setIsVisible((previous) => !previous)}
          aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
        >
          {isVisible ? '숨김' : '보기'}
        </button>
      </div>
      {error && (
        <p className="auth-field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default PasswordInput;
