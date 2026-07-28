import { useEffect, useRef, useState } from 'react';
import { analysesApi } from '../api/petcheckApi';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import PetIllustration from '../components/PetIllustration';
import SuggestedQuestion from '../components/SuggestedQuestion';

const suggestedQuestions = [
  '이 사료를 먹여도 괜찮아?',
  '기피 성분과 일치한 원료를 설명해 줘',
  '왜 이 원료가 해당 성분으로 분류되었어?',
];

const getInitialMessage = (petName, hasAnalysisId) => ({
  id: `greeting-${Date.now()}`,
  role: 'assistant',
  content: hasAnalysisId
    ? `안녕하세요! ${petName}의 현재 사료 분석 결과를 기준으로 궁금한 점을 물어보세요.`
    : '사료 분석 결과를 먼저 완료한 뒤 질문해 주세요.',
  excludeFromHistory: true,
});

function Chatbot({
  petProfile,
  analysisResult,
  onBackToResults,
}) {
  const petName = petProfile.petName || '우리 아이';
  const analysisId = analysisResult?.analysisId ?? analysisResult?.id ?? null;
  const [messages, setMessages] = useState(() => [
    getInitialMessage(petName, Boolean(analysisId)),
  ]);
  const [isResponding, setIsResponding] = useState(false);
  const messageEndRef = useRef(null);
  const isMountedRef = useRef(true);
  const isRespondingRef = useRef(false);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isResponding]);

  useEffect(() => {
    requestSequenceRef.current += 1;
    isRespondingRef.current = false;
    setIsResponding(false);
    setMessages([getInitialMessage(petName, Boolean(analysisId))]);
  }, [analysisId, petName]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      requestSequenceRef.current += 1;
    };
  }, []);

  const resetConversation = () => {
    requestSequenceRef.current += 1;
    isRespondingRef.current = false;
    setIsResponding(false);
    setMessages([getInitialMessage(petName, Boolean(analysisId))]);
  };

  const sendQuestion = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || !analysisId || isRespondingRef.current) return;

    const history = messages
      .filter((message) => (
        !message.excludeFromHistory
        && (message.role === 'user' || message.role === 'assistant')
      ))
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));
    const requestSequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestSequence;
    isRespondingRef.current = true;
    setMessages((previous) => [
      ...previous,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmedQuestion,
      },
    ]);
    setIsResponding(true);

    try {
      const response = await analysesApi.chat(
        analysisId,
        trimmedQuestion,
        history,
      );
      const answer = String(response?.answer ?? '').trim();
      if (!answer) {
        throw new Error('챗봇 답변이 비어 있습니다. 잠시 후 다시 시도해 주세요.');
      }
      if (!isMountedRef.current || requestSequenceRef.current !== requestSequence) return;

      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: answer,
          sources: Array.isArray(response?.sources) ? response.sources : [],
        },
      ]);
    } catch (error) {
      if (!isMountedRef.current || requestSequenceRef.current !== requestSequence) return;

      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            error?.message
            || '챗봇 답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
          isError: true,
          excludeFromHistory: true,
        },
      ]);
    } finally {
      if (isMountedRef.current && requestSequenceRef.current === requestSequence) {
        isRespondingRef.current = false;
        setIsResponding(false);
      }
    }
  };

  return (
    <main className="chatbot-page">
      <header className="chatbot-header">
        <button type="button" onClick={onBackToResults} aria-label="분석 결과로 돌아가기">
          ←
        </button>
        <div>
          <strong>PetCheck AI</strong>
          <span>
            <i aria-hidden="true" />
            {analysisId ? '분석 결과 연결됨' : '분석 결과 필요'}
          </span>
        </div>
        <button
          type="button"
          disabled={isResponding}
          onClick={resetConversation}
        >
          새 대화
        </button>
      </header>

      <section className="chatbot-profile">
        <div>
          <span>
            <PetIllustration type={petProfile.petType} />
          </span>
          <div>
            <strong>{petName}의 분석 결과 적용 중</strong>
            <small>
              기피 성분: {petProfile.allergies?.length
                ? petProfile.allergies.join(', ')
                : '등록된 성분 없음'}
            </small>
          </div>
        </div>
      </section>

      <section className="chatbot-body" aria-label="AI 대화">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            petType={petProfile.petType}
          />
        ))}

        {isResponding && (
          <div className="chat-typing" aria-label="AI가 답변을 작성하고 있습니다">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={messageEndRef} />
      </section>

      <footer className="chatbot-footer">
        <div className="suggested-questions">
          <span>이런 질문을 해보세요</span>
          <div>
            {suggestedQuestions.map((question) => (
              <SuggestedQuestion
                key={question}
                disabled={isResponding || !analysisId}
                onClick={() => sendQuestion(question)}
              >
                {question}
              </SuggestedQuestion>
            ))}
          </div>
        </div>
        {!analysisId && (
          <p className="chatbot-analysis-required" role="status">
            분석 결과를 먼저 완료한 뒤 질문해 주세요.
          </p>
        )}
        <ChatInput onSend={sendQuestion} disabled={isResponding || !analysisId} />
        <p>AI 답변은 참고 정보이며, 건강 이상이 있다면 수의사와 상담해 주세요.</p>
      </footer>
    </main>
  );
}

export default Chatbot;
