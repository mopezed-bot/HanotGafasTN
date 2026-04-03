'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Menu, 
  X, 
  ShoppingBag, 
  User, 
  Plus, 
  LogIn,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/cart';
import { cn } from '@/lib/utils';

export const Header = ({ user }: { user: any }) => {
  const cart = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      const { data } = await supabase
        .from('listings')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .eq('is_active', true)
        .eq('is_sold', false)
        .limit(5);
      setSearchResults(data || []);
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        isScrolled ? "py-2" : "py-4"
      )}
    >
      <div className={cn(
        "max-w-7xl mx-auto px-4 rounded-3xl transition-all duration-500",
        isScrolled ? "glass shadow-2xl py-2 mx-6" : "bg-transparent py-2"
      )}>
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-xl">H</span>
            </div>
            <div className="hidden sm:block">
              <span className={cn("text-2xl font-black tracking-tighter", isScrolled ? "text-gray-900" : "text-gray-900")}>
                Hanout<span className="text-primary italic">TN</span>
              </span>
            </div>
          </Link>

          <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Rechercher un produit, appartement..."
                className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-transparent rounded-2xl focus:border-primary focus:bg-white focus:outline-none transition-all shadow-sm"
              />
            </div>
            
            <AnimatePresence>
              {showSearch && searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl shadow-2xl border overflow-hidden"
                >
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/listings/${result.id}`}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-3 p-3 hover:bg-primary/5 transition-colors group"
                    >
                      {result.images?.[0] ? (
                        <img src={result.images[0]} alt={result.title} className="w-12 h-12 object-cover rounded-xl" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{result.title}</p>
                        <p className="text-sm text-primary font-bold">{result.price} {result.currency}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/cart" className="relative p-2 hover:bg-primary/5 rounded-2xl transition-colors">
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              {cart.items.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                >
                  {cart.getItemCount()}
                </motion.span>
              )}
            </Link>
            
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 p-1 hover:bg-primary/5 rounded-2xl transition-colors">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                  <User className="w-5 h-5 text-primary" />
                </div>
              </Link>
            ) : (
              <Link href="/auth/login" className="hidden sm:block">
                <Button size="sm" variant="glass">
                  Connexion
                </Button>
              </Link>
            )}
            
            <Link href="/listings/new" className="hidden md:block">
              <Button size="sm" className="rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Vendre
              </Button>
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-primary/5 rounded-2xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[90] bg-white/80 md:hidden flex flex-col pt-32 px-8"
          >
            <nav className="flex flex-col gap-8">
              {[
                { label: "ACCUEIL", href: "/" },
                { label: "MARKETPLACE", href: "/marketplace" },
                { label: "VENDRE", href: "/listings/new" },
                { label: "MES MESSAGES", href: "/messages" },
                { label: "MON PROFIL", href: "/profile" },
                { label: "À PROPOS", href: "/about" }
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-black text-gray-900 tracking-tighter hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    {item.label}
                    <ChevronRight className="w-8 h-8 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-auto pb-12 border-t border-gray-100 pt-8 space-y-6"
            >
               <Button className="w-full h-16 rounded-2xl text-lg shadow-2xl shadow-primary/20">
                 DÉPOSER UNE ANNONCE
               </Button>
               <div className="flex justify-center gap-8">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidentialité</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conditions</span>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
