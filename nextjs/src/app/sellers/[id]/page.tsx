'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  Star,
  Loader2,
  Calendar,
  Package,
  MessageCircle,
  Phone,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Share2
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Profile, Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSellerProfile();
  }, [params.id]);

  const fetchSellerProfile = async () => {
    try {
      setIsLoading(true);
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', params.id).single();
      if (profileError || !profile) {
        setError('Membre non trouvé');
        return;
      }
      setSeller(profile);
      const { data: listingsData } = await supabase.from('listings').select('*').eq('seller_id', params.id).eq('is_active', true).order('created_at', { ascending: false });
      setListings(listingsData || []);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">Chargement du profil...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{error || 'Membre Introuvable'}</h1>
        <Link href="/marketplace">
          <Button variant="glass">RETOUR AU MARCHÉ</Button>
        </Link>
      </div>
    );
  }

  const memberSince = seller.created_at ? new Date(seller.created_at).toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long' 
  }) : 'Inconnu';

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Seller Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 md:p-16 rounded-[4rem] border-primary/5 relative overflow-hidden mb-16"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
            {/* Avatar Section */}
            <div className="relative shrink-0 group">
               <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
               {seller.avatar_url ? (
                 <img src={seller.avatar_url} alt="" className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-2xl relative z-10" />
               ) : (
                 <div className="w-48 h-48 rounded-full bg-primary/5 flex items-center justify-center border-4 border-white shadow-2xl relative z-10">
                   <User className="w-20 h-20 text-primary/20" />
                 </div>
               )}
               <div className="absolute -bottom-2 -right-2 z-20 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl">
                 <ShieldCheck className="w-6 h-6" />
               </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-6">
               <div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">{seller.full_name || 'Membre'} <span className="text-primary italic">.</span></h1>
                    <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10 w-fit mx-auto md:mx-0">VENDEUR VÉRIFIÉ</span>
                  </div>
                  <p className="text-gray-400 font-black tracking-widest text-xs uppercase">{seller.username ? `@${seller.username}` : '@tunisien'}</p>
               </div>

               <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-2 text-gray-400 font-bold">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <span>{listings.length} Annonces</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-bold">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <span>Membre depuis {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-bold">
                    <Star className="w-5 h-5 text-emerald-500" />
                    <span>4.9 (42 Avis)</span>
                  </div>
               </div>

               {seller.bio && (
                 <p className="text-gray-500 font-medium italic max-w-2xl leading-relaxed text-lg">"{seller.bio}"</p>
               )}

               <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                  {seller.phone && (
                    <a href={`https://wa.me/${seller.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener">
                      <Button className="rounded-2xl h-14 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 group">
                        <MessageCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        WHATSAPP
                      </Button>
                    </a>
                  )}
                  <Button variant="glass" className="rounded-2xl h-14 px-8 group">
                    <Share2 className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                    PARTAGER
                  </Button>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard / Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-6">
             <div className="glass p-8 rounded-[2.5rem] border-primary/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Performance Vendeur</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Ventes Totales</p>
                      <div className="flex items-center gap-1 text-emerald-600 font-black tracking-tight">
                        <TrendingUp className="w-4 h-4" /> 182
                      </div>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Temps de Réponse</p>
                      <span className="text-primary font-black">&lt; 1h</span>
                   </div>
                   <div className="h-px bg-gray-100" />
                   <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">Satisfaction</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Besoin d&apos;Aide ?</p>
                   <p className="font-bold text-lg leading-snug mb-6 italic">Signaler un profil ou poser une question à propos de ce vendeur.</p>
                   <Button variant="glass" className="w-full text-white border-white/10 hover:bg-white/10 rounded-xl py-3 text-xs">CONTACTER LE SUPPORT</Button>
                </div>
             </div>
          </div>

          {/* Main Listings Grid */}
          <div className="lg:col-span-3">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Annonces Actives <span className="text-primary italic">.</span></h2>
                <div className="h-px flex-1 bg-gray-100 mx-8 hidden sm:block" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{listings.length} PRODUITS</span>
             </div>

             {listings.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(204,85,0,0.1)] border border-primary/5"
                    >
                      {/* Image Container */}
                      <div className="aspect-[4/5] relative overflow-hidden">
                        {listing.images?.[0] ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-200" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                           <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-900 border border-white/20 shadow-lg">
                             {listing.condition || 'BON ÉTAT'}
                           </span>
                        </div>
                        {listing.is_sold && (
                          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white text-gray-900 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">VENDU</span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent flex flex-col justify-end">
                           <p className="text-white font-black text-xl line-clamp-1 mb-1 tracking-tight">{listing.title}</p>
                           <p className="text-primary font-black italic text-2xl tracking-tighter">{listing.price} DT</p>
                        </div>
                      </div>
                    </Link>
                  ))}
               </div>
             ) : (
               <div className="py-32 glass rounded-[4rem] text-center space-y-6">
                  <ShoppingBag className="w-20 h-20 text-gray-100 mx-auto" />
                  <h3 className="text-2xl font-black text-gray-400 tracking-tighter uppercase italic">AUCUNE ANNONCE ACTIVE</h3>
                  <Button variant="glass" className="rounded-xl px-10">PRÉVENIR QUAND DISPONIBLE</Button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
