export const SelectField = ({ label, error, children, className = '', ...props }) => {
  return (
    <label className={`field ${className}`.trim()}>
      <span className="field__label">{label}</span>
      <select className={`field__control ${error ? 'field__control--error' : ''}`.trim()} {...props}>
        {children}
      </select>
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
};