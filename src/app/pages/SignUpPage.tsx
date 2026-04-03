import { Link } from 'react-router';
import { useState } from 'react';
import { ROUTES } from '../../core/constants';
import { PasswordInput } from '../../shared/components/PasswordInput';
import { useRegister } from '../hooks/useAuth';

export function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const { register, loading, error, fieldErrors } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join ShadiBazar</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                id="signup-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
              />
              {fieldErrors.name && (
                <p id="signup-name-error" className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="signup-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="signup-email-error" className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <PasswordInput
                id="signup-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="********"
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="signup-password-error" className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <PasswordInput
                id="signup-confirm-password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                placeholder="********"
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                aria-invalid={Boolean(fieldErrors.password_confirmation)}
                aria-describedby={fieldErrors.password_confirmation ? 'signup-confirm-password-error' : undefined}
              />
              {fieldErrors.password_confirmation && (
                <p id="signup-confirm-password-error" className="mt-1 text-sm text-red-600">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 rounded text-pink-600" required aria-describedby="signup-terms" />
              <span id="signup-terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/#terms" className="text-pink-600 hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/#privacy-policy" className="text-pink-600 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-pink-600 hover:underline font-semibold">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to={ROUTES.HOME} className="text-gray-600 hover:text-pink-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
