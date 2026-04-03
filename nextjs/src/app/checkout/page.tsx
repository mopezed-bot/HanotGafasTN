'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  User,
  ShoppingBag,
  Loader2,
  Check,
  ChevronRight,
  ShieldCheck,
  Wallet,
  Sparkles
} from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/cart';
import { getListingById } from '@/lib/api/listings';
import type { Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cart = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login?redirect=/checkout');
        return;
      }
      setUser(currentUser);
      
      const listingId = searchParams.get('listing');
      if (listingId) {
        const { data } = await getListingById(listingId);
        if (data) cart.addItem(data as unknown as Listing);
      }
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      if (profile) {
        setFormData(prev => ({
          ...prev,
          firstName: profile.full_name?.split(' ')[0] || '',
          lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
          email: currentUser.email || '',
          phone: profile.phone || '',
        }));
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const { data: order, error } = await supabase.from('orders').insert({
        buyer_id: user.id,
        total: cart.getTotal(),
        status: 'pending',
        shipping_address: `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city} ${formData.postalCode}`,
        phone: formData.phone,
        notes: formData.notes,
      }).select().single();

      if (error) throw error;

      for (const item of cart.items) {
        await supabase.from('order_items').insert({
          order_id: order.id,
          listing_id: item.listing.id,
          price: item.listing.price,
          quantity: item.quantity,
        });
        await supabase.from('listings').update({ is_sold: true }).eq('id', item.listing.id);
      }

      cart.clearCart();
      setOrderId(order.id);
      setOrderComplete(true);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">Sécurisation de la caisse...</p>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-[3.5rem] text-center max-w-md border-emerald-500/10 shadow-2xl shadow-emerald-500/5"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter leading-none">Commande Confirmée !</h1>
          <p className="text-gray-500 font-bold mb-8 italic">"Merci de faire confiance au commerce local."</p>
          <div className="bg-gray-50 p-4 rounded-2xl mb-10 text-[10px] font-black uppercase tracking-widest text-gray-400">
             ID: #{orderId.slice(0, 8)}
          </div>
          <div className="flex flex-col gap-4">
            <Link href="/profile">
              <Button className="w-full h-16 rounded-2xl">VOIR MES COMMANDES</Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="glass" className="w-full h-16 rounded-2xl">RETOUR AU MARCHÉ</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
           <div>
             <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 group text-gray-400 font-black tracking-widest text-[10px] uppercase mb-4 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                RETOUR AU PANIER
              </button>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                Caisse Sécurisée <span className="text-primary italic">.</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-4">
                TRANSFORMATION DE VOS ENVIES EN RÉALITÉ
              </p>
           </div>
           
           <div className="flex items-center gap-2 px-6 py-3 glass rounded-[1.5rem] border-emerald-500/10">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">PAIEMENT 100% SÉCURISÉ</span>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Shipping Form */}
          <div className="glass p-10 rounded-[3rem] border-primary/5 space-y-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                 <Truck className="w-5 h-5 text-primary" />
               </div>
               <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Informations de Livraison</h2>
            </div>
            
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                   <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                   <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                   <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone</label>
                   <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adresse de livraison</label>
                 <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rue, Immeuble, Appartement..."
                  required
                  className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gouvernorat / Ville</label>
                   <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Gafsa, Tunis, etc."
                    required
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Code Postal</label>
                   <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes (Optionnel)</label>
                 <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all resize-none"
                ></textarea>
              </div>
            </form>
          </div>

          {/* Order Summary Summary */}
          <div className="space-y-8">
            <div className="glass p-10 rounded-[3rem] border-primary/10 shadow-2xl shadow-primary/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Récapitulatif de la commande</h2>
                 </div>
                 
                 <div className="space-y-4 mb-10">
                   {cart.items.map((item) => (
                     <div key={item.listing.id} className="flex gap-4 group">
                       <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                         {item.listing.images?.[0] ? (
                           <img src={item.listing.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <ShoppingBag className="w-8 h-8 text-gray-100" />
                           </div>
                         )}
                       </div>
                       <div className="flex-1 py-1 flex flex-col justify-center">
                         <h3 className="font-black text-gray-900 leading-tight line-clamp-1">{item.listing.title}</h3>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">QTÉ: {item.quantity}</p>
                       </div>
                       <p className="font-black text-gray-900 self-center">{item.listing.price.toLocaleString()} DT</p>
                     </div>
                   ))}
                 </div>

                 <div className="space-y-4 pt-8 border-t border-gray-100 pb-10">
                   <div className="flex justify-between items-center text-gray-500 font-bold">
                     <span className="text-[10px] uppercase tracking-widest font-black">Sous-total</span>
                     <span className="tracking-tighter">{cart.getTotal().toLocaleString()} DT</span>
                   </div>
                   <div className="flex justify-between items-center text-gray-500 font-bold">
                     <span className="text-[10px] uppercase tracking-widest font-black">Livraison</span>
                     <span className="text-[10px] uppercase tracking-widest font-black italic text-emerald-600">OFFERTE</span>
                   </div>
                   <div className="flex justify-between items-end pt-4">
                     <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Total Final</span>
                     <p className="text-4xl font-black text-primary tracking-tighter leading-none mb-1">
                       {cart.getTotal().toLocaleString()} <span className="text-sm">DT</span>
                     </p>
                   </div>
                 </div>

                 <Button
                   form="checkout-form"
                   type="submit"
                   isLoading={processing}
                   className="w-full h-24 rounded-[2rem] text-2xl group shadow-2xl shadow-primary/30 font-black italic italic tracking-wider"
                 >
                   CONFIRMER L'ACHAT
                   <ChevronRight className="ml-2 w-8 h-8 group-hover:translate-x-1 transition-transform" />
                 </Button>
                 
                 <div className="mt-8 flex items-center justify-center gap-3 text-emerald-600">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profitez de votre achat local !</span>
                 </div>
               </div>
            </div>

            {/* Payment Method Info */}
            <div className="glass p-8 rounded-[2.5rem] border-primary/5">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                     <Wallet className="w-6 h-6 text-blue-600" />
                   </div>
                   <div>
                     <p className="text-sm font-black text-gray-900 leading-none mb-1">Paiement Flexible</p>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">D17, Virement, Boutique</p>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="bg-background min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">Chargement...</p>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
