import { useEffect, useRef, useState } from 'react';
import { analysesApi, petsApi } from '../api/petcheckApi';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import PetIllustration from '../components/PetIllustration';
import SuggestedQuestion from '../components/SuggestedQuestion';

const suggestedQuestions = {
  analysis: [
    '이 사료를 먹여도 괜찮아?',
    '기피 성분과 일치한 원료를 설명해 줘',
    '왜 이 원료가 해당 성분으로 분류되었어?',
  ],
  pet: [
    '우리 아이가 피해야 하는 성분을 알려줘',
    '간식을 고를 때 무엇을 확인해야 해?',
    '알레르기 성분을 먹었을 때 어떻게 해야 해?',
  ],
};

const getInitialMessage = (petName, chatMode, canChat) => ({
  id: `greeting-${Date.now()}`,
  role: 'assistant',
  content: canChat
    ? chatMode === 'analysis'
      ? `안녕하세요! ${petName}의 현재 사료 분석 결과를 기준으로 궁금한 점을 물어보세요.`
      : `안녕하세요! ${petName}의 프로필과 등록된 회피 성분을 기준으로 궁금한 점을 물어보세요.`
    : '상담할 반려동물 정보를 찾을 수 없습니다.',
  excludeFromHistory: true,
});

const getChatErrorMessage = (error) => {
  if (error?.status === 401) {
    return '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.';
  }
  if (error?.status === 403) {
    return '이 반려동물의 상담 권한이 없습니다.';
  }
  if (error?.status === 404) {
    return '반려동물 정보를 찾을 수 없습니다.';
  }
  if (error?.status === 502) {
    return 'AI 상담 서버 연결에 실패했습니다.';
  }
  if (error?.status === 504) {
    return 'AI 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (error?.status === 0) {
    return '서버에 연결할 수 없습니다.';
  }

  return error?.message || '챗봇 답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
};

function Chatbot({
  petProfile,
  analysisResult,
  onClose,
}) {
  const petName = petProfile.petName || '우리 아이';
  const petId = petProfile.id ?? petProfile.petId ?? null;
  const analysisId = analysisResult?.analysisId ?? analysisResult?.id ?? null;
  const chatMode = analysisId ? 'analysis' : 'pet';
  const chatTargetId = analysisId ?? petId;
  const canChat = Boolean(chatTargetId);
  const [messages, setMessages] = useState(() => [
    getInitialMessage(petName, chatMode, canChat),
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
    setMessages([getInitialMessage(petName, chatMode, canChat)]);
  }, [canChat, chatMode, chatTargetId, petName]);

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
    setMessages([getInitialMessage(petName, chatMode, canChat)]);
  };

  const sendQuestion = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || !chatTargetId || isRespondingRef.current) return;

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
      const response = chatMode === 'analysis'
        ? await analysesApi.chat(analysisId, trimmedQuestion, history)
        : await petsApi.chat(petId, trimmedQuestion, history);
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
          content: getChatErrorMessage(error),
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
        <button type="button" onClick={onClose} aria-label="AI 상담 닫기">
          ←
        </button>
        <div>
          <strong>PetCheck AI</strong>
          <span>
            <i aria-hidden="true" />
            {chatMode === 'analysis' ? '분석 결과 연결됨' : `${petName} 일반 상담`}
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
            <strong>
              {chatMode === 'analysis'
                ? `${petName}의 분석 결과 적용 중`
                : `${petName}의 프로필 적용 중`}
            </strong>
            <small>
              {petProfile.petType === 'cat' ? '고양이' : '강아지'}
              {' · 기피 성분: '}
              {petProfile.allergies?.length
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
            {suggestedQuestions[chatMode].map((question) => (
              <SuggestedQuestion
                key={question}
                disabled={isResponding || !canChat}
                onClick={() => sendQuestion(question)}
              >
                {question}
              </SuggestedQuestion>
            ))}
          </div>
        </div>
        {!canChat && (
          <p className="chatbot-analysis-required" role="status">
            상담할 반려동물을 먼저 선택해 주세요.
          </p>
        )}
        <ChatInput onSend={sendQuestion} disabled={isResponding || !canChat} />
        <p>AI 답변은 참고 정보이며, 건강 이상이 있다면 수의사와 상담해 주세요.</p>
      </footer>
    </main>
  );
}

export default Chatbot;
