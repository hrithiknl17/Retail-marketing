import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Key, User, ArrowLeft, Send } from 'lucide-react';
import { api, type AuthSession } from '../api';

interface SignUpProps {
  onBack: () => void;
  onSignIn: () => void;
  onSuccess: (session: AuthSession) => void;
}

export default function SignUp({ onBack, onSignIn, onSuccess }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [caretPos, setCaretPos] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context && emailRef.current) {
      const style = window.getComputedStyle(emailRef.current);
      context.font = style.font;
      context.measureText(email.substring(0, caretPos));
    }
  }, [email, caretPos]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setCaretPos(e.target.selectionStart || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = await api.signUp({ name, email, password });
      setIsSuccess(true);
      setTimeout(() => onSuccess(session), 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Account creation failed.';
      setError(message);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const chloeX = Math.min(caretPos * 8 + 40, 280);

  return (
    <div className="min-h-screen bg-[#4900e5] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6236ff] rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3a00b8] rounded-full blur-[120px] opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10"
      >
        <button
          onClick={onBack}
          className="absolute left-8 top-8 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-12 pt-4">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">Create Account</h2>
          <p className="text-zinc-500">Provision a Supabase-backed FreshSync user.</p>
        </div>

        <div className="relative h-20 mb-4">
          <motion.div
            animate={{
              x: isFocused ? chloeX : 160,
              y: isFocused ? 0 : 10,
              scale: isSuccess ? 0 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute left-0"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                <div className="flex gap-1.5 mt-[-4px]">
                  <div className="w-2.5 h-2.5 bg-white rounded-full relative overflow-hidden">
                    <motion.div
                      animate={{
                        x: isFocused ? caretPos / 10 : 0,
                        y: isFocused ? -1 : 0,
                      }}
                      className="w-1.5 h-1.5 bg-zinc-900 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                  <div className="w-2.5 h-2.5 bg-white rounded-full relative overflow-hidden">
                    <motion.div
                      animate={{
                        x: isFocused ? caretPos / 10 : 0,
                        y: isFocused ? -1 : 0,
                      }}
                      className="w-1.5 h-1.5 bg-zinc-900 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
                <motion.div
                  animate={{ height: isFocused ? 4 : 2, width: isFocused ? 8 : 4 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/40 rounded-full"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-900/10 rounded-full blur-[1px]" />
            </div>
          </motion.div>

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-emerald-100 text-emerald-600 px-6 py-2 rounded-full font-bold shadow-sm">
                  Account created
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsFocused(false)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-zinc-900"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyUp={(e) => setCaretPos((e.target as HTMLInputElement).selectionStart || 0)}
                onClick={(e) => setCaretPos((e.target as HTMLInputElement).selectionStart || 0)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-zinc-900 font-medium"
                placeholder="name@store.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 ml-1">Password</label>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(false)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-zinc-900"
                placeholder="••••••••"
                minLength={6}
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
            className="w-full bg-[#4900e5] hover:bg-[#3a00b8] text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#4900e5]/20 flex items-center justify-center gap-3 group transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-8">
          Already have an account?{' '}
          <button onClick={onSignIn} className="text-[#4900e5] font-bold hover:underline">
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
