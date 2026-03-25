import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import bgImage from '../1.png';
import { api, type AuthSession } from '../api';

interface SignInProps {
  onBack: () => void;
  onSignUp: () => void;
  onSuccess: (session: AuthSession) => void;
}

export default function SignIn({ onBack, onSignUp, onSuccess }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caretPos, setCaretPos] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setCaretPos(e.target.selectionStart || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = await api.signIn(email, password);
      onSuccess(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const chloeX = Math.min(caretPos * 8 + 40, 280);

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-start p-6 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-zinc-900/10" />

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-md border border-white/20 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] p-10 relative z-10 ml-20"
      >
        <button onClick={onBack} className="absolute left-8 top-8 p-2 text-zinc-400 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8 pt-4">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">Welcome Back</h2>
          <p className="text-zinc-500">Sign in with your Supabase account to open FreshSync.</p>
        </div>

        <div className="relative h-24 mb-6">
          <motion.div
            animate={{
              x: isFocused ? chloeX : 160,
              y: isFocused ? 0 : 10,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute left-0"
          >
            <div className="relative">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                <div className="flex gap-2 mt-[-4px]">
                  <div className="w-3 h-3 bg-white rounded-full relative overflow-hidden">
                    <motion.div
                      animate={{
                        x: isFocused ? caretPos / 8 - 4 : 0,
                        y: isFocused ? -1 : 0,
                      }}
                      className="w-1.5 h-1.5 bg-zinc-900 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                  <div className="w-3 h-3 bg-white rounded-full relative overflow-hidden">
                    <motion.div
                      animate={{
                        x: isFocused ? caretPos / 8 - 4 : 0,
                        y: isFocused ? -1 : 0,
                      }}
                      className="w-1.5 h-1.5 bg-zinc-900 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
                <motion.div
                  animate={{ height: isFocused ? 4 : 2, width: isFocused ? 10 : 6 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/40 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#4900e5] transition-colors" />
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyUp={(e) => setCaretPos((e.target as HTMLInputElement).selectionStart || 0)}
                onClick={(e) => setCaretPos((e.target as HTMLInputElement).selectionStart || 0)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#4900e5] transition-all outline-none text-zinc-900 font-medium placeholder:text-zinc-300"
                placeholder="name@freshsync.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Password</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#4900e5] transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(false)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#4900e5] transition-all outline-none text-zinc-900 placeholder:text-zinc-300"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-rose-500 font-medium text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#4900e5] text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#4900e5]/20 flex items-center justify-center gap-3 group transition-all mt-4 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
            <LogIn className="w-5 h-5 transition-transform" />
          </button>
        </form>

        <button
          type="button"
          onClick={onSignUp}
          className="w-full mt-4 border border-zinc-200 text-zinc-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-50 transition-colors"
        >
          Create Account
          <UserPlus className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
