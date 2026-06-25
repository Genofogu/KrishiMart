
import React, { useState, useEffect } from 'react';
import { User, UserRole, Village, AuditAction } from '../types';
import { Sprout, AlertCircle, CheckCircle, Loader, KeyRound, ArrowLeft, Lock } from 'lucide-react';
import { ADMIN_CREDENTIALS, INITIAL_USERS, AVAILABLE_VILLAGES } from '../constants';

interface AuthScreenProps {
  onLogin: (user: User, rememberMe: boolean) => void;
  onLogAudit: (action: AuditAction, actor: string, target?: string, detail?: string) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot_password';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onLogAudit }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState<{show: boolean, msg: string}>({ show: false, msg: '' });
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('consumer');
  const [village, setVillage] = useState<Village>('City Center');
  
  // New Feature: Remember Me
  const [rememberMe, setRememberMe] = useState(false);

  // Rate Limiting
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Users DB
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('krishi_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('krishi_users', JSON.stringify(INITIAL_USERS));
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check Lockout
    if (lockoutTime) {
      if (Date.now() < lockoutTime) {
         setError(`Too many failed attempts. Try again in ${Math.ceil((lockoutTime - Date.now()) / 1000)}s`);
         return;
      } else {
         setLockoutTime(null);
         setAttempts(0);
      }
    }

    setLoading(true);

    setTimeout(() => {
      // 1. Check Admin
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          name: 'Admin Officer',
          email: email,
          role: 'admin',
          isVerified: true,
          trustScore: 5,
          totalOrders: 0
        };
        triggerWelcome("Welcome Admin", adminUser);
        return;
      }

      // 2. Check Users
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        if (foundUser.password === password) {
          triggerWelcome(`Welcome back, ${foundUser.name}`, foundUser);
        } else {
          handleFailedAttempt();
          onLogAudit('LOGIN_FAILED', 'Anonymous', email, 'Wrong Password');
          setLoading(false);
        }
      } else {
        handleFailedAttempt();
        onLogAudit('LOGIN_FAILED', 'Anonymous', email, 'User not found');
        setLoading(false);
      }
    }, 800);
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 3) {
      setLockoutTime(Date.now() + 30000); // 30s lockout
      setError("Too many failed attempts. Locked for 30 seconds.");
    } else {
      setError(`Incorrect credentials. ${3 - newAttempts} attempts remaining.`);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (users.some(u => u.email === email)) {
        setError("Email already registered.");
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role,
        village: role === 'farmer' ? 'Rampur' : village,
        isVerified: true,
        trustScore: 5.0,
        totalOrders: 0,
        landSizeAcres: role === 'farmer' ? 2 : 0
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('krishi_users', JSON.stringify(updatedUsers));

      onLogAudit('SIGNUP', newUser.name, 'System');
      triggerWelcome(`Welcome to Krishi-Mart, ${newUser.name}`, newUser);
    }, 1000);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex > -1) {
        // Mock Update
        const updatedUsers = [...users];
        updatedUsers[userIndex].password = password; // Set new password
        setUsers(updatedUsers);
        localStorage.setItem('krishi_users', JSON.stringify(updatedUsers));
        
        onLogAudit('PASSWORD_RESET', updatedUsers[userIndex].name, 'System');
        alert("Password reset successful! Please sign in with your new password.");
        setMode('signin');
      } else {
        setError("Email not found in our records.");
      }
      setLoading(false);
    }, 1000);
  };

  const triggerWelcome = (msg: string, user: User) => {
    setLoading(false);
    setShowWelcome({ show: true, msg });
    setTimeout(() => {
      onLogin(user, rememberMe);
    }, 1500);
  };

  if (showWelcome.show) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 animate-in fade-in duration-500">
        <CheckCircle size={64} className="text-green-600 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-800">{showWelcome.msg}</h2>
        <p className="text-gray-500 mt-2">Redirecting to Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-[400px] w-full">
        <div className="flex flex-col items-center mb-6">
          <Sprout size={48} className="text-green-600 mb-2" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Krishi-Mart</h1>
        </div>

        <div className="bg-white p-8 rounded-lg border border-gray-300 shadow-sm relative overflow-hidden">
          {lockoutTime && (
            <div className="absolute inset-0 bg-gray-100/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
               <Lock size={48} className="text-red-500 mb-4" />
               <h3 className="text-lg font-bold text-gray-800">Account Locked</h3>
               <p className="text-sm text-gray-500">Too many failed attempts. Please wait.</p>
            </div>
          )}

          <h2 className="text-2xl font-normal mb-6 text-gray-900 flex items-center gap-2">
            {mode === 'forgot_password' && (
              <button onClick={() => setMode('signin')} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </button>
            )}
            {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset Password'}
          </h2>

          <form onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handlePasswordReset} className="space-y-4">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Your name</label>
                  <input required type="text" className="w-full p-2 border border-gray-300 rounded" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                  <select className="w-full p-2 border border-gray-300 rounded" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                    <option value="consumer">Consumer</option>
                    <option value="farmer">Farmer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input required type="text" className="w-full p-2 border border-gray-300 rounded" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {mode === 'forgot_password' ? 'New Password' : 'Password'}
              </label>
              <input required type="password" className="w-full p-2 border border-gray-300 rounded" value={password} onChange={e => setPassword(e.target.value)} />
              
              {mode === 'signin' && (
                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-green-600 focus:ring-green-500"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    Remember Me
                  </label>
                  <button type="button" onClick={() => setMode('forgot_password')} className="text-xs text-blue-600 hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !!lockoutTime} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded shadow-sm flex justify-center items-center gap-2 disabled:opacity-50">
              {loading ? <Loader size={16} className="animate-spin" /> : (mode === 'forgot_password' ? 'Reset Password' : (mode === 'signin' ? 'Sign In' : 'Create Account'))}
            </button>
          </form>
        </div>

        {mode !== 'forgot_password' && (
          <div className="mt-6 text-center">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">
                {mode === 'signin' ? 'New to Krishi-Mart?' : 'Already have an account?'}
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <button 
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
                setPassword('');
              }}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded border border-gray-300 shadow-sm"
            >
              {mode === 'signin' ? 'Create your Krishi-Mart account' : 'Sign in to your account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
