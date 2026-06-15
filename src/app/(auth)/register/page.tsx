'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Lock,
  User,
  Briefcase,
  Users,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import MockGoogleModal from '@/components/ui/MockGoogleModal';

// Zod validation schemas for each step
const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const step2Schema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
  orgIndustry: z.string().min(2, 'Industry must be at least 2 characters'),
  orgSize: z.string().min(1, 'Please select your team size'),
});

const registerSchema = step1Schema.merge(step2Schema).extend({
  plan: z.enum(['starter', 'professional', 'agency']),
});

type RegisterInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && url.trim() !== '' && !url.includes('your-project');
  };

  const handleGoogleClick = async () => {
    if (isSupabaseConfigured()) {
      setLoading(true);
      try {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
      } catch (err) {
        setError('Failed to initialize Google registration');
        setLoading(false);
      }
    } else {
      setIsGoogleModalOpen(true);
    }
  };

  const handleGoogleSelect = (account: { email: string; fullName: string }) => {
    setIsGoogleModalOpen(false);
    setValue('fullName', account.fullName);
    setValue('email', account.email);
    setValue('password', 'mock-google-password-123');
    setBotVerified(true);
    setStep(2);
  };

  // Bot check challenge states
  const [botNum1, setBotNum1] = useState(0);
  const [botNum2, setBotNum2] = useState(0);
  const [botAnswer, setBotAnswer] = useState('');
  const [botVerified, setBotVerified] = useState(false);
  const [botError, setBotError] = useState(false);

  // Verification popup modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [sentCode, setSentCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  // Generate dynamic captcha on load/step transition
  useEffect(() => {
    setBotNum1(Math.floor(Math.random() * 8) + 2);
    setBotNum2(Math.floor(Math.random() * 8) + 2);
  }, [step]);

  // Single form instance for all registration data
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      orgName: '',
      orgIndustry: '',
      orgSize: '',
      plan: 'starter',
    },
  });

  const selectedPlan = watch('plan');
  const userEmail = watch('email');

  // Verify the manual arithmetic puzzle
  const handleVerifyBot = () => {
    const sum = botNum1 + botNum2;
    if (parseInt(botAnswer) === sum) {
      setBotVerified(true);
      setBotError(false);
    } else {
      setBotVerified(false);
      setBotError(true);
      alert('Arithmetic challenge failed. Please verify the numbers again.');
    }
  };

  // Navigate forward in the wizard after validating the current step
  const nextStep = async () => {
    let fieldsToValidate: Array<keyof RegisterInputs> = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'email', 'password'];
    } else if (step === 2) {
      fieldsToValidate = ['orgName', 'orgIndustry', 'orgSize'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      // If step 1, enforce bot check puzzle first
      if (step === 1 && !botVerified) {
        setBotError(true);
        return;
      }
      setError(null);
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  // Triggers the 6-Digit Email Verification Flow instead of instant registry posting
  const handleInitiateRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(async (data) => {
      // Generate random mock 6-digit confirmation code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(generatedCode);
      setCodeError(null);
      setShowVerificationModal(true);
      
      // Developer hint / test helper console log
      console.log(`[SECURITY] Registration confirmation code sent to ${data.email}: ${generatedCode}`);
    })(e);
  };

  const handleVerifyCodeSubmit = async () => {
    const enteredCode = verificationCode.join('');
    if (enteredCode !== sentCode) {
      setCodeError('Incorrect 6-digit verification code. Please check your developer console or email logs.');
      return;
    }

    // Code matches, proceed with actual registration posting
    setLoading(true);
    setError(null);
    setShowVerificationModal(false);

    const formData = {
      fullName: watch('fullName'),
      email: watch('email'),
      password: watch('password'),
      orgName: watch('orgName'),
      orgIndustry: watch('orgIndustry'),
      orgSize: watch('orgSize'),
      plan: watch('plan'),
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/overview');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred during account provisioning.');
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newCode = [...verificationCode];
    newCode[index] = val.slice(-1);
    setVerificationCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`code-in-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between p-6 md:p-12">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center gap-3 mb-8">
        <div className="w-4 h-4 bg-accent" />
        <span className="font-display text-xl font-bold tracking-wider text-text-primary">BRANDAVOX AI</span>
      </header>

      {/* Main content container */}
      <main className="max-w-2xl mx-auto w-full bg-surface border border-border-custom rounded-modal p-8 md:p-12 neumorphism-card-dark my-auto relative overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center mb-12 border-b border-border-custom pb-6">
          <div>
            <span className="font-mono text-xs text-accent uppercase tracking-widest font-semibold block mb-1">
              Step {step} of 3
            </span>
            <h1 className="font-display text-2xl font-bold text-text-primary">
              {step === 1 && 'Create Your Agent Account'}
              {step === 2 && 'Set Up Workspace'}
              {step === 3 && 'Choose Your Operations Plan'}
            </h1>
          </div>

          {/* Dots progress indicator */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1 transition-all duration-300 ${
                  s <= step ? 'bg-accent' : 'bg-border-custom'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-md font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleInitiateRegistry} className="space-y-6">
          {/* STEP 1: Personal User Profile details */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted/50"
                    placeholder="Godswill Johnson"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1 font-sans">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                  Work Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted/50"
                    placeholder="godswill@agency.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 font-sans">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full pl-10 pr-12 py-3 bg-background border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 font-sans">{errors.password.message}</p>
                )}
              </div>

              {/* Bot Check challenge widget */}
              <div className="p-4 border border-border-custom rounded bg-background/45 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                    {botVerified ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                    )}
                    <span>Cybersecurity Bot Challenge</span>
                  </label>
                  {botVerified && (
                    <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase">
                      ✓ Verification successful
                    </span>
                  )}
                </div>

                {!botVerified ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="font-mono text-xs text-text-primary bg-background border border-border-custom px-4 py-2.5 rounded w-full sm:w-auto text-center shrink-0">
                      {botNum1} + {botNum2} = ?
                    </div>
                    <input
                      type="text"
                      value={botAnswer}
                      onChange={(e) => setBotAnswer(e.target.value)}
                      placeholder="Answer"
                      className="w-full sm:w-28 px-3 py-2.5 bg-background border border-border-custom text-text-primary rounded text-sm font-mono text-center focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyBot}
                      className="w-full sm:w-auto py-2.5 px-4 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-all"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-text-muted">You have proven you are human. You may proceed.</p>
                )}
                {botError && !botVerified && (
                  <p className="text-xs text-red-500 mt-1 font-sans">Please complete the arithmetic sum.</p>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-custom" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono">
                  <span className="bg-surface px-4 text-text-muted uppercase">or continue with</span>
                </div>
              </div>

              {/* Social OAuth */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full bg-background hover:bg-background/80 border border-border-custom text-text-primary py-3 px-4 rounded-badge font-sans text-sm flex items-center justify-center gap-3 transition-colors duration-150 cursor-pointer disabled:opacity-50"
              >
                {/* Simple SVG Google Icon */}
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Register with Google</span>
              </button>
            </div>
          )}

          {/* STEP 2: Organization details */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Workspace Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                  Agency Workspace Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    {...register('orgName')}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted/50"
                    placeholder="Brandavox Labs"
                  />
                </div>
                {errors.orgName && (
                  <p className="text-xs text-red-500 mt-1 font-sans">{errors.orgName.message}</p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                  Industry / Focus
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    {...register('orgIndustry')}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted/50"
                    placeholder="Digital Marketing, Public Relations, SaaS Growth"
                  />
                </div>
                {errors.orgIndustry && (
                  <p className="text-xs text-red-500 mt-1 font-sans">{errors.orgIndustry.message}</p>
                )}
              </div>

              {/* Team Size Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted font-sans uppercase tracking-wider block">
                  Team Size
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                    <Users className="h-4 w-4" />
                  </span>
                  <select
                    {...register('orgSize')}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border-custom text-text-primary rounded-badge font-sans text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select team size</option>
                    <option value="1">Just Me (Solo Operator)</option>
                    <option value="2-10">2–10 members</option>
                    <option value="11-50">11–50 members</option>
                    <option value="50+">50+ members</option>
                  </select>
                </div>
                {errors.orgSize && (
                  <p className="text-xs text-red-500 mt-1 font-sans">{errors.orgSize.message}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Subscriptions Plan selection */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plan 1: Starter */}
              <div
                onClick={() => setValue('plan', 'starter')}
                className={`border rounded-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 relative ${
                  selectedPlan === 'starter'
                    ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(234,88,12,0.1)]'
                    : 'border-border-custom bg-background hover:border-border-custom/80'
                }`}
              >
                {selectedPlan === 'starter' && (
                  <span className="absolute top-3 right-3 bg-accent text-white rounded-full p-0.5 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-1">Starter</h3>
                  <p className="text-xs text-text-muted mb-4 font-sans">Ideal for solo strategists.</p>
                  <div className="font-display text-2xl font-bold mb-6">
                    $0<span className="text-xs text-text-muted font-sans font-normal">/mo</span>
                  </div>
                  <ul className="text-xs text-text-muted space-y-2 font-sans mb-6">
                    <li>• 1 Brand Workspace</li>
                    <li>• 5 Clients Command</li>
                    <li>• 500 AI Generations/mo</li>
                    <li>• Core Analytics</li>
                  </ul>
                </div>
              </div>

              {/* Plan 2: Professional */}
              <div
                onClick={() => setValue('plan', 'professional')}
                className={`border rounded-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 relative ${
                  selectedPlan === 'professional'
                    ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(234,88,12,0.1)]'
                    : 'border-border-custom bg-background hover:border-border-custom/80'
                }`}
              >
                {selectedPlan === 'professional' && (
                  <span className="absolute top-3 right-3 bg-accent text-white rounded-full p-0.5 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-1">Professional</h3>
                  <p className="text-xs text-text-muted mb-4 font-sans">For growing agencies.</p>
                  <div className="font-display text-2xl font-bold mb-6">
                    $99<span className="text-xs text-text-muted font-sans font-normal">/mo</span>
                  </div>
                  <ul className="text-xs text-text-muted space-y-2 font-sans mb-6">
                    <li>• 10 Brand Workspaces</li>
                    <li>• 50 Clients Command</li>
                    <li>• 5,000 AI Generations/mo</li>
                    <li>• CRM & Recovery Agents</li>
                    <li>• Campaign Operations</li>
                  </ul>
                </div>
              </div>

              {/* Plan 3: Agency */}
              <div
                onClick={() => setValue('plan', 'agency')}
                className={`border rounded-card p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 relative ${
                  selectedPlan === 'agency'
                    ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(234,88,12,0.1)]'
                    : 'border-border-custom bg-background hover:border-border-custom/80'
                }`}
              >
                {selectedPlan === 'agency' && (
                  <span className="absolute top-3 right-3 bg-accent text-white rounded-full p-0.5 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div>
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-1">Agency</h3>
                  <p className="text-xs text-text-muted mb-4 font-sans">Unlimited scale & memory.</p>
                  <div className="font-display text-2xl font-bold mb-6">
                    $299<span className="text-xs text-text-muted font-sans font-normal">/mo</span>
                  </div>
                  <ul className="text-xs text-text-muted space-y-2 font-sans mb-6">
                    <li>• Unlimited Brands</li>
                    <li>• Unlimited Clients</li>
                    <li>• Unlimited AI Generations</li>
                    <li>• White-label Domain</li>
                    <li>• Advanced API Access</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Control Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-border-custom mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="flex items-center gap-2 py-3 px-6 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-surface border border-border-custom hover:border-accent text-text-primary hover:text-accent py-3 px-6 rounded-badge font-sans text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent-hover text-white py-3 px-8 rounded-badge font-sans font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Provisioning Agency OS...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      {/* 6-Digit Email Verification Overlay Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface border border-border-custom max-w-md w-full p-8 rounded-modal shadow-2xl relative space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border-custom">
              <KeyRound className="w-5 h-5 text-accent" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-primary font-mono">
                Email Authentication Required
              </h3>
            </div>

            <div className="space-y-2 text-xs font-sans text-text-muted">
              <p>We have dispatched a 6-digit confirmation key to:</p>
              <strong className="text-text-primary block font-mono bg-background px-3 py-1.5 border border-border-custom rounded-sm">
                {userEmail}
              </strong>
              <p>Type the verification code below to authorize and build your multi-tenant workspace.</p>
              
              {/* Dev notice hint */}
              <div className="mt-2 p-2 bg-accent/5 border border-accent/20 rounded font-mono text-[9px] text-accent">
                💡 Developer Test Code: <span className="font-bold underline">{sentCode}</span>
              </div>
            </div>

            {codeError && (
              <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-400 text-xs rounded font-sans">
                {codeError}
              </div>
            )}

            {/* Verification code fields */}
            <div className="flex justify-between gap-2.5">
              {verificationCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`code-in-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  className="w-12 h-12 bg-background border border-border-custom text-text-primary text-lg font-mono font-bold text-center rounded focus:outline-none focus:border-accent"
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-custom/60">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="py-2.5 px-4 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyCodeSubmit}
                className="py-2.5 px-6 bg-accent hover:bg-accent-hover text-white text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition-all"
              >
                Confirm Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-text-muted mt-8 font-sans">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:text-accent-hover font-semibold hover:underline">
          Sign in
        </Link>
      </footer>
      <MockGoogleModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelect={handleGoogleSelect}
      />
    </div>
  );
}
