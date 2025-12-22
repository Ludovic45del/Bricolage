import React, { useState } from 'react';
import { Member as User } from '../api/memberTypes';
import { Button } from './ui/Button';
import { ArrowRight, LayoutDashboard, KeyRound, Mail, UserPlus, Eye, EyeOff } from 'lucide-react';
import { RegisterModal } from './RegisterModal';
import { userToMember } from '../api/memberTypes';

interface LoginScreenProps {
  users: User[];
  onLogin: (role: 'admin' | 'user', userId?: string) => void;
  onRegister: (userData: User) => void;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, onRegister, showAlert }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    // Force Admin Login Bypass (Legacy dev backdoor)
    if (trimmedIdentifier.toLowerCase() === 'admin' && trimmedPassword === 'admin') {
      setTimeout(() => {
        // Try to find an existing admin to use their ID for consistency
        const adminUser = users.find(u => u.role === 'admin');
        if (adminUser) {
          onLogin('admin', adminUser.id);
        } else {
          // Fallback if absolutely no admin found
          // In V2 constants, we have 'admin1'
          onLogin('admin', 'admin1');
        }
        setIsLoading(false);
      }, 500);
      return;
    }

    // Simulate network delay
    setTimeout(() => {
      const user = users.find(u =>
        (u.email?.toLowerCase() === trimmedIdentifier.toLowerCase() || u.badgeNumber?.toLowerCase() === trimmedIdentifier.toLowerCase()) &&
        u.passwordHash === trimmedPassword // Mock password check
      );

      if (user) {
        // Map Admin and Staff to 'admin', and Member to 'user'
        const appRole = (user.role === 'admin' || user.role === 'staff') ? 'admin' : 'user';
        onLogin(appRole, user.id);
      } else {
        showAlert("Erreur d'authentification", "Identifiant ou mot de passe incorrect.", 'warning');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-transparent">
      {/* Decorative Aura background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-lg z-10 glass-card p-10 md:p-16 border-white/10 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 glass-card mb-8 border-white/20">
            <LayoutDashboard className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white mb-3">
            Section <span className="text-purple-400">Bricolage</span>
          </h1>
          <p className="text-gray-400 text-lg font-light tracking-wide">
            Gérez vos outils en toute simplicité.
          </p>
        </div>

        <div className="space-y-8">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email ou Matricule</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  required
                  type="text"
                  className="block w-full rounded-2xl glass-input p-4 pl-12 text-sm transition-all focus:ring-0"
                  placeholder="Ex: admin@aaccea.com ou A001"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mot de Passe</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-purple-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-2xl glass-input p-4 pl-12 pr-12 text-sm transition-all focus:ring-0 font-bold tracking-widest"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-5 text-lg font-black shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se Connecter'}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-6 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Pas encore de compte ?</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="w-full group glass-card p-6 flex items-center justify-between border-white/5 hover:border-purple-400/30 hover:bg-white/5 transition-all duration-500"
          >
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 glass-card flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform duration-500">
                <div className="w-7 h-7 flex items-center justify-center">
                  <UserPlus className="w-full h-full" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-1">Espace Membre</h3>
                <p className="text-sm text-gray-500 group-hover:text-purple-300/60 transition-colors">Créer votre profil en 2 minutes</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-purple-300 transform group-hover:translate-x-2 transition-all duration-500" />
          </button>
        </div>

        <div className="mt-12 text-center text-[10px] text-gray-700 uppercase tracking-[0.3em] font-medium">
          © {new Date().getFullYear()} Section Bricolage
        </div>
      </div>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={onRegister}
      />
    </div>
  );
};