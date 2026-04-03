'use client';

import { Suspense } from 'react';
import ListingForm from '@/components/listings/ListingForm';
import { Package, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function ListingFormContent() {
  return (
    <div className="max-w-3xl mx-auto pt-32 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6">
           <Sparkles className="w-4 h-4 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Vendre Rapidement à Gafsa</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6">
          Votre Nouvelle <span className="text-primary italic">Annonce .</span>
        </h1>
        <p className="text-gray-500 font-bold max-w-xl mx-auto">
          Postez en quelques étapes et touchez des milliers d'acheteurs à <span className="text-primary italic">Moulares, Redeyef et dans toute la Tunisie</span>.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ListingForm />
      </motion.div>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-background px-4 overflow-x-hidden">
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">Préparation du formulaire...</p>
          </div>
        }
      >
        <ListingFormContent />
      </Suspense>
    </div>
  );
}
