import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/common/Button';
import { TextField } from '../components/forms/TextField';
import { authApi } from '../api/authApi';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await authApi.resetPassword(token, password);
      // Wait a moment then redirect to login
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. The token may be invalid or expired.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="form-card">
        <div>
          <span className="page__eyebrow">Account Recovery</span>
          <h1 className="section-title">Reset Password</h1>
          <p className="section-copy">Please enter your new password.</p>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={error}
          />
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
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
