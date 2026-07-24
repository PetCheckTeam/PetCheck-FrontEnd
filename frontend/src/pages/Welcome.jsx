import FeatureCard from '../components/FeatureCard';
import PetIllustration from '../components/PetIllustration';

const features = [
  {
    icon: '📷',
    title: '사료 성분 분석',
    description: '포장지 사진을 올리면 주요 성분을 한눈에 정리해요.',
  },
  {
    icon: '🛡️',
    title: '알레르기 위험 확인',
    description: '등록한 알레르기와 일치하는 성분을 먼저 찾아드려요.',
  },
  {
    icon: '💬',
    title: '맞춤 건강 메시지',
    description: '우리 아이 정보를 바탕으로 쉬운 건강 안내를 전해요.',
  },
];

function Welcome({ onBackToLogin, onStartSetup }) {
  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <span className="brand__paw" aria-hidden="true">P</span>
          PetCheck
        </a>
        <button type="button" onClick={onBackToLogin}>
          로그아웃
        </button>
      </header>

      <section className="welcome-hero">
        <div className="welcome-hero__copy">
          <span className="eyebrow">반려동물 사료, 어렵지 않게</span>
          <h1>우리 아이의 한 끼를<br />더 안심할 수 있도록</h1>
          <p>
            사료 사진 한 장이면 충분해요.<br />
            복잡한 성분표를 PetCheck가 쉽게 설명해 드릴게요.
          </p>
          <button className="welcome-next" type="button" onClick={onStartSetup}>
            <strong>반려동물 정보 등록</strong>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="welcome-hero__visual">
          <div className="welcome-hero__bubble">
            이 사료 나한테 맞아? <span aria-hidden="true">🤔</span>
          </div>
          <PetIllustration className="welcome-hero__pet" />
          <div className="welcome-hero__plate" aria-hidden="true" />
        </div>
      </section>

      <section className="welcome-features" aria-labelledby="feature-heading">
        <div className="welcome-features__heading">
          <span className="eyebrow">PetCheck가 도와드려요</span>
          <h2 id="feature-heading">사료 확인에 필요한 것만 담았어요</h2>
        </div>
        <div className="welcome-features__grid">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Welcome;
