'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  Eye, 
  MessageCircle,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Shield,
  Truck,
  RotateCcw,
  Loader2,
  CheckCircle,
  Zap,
  Tag
} from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase/client';
import { getListingById, incrementViewCount } from '@/lib/api/listings';
import type { ListingWithSeller } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingWithSeller | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (params.id) {
        const { data } = await getListingById(params.id as string);
        setListing(data);
        
        if (data) {
          await incrementViewCount(data.id);
          fetchReviews(data.id);
          
          if (currentUser) {
            const { data: favData } = await supabase
              .from('favorites')
              .select('id')
              .eq('user_id', currentUser.id)
              .eq('listing_id', data.id)
              .single();
            if (favData) setIsFavorite(true);
          }
        }
      }
      setIsLoading(false);
    };
    init();
  }, [params.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !listing) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: listing.seller_id,
      listing_id: listing.id,
      content: message,
    });
    if (!error) {
      setShowContactForm(false);
      setMessage('');
      alert('Message envoyé au vendeur !');
    }
    setSending(false);
  };

  const fetchReviews = async (listingId: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewText.trim() || !listing) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      listing_id: listing.id,
      reviewer_id: user.id,
      rating: reviewRating,
      comment: reviewText.trim(),
    });
    if (!error) {
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      fetchReviews(listing.id);
    }
    setSubmittingReview(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-400 font-black italic tracking-widest text-xs">RÉCUPÉRATION DE L'ANNONCE...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass p-12 rounded-[3rem] text-center max-w-md">
           <ShoppingBag className="w-16 h-16 text-primary/20 mx-auto mb-6" />
           <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Annonce Introuvable</h1>
           <p className="text-gray-500 font-bold mb-8">Désolé, cette annonce n'existe plus ou a été supprimée.</p>
           <Link href="/marketplace">
             <Button className="rounded-2xl w-full h-14">Retour au Marketplace</Button>
           </Link>
        </div>
      </div>
    );
  }

  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 group text-gray-500 font-black tracking-widest text-[10px] uppercase hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-primary/20 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            RETOUR
          </button>
          <div className="flex items-center gap-2">
             <button className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
             </button>
             <button 
               onClick={async () => {
                 if (!user) return router.push('/auth/login');
                 if (isFavorite) {
                   await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', listing.id);
                 } else {
                   await supabase.from('favorites').insert({ user_id: user.id, listing_id: listing.id });
                 }
                 setIsFavorite(!isFavorite);
               }}
               className={cn(
                 "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                 isFavorite ? "bg-red-50 text-red-500 shadow-lg shadow-red-500/20" : "glass text-gray-400 hover:text-red-400"
               )}
             >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
             </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Images */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="relative aspect-square glass rounded-[3rem] overflow-hidden border-primary/5 group">
              {images.length > 0 ? (
                <img 
                  src={images[selectedImage]} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-gray-200" />
                </div>
              )}

              {images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                   <button 
                    onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="w-12 h-12 glass rounded-2xl flex items-center justify-center pointer-events-auto hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                    className="w-12 h-12 glass rounded-2xl flex items-center justify-center pointer-events-auto hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}

              <div className="absolute top-6 left-6">
                 <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10">
                   {listing.condition || 'Occasion'}
                 </span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 border-2 transition-all duration-300",
                      i === selectedImage ? "border-primary scale-105 shadow-xl shadow-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Details */}
          <div className="space-y-10">
            <div>
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                   <Tag className="w-4 h-4 text-emerald-600" />
                 </div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{listing.category_name}</span>
                 <span className="w-1 h-1 rounded-full bg-gray-200" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                   <Eye className="w-3 h-3" /> {listing.view_count || 0} VUES
                 </span>
               </div>

               <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                 {listing.title}
               </h1>

               <div className="flex items-baseline gap-3">
                 <span className="text-5xl font-black text-primary tracking-tighter">{listing.price.toLocaleString()}</span>
                 <span className="text-xl font-black text-primary/50 tracking-tighter">DT</span>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="glass p-6 rounded-[2rem] border-primary/5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Localisation</p>
                    <p className="font-black text-gray-900 text-sm italic">{listing.address || 'Gafsa, Tunisie'}</p>
                  </div>
               </div>
               <div className="glass p-6 rounded-[2rem] border-primary/5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Publié le</p>
                    <p className="font-black text-gray-900 text-sm">{new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</h2>
               <div className="glass p-8 rounded-[2.5rem] border-primary/5">
                 <p className="text-gray-600 leading-relaxed font-bold">{listing.description || "Aucune description fournie."}</p>
               </div>
            </div>

            {/* Seller Shell */}
            <div className="space-y-4 pt-4">
               <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Propriétaire</h2>
               <div className="glass p-6 rounded-[2.5rem] border-primary/5 flex items-center gap-4 group">
                  {listing.seller_avatar ? (
                    <img src={listing.seller_avatar} alt="" className="w-16 h-16 rounded-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 leading-none mb-1 group-hover:text-primary transition-colors">{listing.seller_full_name || 'Vendeur Vérifié'}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Membre depuis {new Date(listing.seller_created_at || Date.now()).getFullYear()}</p>
                  </div>
                  <Link href={`/sellers/${listing.seller_id}`}>
                    <Button variant="glass" size="sm" className="rounded-xl">PROFIL</Button>
                  </Link>
               </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
               <Button 
                onClick={() => router.push('/checkout?listing=' + listing.id)}
                className="flex-1 h-20 rounded-[2rem] text-2xl group shadow-2xl shadow-primary/30"
               >
                 <ShoppingBag className="mr-3 w-6 h-6" />
                 ACHETER MAINTENANT
               </Button>
               {user?.id !== listing.seller_id && (
                 <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="w-20 h-20 rounded-[2rem] border-2 flex items-center justify-center p-0"
                    >
                      <MessageCircle className="w-8 h-8" />
                    </Button>
                    <Link href={`/messages?userId=${listing.seller_id}&listingId=${listing.id}`}>
                      <Button variant="secondary" className="h-20 px-8 rounded-[2rem] font-black italic tracking-wider">
                        OUVRIR CHAT
                      </Button>
                    </Link>
                 </div>
               )}
            </div>

            {/* Contact Form Popup/Drap */}
            <AnimatePresence>
               {showContactForm && (
                 <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="glass p-8 rounded-[2.5rem] border-primary/20 space-y-6"
                 >
                    <h3 className="font-black text-gray-900 italic">Envoyer un message au vendeur</h3>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Bonjour, je suis intéressé par votre annonce..."
                      rows={3}
                      className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                    />
                    <div className="flex gap-4">
                       <Button isLoading={sending} onClick={handleSendMessage} className="flex-1 rounded-xl">ENVOYER</Button>
                       <Button variant="glass" onClick={() => setShowContactForm(false)} className="rounded-xl px-6">ANNULER</Button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-100">
               {[
                 { icon: Shield, label: "Sécurisé", color: "text-emerald-500" },
                 { icon: Truck, label: "Livraison", color: "text-blue-500" },
                 { icon: RotateCcw, label: "Retours", color: "text-amber-500" }
               ].map((badge, i) => (
                 <div key={i} className="text-center group">
                    <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <badge.icon className={cn("w-6 h-6", badge.color)} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{badge.label}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 pt-24 border-t border-gray-100">
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">Avis Clients <span className="text-primary italic">.</span></h2>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{reviews.length} EXPÉRIENCES PARTAGÉES</p>
              </div>
              {user && user.id !== listing.seller_id && (
                <Button variant="glass" onClick={() => setShowReviewForm(!showReviewForm)} className="rounded-2xl h-14">
                  {showReviewForm ? 'ANNULER' : 'ÉCRIRE UN AVIS'}
                </Button>
              )}
           </div>

           <AnimatePresence>
              {showReviewForm && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-12"
                >
                  <div className="glass p-10 rounded-[3rem] border-primary/20 max-w-2xl">
                    <h3 className="font-black text-gray-900 italic mb-6">Votre expérience</h3>
                    <div className="flex items-center gap-2 mb-8">
                       {[1,2,3,4,5].map(s => (
                         <button key={s} onClick={() => setReviewRating(s)} className="p-1 hover:scale-110 transition-transform">
                            <Star className={cn("w-8 h-8 transition-colors", s <= reviewRating ? "text-primary fill-primary" : "text-gray-200")} />
                         </button>
                       ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Partagez votre avis sur ce produit..."
                      rows={4}
                      className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-3xl p-6 text-sm font-bold focus:outline-none transition-all mb-8"
                    />
                    <Button isLoading={submittingReview} onClick={handleSubmitReview} className="rounded-2xl h-14 px-12">PUBLIER L'AVIS</Button>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((rev, i) => (
                <motion.div 
                  key={rev.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-8 rounded-[2.5rem] border-primary/5 hover:border-primary/20 transition-all group"
                >
                   <div className="flex items-center gap-4 mb-6">
                      {rev.profiles?.avatar_url ? (
                        <img src={rev.profiles.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-gray-900 leading-none mb-1">{rev.profiles?.full_name || 'Anonyme'}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-3 h-3", i < rev.rating ? "text-primary fill-primary" : "text-gray-200")} />
                          ))}
                        </div>
                      </div>
                   </div>
                   <p className="text-gray-600 font-bold italic line-clamp-4 leading-relaxed mb-6">"{rev.comment}"</p>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(rev.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
              {reviews.length === 0 && (
                <div className="col-span-full py-20 glass rounded-[3rem] border-dashed border-2 border-gray-100 flex flex-col items-center justify-center text-center p-8">
                   <Star className="w-16 h-16 text-gray-100 mb-6" />
                   <p className="text-gray-400 font-black italic tracking-widest text-xs uppercase">AUCUN AVIS POUR LE MOMENT</p>
                   <p className="text-gray-300 font-bold mt-2">Soyez le premier à partager votre expérience !</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
