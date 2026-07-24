import { useEffect, useState } from 'react';
import Button from '../components/Button';
import UploadBox from '../components/UploadBox';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function Scanner({ onBackToSetup, onViewResults }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scanStatus, setScanStatus] = useState('empty');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  useEffect(() => {
    if (scanStatus !== 'scanning') return undefined;

    // 실제 API 연결 후에는 이 타이머를 서버 요청으로 교체합니다.
    const timer = window.setTimeout(() => {
      setScanStatus('complete');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [scanStatus]);

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
  };

  return (
    <main className="scanner-page">
      <header className="scanner-header">
        <button type="button" onClick={onBackToSetup} aria-label="이전 화면">←</button>
        <a className="brand" href="/" aria-label="PetCheck 홈">
          <span className="brand__paw" aria-hidden="true">P</span>
          PetCheck
        </a>
        <span className="scanner-header__step">사료 분석</span>
      </header>

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
                  <span>알레르기 비교</span>
                </div>
              </>
            ) : (
              <>
                <span className="scan-state__complete-icon" aria-hidden="true">✓</span>
                <span className="eyebrow">분석 완료</span>
                <h2>성분표를 모두 확인했어요!</h2>
                <p>안전·주의·위험 성분을 구분해 두었어요.</p>
                <div className="scan-state__actions">
                  <Button type="button" onClick={onViewResults}>상세 분석 결과 보기</Button>
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
            {errorMessage && <p className="scanner-error" role="alert">{errorMessage}</p>}
            <Button
              type="button"
              fullWidth
              disabled={!selectedImage}
              onClick={() => selectedImage && setScanStatus('scanning')}
            >
              {selectedImage ? '이 사진 분석하기' : '사진을 먼저 올려주세요'}
            </Button>
          </>
        )}
      </section>
    </main>
  );
}

export default Scanner;
