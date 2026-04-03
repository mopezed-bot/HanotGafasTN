'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Shield, 
  Truck, 
  Headphones, 
  CreditCard,
  Zap,
  CheckCircle,
  Gem,
  MapPin,
  Package,
  Plus
} from 'lucide-react';
import { getListings } from '@/lib/api/listings';
import type { ListingWithSeller } from '@/types';

// Components
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const { data } = await getListings();
    // Filter logic for "Houses/Apartments" to show first as per previous version
    const houseListings = data.filter((listing) => {
      const slug = (listing.category_slug || '').toLowerCase();
      const name = (listing.category_name || '').toLowerCase();
      return slug.includes('real-estate') || name.includes('immobilier') || name.includes('house') || name.includes('apartment');
    });
    const nonHouseListings = data.filter((listing) => !houseListings.some((house) => house.id === listing.id));
    setListings([...houseListings, ...nonHouseListings].slice(0, 12));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white">
      <main>
        <Hero />
        
        {/* Features Bar */}
        <div className="py-12 bg-gray-900 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Paiement Sécurisé", desc: "100% Protection", color: "text-amber-500" },
                { icon: Truck, title: "Livraison Rapide", desc: "Partout en Tunisie", color: "text-emerald-500" },
                { icon: Headphones, title: "Support Local", desc: "Équipe Gafsa 24/7", color: "text-primary" },
                { icon: CreditCard, title: "Multi-Paiement", desc: "D17, Payme, Cartes", color: "text-blue-500" }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase tracking-wider">{feature.title}</h4>
                    <p className="text-gray-400 text-xs mt-1">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <CategoryGrid />

        {/* Local Promotion Banner */}
        <section className="py-20 relative px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto glass rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            {/* Background Accent */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-primary/10 rounded-full blur-[100px] -rotate-12" />
            
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-primary font-black uppercase tracking-widest text-sm italic">Focus Gafsa Bassin</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
                Boostez le Commerce dans <br/>
                <span className="text-primary">Moulares & Redeyef.</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {[
                  "Annonces Géo-localisées",
                  "Vérification des Vendeurs",
                  "Espace de Discussion Instantané",
                  "Support Communautaire"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/30">Rejoindre la Communauté</Button>
                <Button size="lg" variant="outline" className="rounded-2xl border-2">Savoir Plus</Button>
              </div>
            </div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/3 relative z-10"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl group-hover:scale-110 transition-transform duration-500" />
                <div className="relative bg-white p-8 rounded-[3rem] border border-white/50 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Gem className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Membre Premium</p>
                      <p className="font-black text-gray-900">Avantages Exclusifs</p>
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium mb-6">
                    Mettez vos annonces en avant et vendez <span className="text-primary font-black">3x plus vite</span> à Gafsa.
                  </p>
                  <Button variant="secondary" className="w-full rounded-2xl font-black italic">Bientôt Disponible</Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <FeaturedListings listings={listings} isLoading={isLoading} />

        {/* CTA Section */}
        <section className="py-24 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')]" />
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-widest italic mb-6">HANOUT<span className="text-primary">TN</span></h2>
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
                Prêt à faire bouger les choses ? Commencez à vendre vos articles en quelques secondes.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/marketplace">
                  <Button size="lg" className="rounded-[2rem] px-12 group h-20 text-2xl">
                    <Plus className="mr-3 w-8 h-8 group-hover:rotate-90 transition-transform" />
                    CRÉER UNE ANNONCE
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
