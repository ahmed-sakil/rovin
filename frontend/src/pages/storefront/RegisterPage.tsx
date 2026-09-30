import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { User, Mail, Phone, Lock, KeyRound, ArrowRight, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

export const RegisterPage: React.FC = () => {
  usePageTitle('Pilot Registration', '6-Digit OTP Secure Account Setup');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { sendRegisterOtp, verifyAndRegister, isAuthenticated } = useAuth();
  const [step, setStep] = useState<1 | 2>(1); // 1 = Info, 2 = 6-digit OTP
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePolicy) {
      toast.error('Policy Agreement Required', {
        description: 'You must agree to the ROVIN Terms & Privacy Policy to register.',
      });
      return;
    }
    if (password.length < 6) {
      toast.error('Weak Security Key', { description: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    const sent = await sendRegisterOtp(email, phone);
    setLoading(false);
    if (sent) setStep(2);
  };

  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Invalid Code', { description: 'Please enter the 6-digit verification code.' });
      return;
    }

    setLoading(true);
    const success = await verifyAndRegister({
      name,
      email,
      phone,
      password,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      otp,
    });
    setLoading(false);
    if (success) {
      navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-center items-center p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <BrandLogo variant="full" size="lg" className="mx-auto mb-2" />
          </Link>
          <p className="text-xs font-mono text-machined-dim uppercase tracking-wider">
            ROVIN PILOT REGISTRATION PROTOCOL
          </p>
        </div>

        <div className="chassis-card p-6 sm:p-8 border-nitro-amber/40 shadow-chassis">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-fastener-border">
            <div className="flex items-center gap-2">
              <BrandLogo variant="icon" size="sm" />
              <h2 className="font-orbitron font-bold text-base text-machined-titanium uppercase">
                {step === 1 ? 'Create Pilot Account' : 'Verify 6-Digit Code'}
              </h2>
            </div>
            <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber text-[10px]">
              STEP {step}/2
            </span>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                  Full Pilot Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sakil Ahmed"
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 pl-9 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pilot@rovin.com.bd"
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                    BD Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                    Gender (Avatar)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  >
                    <option value="MALE" className="bg-carbon-card text-machined-titanium">Male</option>
                    <option value="FEMALE" className="bg-carbon-card text-machined-titanium">Female</option>
                    <option value="OTHER" className="bg-carbon-card text-machined-titanium">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                  Security Password (Min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 pl-9 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
              </div>

              {/* Mandatory Policy Agreement Checkbox */}
              <div
                onClick={() => setAgreePolicy(!agreePolicy)}
                className="flex items-start gap-2.5 pt-2 cursor-pointer select-none group"
              >
                <div className="mt-0.5 text-nitro-amber">
                  {agreePolicy ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-machined-dim group-hover:text-machined-silver" />}
                </div>
                <p className="text-[11px] font-mono text-machined-muted leading-tight">
                  I agree to the ROVIN{' '}
                  <Link to="/terms-conditions" target="_blank" className="text-nitro-amber underline" onClick={(e) => e.stopPropagation()}>
                    Terms of Operation
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-nitro-amber underline" onClick={(e) => e.stopPropagation()}>
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="nitro-btn w-full text-xs py-3 mt-4 flex items-center justify-center gap-2"
              >
                {loading ? 'Transmitting Code...' : 'Dispatch 6-Digit Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCompleteRegister} className="space-y-4">
              <div className="p-3 bg-carbon-elevated border border-nitro-amber/30 rounded text-center">
                <KeyRound className="w-8 h-8 text-nitro-amber mx-auto mb-1 animate-bounce" />
                <p className="text-xs font-mono text-machined-silver">
                  Verification code dispatched to:
                </p>
                <p className="font-mono text-xs font-bold text-nitro-amber mt-0.5">
                  {email} / {phone}
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-machined-muted text-center mb-2">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold bg-carbon-elevated border border-nitro-amber/60 rounded p-3 text-nitro-amber outline-none focus:ring-2 focus:ring-nitro-amber/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="nitro-btn w-full text-xs py-3"
              >
                {loading ? 'Initializing Account...' : 'Complete Registration & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-mono text-machined-dim hover:text-machined-silver"
              >
                &larr; Re-edit Coordinates
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-fastener-border text-center text-xs font-mono text-machined-dim">
            <span>Already registered callsign? </span>
            <Link
              to={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="text-nitro-amber font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-[11px] font-mono text-machined-dim">
          <Link to="/" className="hover:text-nitro-amber transition-colors">
            &larr; Return to Equipment Hangar
          </Link>
        </div>
      </div>
    </div>
  );
};
