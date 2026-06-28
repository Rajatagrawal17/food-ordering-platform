import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/common/Button';
import { TextField } from '../components/forms/TextField';
import { registerSchema } from '../validations/authValidation';
import { useAuth } from '../hooks/useAuth';

const initialState = { name: '', email: '', password: '', phone: '' };

export default function RegisterPage() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await register(form);
      navigate(ROUTES.HOME, { replace: true });
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 409) {
        setSubmitError('An account with this email already exists.');
      } else if (status === 403) {
        // A 403 here means the CSRF token wasn't valid/present, not that
        // the account already exists — surfacing this distinctly makes
        // this class of bug visible from the UI instead of looking like
        // a generic failure.
        setSubmitError('Something went wrong securing your request. Please refresh the page and try again.');
      } else if (status === 429) {
        setSubmitError('Too many attempts. Please wait a few minutes and try again.');
      } else {
        setSubmitError('Unable to create the account. Please try again.');
      }

      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="form-card">
        <div>
          <span className="page__eyebrow">Start ordering</span>
          <h1 className="section-title">Create your account</h1>
          <p className="section-copy">Join once, then keep your cart, profile, and order history in sync.</p>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          <TextField label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} error={errors.name} />
          <TextField label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} error={errors.email} />
          <TextField label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} error={errors.password} />
          <TextField label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} error={errors.phone} />
          {submitError ? <div className="field__error">{submitError}</div> : null}
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Register'}
            </Button>
            <Link to={ROUTES.LOGIN} className="button button--secondary">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}