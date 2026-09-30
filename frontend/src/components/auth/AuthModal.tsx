import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';
import { X, Lock, Mail, Phone, User, KeyRound, Sparkles, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, sendRegisterOtp, verifyAndRegister } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<1 | 2>(1); // For register flow: 1 = Details, 2 = 6-digit OTP
  const [loading, setLoading] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [otp, setOtp] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(identifier, password);
    setLoading(false);
    if (success) onClose();
  };

  const handleSendRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePolicy) {
      toast.error('Policy Agreement Required', {
        description: 'You must agree to the ROVIN Terms & Privacy Policy to register.',
      });
      return;
    }
    setLoading(true);
    const sent = await sendRegisterOtp(email, phone);
    setLoading(false);
    if (sent) setStep(2);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await verifyAndRegister({
      name,
      email,
      phone,
      password,
      gender,
      otp,
    });
    setLoading(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-carbon-card border border-fastener-gunmetal rounded-xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header telemetry ribbon */}
        <div className="bg-carbon-slate px-6 py-4 border-b border-fastener-border flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <BrandLogo variant="icon" size="sm" />
            <span className="font-orbitron font-bold text-sm tracking-wider text-machined-titanium uppercase">
              {mode === 'login' ? 'PILOT AUTHENTICATION' : 'CREW REGISTRATION'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-machined-dim hover:text-machined-titanium p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-fastener-border bg-carbon-slate/50 text-xs font-orbitron font-semibold">
          <button
            onClick={() => { setMode('login'); setStep(1); }}
            className={`py-3 transition-colors ${
              mode === 'login'
                ? 'text-nitro-amber border-b-2 border-nitro-amber bg-carbon-card'
                : 'text-machined-dim hover:text-machined-muted'
            }`}
          >
            ACCESS TERMINAL
          </button>
          <button
            onClick={() => { setMode('register'); setStep(1); }}
            className={`py-3 transition-colors ${
              mode === 'register'
                ? 'text-nitro-amber border-b-2 border-nitro-amber bg-carbon-card'
                : 'text-machined-dim hover:text-machined-muted'
            }`}
          >
            NEW OPERATOR
          </button>
        </div>

        <div className="p-6">
          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1.5">
                  Email or BD Phone (01XXXXXXXXX)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="pilot@rovin.com.bd or 017XXXXXXXX"
                    className="w-full bg-carbon-slate border border-fastener-border rounded pl-10 pr-3 py-2 text-sm text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-machined-muted uppercase mb-1.5">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-carbon-slate border border-fastener-border rounded pl-10 pr-3 py-2 text-sm text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full nitro-btn mt-2 py-3"
              >
                {loading ? 'AUTHENTICATING...' : 'ENGAGE SESSION'}
              </button>

              <div className="pt-2 text-center text-xs text-machined-dim">
                <span>Default Admin Login: </span>
                <span className="text-machined-silver font-mono">admin@rovin.com.bd</span> / <span className="text-nitro-amber font-mono">Admin@12345</span>
              </div>
            </form>
          ) : (
            /* Register Multi-Step OTP Flow */
            <div>
              {step === 1 ? (
                <form onSubmit={handleSendRegisterOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sakil Ahmed"
                        className="w-full bg-carbon-slate border border-fastener-border rounded pl-9 pr-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                        BD Mobile (01XXXXXXXXX)
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01711223344"
                        className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                        Gender (Assigns Avatar)
                      </label>
                      <select
                        value={gender}
                        onChange={(e: any) => setGender(e.target.value)}
                        className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                      >
                        <option value="MALE">Male (Drift Pilot)</option>
                        <option value="FEMALE">Female (Tech Pilot)</option>
                        <option value="OTHER">Other / Tactical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                        Password (Min 6)
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                      />
                    </div>
                  </div>

                  {/* Mandatory Privacy Policy & Terms Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-mono text-machined-muted">
                      <input
                        type="checkbox"
                        checked={agreePolicy}
                        onChange={(e) => setAgreePolicy(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded bg-carbon-slate border-fastener-border text-nitro-amber focus:ring-0 cursor-pointer"
                      />
                      <span>
                        I agree to the{' '}
                        <Link
                          to="/terms-conditions"
                          target="_blank"
                          className="text-nitro-amber underline hover:text-nitro-orange"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          to="/privacy-policy"
                          target="_blank"
                          className="text-nitro-amber underline hover:text-nitro-orange"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !agreePolicy}
                    className="w-full nitro-btn mt-2 py-2.5 text-xs disabled:opacity-40"
                  >
                    {loading ? 'DISPATCHING CODE...' : 'TRANSMIT 6-DIGIT VERIFICATION CODE'}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Digit OTP Verification */
                <form onSubmit={handleCompleteRegistration} className="space-y-4">
                  <div className="text-center py-2">
                    <KeyRound className="w-10 h-10 text-nitro-amber mx-auto mb-2 animate-bounce" />
                    <h3 className="font-orbitron font-bold text-sm text-machined-titanium uppercase">
                      Enter 6-Digit Calibration Code
                    </h3>
                    <p className="text-xs text-machined-muted mt-1">
                      Dispatched to <span className="text-nitro-amber font-mono">{email}</span>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="0 0 0 0 0 0"
                      className="w-full text-center tracking-[1em] font-mono text-2xl font-bold bg-carbon-slate border-2 border-nitro-amber rounded py-3 text-nitro-amber focus:outline-none shadow-nitro-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 outline-btn py-2.5 text-xs"
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-2/3 nitro-btn py-2.5 text-xs"
                    >
                      {loading ? 'VERIFYING...' : 'INITIALIZE ACCOUNT'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
