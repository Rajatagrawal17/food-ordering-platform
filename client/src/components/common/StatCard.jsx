export const StatCard = ({ label, value, tone = 'neutral' }) => {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};