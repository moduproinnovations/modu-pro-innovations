import React, { useState, useId } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import SeoHead from '../../components/SeoHead';

export default function AdminLogin() {
  const { admin, checkingAuth, login } = useAuth();
  const { siteSettings } = useSite();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const idPrefix = useId();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (!checkingAuth && admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const onSubmit = async ({ email, password }) => {
    setAuthError('');
    try {
      await login(email, password);
      addToast({
        type: 'success',
        title: 'Administrator Authenticated',
        message: 'Welcome to the Modu Pro Innovation Management Console.',
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Authentication failed. Please check your administrator credentials.';
      setAuthError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1428] text-[#F4EEDF] flex flex-col justify-between p-4 sm:p-8 industrial-blueprint-grid">
      <SeoHead title="Administrator Sign In" />

      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono-code uppercase tracking-widest text-[#D9C08B] hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="w-4 h-4" />
          <span>Return to Public Website</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-[#16294D] border border-[#D9C08B]/40 p-8 sm:p-10 shadow-2xl">
        <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-[#3F5E8C]/40">
          <div className="bg-[#F4EEDF] px-2.5 py-1.5 border border-[#D9C08B]/50">
            <img
              src={siteSettings?.logoUrl || '/assets/logo/modu-pro-logo.png'}
              alt="Modu Pro Innovation"
              className="h-9 w-auto object-contain"
            />
          </div>
          <div>
            <p className="font-mono-code text-[11px] uppercase tracking-[0.2em] text-[#D9C08B]">
              Restricted Access
            </p>
            <h1 className="font-display text-2xl font-semibold text-[#F4EEDF]">
              Administrator Sign In
            </h1>
          </div>
        </div>

        {authError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 p-3.5 bg-[#0A1428] border border-[#D9C08B] flex items-start gap-2.5 text-xs text-[#F4EEDF]"
          >
            <AlertCircle aria-hidden="true" className="w-4 h-4 text-[#D9C08B] shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} method="POST" noValidate className="space-y-5">
          <div>
            <label
              htmlFor={`${idPrefix}-email`}
              className="block text-xs font-medium uppercase tracking-wider text-[#F4EEDF] mb-1.5"
            >
              Administrator Email
            </label>
            <input
              id={`${idPrefix}-email`}
              type="email"
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full px-4 py-3 bg-[#0A1428] border border-[#3F5E8C]/60 text-[#F4EEDF] focus:border-[#D9C08B]"
              placeholder="admin@modupro.in"
              {...register('email', {
                required: 'Administrator email is required.',
              })}
            />
            {errors.email && (
              <p role="alert" className="mt-1.5 text-xs text-[#D9C08B]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={`${idPrefix}-password`}
                className="text-xs font-medium uppercase tracking-wider text-[#F4EEDF]"
              >
                Password
              </label>
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-[#D9C08B] hover:underline"
              >
                {showPassword ? (
                  <>
                    <EyeOff aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye aria-hidden="true" className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <input
              id={`${idPrefix}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-[#0A1428] border border-[#3F5E8C]/60 text-[#F4EEDF] focus:border-[#D9C08B]"
              placeholder="Enter administrator password"
              {...register('password', {
                required: 'Password is required.',
              })}
            />
            {errors.password && (
              <p role="alert" className="mt-1.5 text-xs text-[#D9C08B]">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#D9C08B] text-[#0A1428] text-xs font-semibold uppercase tracking-[0.18em] border border-[#D9C08B] hover:bg-transparent hover:text-[#D9C08B] transition-colors cursor-pointer"
          >
            <ShieldCheck aria-hidden="true" className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing In...' : 'Sign In to Console'}</span>
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-[#F4EEDF]/55 font-mono-code">
        MODU PRO INNOVATION PVT. LTD. • PROTECTED SESSION
      </div>
    </div>
  );
}
