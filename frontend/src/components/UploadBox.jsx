import { useRef, useState } from 'react';

function UploadBox({ previewUrl, fileName, onFileSelect, onRemove }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFile = (file) => {
    if (file) onFileSelect(file);
  };

  return (
    <div
      className={`upload-box ${isDragging ? 'upload-box--dragging' : ''} ${previewUrl ? 'upload-box--filled' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        className="upload-box__input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          handleFile(event.target.files[0]);
          event.target.value = '';
        }}
      />

      {previewUrl ? (
        <div className="upload-preview">
          <img src={previewUrl} alt="선택한 사료 성분표 미리보기" />
          <div className="upload-preview__footer">
            <div>
              <strong>{fileName}</strong>
              <span>사진이 준비됐어요</span>
            </div>
            <div className="upload-preview__actions">
              <button type="button" onClick={openFilePicker}>다시 선택</button>
              <button type="button" onClick={onRemove}>삭제</button>
            </div>
          </div>
        </div>
      ) : (
        <button className="upload-box__empty" type="button" onClick={openFilePicker}>
          <span className="upload-box__icon" aria-hidden="true">📷</span>
          <strong>성분표 사진을 올려주세요</strong>
          <span>사진을 선택하거나 이곳에 끌어다 놓으세요.</span>
          <small>!JPEG 형식의 파일만 가능해요!</small>
        </button>
      )}
    </div>
  );
}

export default UploadBox;
