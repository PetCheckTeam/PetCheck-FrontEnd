import { useState } from 'react';
import AllergyChip from '../components/AllergyChip';
import Button from '../components/Button';
import PetIllustration from '../components/PetIllustration';
import ProgressBar from '../components/ProgressBar';

const allergyOptions = [
  '닭고기',
  '소고기',
  '돼지고기',
  '밀',
  '옥수수',
  '우유',
  '계란',
  '생선',
];

function Setup({ onBackToWelcome, onStartScanner }) {
  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState('');
  const [petName, setPetName] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const toggleAllergy = (allergy) => {
    setAllergies((previous) => {
      if (previous.includes(allergy)) {
        return previous.filter((item) => item !== allergy);
      }

      return [...previous, allergy];
    });
  };

  const goToPreviousStep = () => {
    if (step === 1) {
      onBackToWelcome();
      return;
    }

    setStep((previous) => previous - 1);
  };

  if (isComplete) {
    return (
      <main className="setup-page">
        <section className="setup-complete">
          <span className="setup-complete__check" aria-hidden="true">✓</span>
          <PetIllustration className="setup-complete__pet" />
          <span className="eyebrow">등록 완료</span>
          <h1>{petName}의 정보를<br />안전하게 저장했어요</h1>
          <p>
            {allergies.length > 0
              ? `알레르기 ${allergies.length}개도 함께 기억할게요.`
              : '등록된 알레르기는 없어요.'}
          </p>
          <div className="setup-complete__summary">
            <span>{petType === 'dog' ? '🐶 강아지' : '🐱 고양이'}</span>
            <span>{petName}</span>
            <span>{allergies.length > 0 ? allergies.join(', ') : '알레르기 없음'}</span>
          </div>
          <div className="setup-complete__next">
            다음 단계에서는 사료 사진을 올릴 수 있어요.
          </div>
          <Button type="button" onClick={onStartScanner}>
            사료 사진 올리기 →
          </Button>
          <button
            className="setup-complete__back"
            type="button"
            onClick={onBackToWelcome}
          >
            소개 화면으로 돌아가기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="setup-page">
      <header className="setup-header">
        <button type="button" onClick={goToPreviousStep} aria-label="이전 화면">
          ←
        </button>
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <span className="brand__paw" aria-hidden="true">P</span>
          PetCheck
        </a>
      </header>

      <section className="setup-card">
        <ProgressBar currentStep={step} totalSteps={3} />

        {step === 1 && (
          <div className="setup-step">
            <div className="setup-step__heading">
              <span className="eyebrow">첫 번째 질문</span>
              <h1>어떤 반려동물과<br />함께 살고 있나요?</h1>
              <p>한 마리씩 차근차근 등록할 수 있어요.</p>
            </div>

            <div className="pet-type-grid">
              <button
                className={`pet-type-card ${petType === 'dog' ? 'pet-type-card--selected' : ''}`}
                type="button"
                aria-pressed={petType === 'dog'}
                onClick={() => setPetType('dog')}
              >
                <span aria-hidden="true">🐶</span>
                <strong>강아지</strong>
                <small>멍멍!</small>
              </button>
              <button
                className={`pet-type-card ${petType === 'cat' ? 'pet-type-card--selected' : ''}`}
                type="button"
                aria-pressed={petType === 'cat'}
                onClick={() => setPetType('cat')}
              >
                <span aria-hidden="true">🐱</span>
                <strong>고양이</strong>
                <small>야옹!</small>
              </button>
            </div>

            <Button
              type="button"
              fullWidth
              disabled={!petType}
              onClick={() => setStep(2)}
            >
              다음
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <div className="setup-step__heading">
              <span className="eyebrow">두 번째 질문</span>
              <h1>반려동물의 이름을<br />알려주세요</h1>
              <p>앞으로 이름을 불러 친근하게 안내할게요.</p>
            </div>

            <label className="setup-name-field" htmlFor="pet-name">
              <span>이름</span>
              <input
                id="pet-name"
                type="text"
                value={petName}
                maxLength="20"
                placeholder="예: 보리"
                autoFocus
                onChange={(event) => setPetName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && petName.trim()) setStep(3);
                }}
              />
              <small>{petName.length} / 20</small>
            </label>

            <Button
              type="button"
              fullWidth
              disabled={!petName.trim()}
              onClick={() => setStep(3)}
            >
              {petName.trim() ? `${petName.trim()} 등록하기 💛` : '이름을 입력해 주세요'}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="setup-step">
            <div className="setup-step__heading">
              <span className="eyebrow">마지막 질문</span>
              <h1>{petName}에게 피해야 할<br />알레르기가 있나요?</h1>
              <p>여러 개를 선택할 수 있고, 없다면 바로 넘어가도 돼요.</p>
            </div>

            <div className="allergy-grid">
              {allergyOptions.map((allergy) => (
                <AllergyChip
                  key={allergy}
                  label={allergy}
                  selected={allergies.includes(allergy)}
                  onToggle={() => toggleAllergy(allergy)}
                />
              ))}
            </div>

            <Button type="button" fullWidth onClick={() => setIsComplete(true)}>
              {allergies.length > 0
                ? `알레르기 ${allergies.length}개 저장하기`
                : '알레르기 없이 등록 완료'}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Setup;
