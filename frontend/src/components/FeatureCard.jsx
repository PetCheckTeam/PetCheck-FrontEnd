function FeatureCard({ icon, title, description }) {
  return (
    <article className="feature-card">
      <span className="feature-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export default FeatureCard;
