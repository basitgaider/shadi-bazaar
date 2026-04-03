import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Mail } from 'lucide-react';
import { ROUTES } from '../../core/constants';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useResendOtp, useVerifyOtp } from '../hooks/useAuth';

export interface VerifyOtpLocationState {
  email: string;
  mode?: 'register' | 'reset';
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 1)}***${local.slice(-1)}@${domain}`;
}

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as VerifyOtpLocationState | null;
  const email = state?.email ?? '';
  const mode = state?.mode ?? 'register';

  const [otp, setOtp] = useState('');
  const { verifyOtp, loading, error, fieldErrors } = useVerifyOtp(email);
  const { resendOtp, resendLoading } = useResendOtp();

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.SIGNUP, { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'reset') {
      navigate(ROUTES.RESET_PASSWORD, { replace: true, state: { email, otp } });
      return;
    }

    verifyOtp(otp);
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify your email</h1>
          <p className="text-gray-600">
            {mode === 'reset'
              ? `Enter the 4-digit reset code sent to ${maskEmail(email)}`
              : `Enter the 4-digit code sent to ${maskEmail(email)}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <label htmlFor="verify-otp" className="block text-sm font-medium text-gray-700">
                Verification code
              </label>
              <InputOTP
                id="verify-otp"
                maxLength={4}
                value={otp}
                onChange={setOtp}
                containerClassName="justify-center"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="rounded-lg border border-gray-200 size-12 text-center text-lg" />
                  <InputOTPSlot index={1} className="rounded-lg border border-gray-200 size-12 text-center text-lg" />
                  <InputOTPSlot index={2} className="rounded-lg border border-gray-200 size-12 text-center text-lg" />
                  <InputOTPSlot index={3} className="rounded-lg border border-gray-200 size-12 text-center text-lg" />
                </InputOTPGroup>
              </InputOTP>
              {fieldErrors.otp && <p className="text-sm text-red-600">{fieldErrors.otp}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : mode === 'reset' ? 'Continue' : 'Verify'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                type="button"
                onClick={() => resendOtp(email)}
                disabled={resendLoading}
                className="text-pink-600 hover:underline font-medium disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
            </p>
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
