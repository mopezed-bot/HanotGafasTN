'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-white font-black text-2xl">H</span>
              </div>
              <div>
                <span className="text-3xl font-black tracking-tighter">
                  Hanout<span className="text-primary italic">TN</span>
                </span>
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-0.5">Vibe Local, Impact National</p>
              </div>
            </Link>
            <p className="text-gray-400 font-medium leading-relaxed mb-8 pr-4">
              La plateforme communautaire de référence pour le commerce local à Gafsa et dans tout le bassin minier. 
              Simplifiez vos échanges, dynamisez votre région.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
                <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer group">
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 border-b-2 border-primary w-fit pr-4 pb-2">Navigation</h4>
            <ul className="space-y-4">
              <li><Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">Annuaire Marketplace <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
              <li><Link href="/listings/new" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">Vendre un Article <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">À Propos de Nous <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">Centre d&apos;Aide <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 border-b-2 border-secondary w-fit pr-4 pb-2">Catégories</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
              <li><Link href="/marketplace?category=vehicles" className="text-gray-400 hover:text-white transition-colors text-sm">Automobile</Link></li>
              <li><Link href="/marketplace?category=real-estate" className="text-gray-400 hover:text-white transition-colors text-sm">Immobilier</Link></li>
              <li><Link href="/marketplace?category=electronics-phones" className="text-gray-400 hover:text-white transition-colors text-sm">Multimédia</Link></li>
              <li><Link href="/marketplace?category=fashion-clothing" className="text-gray-400 hover:text-white transition-colors text-sm">Mode & Style</Link></li>
              <li><Link href="/marketplace?category=home-furniture" className="text-gray-400 hover:text-white transition-colors text-sm">Maison</Link></li>
              <li><Link href="/marketplace?category=jobs" className="text-gray-400 hover:text-white transition-colors text-sm">Emploi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 border-b-2 border-accent w-fit pr-4 pb-2">Contact</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Gafsa Basin</p>
                  <p className="text-xs text-gray-500">Moulares / Redeyef, Tunisie</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Email Support</p>
                  <p className="text-xs text-gray-500">contact@hanouttn.tn</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Téléphone</p>
                  <p className="text-xs text-gray-500">+216 12 345 678</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm font-medium">
            © 2024 HanoutTN. Fièrement conçu pour la Tunisie.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Confidentialité</Link>
            <Link href="#" className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Conditions</Link>
            <Link href="#" className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
              <Globe className="w-4 h-4" /> FR / AR
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
