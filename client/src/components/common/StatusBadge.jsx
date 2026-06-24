export const StatusBadge = ({ value }) => {
  const tone = value === 'paid' || value === 'delivered' ? 'good' : value === 'failed' || value === 'cancelled' ? 'danger' : 'warning';

  return <span className={`status-badge status-badge--${tone}`}>{value}</span>;
};