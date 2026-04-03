'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Package, Eye, MessageCircle, Heart, Zap } from 'lucide-react';
import type { ListingWithSeller } from '@/types';
import { Button } from '@/components/ui/Button';

export const FeaturedListings = ({ listings, isLoading }: { listings: ListingWithSeller[], isLoading: boolean }) => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Dernières <span className="text-primary italic">Pépites.</span>
            </h2>
            <p className="text-xl text-gray-500 mt-2 font-medium">Les annonces les plus fraîches de Gafsa et environs.</p>
          </motion.div>
          <Link href="/marketplace">
            <Button variant="outline" className="rounded-2xl border-2">
              Voir toutes les annonces
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-[2.5rem] h-96 animate-pulse" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {listings.map((listing, index) => (
              <motion.article
                key={listing.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 hover:shadow-primary/20 transition-all duration-500 overflow-hidden flex flex-col border border-gray-100"
              >
                <div className="relative h-64 overflow-hidden">
                  <Link href={`/listings/${listing.id}`} className="block h-full">
                    {listing.images?.[0] ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </Link>
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black uppercase text-gray-900 tracking-wider">Top Deal</span>
                    </div>
                  </div>

                  <button className="absolute top-4 right-4 w-10 h-10 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-900 shadow-xl">
                    <Heart className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-4 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                    <Link href={`/listings/${listing.id}`}>
                      <div className="glass px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-white transition-colors">
                        <Eye className="w-4 h-4 text-primary" />
                        APERÇU
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                      {listing.category_name || 'Divers'}
                    </span>
                  </div>
                  
                  <Link href={`/listings/${listing.id}`} className="block mb-2">
                    <h3 className="font-black text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-400">Prix local</p>
                      <p className="text-2xl font-black text-primary tracking-tighter">
                        {listing.price} <span className="text-sm">{listing.currency}</span>
                      </p>
                    </div>
                    {listing.seller_id && (
                      <Link href={`/messages?userId=${listing.seller_id}&listingId=${listing.id}`}>
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-primary group/msg transition-colors">
                          <MessageCircle className="w-6 h-6 text-gray-900 group-hover/msg:text-white transition-colors" />
                        </div>
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-primary" />
                    {listing.address || 'Gafsa, Tunisie'}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-primary/20">
            <Package className="w-20 h-20 text-primary/20 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Aucune annonce trouvée</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium italic">Soyez le premier à dynamiser le marché local !</p>
            <Link href="/listings/new">
              <Button size="lg" className="rounded-2xl shadow-primary/40">
                Lancer une annonce
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
