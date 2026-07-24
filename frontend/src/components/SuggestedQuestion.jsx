function SuggestedQuestion({ children, onClick, disabled }) {
  return (
    <button
      className="suggested-question"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      <span aria-hidden="true">→</span>
    </button>
  );
}

export default SuggestedQuestion;
