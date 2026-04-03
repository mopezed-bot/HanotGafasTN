'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Laptop, 
  Car, 
  Home, 
  Shirt, 
  Sofa, 
  Dumbbell, 
  Briefcase, 
  Gem, 
  ShoppingBag, 
  Watch,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Alimentation', slug: 'grocery', icon: ShoppingBag, color: 'bg-emerald-500', count: 1420 },
  { name: 'Électronique', slug: 'electronics-phones', icon: Laptop, color: 'bg-blue-500', count: 1250 },
  { name: 'Véhicules', slug: 'vehicles', icon: Car, color: 'bg-green-500', count: 890 },
  { name: 'Immobilier', slug: 'real-estate', icon: Home, color: 'bg-amber-500', count: 567 },
  { name: 'Mode', slug: 'fashion-clothing', icon: Shirt, color: 'bg-pink-500', count: 2340 },
  { name: 'Maison', slug: 'home-furniture', icon: Sofa, color: 'bg-orange-500', count: 780 },
  { name: 'Sports', slug: 'sports-leisure', icon: Dumbbell, color: 'bg-purple-500', count: 450 },
  { name: 'Emplois', slug: 'jobs', icon: Briefcase, color: 'bg-indigo-500', count: 320 },
  { name: 'Beauté', slug: 'beauty', icon: Gem, color: 'bg-rose-500', count: 670 },
  { name: 'Bijoux', slug: 'watches-jewelry', icon: Watch, color: 'bg-cyan-500', count: 290 },
];

export const CategoryGrid = () => {
  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
            >
              Parcourez par <span className="text-primary italic">Catégorie.</span>
            </motion.h2>
            <p className="text-lg text-gray-500 mt-2 font-medium">Tout ce dont vous avez besoin, à portée de clic.</p>
          </div>
          <Link href="/marketplace" className="group flex items-center gap-2 text-primary font-black hover:translate-x-2 transition-transform">
            Voir tout le catalogue <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
            >
              <Link
                href={`/marketplace?category=${cat.slug}`}
                className="group p-8 bg-white rounded-[2rem] hover:bg-primary transition-all duration-500 shadow-xl shadow-gray-200/50 hover:shadow-primary/40 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500",
                  cat.color,
                  "shadow-lg group-hover:shadow-white/20"
                )}>
                  <cat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-gray-900 mb-1 group-hover:text-white transition-colors">{cat.name}</h3>
                <p className="text-[10px] uppercase font-black text-gray-400 group-hover:text-white/60 transition-colors tracking-widest">{cat.count.toLocaleString()} annonces</p>
                
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 -translate-y-8 group-hover:bg-black/5 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
