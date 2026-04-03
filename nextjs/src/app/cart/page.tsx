'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  Loader2, 
  ChevronRight, 
  Trash,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const cart = useCartStore();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-[3.5rem] text-center max-w-md border-primary/5"
        >
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-primary/20" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Votre Panier est Vide</h1>
          <p className="text-gray-500 font-bold mb-10 leading-relaxed italic">
            "On dirait que vous n'avez pas encore trouvé de trésors dans le bassin minier."
          </p>
          <Link href="/marketplace">
            <Button className="rounded-2xl w-full h-16 text-lg shadow-xl shadow-primary/20 group">
              Commencer mes achats
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
             <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => window.history.back()}
                className="flex items-center gap-2 group text-gray-400 font-black tracking-widest text-[10px] uppercase mb-4 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                DÉCOUVRIR PLUS
              </motion.button>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                Votre Panier <span className="text-primary italic">.</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-4">
                {cart.getItemCount()} ARTICLES PRÊTS POUR LE DÉPART
              </p>
           </div>
           
           <button 
            onClick={() => cart.clearCart()}
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
           >
             <Trash className="w-3 h-3" /> VIDER LE PANIER
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item, i) => (
                <motion.div 
                  key={item.listing.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-6 rounded-[2.5rem] border-primary/5 flex gap-6 group hover:translate-x-2 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-32 h-32 bg-gray-50 rounded-[1.5rem] overflow-hidden shrink-0">
                    {item.listing.images?.[0] ? (
                      <img 
                        src={item.listing.images[0]} 
                        alt={item.listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-200" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/listings/${item.listing.id}`} className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight">
                          {item.listing.title}
                        </Link>
                        <button
                          onClick={() => cart.removeItem(item.listing.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        ÉTAT: {item.listing.condition || 'BON'}
                      </p>
                    </div>
                    
                    <div className="flex items-end justify-between">
                       <p className="text-2xl font-black text-gray-900 tracking-tighter">
                         {item.listing.price.toLocaleString()} <span className="text-sm">DT</span>
                       </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right: Checkout Summary */}
          <div className="space-y-6 lg:sticky lg:top-32">
             <div className="glass p-10 rounded-[3rem] border-primary/10 shadow-2xl shadow-primary/5">
                <div className="space-y-6 mb-10">
                   <div className="flex justify-between items-center text-gray-500 font-bold">
                      <span className="text-[10px] uppercase tracking-widest font-black">Sous-total</span>
                      <span className="tracking-tighter">{cart.getTotal().toLocaleString()} DT</span>
                   </div>
                   <div className="flex justify-between items-center text-gray-500 font-bold">
                      <span className="text-[10px] uppercase tracking-widest font-black">Livraison</span>
                      <span className="text-[10px] uppercase tracking-widest font-black italic text-emerald-600">Calculée après</span>
                   </div>
                   <div className="h-px bg-gray-100" />
                   <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Total</span>
                      <div className="text-right">
                         <p className="text-4xl font-black text-primary tracking-tighter leading-none mb-1">
                           {cart.getTotal().toLocaleString()} <span className="text-sm">DT</span>
                         </p>
                      </div>
                   </div>
                </div>

                <Link href="/checkout">
                  <Button className="w-full h-20 rounded-[2rem] text-xl group shadow-2xl shadow-primary/30">
                    PASSER À LA CAISSE
                    <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <p className="text-[10px] font-bold text-gray-400 text-center mt-6 italic">
                   Paiement 100% sécurisé via <span className="text-primary">D17 ou Carte Bancaire</span>.
                </p>
             </div>

             {/* Trust Badges */}
             <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, color: "text-emerald-500", label: "Achat Sûr" },
                  { icon: Truck, color: "text-blue-500", label: "Livraison" },
                  { icon: RotateCcw, color: "text-amber-500", label: "Garantie" }
                ].map((badge, i) => (
                  <div key={i} className="glass p-4 rounded-3xl border-primary/5 text-center group">
                     <badge.icon className={cn("w-6 h-6 mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity", badge.color)} />
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{badge.label}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
