import { useState } from 'react';
import petcheckAppIcon from '../assets/petcheck-app-icon.png';
import resultCatImage from '../assets/result-danger-cat.png';
import resultDogImage from '../assets/result-danger-dog.png';
import Button from '../components/Button';
import IngredientCard from '../components/IngredientCard';

const verdictInfo = {
  safe: {
    label: '안심하고 급여해도 좋아요',
    description: '등록된 알러지와 일치하는 성분이 없어요.',
    icon: '✓',
  },
  warning: {
    label: '급여 전에 확인이 필요해요',
    description: '주의하거나 피해야 할 성분이 발견됐어요.',
    icon: '!',
  },
  danger: {
    label: '급여하지 않는 것이 좋아요',
    description: '등록된 알러지 성분이 포함되어 있어요.',
    icon: '×',
  },
};

const normalizeStatus = (status) => {
  const value = String(status ?? '').trim().toLowerCase();

  if (
    ['matched', 'danger', 'dangerous', 'avoid', 'unsafe', '위험', '알러지 일치']
      .includes(value)
  ) {
    return 'danger';
  }

  if (
    ['unknown', 'warning', 'caution', '주의', '확인 필요']
      .includes(value)
  ) {
    return 'warning';
  }

  if (
    ['not_matched', 'not-matched', 'notmatched', 'safe', '안전', '미일치']
      .includes(value)
  ) {
    return 'safe';
  }

  return 'warning';
};

const createMatchReason = (ingredient) => {
  const matchStatus = String(ingredient.matchStatus ?? '').trim().toUpperCase();

  if (matchStatus === 'MATCHED') {
    const matchedName = ingredient.matchedAvoidIngredientName;
    return matchedName
      ? `등록한 알러지 성분 '${matchedName}'과 일치해요.`
      : '등록한 알러지 성분과 일치해요.';
  }

  if (matchStatus === 'UNKNOWN') {
    return '성분을 정확히 비교하기 어려워 확인이 필요해요.';
  }

  if (matchStatus === 'NOT_MATCHED') {
    return '등록한 알러지 성분과 정확히 일치하지 않아요.';
  }

  return '';
};

const parseAnalysisPayload = (value) => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeAnalysisResult = (analysis, petName) => {
  const parsedAiResult = parseAnalysisPayload(analysis?.aiAnalysisResult);
  const source = (
    parsedAiResult
    ?? analysis?.analysisResult
    ?? analysis?.result
    ?? analysis
  );
  const rawIngredients = source?.ingredients ?? source?.ingredientResults ?? [];
  const ingredients = rawIngredients.map((ingredient, index) => ({
    ...ingredient,
    id: ingredient.id ?? ingredient.ingredientId ?? index,
    name: ingredient.name ?? ingredient.ingredientName ?? '이름 없는 성분',
    status: normalizeStatus(
      ingredient.matchStatus
      ?? ingredient.status
      ?? ingredient.riskLevel,
    ),
    shortDescription:
      ingredient.shortDescription ?? ingredient.summary ?? ingredient.description ?? '',
    description: ingredient.description ?? ingredient.detail ?? '',
    reason:
      ingredient.reason
      || ingredient.analysisReason
      || createMatchReason(ingredient),
  }));
  const count = (status) => ingredients.filter((item) => item.status === status).length;
  const hasMatchStatus = rawIngredients.some(
    (ingredient) => ingredient.matchStatus != null,
  );
  const hasUnknownMatch = rawIngredients.some(
    (ingredient) =>
      String(ingredient.matchStatus ?? '').trim().toUpperCase() === 'UNKNOWN',
  );
  const parsedMatchedCount = Number(source?.matchedCount);
  const hasMatchedCount = (
    source?.matchedCount != null
    && source.matchedCount !== ''
    && Number.isFinite(parsedMatchedCount)
  );
  const matchedCount = hasMatchedCount
    ? Math.max(0, parsedMatchedCount)
    : count('danger');
  const verdict = (hasMatchedCount || hasMatchStatus)
    ? matchedCount > 0
      ? 'danger'
      : hasUnknownMatch
        ? 'warning'
        : 'safe'
    : normalizeStatus(
      source?.verdict
      ?? source?.overallStatus
      ?? (count('danger') ? 'danger' : count('warning') ? 'warning' : 'safe'),
    );
  const message = matchedCount > 0
    ? `${petName}에게 등록된 알러지 성분과 일치하는 원료가 ${matchedCount}개 발견됐어요.`
    : (
      source?.message
      ?? source?.healthMessage
      ?? (typeof analysis?.aiAnalysisResult === 'string' && !parsedAiResult
        ? analysis.aiAnalysisResult
        : null)
      ?? `${petName}의 분석 결과를 확인해 주세요.`
    );

  return {
    petName,
    verdict,
    safe: hasMatchStatus ? count('safe') : source?.safeCount ?? count('safe'),
    warning: hasMatchStatus ? count('warning') : source?.warningCount ?? count('warning'),
    danger: hasMatchedCount ? matchedCount : source?.dangerCount ?? count('danger'),
    message,
    ingredients,
  };
};

