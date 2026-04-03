'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  MoreVertical,
  Activity
} from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
  });
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const [usersRes, listingsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('*'),
        supabase.from('orders').select('*'),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalListings: listingsRes.data?.length || 0,
        activeListings: listingsRes.data?.filter(l => l.is_active && !l.is_sold).length || 0,
        totalOrders: ordersRes.data?.length || 0,
      });

      setListings(listingsRes.data || []);
      setOrders(ordersRes.data || []);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    await supabase.from('listings').delete().eq('id', id);
    setListings(listings.filter(l => l.id !== id));
  };

  const handleToggleListing = async (id: string, isActive: boolean) => {
    await supabase.from('listings').update({ is_active: !isActive }).eq('id', id);
    setListings(listings.map(l => l.id === id ? { ...l, is_active: !isActive } : l));
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-gray-400 font-black italic tracking-widest text-[10px] uppercase">Chargement du panneau de contrôle...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'VUE D\'ENSEMBLE', icon: LayoutDashboard },
    { id: 'listings', label: 'ANNONCES', icon: Package },
    { id: 'orders', label: 'COMMANDES', icon: ShoppingBag },
    { id: 'users', label: 'UTILISATEURS', icon: Users },
    { id: 'settings', label: 'PARAMÈTRES', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Admin Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 w-fit mb-4">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Accès Administrateur</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-2">
                Administration <span className="text-primary italic">.</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
                GÉRER LE MARCHÉ DU BASSIN MINIER
              </p>
           </div>
           
           <div className="flex items-center gap-4 px-6 py-3 glass rounded-[1.5rem] border-primary/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Système Opérationnel</span>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
           {[
             { label: "Utilisateurs", val: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
             { label: "Annonces Actives", val: stats.activeListings, icon: Package, color: "text-amber-600", bg: "bg-amber-100" },
             { label: "Commandes", val: stats.totalOrders, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-100" },
             { label: "Revenu Total", val: `${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()} DT`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" }
           ].map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass p-8 rounded-[2.5rem] border-primary/5 hover:-translate-y-1 transition-all duration-300 group"
             >
                <div className="flex items-center justify-between mb-4">
                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", stat.bg, stat.color)}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <Activity className="w-4 h-4 text-gray-200" />
                </div>
                <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">{stat.val}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
             </motion.div>
           ))}
        </div>

        {/* Main Content Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
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
                  <tab.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="font-black tracking-widest text-[10px] uppercase">{tab.label}</span>
                </div>
                <ChevronRight className={cn("w-3 h-3 opacity-50", activeTab === tab.id ? "block" : "hidden md:block")} />
              </button>
            ))}
          </div>

          {/* Dynamic Content Panel */}
          <div className="lg:col-span-4">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.2 }}
               >
                 {activeTab === 'overview' && (
                   <div className="grid md:grid-cols-2 gap-8">
                     <div className="glass p-10 rounded-[3rem] border-primary/5">
                       <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-8 italic">Dernières Commandes</h3>
                       <div className="space-y-4">
                         {orders.slice(0, 5).map(order => (
                           <div key={order.id} className="flex items-center justify-between p-5 bg-white/50 rounded-3xl border border-gray-50 hover:border-primary/20 transition-all">
                             <div>
                               <p className="font-black text-gray-900 leading-none mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                             </div>
                             <div className="text-right">
                               <p className="font-black text-primary italic">{order.total} DT</p>
                               <span className={cn(
                                 "text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest",
                                 order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                               )}>
                                 {order.status}
                               </span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>

                     <div className="glass p-10 rounded-[3rem] border-primary/5">
                       <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-8 italic">Recentes Annonces</h3>
                       <div className="space-y-4">
                         {listings.slice(0, 5).map(listing => (
                           <div key={listing.id} className="flex items-center justify-between p-5 bg-white/50 rounded-3xl border border-gray-50 hover:border-primary/20 transition-all group">
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                 {listing.images?.[0] && (
                                   <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                 )}
                               </div>
                               <div>
                                 <p className="font-black text-gray-900 leading-snug line-clamp-1 max-w-[150px]">{listing.title}</p>
                                 <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest">{listing.price} DT</p>
                               </div>
                             </div>
                             <span className={cn(
                               "text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest",
                               listing.is_sold ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600'
                             )}>
                               {listing.is_sold ? 'Vendu' : 'Actif'}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 )}

                 {activeTab === 'listings' && (
                   <div className="glass rounded-[3.5rem] border-primary/5 overflow-hidden">
                     <div className="p-8 border-b border-gray-100 flex items-center justify-between gap-6">
                        <div className="relative flex-1 group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                          <input
                            type="text"
                            placeholder="Chercher une annonce par titre ou ID..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-xs font-bold focus:outline-none transition-all placeholder:text-gray-300"
                          />
                        </div>
                        <Button variant="glass" className="rounded-2xl h-12 px-6"><Filter className="w-4 h-4 mr-2" /> FILTRER</Button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50/50">
                              <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Article</th>
                              <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Prix</th>
                              <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Status</th>
                              <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Vues</th>
                              <th className="text-center p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {listings.map(listing => (
                              <tr key={listing.id} className="hover:bg-primary/5 transition-colors group">
                                <td className="p-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                      {listing.images?.[0] && (
                                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <span className="font-black text-gray-900 tracking-tight line-clamp-1">{listing.title}</span>
                                  </div>
                                </td>
                                <td className="p-6 font-black text-primary italic tracking-tight">{listing.price} DT</td>
                                <td className="p-6">
                                  <span className={cn(
                                    "text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest",
                                    listing.is_sold ? 'bg-red-50 text-red-500' : 
                                    listing.is_active ? 'bg-emerald-50 text-emerald-600' : 
                                    'bg-gray-100 text-gray-400'
                                  )}>
                                    {listing.is_sold ? 'Vendu' : listing.is_active ? 'Actif' : 'Bloqué'}
                                  </span>
                                </td>
                                <td className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">{listing.view_count || 0} Vues</td>
                                <td className="p-6">
                                  <div className="flex justify-center gap-2">
                                    <button onClick={() => handleToggleListing(listing.id, listing.is_active)} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white transition-all"><Eye className="w-5 h-5" /></button>
                                    <button onClick={() => handleDeleteListing(listing.id)} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-5 h-5" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                   </div>
                 )}

                 {activeTab === 'orders' && (
                   <div className="glass rounded-[3.5rem] border-primary/5 overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">ID Commande</th>
                            <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Client</th>
                            <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Total</th>
                            <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">État</th>
                            <th className="text-left p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Date</th>
                            <th className="text-center p-6 text-[10px] uppercase font-black text-gray-400 tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                              <td className="p-6 font-black text-gray-400 text-xs tracking-tight uppercase italic">#{order.id.slice(0, 8)}</td>
                              <td className="p-6 font-black text-gray-900 tracking-tight">{order.shipping_address?.split(',')[0] || 'Inconnu'}</td>
                              <td className="p-6 font-black text-primary italic tracking-tight">{order.total} DT</td>
                              <td className="p-6">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-2 border-transparent bg-gray-100/50 hover:bg-white focus:border-primary focus:outline-none cursor-pointer transition-all appearance-none text-center"
                                >
                                  <option value="pending">En Attente</option>
                                  <option value="paid">Payée</option>
                                  <option value="shipped">Expédiée</option>
                                  <option value="delivered">Livrée</option>
                                  <option value="cancelled">Annulée</option>
                                </select>
                              </td>
                              <td className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-6">
                                <div className="flex justify-center">
                                  <button className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
