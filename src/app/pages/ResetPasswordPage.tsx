import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ROUTES } from '../../core/constants';
import { PasswordInput } from '../../shared/components/PasswordInput';
import { useResetPassword } from '../hooks/useAuth';

interface ResetPasswordLocationState {
  email: string;
  otp: string;
}

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResetPasswordLocationState | null;
  const email = state?.email ?? '';
  const otp = state?.otp ?? '';
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const { resetPassword, loading, error, fieldErrors } = useResetPassword(email, otp);

  useEffect(() => {
    if (!email || !otp) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
    }
  }, [email, navigate, otp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword({
      password,
      password_confirmation: passwordConfirmation,
    });
  };

  if (!email || !otp) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Set a new password for {email}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <PasswordInput
                id="reset-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'reset-password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="reset-password-error" className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="reset-password-confirmation" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <PasswordInput
                id="reset-password-confirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="********"
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                aria-invalid={Boolean(fieldErrors.password_confirmation)}
                aria-describedby={fieldErrors.password_confirmation ? 'reset-password-confirmation-error' : undefined}
              />
              {fieldErrors.password_confirmation && (
                <p id="reset-password-confirmation-error" className="mt-1 text-sm text-red-600">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link to={ROUTES.LOGIN} className="text-pink-600 hover:underline font-semibold">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
