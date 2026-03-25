/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Vendors from './pages/Vendors';
import Billing from './pages/Billing';
import Assistant from './pages/Assistant';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { api, setAuthToken, type AuthSession } from './api';
import type { UserRole } from './types';

const STORAGE_KEY = 'freshsync.auth.session';

type AuthView = 'landing' | 'signin' | 'signup';

const readStoredSession = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const persistSession = (session: AuthSession | null) => {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  setAuthToken(session.access_token);
};

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState<AuthView>('landing');

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedSession = readStoredSession();
      if (!storedSession) {
        setIsBootstrapping(false);
        return;
      }

      persistSession(storedSession);

      try {
        const user = await api.getSession();
        const restoredSession = { ...storedSession, user };
        persistSession(restoredSession);
        setSession(restoredSession);
        if (user.role === 'customer') {
          setActiveTab('inventory');
        }
      } catch {
        persistSession(null);
        setSession(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, []);

  const handleAuthSuccess = (nextSession: AuthSession) => {
    persistSession(nextSession);
    setSession(nextSession);

    if (nextSession.user.role === 'customer') {
      setActiveTab('inventory');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    persistSession(null);
    setSession(null);
    setActiveTab('dashboard');
    setAuthView('landing');
  };

  const userRole: UserRole = session?.user.role || 'customer';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory userRole={userRole} />;
      case 'vendors':
        return <Vendors />;
      case 'billing':
        return <Billing />;
      case 'assistant':
        return <Assistant userRole={userRole} />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'inventory':
        return 'Inventory Management';
      case 'vendors':
        return 'Vendors & Deliveries';
      case 'billing':
        return 'Point of Sale';
      case 'assistant':
        return 'AI Assistant';
      default:
        return 'FreshSync';
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
          <p className="text-sm text-zinc-400">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (authView === 'signin') {
      return (
        <SignIn
          onBack={() => setAuthView('landing')}
          onSignUp={() => setAuthView('signup')}
          onSuccess={handleAuthSuccess}
        />
      );
    }

    if (authView === 'signup') {
      return (
        <SignUp
          onBack={() => setAuthView('landing')}
          onSignIn={() => setAuthView('signin')}
          onSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <LandingPage
        onSignIn={() => setAuthView('signin')}
        onSignUp={() => setAuthView('signup')}
      />
    );
  }

  return (
    <div className="flex h-screen bg-zinc-100 font-sans overflow-hidden">
      <Sidebar
        userRole={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header title={getTitle()} userRole={userRole} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}
