/**
 * Website auth hooks.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ZodError } from 'zod';
import * as authApi from '../../core/api/services/auth';
import { ROUTES } from '../../core/constants';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type VerifyOtpInput,
} from '../../core/validators/auth.validators';

export function zodErrorsToFieldMap(error: ZodError): Record<string, string> {
  const map: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!map[path]) map[path] = issue.message;
  }

  return map;
}

export interface UseAuthState {
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

export function useLogin() {
  const navigate = useNavigate();
  const [state, setState] = useState<UseAuthState>({
    loading: false,
    error: null,
    fieldErrors: {},
  });

  const login = useCallback(
    async (raw: { email: string; password: string }) => {
      setState({ loading: true, error: null, fieldErrors: {} });
      const parsed = loginSchema.safeParse(raw);

      if (!parsed.success) {
        setState({
          loading: false,
          error: null,
          fieldErrors: zodErrorsToFieldMap(parsed.error),
        });
        return;
      }

      const payload: LoginInput = parsed.data;

      try {
        const res = await authApi.login(payload);

        if (res.status === 1) {
          setState({ loading: false, error: null, fieldErrors: {} });
          toast.success('Welcome back! You are logged in.');
          navigate(ROUTES.MY_PROFILE, { replace: true });
          return;
        }

        if ((res as { status: number }).status === 2) {
          setState({ loading: false, error: null, fieldErrors: {} });
          toast.info('Verify your email before logging in.');
          navigate(ROUTES.VERIFY_OTP, { replace: true, state: { email: payload.email, mode: 'register' } });
          return;
        }

        setState({
          loading: false,
          error: res.message ?? 'Login failed',
          fieldErrors: {},
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Network error';
        setState({ loading: false, error: message, fieldErrors: {} });
      }
    },
    [navigate]
  );

  return { login, ...state };
}

export function useRegister() {
  const navigate = useNavigate();
  const [state, setState] = useState<UseAuthState>({
    loading: false,
    error: null,
    fieldErrors: {},
  });

  const register = useCallback(
    async (raw: { name: string; email: string; password: string; password_confirmation: string }) => {
      setState({ loading: true, error: null, fieldErrors: {} });
      const parsed = registerSchema.safeParse(raw);

      if (!parsed.success) {
        setState({
          loading: false,
          error: null,
          fieldErrors: zodErrorsToFieldMap(parsed.error),
        });
        return;
      }

      const payload: RegisterInput = parsed.data;

      try {
        const res = await authApi.register(payload);

        if (res.status === 1) {
          setState({ loading: false, error: null, fieldErrors: {} });
          toast.success('Check your email for the verification code.');
          navigate(ROUTES.VERIFY_OTP, { replace: true, state: { email: payload.email, mode: 'register' } });
          return;
        }

        setState({
          loading: false,
          error: res.message ?? 'Registration failed',
          fieldErrors: {},
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Network error';
        setState({ loading: false, error: message, fieldErrors: {} });
      }
    },
    [navigate]
  );

  return { register, ...state };
}

export interface UseForgotPasswordState extends UseAuthState {
  success: boolean;
}

export function useForgotPassword() {
  const navigate = useNavigate();
  const [state, setState] = useState<UseForgotPasswordState>({
    loading: false,
    error: null,
    fieldErrors: {},
    success: false,
  });

  const forgotPassword = useCallback(
    async (raw: { email: string }) => {
      setState({ loading: true, error: null, fieldErrors: {}, success: false });
      const parsed = forgotPasswordSchema.safeParse(raw);

      if (!parsed.success) {
        setState({
          loading: false,
          error: null,
          fieldErrors: zodErrorsToFieldMap(parsed.error),
          success: false,
        });
        return;
      }

      const payload: ForgotPasswordInput = parsed.data;

      try {
        const res = await authApi.forgotPassword(payload);

        if (res.status === 1) {
          setState({ loading: false, error: null, fieldErrors: {}, success: true });
          toast.success('Reset code sent! Check your email.');
          navigate(ROUTES.VERIFY_OTP, { replace: true, state: { email: payload.email, mode: 'reset' } });
          return;
        }

        setState({
          loading: false,
          error: res.message ?? 'Request failed',
          fieldErrors: {},
          success: false,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Network error';
        setState({ loading: false, error: message, fieldErrors: {}, success: false });
      }
    },
    [navigate]
  );

  return { forgotPassword, ...state };
}

export function useVerifyOtp(email: string) {
  const navigate = useNavigate();
  const [state, setState] = useState<UseAuthState>({
    loading: false,
    error: null,
    fieldErrors: {},
  });

  const verifyOtp = useCallback(
    async (otp: string) => {
      setState({ loading: true, error: null, fieldErrors: {} });
      const parsed = verifyOtpSchema.safeParse({ email, otp });

      if (!parsed.success) {
        setState({
          loading: false,
          error: null,
          fieldErrors: zodErrorsToFieldMap(parsed.error),
        });
        return;
      }

      const payload: VerifyOtpInput = parsed.data;

      try {
        const res = await authApi.verifyOtp(payload);

        if (res.status === 1) {
          setState({ loading: false, error: null, fieldErrors: {} });
          toast.success('Email verified! You can log in now.');
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }

        setState({
          loading: false,
          error: res.message ?? 'Verification failed',
          fieldErrors: {},
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Network error';
        setState({ loading: false, error: message, fieldErrors: {} });
      }
    },
    [email, navigate]
  );

  return { verifyOtp, ...state };
}

export function useResendOtp() {
  const [resendLoading, setResendLoading] = useState(false);

  const resendOtp = useCallback(async (email: string) => {
    setResendLoading(true);

    try {
      const res = await authApi.resendOtp({ email });
      if (res.status === 1) toast.success('New code sent to your email.');
      else toast.error(res.message ?? 'Failed to resend code.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  }, []);

  return { resendOtp, resendLoading };
}

export function useResetPassword(email: string, otp: string) {
  const navigate = useNavigate();
  const [state, setState] = useState<UseAuthState>({
    loading: false,
    error: null,
    fieldErrors: {},
  });

  const resetPassword = useCallback(
    async (raw: { password: string; password_confirmation: string }) => {
      setState({ loading: true, error: null, fieldErrors: {} });
      const parsed = resetPasswordSchema.safeParse({ email, otp, ...raw });

      if (!parsed.success) {
        setState({
          loading: false,
          error: null,
          fieldErrors: zodErrorsToFieldMap(parsed.error),
        });
        return;
      }

      const payload: ResetPasswordInput = parsed.data;

      try {
        const res = await authApi.resetPassword(payload);

        if (res.status === 1) {
          setState({ loading: false, error: null, fieldErrors: {} });
          toast.success('Password reset successfully. You can log in now.');
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }

        setState({
          loading: false,
          error: res.message ?? 'Password reset failed',
          fieldErrors: {},
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Network error';
        setState({ loading: false, error: message, fieldErrors: {} });
      }
    },
    [email, navigate, otp]
  );

  return { resetPassword, ...state };
}
