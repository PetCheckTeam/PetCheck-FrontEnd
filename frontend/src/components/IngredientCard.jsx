const statusLabels = {
  safe: '안전',
  warning: '주의',
  danger: '위험',
};

function IngredientCard({ ingredient, isOpen, onToggle }) {
  return (
    <article className={`ingredient-card ingredient-card--${ingredient.status}`}>
      <button
        className="ingredient-card__summary"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="ingredient-card__status">
          {statusLabels[ingredient.status]}
        </span>
        <span className="ingredient-card__name">
          <strong>{ingredient.name}</strong>
          <small>{ingredient.shortDescription}</small>
        </span>
        <span className="ingredient-card__toggle" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className="ingredient-card__detail">
          <p>{ingredient.description}</p>
          {ingredient.reason && (
            <div>
              <strong>판단 이유</strong>
              <span>{ingredient.reason}</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default IngredientCard;
