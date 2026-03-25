import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Shield, Palette, Database, Globe, Lock, Mail, Key, ArrowRight } from 'lucide-react';

export default function Settings() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if (email === 'admin@freshsync.com' && password === 'admin123') {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Invalid admin credentials. Use admin@freshsync.com / admin123');
    }
  };

  const sections = [
    {
      title: 'General',
      icon: Globe,
      items: [
        { name: 'Store Information', description: 'Name, address, and contact details' },
        { name: 'Language & Region', description: 'English (US), USD ($)' },
      ]
    },
    {
      title: 'Profile',
      icon: User,
      items: [
        { name: 'Account Settings', description: 'Email, password, and two-factor auth' },
        { name: 'Notification Preferences', icon: Bell, description: 'Email and push notifications' },
      ]
    },
    {
      title: 'System',
      icon: Database,
      items: [
        { name: 'Inventory Rules', description: 'Auto-reorder points and alerts' },
        { name: 'Appearance', icon: Palette, description: 'Dark mode and brand colors' },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { name: 'User Management', description: 'Employee roles and permissions' },
        { name: 'Backup & Restore', description: 'Last backup: 2 hours ago' },
      ]
    }
  ];

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-200 p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Admin Access Required</h2>
            <p className="text-zinc-500 mt-2">Please verify your identity to access store settings</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="admin@freshsync.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-rose-500 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all"
            >
              Verify Identity
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Settings</h2>
        <p className="text-zinc-500">Manage your store configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <section.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-zinc-800">{section.title}</h3>
            </div>
            
            <div className="space-y-4">
              {section.items.map((item) => (
                <button 
                  key={item.name}
                  className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 transition-colors group border border-transparent hover:border-zinc-100"
                >
                  <p className="font-medium text-zinc-900 group-hover:text-emerald-600 transition-colors">{item.name}</p>
                  <p className="text-sm text-zinc-500">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
