export const Spinner = ({ label = 'Loading' }) => {
  return (
    <div className="spinner" role="status" aria-live="polite" aria-label={label}>
      <span className="spinner__ring" />
      <span>{label}</span>
    </div>
  );
};