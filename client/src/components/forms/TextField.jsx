export const TextField = ({ label, error, className = '', ...props }) => {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field__label">{label}</span>
      <input className={`field__control ${error ? 'field__control--error' : ''}`.trim()} {...props} />
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
};