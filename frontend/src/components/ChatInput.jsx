import { useState } from 'react';

function ChatInput({ onSend, disabled }) {
  const [question, setQuestion] = useState('');

  const submitQuestion = () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || disabled) return;

    onSend(trimmedQuestion);
    setQuestion('');
  };

  return (
    <div className="chat-input">
      <textarea
        value={question}
        rows="1"
        maxLength="300"
        placeholder="궁금한 내용을 입력해 주세요"
        aria-label="AI에게 질문하기"
        disabled={disabled}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitQuestion();
          }
        }}
      />
      <button
        type="button"
        aria-label="질문 보내기"
        disabled={!question.trim() || disabled}
        onClick={submitQuestion}
      >
        ↑
      </button>
    </div>
  );
}

export default ChatInput;
