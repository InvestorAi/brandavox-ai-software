'use client';

import React, { useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';

interface GoogleAccount {
  email: string;
  fullName: string;
  avatarLetter: string;
  avatarBg: string;
}

interface MockGoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (account: { email: string; fullName: string }) => void;
}

const PREDEFINED_ACCOUNTS: GoogleAccount[] = [
  {
    email: 'godswill@brandavox.ai',
    fullName: 'Godswill Johnson',
    avatarLetter: 'G',
    avatarBg: 'bg-orange-600',
  },
  {
    email: 'sandbox@brandavox.ai',
    fullName: 'Agency Sandbox',
    avatarLetter: 'S',
    avatarBg: 'bg-blue-600',
  },
];

export default function MockGoogleModal({ isOpen, onClose, onSelect }: MockGoogleModalProps) {
  const [step, setStep] = useState<'choose' | 'custom' | 'loading'>('choose');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<{ email: string; fullName: string } | null>(null);

  if (!isOpen) return null;

  const handleSelectPredefined = (account: GoogleAccount) => {
    setSelectedAccount({ email: account.email, fullName: account.fullName });
    setStep('loading');
    setTimeout(() => {
      onSelect({ email: account.email, fullName: account.fullName });
    }, 1500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!customName.trim()) {
      setCustomError('Please enter your full name');
      return;
    }
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setCustomError('Please enter a valid email address');
      return;
    }

    setSelectedAccount({ email: customEmail, fullName: customName });
    setStep('loading');
    setTimeout(() => {
      onSelect({ email: customEmail, fullName: customName });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Outer Google Window Card */}
      <div className="bg-[#1f1f1f] text-[#e3e3e3] border border-[#444] rounded-lg max-w-[400px] w-full p-8 shadow-2xl relative font-sans flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8e918f] hover:text-[#e3e3e3] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Logo (Clean SVG) */}
        <div className="mb-6 flex justify-center">
          <svg className="h-6 w-24" viewBox="0 0 74 24" fill="currentColor">
            <path d="M7.8 15.5c-2.3 0-4.2-1.9-4.2-4.3 0-2.4 1.9-4.3 4.2-4.3 1.1 0 2.1.4 2.8 1.2l2.2-2.2C11.5 4.6 9.8 4 7.8 4 3.9 4 .6 7.2.6 11.2s3.2 7.2 7.2 7.2c2.1 0 3.7-.7 4.9-1.9l-2.2-2.2c-.7.7-1.6 1.2-2.7 1.2zm8.8-11.5c-2.4 0-4.3 2-4.3 4.3s1.9 4.3 4.3 4.3 4.3-2 4.3-4.3-1.9-4.3-4.3-4.3zm0 6.2c-1.1 0-2-1-2-2.1s.9-2.1 2-2.1 2 1 2 2.1-.9 2.1-2 2.1zm10 2.1c0 2.4-1.9 4.3-4.3 4.3s-4.3-2-4.3-4.3 1.9-4.3 4.3-4.3 4.3 2 4.3 4.3zm-6.2 0c0-1.1.9-2.1 2-2.1s2 1 2 2.1-.9 2.1-2 2.1-2-1-2-2.1zm15.7-8c-1.3 0-2.3.6-2.8 1.4h-.1V4.3h-2.3v13.5c0 3.1-1.8 4.3-3.9 4.3-2 0-3.2-1.3-3.7-2.4l2.1-.9c.4.9 1.1 1.6 1.6 1.6 1.4 0 2.2-.8 2.2-2.4v-1.1h-.1c-.5.6-1.4 1.2-2.6 1.2-2.3 0-4.3-1.9-4.3-4.3s2-4.3 4.3-4.3c1.2 0 2.1.6 2.6 1.2h.1V4.3h2.3v7.9zm-3.6 6c1.1 0 2-1 2-2.1s-.9-2.1-2-2.1-2 1-2 2.1.9 2.1 2 2.1zM51.8 4.3h2.3v13.5h-2.3V4.3zm9.1 4c-2 0-3.9.9-4.7 2.8l8.2-3.4-.3-.7c-.5-1.2-1.8-3-4.2-3-2.3 0-4.2 1.9-4.2 4.3 0 2.3 1.9 4.3 4.5 4.3 2.1 0 3.3-1.3 3.8-2.1l-1.9-1.2c-.6.8-1.4 1.4-2.2 1.4-1.3 0-2.2-.6-2.5-1.6l7.5-3.1-.3-.8zM57.6 10c.3-1.1 1.2-1.8 2.1-1.8.7 0 1.3.4 1.6.9L57.6 10z" />
          </svg>
        </div>

        {step === 'choose' && (
          <div className="w-full text-center">
            <h2 className="text-[22px] font-normal text-[#e3e3e3] mb-1 font-sans">
              Choose an account
            </h2>
            <p className="text-[14px] text-[#c4c7c5] mb-6 font-sans">
              to continue to <span className="font-semibold text-orange-500 font-display">Brandavox</span>
            </p>

            {/* Account List */}
            <div className="space-y-0.5 border border-[#444] rounded-lg overflow-hidden bg-[#181818] mb-6">
              {PREDEFINED_ACCOUNTS.map((account, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPredefined(account)}
                  type="button"
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#282828] text-left transition-colors border-b border-[#333] last:border-0 cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${account.avatarBg}`}>
                    {account.avatarLetter}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[14px] font-medium text-[#e3e3e3] truncate">
                      {account.fullName}
                    </div>
                    <div className="text-[12px] text-[#c4c7c5] truncate">
                      {account.email}
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setStep('custom')}
                type="button"
                className="w-full flex items-center gap-3 p-4 hover:bg-[#282828] text-left transition-colors cursor-pointer text-[#8ab4f8]"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2d2e30]">
                  <span className="text-xl font-mono text-[#8ab4f8]">+</span>
                </div>
                <div className="text-[14px] font-medium">Use another account</div>
              </button>
            </div>
          </div>
        )}

        {step === 'custom' && (
          <div className="w-full">
            <h2 className="text-[22px] font-normal text-center text-[#e3e3e3] mb-1 font-sans">
              Sign in
            </h2>
            <p className="text-[14px] text-center text-[#c4c7c5] mb-6 font-sans">
              Use your Google Account
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {customError && (
                <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-2.5 rounded">
                  {customError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1 font-sans">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-[#2d2e30] border border-[#555] rounded text-sm text-[#e3e3e3] placeholder-[#8e918f] focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4c7c5] mb-1 font-sans">
                  Email or phone
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="john.doe@gmail.com"
                  className="w-full px-3 py-2 bg-[#2d2e30] border border-[#555] rounded text-sm text-[#e3e3e3] placeholder-[#8e918f] focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('choose');
                    setCustomError('');
                  }}
                  className="text-sm font-semibold text-[#8ab4f8] hover:text-[#aecbfa] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#131314] font-semibold text-sm rounded cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'loading' && selectedAccount && (
          <div className="w-full flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-[#e3e3e3] mb-1">
              Connecting to Google
            </h3>
            <p className="text-sm text-[#c4c7c5]">
              Signing in as <span className="font-semibold text-white">{selectedAccount.email}</span>...
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-[12px] text-[#c4c7c5] font-sans leading-relaxed text-center border-t border-[#333] pt-4 w-full">
          To continue, Google will share your name, email address, language preference, and profile picture with Brandavox. See our{' '}
          <a href="/privacy" className="text-[#8ab4f8] hover:underline">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms" className="text-[#8ab4f8] hover:underline">
            Terms of Service
          </a>
          .
        </div>
      </div>
    </div>
  );
}
