function FeatureCard({
  icon,
  title,
  description,
  visual,
  reveal = false,
  revealOrder = 0,
}) {
  return (
    <article
      className={`feature-card${reveal ? ' feature-card--reveal' : ''}`}
      style={reveal ? { '--reveal-order': revealOrder } : undefined}
    >
      <div className="feature-card__visual">
        {visual}
        <span className="feature-card__icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export default FeatureCard;
