import { useEffect, useRef, useState } from 'react';
import AuthInput from '../components/AuthInput';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import PasswordInput from '../components/PasswordInput';
import PetIllustration from '../components/PetIllustration';

const loginFeatures = [
  {
    icon: '📷',
    title: '사료 성분 분석',
    description: '포장지 사진을 올리면 복잡한 원재료를 한눈에 보기 쉽게 정리해요.',
    badge: '사진 한 장으로 간편하게',
  },
  {
    icon: '🛡️',
    title: '알러지 위험 확인',
    description: '등록한 알레르기와 일치하는 성분을 찾아 안전·주의·위험으로 알려드려요.',
    badge: '놓치기 쉬운 성분까지',
  },
  {
    icon: '💬',
    title: '맞춤 건강 메시지',
    description: '우리 아이 정보를 바탕으로 분석 결과를 이해하기 쉬운 말로 설명해요.',
    badge: '우리 아이에게 맞춰서',
  },
];

function Login({ onMoveToSignup, onLoginSuccess }) {
  const featureSectionRef = useRef(null);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const featureCards = featureSectionRef.current?.querySelectorAll(
      '.feature-card--reveal',
    );

    if (!featureCards?.length) {
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      featureCards.forEach((card) => card.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35,
        rootMargin: '0px 0px -12%',
      },
    );

    featureCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // 지금은 HTML의 required 검사를 통과하면 로그인 성공으로 가정합니다.
    // API 연결 후에는 서버 응답이 성공했을 때 이 함수를 호출하면 됩니다.
    onLoginSuccess({ email: formValues.email.trim() });
  };

  return (
    <main className="login-page">
      <div className="auth-page">
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
      </div>

      <section
        ref={featureSectionRef}
        className="login-features"
        aria-labelledby="login-feature-heading"
      >
        <div className="login-features__floating-icons" aria-hidden="true">
          {['🐾', '🥕', '🦴', '🐶', '🐟', '🥣', '🐱', '🌽', '🥚', '💛'].map(
            (icon, index) => (
              <span key={`${icon}-${index}`}>{icon}</span>
            ),
          )}
        </div>

        <div className="login-features__heading">
          <span className="eyebrow">PetCheck가 도와드려요</span>
          <h2 id="login-feature-heading">
            사료 확인에 필요한 것만
            <br />
            쉽고 정확하게 담았어요
          </h2>
        </div>

        <div className="login-features__list">
          {loginFeatures.map((feature, index) => (
            <div className="feature-scene" key={feature.title}>
              <FeatureCard
                {...feature}
                reveal
                visual={(
                  <div className="feature-card__mascot" aria-hidden="true">
                    <span className="feature-card__number">0{index + 1}</span>
                    <span className="feature-card__pet-position">
                      <PetIllustration />
                    </span>
                    <strong>{feature.badge}</strong>
                  </div>
                )}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Login;
