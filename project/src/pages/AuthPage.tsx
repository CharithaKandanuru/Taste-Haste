import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

type Tab = 'login' | 'register' | 'forgot';

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [forgotEmail, setForgotEmail] = useState('');

  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) {
      setError(error.message.includes('Invalid') ? 'Invalid email or password' : error.message);
    } else {
      onNavigate('home');
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) {
      setError('Invalid credentials. Register first, then use "Sign in as Admin".');
    } else {
      onNavigate('admin');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(registerForm.email, registerForm.password, registerForm.name);
    if (error) {
      setError(error.message.includes('already') ? 'Email already registered' : error.message);
    } else {
      setSuccess('Account created! You are now logged in.');
      setTimeout(() => onNavigate('home'), 1500);
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSuccess('Password reset link sent to your email!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🍛</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold font-display text-neutral-900 dark:text-white leading-tight">Taste &amp; Haste</h1>
              <p className="text-xs text-primary-500 font-medium">Authentic Regional Flavors</p>
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : tab === 'register' ? 'Create an account to get started.' : 'Reset your password'}
          </p>
        </div>

        <div className="card p-6 animate-slide-up">
          {/* Tabs */}
          {tab !== 'forgot' && (
            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 mb-6">
              <button
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'login' ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}
                onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'register' ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm' : 'text-neutral-500 dark:text-neutral-400'}`}
                onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 text-success-600 dark:text-success-400 rounded-xl text-sm">
              {success}
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email" required value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} required value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field pl-10 pr-10"
                    placeholder="Your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => { setTab('forgot'); setError(''); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </button>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200 dark:border-neutral-700" /></div>
                <div className="relative flex justify-center text-xs text-neutral-500 dark:text-neutral-400"><span className="px-2 bg-white dark:bg-neutral-900">or</span></div>
              </div>
              <button type="button" onClick={handleAdminLogin} className="btn-secondary w-full text-sm">
                Sign in as Admin
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text" required value={registerForm.name}
                    onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email" required value={registerForm.email}
                    onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} required value={registerForm.password}
                    onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field pl-10 pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} required value={registerForm.confirmPassword}
                    onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="input-field pl-10"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {tab === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <button type="button" onClick={() => { setTab('login'); setError(''); setSuccess(''); }} className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-2 flex items-center gap-1">
                ← Back to login
              </button>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Enter your email address and we'll send you a reset link.</p>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email" required value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
