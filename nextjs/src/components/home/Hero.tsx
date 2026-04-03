'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-primary font-bold text-sm mb-6 border-primary/20"
            >
              <Zap className="w-4 h-4 fill-primary" />
              <span>Marketplace local Gafsa & Bassin</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 text-gray-900">
              Achetez & Vendez <br/>
              <span className="text-primary italic">Localement.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-lg font-medium leading-relaxed">
              Le premier marketplace dédié au bassin minier. 
              <span className="text-primary font-black ml-1">Moulares, Redeyef, Metlaoui</span> et toute la Tunisie à portée de main.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="rounded-2xl group">
                  Explorer les annonces
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/listings/new">
                <Button size="lg" variant="outline" className="rounded-2xl border-2">
                  Vendre un article
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-gray-500">
                <span className="text-primary">+1,200</span> utilisateurs actifs à Gafsa
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/50 aspect-square md:aspect-video lg:aspect-square">
              <img 
                src="/images/hero-grocery.png" 
                alt="Produits Frais Gafsa" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-2xl border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-black text-gray-900">Redeyef, Gafsa</span>
                  </div>
                  <div className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-black uppercase">
                    Frais
                  </div>
                </div>
                <p className="text-lg font-black text-gray-900 line-clamp-1">Panier de Fruits & Légumes de Saison</p>
                <p className="text-2xl font-black text-primary">25 DT</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="absolute -top-10 -right-10 hidden xl:flex flex-col gap-4">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="glass p-4 rounded-2xl shadow-xl border-white/20 w-48"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-500">Popularité</span>
                </div>
                <p className="text-xl font-black">+45%</p>
                <p className="text-[10px] text-gray-400">Croissance cette semaine</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="glass p-4 rounded-2xl shadow-xl border-white/20 w-48"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-500">Ventes</span>
                </div>
                <p className="text-xl font-black">250+</p>
                <p className="text-[10px] text-gray-400">Annonces vérifiées</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
