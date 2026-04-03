'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  ShoppingBag, 
  Heart, 
  Settings,
  Edit,
  Plus,
  Package,
  Loader2,
  Trash2,
  Eye,
  Star,
  MessageCircle,
  TrendingUp,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase/client';
import { getListingsBySeller, deleteListing } from '@/lib/api/listings';
import type { Profile, Listing } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [settingsForm, setSettingsForm] = useState({
    full_name: '',
    username: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return router.push('/auth/login');
    setUser(currentUser);
    
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (profileData) {
      setProfile(profileData);
      setSettingsForm({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
      });
    }

    const { data: listingsData } = await getListingsBySeller(currentUser.id);
    setListings(listingsData || []);
    
    const { data: ordersData } = await supabase.from('orders').select('*, order_items(*, listings(*))').eq('buyer_id', currentUser.id).order('created_at', { ascending: false });
    setOrders(ordersData || []);
    
    const { data: favoritesData } = await supabase.from('favorites').select('*, listings(*)').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    setFavorites(favoritesData || []);
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { data, error } = await supabase.from('profiles').update({ ...settingsForm, id: user.id, updated_at: new Date().toISOString() }).eq('id', user.id).select('*').single();
    if (error) return alert('Erreur: ' + error.message);
    setProfile(data);
    alert('Paramètres mis à jour');
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette annonce ?')) return;
    const { error } = await deleteListing(listingId);
    if (error) return alert('Erreur: ' + error.message);
    setListings(listings.filter(l => l.id !== listingId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-400 font-black italic tracking-widest text-xs uppercase">Chargement du profil...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'listings', label: 'ANNONCES', icon: ShoppingBag, count: listings.length },
    { id: 'orders', label: 'COMMANDES', icon: Package, count: orders.length },
    { id: 'favorites', label: 'FAVORIS', icon: Heart, count: favorites.length },
    { id: 'settings', label: 'PARAMÈTRES', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Profile Info Header (Simplified since root layout has global header) */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pb-12 border-b border-gray-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-40 h-40 rounded-full object-cover relative z-10 border-4 border-white shadow-2xl" />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center relative z-10 border-4 border-white shadow-2xl">
                    <User className="w-16 h-16 text-primary" />
                  </div>
                )}
                <button className="absolute bottom-2 right-2 z-20 bg-white text-primary p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4">
                  {profile?.full_name || 'Votre Profil'} <span className="text-primary italic">.</span>
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">{profile?.username || '@tunisien'}</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Membre Vérifié
                  </span>
                </div>
              </div>
            </div>

            <Button variant="glass" onClick={handleLogout} className="rounded-2xl h-14 px-8 border-primary/10">
              <LogOut className="w-4 h-4 mr-2" /> DÉCONNEXION
            </Button>
          </motion.div>
        </div>

        {/* Dash Performance (Visual Wow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <div className="glass p-8 rounded-[2.5rem] border-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-emerald-600 tracking-widest">+12%</span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{orders.reduce((acc, o) => acc + (o.total_amount || 0), 0).toLocaleString()} <span className="text-sm">DT</span></p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ventes Totales</p>
           </div>
           <div className="glass p-8 rounded-[2.5rem] border-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-blue-600 tracking-widest">EN COURS</span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{listings.length}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Annonces Actives</p>
           </div>
           <div className="glass p-8 rounded-[2.5rem] border-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-primary tracking-widest">STABLE</span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{favorites.length}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Items Sauvegardés</p>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Tabs */}
          <div className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "glass hover:bg-white text-gray-400 hover:text-gray-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  <span className="font-black tracking-widest text-[10px] uppercase">{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="lg:col-span-3">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.2 }}
               >
                 {activeTab === 'listings' && (
                   <div className="space-y-8">
                     <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Mes Annonces <span className="text-primary italic">.</span></h2>
                        <Link href="/listings/new">
                          <Button size="sm" className="rounded-xl"><Plus className="w-4 h-4 mr-2" /> AJOUTER</Button>
                        </Link>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {listings.map(l => (
                          <div key={l.id} className="glass p-6 rounded-[2.5rem] border-primary/5 flex gap-6 group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                               {l.images?.[0] ? (
                                 <img src={l.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                               ) : (
                                 <div className="w-full h-full bg-gray-50 flex items-center justify-center"><ShoppingBag className="text-gray-200" /></div>
                               )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                               <h3 className="font-black text-gray-900 line-clamp-1 mb-1">{l.title}</h3>
                               <p className="text-xl font-black text-primary tracking-tighter mb-4">{l.price} DT</p>
                               <div className="flex gap-2">
                                  <Link href={`/listings/${l.id}`} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white transition-colors"><Eye className="w-4 h-4" /></Link>
                                  <button onClick={() => handleDeleteListing(l.id)} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </div>
                          </div>
                        ))}
                        {listings.length === 0 && (
                          <div className="col-span-full py-20 glass rounded-[2.5rem] border-dashed border-2 border-gray-100 flex flex-col items-center justify-center">
                             <Plus className="w-12 h-12 text-gray-100 mb-4" />
                             <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">AUCUNE ANNONCE ACTIVE</p>
                             <Link href="/listings/new" className="mt-4"><Button variant="glass" size="sm" className="rounded-xl">CRÉER MAINTENANT</Button></Link>
                          </div>
                        )}
                     </div>
                   </div>
                 )}

                 {activeTab === 'orders' && (
                   <div className="space-y-8">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Historique de Commandes <span className="text-primary italic">.</span></h2>
                      <div className="space-y-4">
                        {orders.map(order => (
                          <div key={order.id} className="glass p-8 rounded-[2.5rem] border-primary/5">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                               <div>
                                 <p className="text-sm font-black text-gray-900 tracking-tighter">Commande #{order.id.slice(0, 8).toUpperCase()}</p>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                               </div>
                               <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full italic",
                                 order.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                               )}>
                                 {order.status}
                               </span>
                             </div>

                             <div className="space-y-4 mb-4">
                                {order.order_items?.map((item: any) => (
                                  <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                                           {item.listings?.images?.[0] && <img src={item.listings.images[0]} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                          <p className="font-black text-gray-900 text-sm line-clamp-1">{item.listings?.title || 'Produit'}</p>
                                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Quantité: {item.quantity}</p>
                                        </div>
                                     </div>
                                     <p className="font-black text-primary tracking-tighter text-lg">{item.price} DT</p>
                                  </div>
                                ))}
                             </div>

                             <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total payé</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">{order.total_amount} DT</p>
                             </div>
                          </div>
                        ))}
                        {orders.length === 0 && (
                          <div className="py-20 glass rounded-[2.5rem] flex flex-col items-center justify-center">
                             <Package className="w-12 h-12 text-gray-100 mb-4" />
                             <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">PAS DE COMMANDES ENCORE</p>
                          </div>
                        )}
                      </div>
                   </div>
                 )}

                 {activeTab === 'favorites' && (
                   <div className="space-y-8">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Mes Coups de Coeur <span className="text-primary italic">.</span></h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {favorites.map(fav => (
                          <Link key={fav.id} href={`/listings/${fav.listing_id}`} className="group relative block aspect-[4/3] glass rounded-[2.5rem] overflow-hidden border-primary/5">
                             {fav.listings?.images?.[0] ? (
                               <img src={fav.listings.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             ) : (
                               <div className="w-full h-full bg-gray-50 flex items-center justify-center"><Heart className="text-gray-200" /></div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-white font-black text-lg line-clamp-1 mb-1 tracking-tight">{fav.listings?.title}</h3>
                                <p className="text-primary font-black tracking-tighter text-xl italic">{fav.listings?.price} DT</p>
                             </div>
                             <button 
                               onClick={async (e) => { e.preventDefault(); await supabase.from('favorites').delete().eq('id', fav.id); setFavorites(favorites.filter(f => f.id !== fav.id)); }}
                               className="absolute top-6 right-6 w-12 h-12 glass rounded-2xl flex items-center justify-center text-red-500 hover:scale-110 transition-transform"
                             >
                                <Heart className="w-5 h-5 fill-current" />
                             </button>
                          </Link>
                        ))}
                      </div>
                   </div>
                 )}

                 {activeTab === 'settings' && (
                   <div className="space-y-8">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Configuration du Compte <span className="text-primary italic">.</span></h2>
                      <div className="glass p-10 rounded-[3rem] border-primary/5 space-y-8">
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Nom Complet</label>
                                <input type="text" value={settingsForm.full_name} onChange={(e) => setSettingsForm({ ...settingsForm, full_name: e.target.value })} className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Username</label>
                                <input type="text" value={settingsForm.username} onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })} className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all" />
                              </div>
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">WhatsApp (+216)</label>
                             <input type="tel" value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Bio / Description</label>
                             <textarea rows={4} value={settingsForm.bio} onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })} className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-3xl p-6 text-sm font-bold focus:outline-none transition-all resize-none" />
                           </div>
                           <Button type="submit" className="rounded-2xl h-14 px-12 italic tracking-wider">SAUVEGARDER LES MODIFICATIONS</Button>
                        </form>
                      </div>
                   </div>
                 )}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
