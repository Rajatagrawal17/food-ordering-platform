import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function NotFoundPage() {
  return (
    <section className="page">
      <div className="page__hero">
        <span className="page__eyebrow">404</span>
        <h1 className="page__title">Page not found</h1>
        <p className="page__subtitle">The route you requested does not exist.</p>
        <Link to={ROUTES.HOME} className="button button--primary">
          Back home
        </Link>
      </div>
    </section>
  );
}