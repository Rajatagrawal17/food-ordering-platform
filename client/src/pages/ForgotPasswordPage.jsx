import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/common/Button';
import { TextField } from '../components/forms/TextField';
import { authApi } from '../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await authApi.forgotPassword(email);
      if (res.data?.isMockMode) {
        setMessage(
          <>
            <span>Password reset link generated (Mock Mode): </span>
            <a href={res.data.resetUrl} style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>
              Click here to reset
            </a>
          </>
        );
      } else {
        setMessage(res.message || 'Password reset link sent to your email.');
      }
    } catch (err) {
      setError('Failed to send reset link. Please check your email or try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="form-card">
        <div>
          <span className="page__eyebrow">Account Recovery</span>
          <h1 className="section-title">Forgot Password</h1>
          <p className="section-copy">Enter your email address to receive a password reset link.</p>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error}
          />
          {message && <div style={{ color: 'green', fontSize: '0.875rem' }}>{message}</div>}
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
