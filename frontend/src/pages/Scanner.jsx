import { useEffect, useState } from 'react';
import { analysesApi } from '../api/petcheckApi';
import Button from '../components/Button';
import UploadBox from '../components/UploadBox';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function Scanner({
  petProfiles,
  selectedPetId,
  onSelectPet,
  onBack,
  onViewResults,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanStatus, setScanStatus] = useState('empty');
  const [errorMessage, setErrorMessage] = useState('');
  const [productName, setProductName] = useState('');
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleFileSelect = (file) => {
    setErrorMessage('');

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage('JPG, PNG, WEBP 형식의 이미지만 올릴 수 있어요.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('이미지 크기는 10MB 이하로 올려주세요.');
      return;
    }

    setSelectedImage(file);
    setScanStatus('upload');
  };

  const handleRemove = () => {
    setSelectedImage(null);
    setScanStatus('empty');
    setErrorMessage('');
    setAnalysisData(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !selectedPetId || !productName.trim()) return;

    setErrorMessage('');
    setScanStatus('scanning');
    try {
      const created = await analysesApi.create({
        petId: selectedPetId,
        image: selectedImage,
        productName: productName.trim(),
      });
      const analysisId = created?.analysisId ?? created?.id;
      if (!analysisId) throw new Error('분석 생성 응답에 분석 ID가 없습니다.');

      let current = created;
      let isConfirmed = false;
      let isComplete = false;
      for (let attempt = 0; attempt < 60; attempt += 1) {
        current = await analysesApi.get(analysisId);
        const status = String(current?.status ?? '').toUpperCase();
        if (['COMPLETED', 'COMPLETE', 'SUCCESS', 'DONE', 'ANALYZED'].includes(status)) {
          isComplete = true;
          break;
        }
        if (!isConfirmed && ['OCR_COMPLETED', 'OCR_COMPLETE', 'OCR_READY'].includes(status)) {
          await analysesApi.confirm(analysisId);
          isConfirmed = true;
        }
        if (['FAILED', 'ERROR'].includes(status)) {
          throw new Error(current?.message ?? '사료 분석에 실패했습니다.');
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
      }
      if (!isComplete) throw new Error('분석 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해 주세요.');
      setAnalysisData(current);
      setScanStatus('complete');
    } catch (error) {
      setErrorMessage(error.message);
      setScanStatus('upload');
    }
  };

  return (
    <main className="scanner-page">
      <header className="scanner-header">
        <button type="button" onClick={onBack} aria-label="이전 화면">←</button>
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <span className="brand__paw" aria-hidden="true">P</span>
          PetCheck
        </a>
        <span className="scanner-header__step">사료 분석</span>
      </header>

      <div className="scanner-layout">
        <aside className="pet-selector" aria-label="분석할 반려동물 선택">
          <div className="pet-selector__heading">
            <span>분석 대상</span>
            <strong>반려동물 선택</strong>
          </div>
          <div className="pet-selector__list">
            {petProfiles.map((pet) => (
              <button
                key={pet.id}
                className={`pet-selector__item ${
                  pet.id === selectedPetId ? 'pet-selector__item--selected' : ''
                }`}
                type="button"
                aria-pressed={pet.id === selectedPetId}
                onClick={() => onSelectPet(pet.id)}
              >
                <span className="pet-selector__emoji" aria-hidden="true">
                  {pet.petType === 'dog' ? '🐶' : '🐱'}
                </span>
                <span>
                  <strong>{pet.petName}</strong>
                  <small>
                    {pet.allergies.length > 0
                      ? `알러지 ${pet.allergies.length}개`
                      : '알러지 없음'}
                  </small>
                </span>
                <span className="pet-selector__check" aria-hidden="true">✓</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="scanner-card">
        <div className="scanner-heading">
          <span className="eyebrow">사료 성분 확인</span>
          <h1>성분표가 잘 보이게<br />사진을 올려주세요</h1>
          <p>글자가 선명할수록 더 정확하게 확인할 수 있어요.</p>
        </div>

        <div className="scanner-tips" aria-label="사진 촬영 안내">
          <div><span aria-hidden="true">☀️</span> 밝은 곳에서</div>
          <div><span aria-hidden="true">▣</span> 성분표 전체를</div>
          <div><span aria-hidden="true">✋</span> 흔들리지 않게</div>
        </div>

        {scanStatus === 'scanning' || scanStatus === 'complete' ? (
          <div className={`scan-state scan-state--${scanStatus}`}>
            {scanStatus === 'scanning' ? (
              <>
                <div className="scan-state__loader" aria-hidden="true"><span /></div>
                <span className="eyebrow">AI가 확인하고 있어요</span>
                <h2>성분표를 꼼꼼히 읽는 중...</h2>
                <p>잠시만 기다려 주세요. 곧 분석이 끝나요.</p>
                <div className="scan-state__steps">
                  <span className="scan-state__step--active">이미지 확인</span>
                  <span>성분 추출</span>
                  <span>알러지 비교</span>
                </div>
              </>
            ) : (
              <>
                <span className="scan-state__complete-icon" aria-hidden="true">✓</span>
                <span className="eyebrow">분석 완료</span>
                <h2>성분표를 모두 확인했어요!</h2>
                <p>안전·주의·위험 성분을 구분해 두었어요.</p>
                <div className="scan-state__actions">
                  <Button type="button" onClick={() => onViewResults(analysisData)}>
                    상세 분석 결과 보기
                  </Button>
                  <button type="button" onClick={handleRemove}>다른 사진 선택하기</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <UploadBox
              previewUrl={previewUrl}
              fileName={selectedImage?.name}
              onFileSelect={handleFileSelect}
              onRemove={handleRemove}
            />
            <label className="setup-name-field scanner-product-field" htmlFor="product-name">
              <span>제품명</span>
              <input
                id="product-name"
                type="text"
                value={productName}
                placeholder="예: 우리 아이 데일리 사료"
                onChange={(event) => setProductName(event.target.value)}
              />
            </label>
            {errorMessage && <p className="scanner-error" role="alert">{errorMessage}</p>}
            <Button
              type="button"
              fullWidth
              disabled={!selectedImage || !selectedPetId || !productName.trim()}
              onClick={handleAnalyze}
            >
              {!selectedImage
                ? '사진을 먼저 올려주세요'
                : !productName.trim()
                  ? '제품명을 입력해 주세요'
                  : '이 사진 분석하기'}
            </Button>
          </>
        )}
        </section>
      </div>
    </main>
  );
}

export default Scanner;
