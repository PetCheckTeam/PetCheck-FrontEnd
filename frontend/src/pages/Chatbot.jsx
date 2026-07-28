import { useEffect, useRef, useState } from 'react';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import PetIllustration from '../components/PetIllustration';
import SuggestedQuestion from '../components/SuggestedQuestion';

const suggestedQuestions = [
  '지금 분석한 사료를 먹여도 괜찮아?',
  '등록한 알러지 성분을 알려줘',
  '사료 성분표에서 뭘 먼저 봐야 해?',
];

function createSampleAnswer(question, petProfile) {
  const petName = petProfile.petName || '우리 아이';
  const allergies = petProfile.allergies || [];
  const allergyText = allergies.length > 0 ? allergies.join(', ') : '없음';

  if (question.includes('알러지') || question.includes('알레르기') || question.includes('기피')) {
    return `${petName}에게 등록된 알러지 성분은 ${allergyText}이에요. 성분표에서 같은 이름뿐 아니라 분말, 추출물, 부산물처럼 다른 형태로 표시될 수 있으니 함께 확인해 주세요.`;
  }

  if (question.includes('먹여') || question.includes('괜찮')) {
    return `현재 분석 결과에서는 ${petName}에게 주의가 필요한 성분이 발견됐어요. 등록한 알러지 성분과 일치하는 원료가 있다면 급여하지 말고, 정확한 판단이 필요할 때는 수의사와 상담해 주세요.`;
  }

  if (question.includes('성분표') || question.includes('먼저')) {
    return `성분표는 앞쪽에 표시된 주원료부터 확인하는 것이 좋아요. 그다음 ${petName}의 알러지 성분인 ${allergyText}이 포함됐는지 살펴보고, 출처가 불분명한 동물성 원료도 확인해 보세요.`;
  }

  return `${petName}의 프로필과 현재 분석 결과를 기준으로 살펴볼게요. 지금은 프론트엔드 샘플 답변 단계이며, 실제 RAG 연결 후에는 제품 성분표와 근거 문서를 검색해 더 정확한 답변을 제공할 예정이에요.`;
}

function Chatbot({
  petProfile,
  petProfiles,
  selectedPetId,
  onSelectPet,
  onBackToResults,
}) {
  const petName = petProfile.petName || '우리 아이';
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `안녕하세요! ${petName}의 사료와 성분에 대해 궁금한 점을 물어보세요. 등록한 프로필을 참고해 쉽게 설명해 드릴게요.`,
    },
  ]);
  const [isResponding, setIsResponding] = useState(false);
  const messageEndRef = useRef(null);
  const responseTimerRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isResponding]);

  useEffect(() => {
    return () => window.clearTimeout(responseTimerRef.current);
  }, []);

  const changePet = (petId) => {
    const nextPet = petProfiles.find((pet) => pet.id === petId);
    if (!nextPet || nextPet.id === selectedPetId) return;

    window.clearTimeout(responseTimerRef.current);
    setIsResponding(false);
    onSelectPet(nextPet.id);
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: `${nextPet.petName}의 프로필로 변경했어요. 사료와 성분에 대해 궁금한 점을 물어보세요.`,
      },
    ]);
  };

  const sendQuestion = (question) => {
    if (isResponding) return;

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: 'user',
        content: question,
      },
    ]);
    setIsResponding(true);

    // 실제 RAG 연결 후에는 이 타이머를 챗봇 API 요청으로 교체합니다.
    responseTimerRef.current = window.setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: createSampleAnswer(question, petProfile),
        },
      ]);
      setIsResponding(false);
    }, 1200);
  };

  return (
    <main className="chatbot-page">
      <header className="chatbot-header">
        <button type="button" onClick={onBackToResults} aria-label="분석 결과로 돌아가기">
          ←
        </button>
        <div>
          <strong>PetCheck AI</strong>
          <span><i aria-hidden="true" /> 답변 가능</span>
        </div>
        <button
          type="button"
          onClick={() =>
            setMessages([
              {
                id: Date.now(),
                role: 'assistant',
                content: `새 대화를 시작할게요. ${petName}에 대해 무엇이 궁금한가요?`,
              },
            ])
          }
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
            <strong>{petName}의 프로필 적용 중</strong>
            <small>
              기피 성분: {petProfile.allergies?.length
                ? petProfile.allergies.join(', ')
                : '등록된 성분 없음'}
            </small>
          </div>
        </div>
        <label className="chatbot-profile__selector">
          <span>반려동물 선택</span>
          <select
            value={selectedPetId ?? ''}
            onChange={(event) => changePet(event.target.value)}
          >
            {petProfiles.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.petType === 'cat' ? '🐱' : '🐶'} {pet.petName}
              </option>
            ))}
          </select>
        </label>
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
                disabled={isResponding}
                onClick={() => sendQuestion(question)}
              >
                {question}
              </SuggestedQuestion>
            ))}
          </div>
        </div>
        <ChatInput onSend={sendQuestion} disabled={isResponding} />
        <p>AI 답변은 참고 정보이며, 건강 이상이 있다면 수의사와 상담해 주세요.</p>
      </footer>
    </main>
  );
}

export default Chatbot;
