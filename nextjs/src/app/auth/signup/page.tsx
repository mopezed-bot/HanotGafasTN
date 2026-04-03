'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Profile is automatically created by the Supabase trigger
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || "Échec de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-4 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-[3rem] shadow-2xl border-primary/10 relative overflow-hidden"
        >
          {/* Subtle Accent */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16" />
          
          <div className="relative z-10 text-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-4">
              Rejoignez <span className="text-primary italic">HanoutTN</span>
            </h1>
            <p className="text-gray-500 font-bold">
              Le futur du commerce local à <span className="text-primary italic">Gafsa</span>.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-8 text-sm font-bold border border-red-100 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Nom Complet</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Prénom Nom"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">WhatsApp</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+216 -- --- ---"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-bold focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-4 bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-bold focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Confirmation</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input type="checkbox" required className="mt-1 w-5 h-5 rounded-lg border-2 border-primary/20 text-primary focus:ring-primary/20 transition-all cursor-pointer" />
              <span className="text-xs text-gray-500 font-bold leading-relaxed">
                J'accepte les <a href="#" className="text-primary hover:underline italic">Conditions d'Utilisation</a> et la <a href="#" className="text-primary hover:underline italic">Politique de Confidentialité</a>.
              </span>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full group h-16 text-lg rounded-2xl font-black italic tracking-wider shadow-xl shadow-primary/20"
            >
              CRÉER MON COMPTE
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="mt-10 text-center text-gray-500 font-bold text-sm">
            Déjà inscrit ?{' '}
            <Link href="/auth/login" className="text-primary font-black hover:underline italic">
              Se connecter maintenant
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