const completedStatuses = new Set([
  'COMPLETED',
  'COMPLETE',
  'SUCCESS',
  'DONE',
  'ANALYZED',
]);

const hasAnalysisData = (analysis) => Boolean(
  analysis?.aiAnalysisResult
  || analysis?.analysisResult
  || analysis?.result
  || analysis?.ingredientResults?.length
  || analysis?.ingredients?.length,
);

function ResultsHeader({ onScanAgain, onGoHome }) {
  return (
    <header className="results-header">
      <button type="button" onClick={onScanAgain} aria-label="이전 화면">←</button>
      <a className="brand" href="/" aria-label="PetCheck 홈">
        <img className="brand__image" src={petcheckAppIcon} alt="" />
        PetCheck
      </a>
      <button type="button" onClick={onGoHome}>홈</button>
    </header>
  );
}

function Results({ petProfile, analysisResult, onScanAgain, onGoHome, onAskAI }) {
  const [openIngredientId, setOpenIngredientId] = useState(null);
  const petName = petProfile.petName || '우리 아이';
  const analysisId = analysisResult?.analysisId ?? analysisResult?.id ?? null;
  const analysisStatus = String(analysisResult?.status ?? '').toUpperCase();
  const canAskAI = Boolean(
    analysisResult
    && analysisId
    && (completedStatuses.has(analysisStatus) || hasAnalysisData(analysisResult)),
  );

  if (!analysisResult) {
    return (
      <main className="results-page">
        <ResultsHeader onScanAgain={onScanAgain} onGoHome={onGoHome} />
        <section className="result-empty-state" role="status">
          <span aria-hidden="true">!</span>
          <h1>분석 결과를 불러오지 못했습니다.</h1>
          <p>성분표 사진을 다시 분석한 뒤 결과를 확인해 주세요.</p>
          <Button type="button" onClick={onScanAgain}>다시 분석하기</Button>
        </section>
      </main>
    );
  }

  const result = normalizeAnalysisResult(analysisResult, petName);
  const currentVerdict = verdictInfo[result.verdict];
  const resultPetImage = petProfile.petType === 'cat'
    ? resultCatImage
    : resultDogImage;
  const resultPetLabel = petProfile.petType === 'cat' ? '고양이' : '강아지';

  return (
    <main className="results-page">
      <ResultsHeader onScanAgain={onScanAgain} onGoHome={onGoHome} />

      <section className={`result-hero result-hero--${result.verdict}`}>
        <div className="result-hero__copy">
          <span className="result-verdict">
            <span aria-hidden="true">{currentVerdict.icon}</span>
            분석 완료
          </span>
          <h1>{currentVerdict.label}</h1>
          <p>{currentVerdict.description}</p>
        </div>
        <img
          className="pet-illustration result-hero__pet result-hero__pet--verdict"
          src={resultPetImage}
          alt={`화난 표정의 PetCheck ${resultPetLabel} 캐릭터`}
        />
      </section>

      <section className="result-content">
        <div className="result-summary" aria-label="성분 분석 요약">
          <article className="result-count result-count--safe">
            <span>미일치</span>
            <strong>{result.safe}</strong>
            <small>개 성분</small>
          </article>
          <article className="result-count result-count--warning">
            <span>확인 필요</span>
            <strong>{result.warning}</strong>
            <small>개 성분</small>
          </article>
          <article className="result-count result-count--danger">
            <span>알러지 일치</span>
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

        {result.ingredients.length > 0 && (
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
        )}

        <div className="result-ai-cta">
          <div>
            <span aria-hidden="true">✨</span>
            <div>
              <strong>이 결과에 대해 더 궁금한가요?</strong>
              <p>{petName}의 프로필을 참고해 AI가 쉽게 설명해 드려요.</p>
            </div>
          </div>
          <Button
            type="button"
            disabled={!canAskAI}
            onClick={() => {
              if (canAskAI) onAskAI();
            }}
          >
            {canAskAI ? 'AI에게 물어보기 →' : '분석 완료 후 이용할 수 있어요'}
          </Button>
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
