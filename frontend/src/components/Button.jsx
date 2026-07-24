function Button({
  children,
  fullWidth = false,
  className = '',
  ...buttonProps
}) {
  const classes = ['button', fullWidth ? 'button--full' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

export default Button;
