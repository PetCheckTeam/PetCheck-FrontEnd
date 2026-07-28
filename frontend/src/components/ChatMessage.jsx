import PetIllustration from './PetIllustration';

function ChatMessage({ message, petType }) {
  const isAssistant = message.role === 'assistant';

  return (
    <article className={`chat-message chat-message--${message.role}`}>
      {isAssistant && (
        <div className="chat-message__avatar">
          <PetIllustration type={petType} />
        </div>
      )}
      <div className="chat-message__content">
        {isAssistant && <span>PetCheck AI</span>}
        <p className={message.isError ? 'chat-message__error' : undefined}>
          {message.content}
        </p>
        {isAssistant && message.sources?.length > 0 && (
          <div className="chat-message__sources">
            <strong>답변 근거</strong>
            <ul>
              {message.sources.map((source, index) => (
                <li key={`${source.ocrIngredient ?? 'source'}-${index}`}>
                  <span>
                    {source.ocrIngredient || '확인된 원료'}
                    {' → '}
                    {source.ingredientName || '표준 성분 확인 필요'}
                  </span>
                  {String(source.matchStatus ?? '').toUpperCase() === 'MATCHED' && (
                    <em>기피 성분 일치</em>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export default ChatMessage;
