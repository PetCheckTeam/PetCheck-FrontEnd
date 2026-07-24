import Button from '../components/Button';
import PetIllustration from '../components/PetIllustration';

function Welcome({ onLogout }) {
  return (
    <main className="welcome-page">
      <section className="welcome-card">
        <span className="welcome-card__badge">로그인 완료</span>
        <PetIllustration className="welcome-card__pet" />
        <div className="welcome-card__bubble">다시 만나서 반가워요!</div>
        <h1>이제 사료를<br />확인해볼까요?</h1>
        <p>
          사료 사진을 올리면 성분과 알레르기 위험을<br />
          쉽고 빠르게 알려드릴게요.
        </p>
        <Button type="button" onClick={onLogout}>
          로그인 화면으로 돌아가기
        </Button>
      </section>
    </main>
  );
}

export default Welcome;
