import { useState } from 'react';
import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import PetIllustration from '../components/PetIllustration';

function Login({ onMoveToSignup, onLoginSuccess }) {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    // 지금은 HTML의 required 검사를 통과하면 로그인 성공으로 가정합니다.
    // API 연결 후에는 서버 응답이 성공했을 때 이 함수를 호출하면 됩니다.
    onLoginSuccess();
  };

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-labelledby="login-heading">
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <span className="brand__paw" aria-hidden="true">P</span>
          PetCheck
        </a>
        <div className="auth-intro__copy">
          <span className="eyebrow">우리 아이 사료, 쉽게 확인해요</span>
          <h1 id="login-heading">사진 한 장으로<br />사료 성분 체크</h1>
          <p>알레르기 성분부터 건강 메시지까지<br />PetCheck가 알기 쉽게 알려드려요.</p>
        </div>
        <div className="pet-guide">
          <div className="pet-guide__bubble">오늘 먹을 사료도<br />안전한지 확인해볼까요?</div>
          <PetIllustration className="auth-intro__pet" />
        </div>
      </section>

      <section className="auth-card" aria-label="로그인">
        <div className="auth-card__heading">
          <span className="auth-card__step">로그인</span>
          <h2>반가워요 👋</h2>
          <p>등록한 반려동물 정보를 불러올게요.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthInput
            id="login-email"
            label="이메일"
            type="email"
            placeholder="hello@petcheck.com"
            autoComplete="email"
            value={formValues.email}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                email: event.target.value,
              }))
            }
            required
          />
          <PasswordInput
            id="login-password"
            label="비밀번호"
            placeholder="비밀번호를 입력해 주세요"
            autoComplete="current-password"
            value={formValues.password}
            onChange={(event) =>
              setFormValues((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
            required
          />
          <Button type="submit" fullWidth>
            로그인하기
            <span aria-hidden="true">→</span>
          </Button>
        </form>

        <p className="auth-card__switch">
          아직 회원이 아니신가요?
          <button type="button" onClick={onMoveToSignup}>회원가입</button>
        </p>
      </section>
    </main>
  );
}

export default Login;
