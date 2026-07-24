function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="progress">
      <div className="progress__label">
        <span>반려동물 등록</span>
        <strong>{currentStep} / {totalSteps}</strong>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin="1"
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        aria-label={`반려동물 등록 ${currentStep}단계`}
      >
        <div className="progress__value" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
