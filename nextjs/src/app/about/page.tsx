'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { Star, Award, Users, Globe, Eye, Heart, ArrowRight, MapPin, Zap, ShieldCheck, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutContent />
    </Suspense>
  );
}

function AboutContent() {
  const stats = [
    { number: '10k+', label: 'Annonces Active', color: 'text-primary' },
    { number: '5k+', label: 'Membres à Gafsa', color: 'text-amber-600' },
    { number: '100%', label: 'Impact Local', color: 'text-emerald-600' },
    { number: '24/7', label: 'Support Dédié', color: 'text-blue-600' },
  ];

  const values = [
    { icon: Zap, title: 'Proximité', description: 'Nous connectons les voisins de Moulares et Redeyef pour un commerce plus humain.' },
    { icon: ShieldCheck, title: 'Confiance', description: 'Chaque vendeur est vérifié pour garantir des transactions sereines.' },
    { icon: Heart, title: 'Passion', description: 'Nous aimons notre région et nous voulons voir son économie fleurir.' },
    { icon: Globe, title: 'Accessibilité', description: 'Une plateforme moderne accessible à tous, partout en Tunisie.' },
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 mb-24">
        <div className="max-w-7xl mx-auto text-center container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8"
          >
             <Sparkles className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Notre Mission . Notre Histoire</span>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.8] mb-8">
            L'Âme du <br/>
            <span className="text-primary italic">Bassin Minier .</span>
          </h1>
          <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed italic">
            "Plus qu'un marketplace, HanoutTN est le cœur battant du commerce local à Moulares et Redeyef."
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl -rotate-6 scale-95" />
            <div className="relative glass p-4 rounded-[3rem] border-primary/5">
                <img 
                  src="https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=1200" 
                  alt="Notre Vision"
                  className="rounded-[2.5rem] w-full aspect-[4/5] object-cover shadow-2xl"
                />
            </div>
            <div className="absolute -bottom-10 -right-10 glass p-10 rounded-[3rem] border-primary/10 shadow-2xl hidden md:block">
               <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                   <Users className="w-6 h-6" />
                 </div>
                 <p className="text-4xl font-black text-gray-900 tracking-tighter">5000+</p>
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateurs Actifs</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
               <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                 Pourquoi <span className="text-primary italic">HanoutTN ?</span>
               </h2>
               <div className="w-20 h-1.5 bg-primary rounded-full" />
            </div>
            <p className="text-lg text-gray-600 font-bold leading-relaxed">
              Fondé en 2024, HanoutTN est né d'une vision simple : transformer la façon dont les habitants du bassin minier (Gafsa, Moulares, Redeyef) achètent et vendent. 
            </p>
            <p className="text-gray-500 font-medium leading-relaxed">
              Dans une région riche en talent et en opportunités, nous avons créé un pont numérique sécurisé. Que vous soyez un artisan local, une boutique établie, ou un particulier souhaitant donner une seconde vie à ses objets, HanoutTN est votre espace. 
              Pas de complications, juste du commerce de proximité, rapide et fiable.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-100">
               <div>
                  <h4 className="text-gray-900 font-black mb-1 italic">Impact Local</h4>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">100% Gafsa Pride</p>
               </div>
               <div>
                  <h4 className="text-gray-900 font-black mb-1 italic">Soutien 24/7</h4>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Équipe Dédiée</p>
               </div>
            </div>

            <div className="pt-6">
               <Link href="/marketplace">
                <Button size="lg" className="rounded-2xl h-16 px-10 shadow-2xl shadow-primary/20">
                  DÉCOUVRIR LE MARCHÉ
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 -z-10" />
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={cn("text-5xl md:text-7xl font-black mb-4 tracking-tighter", stat.color)}>{stat.number}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4 italic">Nos Valeurs <span className="text-primary">.</span></h2>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">CE QUI NOUS REND DIFFÉRENTS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass p-10 rounded-[3rem] border-primary/5 hover:border-primary/20 transition-all group"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-8 border border-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                  <value.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight leading-none group-hover:text-primary transition-colors italic">{value.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed italic">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Mission Banner */}
      <section className="py-24 px-4 overflow-hidden">
         <div className="max-w-7xl mx-auto glass rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden bg-primary/5">
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-12">
               <h2 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">
                 Gafsa Bassin <span className="text-primary">Minier .</span>
               </h2>
               <div className="flex flex-wrap justify-center gap-4">
                  {["Moulares", "Redeyef", "Metlaoui", "Mdhila", "Gafsa Ville"].map((city, i) => (
                    <div key={i} className="px-6 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 border border-primary/5">
                      {city}
                    </div>
                  ))}
               </div>
               <p className="text-xl md:text-2xl text-gray-500 font-bold max-w-3xl mx-auto italic">
                 Nous sommes fiers de servir notre communauté et de bâtir l&apos;économie numérique locale de demain.
               </p>
               <div className="pt-8">
                  <Link href="/marketplace">
                    <Button size="lg" className="rounded-2xl h-20 px-16 group text-xl shadow-2xl shadow-primary/30">
                       REJOINDRE L&apos;AVENTURE
                       <Plus className="ml-3 w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </Button>
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
