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
        <p>{message.content}</p>
      </div>
    </article>
  );
}

export default ChatMessage;
