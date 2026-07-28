import { useState } from 'react';
import petcheckAppIcon from '../assets/petcheck-app-icon.png';
import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import PetIllustration from '../components/PetIllustration';
import { authApi } from '../api/petcheckApi';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

function Signup({ onMoveToLogin }) {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined, form: undefined }));
  };

  const validateCurrentStep = () => {
    if (step === 1 && !formValues.name.trim()) {
      return { field: 'name', message: '이름을 입력해 주세요.' };
    }
    if (step === 2) {
      if (!formValues.email.trim()) {
        return { field: 'email', message: '이메일을 입력해 주세요.' };
      }
      if (!EMAIL_PATTERN.test(formValues.email)) {
        return { field: 'email', message: '올바른 이메일 형식을 입력해 주세요.' };
      }
    }
    if (step === 3) {
      if (!formValues.password) {
        return { field: 'password', message: '비밀번호를 입력해 주세요.' };
      }
      if (!SPECIAL_CHARACTER_PATTERN.test(formValues.password)) {
        return {
          field: 'password',
          message: '비밀번호에 특수문자를 1개 이상 포함해 주세요.',
        };
      }
    }
    if (step === 4) {
      if (!formValues.passwordConfirm) {
        return {
          field: 'passwordConfirm',
          message: '비밀번호를 한 번 더 입력해 주세요.',
        };
      }
      if (formValues.password !== formValues.passwordConfirm) {
        return {
          field: 'passwordConfirm',
          message: '비밀번호가 일치하지 않아요.',
        };
      }
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateCurrentStep();
    if (validationError) {
      setErrors((previous) => ({
        ...previous,
        [validationError.field]: validationError.message,
      }));
      return;
    }

    if (step < 4) {
      setErrors({});
      setStep((previous) => previous + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.signup({
        email: formValues.email.trim(),
        password: formValues.password,
        nickname: formValues.name.trim(),
      });
      onMoveToLogin();
    } catch (error) {
      setErrors((previous) => ({ ...previous, form: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepCopy = [
    {
      eyebrow: '먼저, 이름을 알려주세요',
      title: '어떻게 불러드릴까요?',
      description: 'PetCheck가 반갑게 이름을 불러드릴게요.',
    },
    {
      eyebrow: '로그인에 사용할 정보예요',
      title: '이메일을 입력해 주세요',
      description: '가입 후 로그인할 때 사용하는 이메일이에요.',
    },
    {
      eyebrow: '계정을 안전하게 지켜요',
      title: '비밀번호를 만들어 주세요',
      description: '기억하기 쉽고 안전한 비밀번호가 좋아요.',
    },
    {
      eyebrow: '마지막 단계예요',
      title: '비밀번호를 확인할게요',
      description: '방금 입력한 비밀번호를 한 번 더 입력해 주세요.',
    },
  ][step - 1];

  return (
    <main className="auth-page auth-page--signup signup-flow-page">
      <section className="auth-intro signup-flow-intro" aria-labelledby="signup-heading">
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <img className="brand__image" src={petcheckAppIcon} alt="" />
          PetCheck
        </a>
        <div className="auth-intro__copy">
          <span className="eyebrow">한 단계씩 천천히</span>
          <h1 id="signup-heading">우리 아이 건강 관리,<br />쉽게 시작해요</h1>
          <p>네 가지 정보만 차례대로 입력하면<br />PetCheck를 바로 시작할 수 있어요.</p>
        </div>

        <div className="signup-journey" aria-label={`회원가입 ${step}단계 진행 중`}>
          {['이름', '이메일', '비밀번호', '확인'].map((label, index) => {
            const journeyStep = index + 1;
            const status = journeyStep < step
              ? 'complete'
              : journeyStep === step
                ? 'active'
                : 'waiting';

            return (
              <div
                className={`signup-journey__item signup-journey__item--${status}`}
                key={label}
              >
                <span>{status === 'complete' ? '✓' : journeyStep}</span>
                <div>
                  <strong>{label}</strong>
                  <small>
                    {status === 'complete'
                      ? '입력 완료'
                      : status === 'active'
                        ? '입력 중'
                        : '다음 단계'}
                  </small>
                </div>
              </div>
            );
          })}
        </div>

        <div className="signup-flow-mascot" aria-hidden="true">
          <div>한 번에 하나씩 하면 쉬워요!</div>
          <PetIllustration className="auth-intro__pet" />
        </div>
      </section>

      <section className="auth-card signup-flow-card" aria-label={`회원가입 ${step}단계`}>
        <div className="signup-flow-card__top">
          {step > 1 ? (
            <button
              className="signup-flow-card__back"
              type="button"
              aria-label="이전 단계"
              onClick={() => {
                setErrors({});
                setStep((previous) => previous - 1);
              }}
            >
              ←
            </button>
          ) : (
            <span className="signup-flow-card__back-placeholder" />
          )}
          <div className="signup-flow-card__progress" aria-hidden="true">
            {[1, 2, 3, 4].map((progressStep) => (
              <span
                className={progressStep <= step ? 'is-filled' : ''}
                key={progressStep}
              />
            ))}
          </div>
          <strong>{step} / 4</strong>
        </div>

        <div className="auth-card__heading signup-flow-card__heading">
          <span className="auth-card__step">{stepCopy.eyebrow}</span>
          <h2>{stepCopy.title}</h2>
          <p>{stepCopy.description}</p>
        </div>

        <form className="auth-form signup-flow-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-flow__step" key={step}>
            {step === 1 && (
              <AuthInput
                id="signup-name"
                label="이름"
                type="text"
                placeholder="예: 안나경"
                autoComplete="name"
                autoFocus
                value={formValues.name}
                onChange={(event) => updateField('name', event.target.value)}
                error={errors.name}
              />
            )}
            {step === 2 && (
              <AuthInput
                id="signup-email"
                label="이메일"
                type="email"
                placeholder="hello@petcheck.com"
                autoComplete="email"
                autoFocus
                value={formValues.email}
                onChange={(event) => updateField('email', event.target.value)}
                error={errors.email}
              />
            )}
            {step === 3 && (
              <PasswordInput
                id="signup-password"
                label="비밀번호"
                placeholder="비밀번호를 입력해 주세요"
                autoComplete="new-password"
                helperText="특수문자를 1개 이상 포함해 주세요. 예: !, @, #"
                autoFocus
                value={formValues.password}
                onChange={(event) => updateField('password', event.target.value)}
                error={errors.password}
              />
            )}
            {step === 4 && (
              <PasswordInput
                id="signup-password-confirm"
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력해 주세요"
                autoComplete="new-password"
                helperText="위에서 입력한 비밀번호와 동일하게 입력해 주세요."
                autoFocus
                value={formValues.passwordConfirm}
                onChange={(event) => updateField('passwordConfirm', event.target.value)}
                error={errors.passwordConfirm}
              />
            )}
          </div>

          {errors.form && <p className="auth-field__error" role="alert">{errors.form}</p>}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting
              ? '가입 중...'
              : step === 4
                ? 'PetCheck 시작하기'
                : '다음으로'}
            <span aria-hidden="true">{step === 4 ? '✓' : '→'}</span>
          </Button>
        </form>

        <p className="auth-card__switch">
          이미 회원이신가요?
          <button type="button" onClick={onMoveToLogin}>로그인</button>
        </p>
      </section>
    </main>
  );
}

export default Signup;
