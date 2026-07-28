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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formValues.name.trim()) nextErrors.name = '이름을 입력해 주세요.';

    if (!formValues.email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.';
    } else if (!EMAIL_PATTERN.test(formValues.email)) {
      nextErrors.email = '올바른 이메일 형식을 입력해 주세요.';
    }

    if (!formValues.password) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    } else if (!SPECIAL_CHARACTER_PATTERN.test(formValues.password)) {
      nextErrors.password = '비밀번호에 특수문자를 1개 이상 포함해 주세요.';
    }

    if (!formValues.passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.';
    } else if (formValues.password !== formValues.passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 일치하지 않아요.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;
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

  return (
    <main className="auth-page auth-page--signup">
      <section className="auth-intro" aria-labelledby="signup-heading">
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <img className="brand__image" src={petcheckAppIcon} alt="" />
          PetCheck
        </a>
        <div className="auth-intro__copy">
          <span className="eyebrow">가입은 1분이면 충분해요</span>
          <h1 id="signup-heading">우리 아이 건강 관리,<br />지금 시작해요</h1>
          <p>계정을 만들면 반려동물과 알러지 정보를<br />안전하게 저장할 수 있어요.</p>
        </div>
        <div className="pet-guide">
          <div className="pet-guide__bubble">조금만 입력하면<br />바로 시작할 수 있어요!</div>
          <PetIllustration className="auth-intro__pet" />
        </div>
      </section>

      <section className="auth-card" aria-label="회원가입">
        <div className="auth-card__heading">
          <span className="auth-card__step">회원가입</span>
          <h2>PetCheck 시작하기</h2>
          <p>아래 네 가지만 입력해 주세요.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthInput
            id="signup-name"
            label="이름"
            type="text"
            placeholder="이름을 입력해 주세요"
            autoComplete="name"
            value={formValues.name}
            onChange={(event) => updateField('name', event.target.value)}
            error={errors.name}
          />
          <AuthInput
            id="signup-email"
            label="이메일"
            type="email"
            placeholder="hello@petcheck.com"
            autoComplete="email"
            value={formValues.email}
            onChange={(event) => updateField('email', event.target.value)}
            error={errors.email}
          />
          <PasswordInput
            id="signup-password"
            label="비밀번호"
            placeholder="비밀번호를 입력해 주세요"
            autoComplete="new-password"
            helperText="특수문자를 1개 이상 포함해 주세요. 예: !, @, #"
            value={formValues.password}
            onChange={(event) => updateField('password', event.target.value)}
            error={errors.password}
          />
          <PasswordInput
            id="signup-password-confirm"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해 주세요"
            autoComplete="new-password"
            helperText="위에서 입력한 비밀번호와 동일하게 입력해 주세요."
            value={formValues.passwordConfirm}
            onChange={(event) => updateField('passwordConfirm', event.target.value)}
            error={errors.passwordConfirm}
          />
          {errors.form && <p className="auth-field__error" role="alert">{errors.form}</p>}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '회원가입하기'}
            <span aria-hidden="true">→</span>
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
