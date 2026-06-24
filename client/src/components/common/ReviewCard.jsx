export const ReviewCard = ({ review }) => {
  return (
    <article className="order-card">
      <div className="badge-row">
        <span className="badge badge--good">{review.rating}/5</span>
        {review.food?.name ? <span className="badge">{review.food.name}</span> : null}
      </div>
      <p className="muted">{review.comment}</p>
      <strong>{review.user?.name ?? 'Customer'}</strong>
    </article>
  );
};