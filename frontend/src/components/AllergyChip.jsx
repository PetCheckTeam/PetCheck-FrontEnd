function AllergyChip({ label, selected, onToggle }) {
  return (
    <button
      className={`allergy-chip ${selected ? 'allergy-chip--selected' : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span aria-hidden="true">{selected ? '✓' : '+'}</span>
      {label}
    </button>
  );
}

export default AllergyChip;
