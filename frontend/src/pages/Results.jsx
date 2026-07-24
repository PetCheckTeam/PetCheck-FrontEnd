import { useState } from 'react';
import Button from '../components/Button';
import IngredientCard from '../components/IngredientCard';
import PetIllustration from '../components/PetIllustration';

const createResultData = (petName, allergies) => {
  const primaryAllergy = allergies[0] || '닭고기';

  return {
    petName,
    verdict: 'warning',
    safe: 4,
    warning: 2,
    danger: 1,
    message: `${petName}에게 주의가 필요한 성분이 있어요. 특히 등록한 알레르기 정보와 일치하는 성분은 급여 전에 꼭 확인해 주세요.`,
    ingredients: [
      {
        id: 1,
        name: '현미',
        status: 'safe',
        shortDescription: '소화 가능한 탄수화물 원료',
        description: '현미는 식이섬유와 탄수화물을 공급하는 곡물 원료예요.',
        reason: '등록된 알레르기 정보와 일치하지 않아요.',
      },
      {
        id: 2,
        name: '연어 오일',
        status: 'safe',
        shortDescription: '오메가-3 지방산 공급원',
        description: '피부와 털 건강에 도움을 줄 수 있는 지방 원료예요.',
        reason: '일반적인 급여 기준에서 안전한 성분으로 분류했어요.',
      },
      {
        id: 3,
        name: '비트 펄프',
        status: 'safe',
        shortDescription: '식이섬유 공급원',
        description: '장 건강과 배변 활동에 도움을 줄 수 있는 섬유질 원료예요.',
        reason: '등록된 알레르기와 관련성이 낮아요.',
      },
      {
        id: 4,
        name: '비타민 혼합제',
        status: 'safe',
        shortDescription: '필수 영양소 보충',
        description: '사료의 영양 균형을 맞추기 위해 포함되는 비타민 성분이에요.',
        reason: '표시된 범위에서는 특별한 위험 신호가 없어요.',
      },
      {
        id: 5,
        name: '옥수수 글루텐',
        status: 'warning',
        shortDescription: '민감한 반려동물은 주의',
        description: '식물성 단백질 공급원이지만 일부 반려동물에게 소화 부담을 줄 수 있어요.',
        reason: '알레르기 이력이 있거나 곡물에 민감하다면 주의가 필요해요.',
      },
      {
        id: 6,
        name: '동물성 지방',
        status: 'warning',
        shortDescription: '원료 출처 확인 필요',
        description: '표기만으로는 어떤 동물에서 얻은 지방인지 정확히 알기 어려워요.',
        reason: '원료 출처가 명확하지 않아 알레르기 반응 여부를 확인하기 어려워요.',
      },
      {
        id: 7,
        name: primaryAllergy,
        status: 'danger',
        shortDescription: `${petName}의 등록 알레르기와 일치`,
        description: `${primaryAllergy}는 ${petName}의 알레르기 정보에 등록된 성분이에요.`,
        reason: '등록한 알레르기 성분과 직접 일치하므로 급여를 피하는 것을 권장해요.',
      },
    ],
  };
};

const verdictInfo = {
  safe: {
    label: '안심하고 급여해도 좋아요',
    description: '등록된 알레르기와 일치하는 성분이 없어요.',
    icon: '✓',
  },
  warning: {
    label: '급여 전에 확인이 필요해요',
    description: '주의하거나 피해야 할 성분이 발견됐어요.',
    icon: '!',
  },
  danger: {
    label: '급여하지 않는 것이 좋아요',
    description: '등록된 알레르기 성분이 포함되어 있어요.',
    icon: '×',
  },
};

function Results({ petProfile, onScanAgain, onGoHome, onAskAI }) {
  const [openIngredientId, setOpenIngredientId] = useState(null);
  const petName = petProfile.petName || '우리 아이';
  const result = createResultData(petName, petProfile.allergies || []);
  const currentVerdict = verdictInfo[result.verdict];

  return (
    <main className="results-page">
      <header className="results-header">
        <button type="button" onClick={onScanAgain} aria-label="이전 화면">←</button>
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <span className="brand__paw" aria-hidden="true">P</span>
          PetCheck
        </a>
        <button type="button" onClick={onGoHome}>홈</button>
      </header>

      <section className={`result-hero result-hero--${result.verdict}`}>
        <div className="result-hero__copy">
          <span className="result-verdict">
            <span aria-hidden="true">{currentVerdict.icon}</span>
            분석 완료
          </span>
          <h1>{currentVerdict.label}</h1>
          <p>{currentVerdict.description}</p>
        </div>
        <PetIllustration className="result-hero__pet" type={petProfile.petType} />
      </section>

      <section className="result-content">
        <div className="result-summary" aria-label="성분 분석 요약">
          <article className="result-count result-count--safe">
            <span>안전</span>
            <strong>{result.safe}</strong>
            <small>개 성분</small>
          </article>
          <article className="result-count result-count--warning">
            <span>주의</span>
            <strong>{result.warning}</strong>
            <small>개 성분</small>
          </article>
          <article className="result-count result-count--danger">
            <span>위험</span>
            <strong>{result.danger}</strong>
            <small>개 성분</small>
          </article>
        </div>

        <article className="health-message">
          <div className="health-message__icon" aria-hidden="true">💬</div>
          <div>
            <span>PetCheck 맞춤 메시지</span>
            <h2>{petName} 보호자님께</h2>
            <p>{result.message}</p>
          </div>
        </article>

        <section className="ingredient-section" aria-labelledby="ingredient-heading">
          <div className="ingredient-section__heading">
            <div>
              <span className="eyebrow">총 {result.ingredients.length}개 성분</span>
              <h2 id="ingredient-heading">성분별 상세 결과</h2>
            </div>
            <p>카드를 누르면 판단 이유를 볼 수 있어요.</p>
          </div>

          <div className="ingredient-list">
            {result.ingredients.map((ingredient) => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                isOpen={openIngredientId === ingredient.id}
                onToggle={() =>
                  setOpenIngredientId((previous) =>
                    previous === ingredient.id ? null : ingredient.id,
                  )
                }
              />
            ))}
          </div>
        </section>

        <div className="result-ai-cta">
          <div>
            <span aria-hidden="true">✨</span>
            <div>
              <strong>이 결과에 대해 더 궁금한가요?</strong>
              <p>{petName}의 프로필을 참고해 AI가 쉽게 설명해 드려요.</p>
            </div>
          </div>
          <Button type="button" onClick={onAskAI}>AI에게 물어보기 →</Button>
        </div>

        <div className="result-actions">
          <Button type="button" onClick={onScanAgain}>다른 사료 분석하기</Button>
          <button type="button" onClick={onGoHome}>처음으로 돌아가기</button>
        </div>

        <p className="result-disclaimer">
          이 결과는 성분표를 바탕으로 한 참고 정보이며, 정확한 진단은 수의사와 상담해 주세요.
        </p>
      </section>
    </main>
  );
}

export default Results;
