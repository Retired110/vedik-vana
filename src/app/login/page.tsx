'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  User,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  getFirebaseAuth,
  isFirebaseConfigured,
  GoogleAuthProvider,
  signInWithPopup,
} from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  // Active Tab: 'SIGN_IN' | 'REGISTER'
  const [activeTab, setActiveTab] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');

  // Sign In Mode: 'OTP' | 'PASSWORD'
  const [signInMode, setSignInMode] = useState<'OTP' | 'PASSWORD'>('OTP');

  // Form states - Sign In (Email Compulsory)
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form states - Register (Email Compulsory)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);

  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [noAccountPrompt, setNoAccountPrompt] = useState(false);
  const [firebaseGoogleSetupNeeded, setFirebaseGoogleSetupNeeded] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Segmented 6-Box OTP input
  const handleOtpBoxChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpCode];
    newOtp[idx] = val.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-box-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
      const prevInput = document.getElementById(`otp-box-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpCode(newOtp);
    const targetIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-box-${targetIdx}`)?.focus();
  };

  // Google 1-Click Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setErrorMsg('Google Sign-In is temporarily unavailable. Please sign in with Email.');
        setIsLoading(false);
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        setErrorMsg('Unable to retrieve email from your Google account.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          photoUrl: user.photoURL,
          googleUid: user.uid,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Signed in with Google successfully!');
        setTimeout(() => {
          router.push(redirectTarget);
          router.refresh();
        }, 500);
      } else {
        setErrorMsg(data.message || 'Failed to authenticate session with Google.');
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in was closed before completing.');
      } else if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        setFirebaseGoogleSetupNeeded(true);
        setErrorMsg('Google Provider must be enabled in Firebase Console (1-click setup).');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Send Login Email OTP (Requires existing account!)
  const handleSendLoginOtp = async () => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Email address is compulsory. Please enter a valid email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setNoAccountPrompt(false);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanEmail, type: 'LOGIN' }),
      });

      const data = await res.json();

      if (data.noAccount) {
        setNoAccountPrompt(true);
        setErrorMsg('No account found with this email address. Please create an account.');
      } else if (data.success) {
        setOtpSent(true);
        setResendCooldown(30);
        setSuccessMsg(data.message || `Verification code sent to ${cleanEmail}! Please check your email inbox.`);
      } else {
        setErrorMsg(data.message || 'Failed to dispatch verification code.');
        if (data.cooldownRemaining) setResendCooldown(data.cooldownRemaining);
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(err.message || 'Failed to request verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify Login OTP
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpCode.join('');
    if (enteredCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanEmail,
          code: enteredCode,
          type: 'LOGIN',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Verification successful! Logging in...');
        setTimeout(() => {
          router.push(redirectTarget);
          router.refresh();
        }, 500);
      } else {
        setErrorMsg(data.message || 'Invalid verification code.');
      }
    } catch {
      setErrorMsg('Verification failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Password Login (Customer only, Email Compulsory)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both your registered email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanEmail, password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Signed in successfully!');
        setTimeout(() => {
          router.push(redirectTarget);
          router.refresh();
        }, 500);
      } else {
        setErrorMsg(data.message || 'Incorrect email or password.');
      }
    } catch {
      setErrorMsg('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Send Registration OTP (Email Compulsory!)
  const handleSendRegOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || regName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Email is compulsory for account verification and order receipts.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Please create a password of at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanEmail, type: 'REGISTRATION' }),
      });

      const data = await res.json();
      if (data.alreadyRegistered) {
        setErrorMsg('An account is already registered with this email. Please Sign In.');
        setEmailInput(cleanEmail);
        setActiveTab('SIGN_IN');
      } else if (data.success) {
        setRegOtpSent(true);
        setResendCooldown(30);
        setSuccessMsg(`Verification code sent to ${cleanEmail}! Please enter the 6 digits to complete registration.`);
      } else {
        setErrorMsg(data.message || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      console.error('Registration OTP error:', err);
      setErrorMsg(err.message || 'Error requesting registration OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Complete Registration with OTP
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpCode.join('');
    if (enteredCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const cleanEmail = regEmail.trim().toLowerCase();
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanEmail,
          code: enteredCode,
          type: 'REGISTRATION',
          name: regName.trim(),
          email: cleanEmail,
          phone: regPhone.trim() || undefined,
          password: regPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Account created successfully!');
        setTimeout(() => {
          router.push(redirectTarget);
          router.refresh();
        }, 500);
      } else {
        setErrorMsg(data.message || 'Registration verification failed.');
      }
    } catch {
      setErrorMsg('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to register when account is not found
  const handleSwitchToRegister = () => {
    setRegEmail(emailInput);
    setActiveTab('REGISTER');
    setNoAccountPrompt(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Forgot password handlers
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = forgotEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_OTP', identifier: clean }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotOtpSent(true);
        setSuccessMsg(`Password reset code sent to ${clean}. Please check your inbox.`);
      } else {
        setErrorMsg(data.message || 'Failed to dispatch password reset code.');
      }
    } catch {
      setErrorMsg('Failed to process request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode || forgotCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          identifier: forgotEmail.trim().toLowerCase(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForgotModal(false);
        setSuccessMsg('Password updated successfully! Please sign in with your new password.');
        setSignInMode('PASSWORD');
      } else {
        setErrorMsg(data.message || 'Failed to reset password.');
      }
    } catch {
      setErrorMsg('Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-forest-950 py-12 px-4 sm:px-6 lg:px-8 text-white relative flex flex-col justify-center">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-brand-forest-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-forest border border-brand-gold/40 flex items-center justify-center text-brand-gold shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-cinzel text-xl font-bold">V</span>
            </div>
          </Link>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wider text-white">
            VEDIK VANA
          </h1>
          <p className="text-xs text-stone-400 tracking-wider">
            Sacred Botanical Living & Customer Sanctuary
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-brand-forest-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-brand-forest-800/80 shadow-2xl space-y-5">
          {/* 1. Google 1-Click Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-white text-stone-900 hover:bg-stone-100 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-forest-800"></div>
            </div>
            <span className="relative px-3 bg-brand-forest-900 text-[11px] text-stone-400 uppercase tracking-wider">
              or continue with email
            </span>
          </div>

          {/* Primary Tabs: Sign In / Create Account */}
          <div className="bg-brand-forest-950/70 p-1 rounded-2xl border border-brand-forest-800 flex gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('SIGN_IN');
                setErrorMsg(null);
                setSuccessMsg(null);
                setNoAccountPrompt(false);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'SIGN_IN'
                  ? 'bg-brand-forest text-brand-gold shadow-sm border border-brand-gold/30'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setErrorMsg(null);
                setSuccessMsg(null);
                setNoAccountPrompt(false);
              }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'REGISTER'
                  ? 'bg-brand-forest text-brand-gold shadow-sm border border-brand-gold/30'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Feedback Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {noAccountPrompt && (
                  <div className="mt-2 pt-2 border-t border-rose-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-stone-300">New to Vedik Vana?</span>
                    <button
                      type="button"
                      onClick={handleSwitchToRegister}
                      className="px-2.5 py-1 rounded-lg bg-brand-gold text-brand-forest-950 text-xs font-bold hover:bg-brand-gold-light transition-colors"
                    >
                      Create Account Now →
                    </button>
                  </div>
                )}
                {firebaseGoogleSetupNeeded && (
                  <div className="mt-3 pt-3 border-t border-rose-800/60 space-y-2">
                    <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                      Google Sign-In requires a 1-time 30-second toggle in Firebase:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] text-stone-300">
                      <li>Click the button below to open Firebase Console.</li>
                      <li>Click <strong>Google</strong> under <em>Sign-in providers</em> and toggle <strong>Enable</strong>.</li>
                      <li>Select your email under <em>Project support email</em> and click <strong>Save</strong>.</li>
                    </ol>
                    <a
                      href="https://console.firebase.google.com/project/vedik-vana-11b3e/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-brand-gold text-brand-forest-950 font-bold text-xs hover:bg-brand-gold-light transition-all"
                    >
                      <span>Open Firebase Console to Enable Google →</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <p className="text-[10px] text-stone-400 text-center">
                      Or sign in immediately below using Email OTP or Password.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'SIGN_IN' && (
            <div className="space-y-4">
              {/* Sign In Mode Switch: OTP vs Password */}
              <div className="flex bg-brand-forest-950/70 p-1 rounded-xl border border-brand-forest-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSignInMode('OTP');
                    setOtpSent(false);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    signInMode === 'OTP'
                      ? 'bg-brand-gold text-brand-forest-950 font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  ✉️ Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInMode('PASSWORD');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    signInMode === 'PASSWORD'
                      ? 'bg-brand-gold text-brand-forest-950 font-semibold shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  🔑 Password
                </button>
              </div>

              {/* Mode A: Email OTP */}
              {signInMode === 'OTP' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Registered Email Address * <span className="text-brand-gold text-[10px] font-normal">(Compulsory)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="yourname@gmail.com"
                          disabled={otpSent}
                          className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold disabled:opacity-60"
                        />
                      </div>
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendLoginOtp}
                          disabled={isLoading}
                          className="px-4 py-3 rounded-xl bg-brand-gold text-brand-forest-950 font-semibold text-xs hover:bg-brand-gold-light transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                          {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode(['', '', '', '', '', '']);
                          }}
                          className="px-3 py-3 rounded-xl bg-brand-forest-800 text-stone-300 text-xs hover:bg-brand-forest-700"
                          title="Change Email"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1.5">
                      We will send a confidential 6-digit verification code to your email inbox.
                    </p>
                  </div>

                  {otpSent && (
                    <form onSubmit={handleVerifyLoginOtp} className="space-y-4 animate-in fade-in">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-stone-300">
                            Enter 6-Digit Code
                          </label>
                          {resendCooldown > 0 ? (
                            <span className="text-[11px] text-stone-400 font-mono">
                              Resend in {resendCooldown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendLoginOtp}
                              disabled={isLoading}
                              className="text-[11px] text-brand-gold hover:underline"
                            >
                              Resend Email OTP
                            </button>
                          )}
                        </div>

                        {/* Segmented 6-Box OTP Input */}
                        <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
                          {otpCode.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`otp-box-${idx}`}
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-full aspect-square text-center font-mono text-lg font-bold rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white focus:outline-none focus:border-brand-gold"
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2">
                          Code expires in 5 minutes. Max 3 verification attempts.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || otpCode.join('').length !== 6}
                        className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                      >
                        <span>{isLoading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Mode B: Password */}
              {signInMode === 'PASSWORD' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Email Address * <span className="text-brand-gold text-[10px] font-normal">(Compulsory)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-stone-300">Password *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotEmail(emailInput);
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-brand-gold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-10 pr-10 py-3 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Authenticating...' : 'Sign In to Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
          {activeTab === 'REGISTER' && (
            <div>
              {!regOtpSent ? (
                <form onSubmit={handleSendRegOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Anandita Sen"
                        className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Email Address * <span className="text-brand-gold text-[10px] font-normal">(Compulsory for login & invoices)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Mobile Number <span className="text-stone-400 text-[10px] font-normal">(Optional, for doorstep delivery verification)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">
                      Password * <span className="text-stone-400 text-[10px] font-normal">(At least 6 characters)</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full text-xs pl-10 pr-10 py-3 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white placeholder:text-stone-500 focus:outline-none focus:border-brand-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Sending Verification...' : 'Verify Email & Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteRegistration} className="space-y-4 animate-in fade-in">
                  <div className="p-3 rounded-xl bg-brand-forest-950/70 border border-brand-forest-800 text-xs text-stone-300">
                    Verifying email address: <strong className="text-brand-gold">{regEmail}</strong>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-stone-300">
                        Enter 6-Digit Email OTP
                      </label>
                      {resendCooldown > 0 ? (
                        <span className="text-[11px] text-stone-400 font-mono">
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleSendRegOtp(e as any)}
                          disabled={isLoading}
                          className="text-[11px] text-brand-gold hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-full aspect-square text-center font-mono text-lg font-bold rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white focus:outline-none focus:border-brand-gold"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.join('').length !== 6}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Privacy & Security reassurance */}
          <div className="pt-3 border-t border-brand-forest-800/80 flex items-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-brand-gold flex-shrink-0" />
            <span>Your information is encrypted and protected by strict Ayurvedic sanctuary confidentiality.</span>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            ← Return to Botanical Storefront
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-brand-forest-900 border border-brand-forest-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-cinzel font-bold text-base text-white">Reset Password</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotOtpSent(false);
                }}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {!forgotOtpSent ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-3">
                <p className="text-xs text-stone-300">
                  Enter your registered email address to receive a password reset code.
                </p>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Registered Email *</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full text-xs p-2.5 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-brand-gold text-brand-forest-950 text-xs font-bold hover:bg-brand-gold-light"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-stone-300">
                  Enter the 6-digit code sent to <strong className="text-brand-gold">{forgotEmail}</strong> and your new password.
                </p>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-xs p-2.5 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white font-mono text-center tracking-widest text-base focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 rounded-xl bg-brand-forest-950 border border-brand-forest-800 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-brand-gold text-brand-forest-950 text-xs font-bold hover:bg-brand-gold-light"
                >
                  {isLoading ? 'Updating...' : 'Update Password & Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
