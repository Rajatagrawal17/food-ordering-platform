import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/common/Button';
import { TextField } from '../components/forms/TextField';
import { loginSchema } from '../validations/authValidation';
import { useAuth } from '../hooks/useAuth';

const initialState = { email: '', password: '' };

export default function LoginPage() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? ROUTES.HOME;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = loginSchema.safeParse(form);

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
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 401) {
        setSubmitError('Invalid email or password.');
      } else if (status === 403) {
        // A 403 here means the CSRF token wasn't valid/present, not that
        // the credentials were wrong — telling the user "invalid email
        // or password" in this case is actively misleading and makes
        // this exact class of bug far harder to diagnose from the UI.
        setSubmitError('Something went wrong securing your request. Please refresh the page and try again.');
      } else if (status === 429) {
        setSubmitError('Too many attempts. Please wait a few minutes and try again.');
      } else {
        setSubmitError('Unable to sign in right now. Please try again in a moment.');
      }

      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="form-card">
        <div>
          <span className="page__eyebrow">Welcome back</span>
          <h1 className="section-title">Sign in</h1>
          <p className="section-copy">Access your cart, orders, and profile using your secure account.</p>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            error={errors.email}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            error={errors.password}
          />
          {submitError ? <div className="field__error">{submitError}</div> : null}
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>
            <Link to={ROUTES.REGISTER} className="button button--secondary">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}