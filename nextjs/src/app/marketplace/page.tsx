'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  MessageCircle,
  Grid, 
  List, 
  Plus,
  ChevronDown,
  X,
  SlidersHorizontal,
  Loader2,
  Star,
  ShoppingBag,
  Utensils,
  Heart,
  Eye,
  Zap
} from 'lucide-react';

// API & Types
import { getListings, getListingsNearby } from '@/lib/api/listings';
import { getCategoriesTree } from '@/lib/api/categories';
import { getRestaurants } from '@/lib/api/restaurants';
import type { ListingWithSeller, CategoryWithChildren, RestaurantWithOwner, ListingFilters, GeoPoint } from '@/types';
import { getCurrentUser } from '@/lib/supabase/client';

// Components
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Dynamic import for MapSearch
const MapSearch = dynamic(() => import('@/components/map/MapSearch'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] glass rounded-[2.5rem] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-gray-500 font-bold">Chargement de la carte...</span>
      </div>
    </div>
  ),
});

type ViewMode = 'grid' | 'list' | 'map';
type ContentType = 'all' | 'listings' | 'restaurants';

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  // State
  const [contentType, setContentType] = useState<ContentType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantWithOwner[]>([]);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [condition, setCondition] = useState<string[]>([]);

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 34.31, lng: 8.23 });
        }
      );
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await getCategoriesTree();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch data base on filters
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    const filters: ListingFilters = {
      searchQuery: searchQuery || undefined,
      categoryId: selectedCategory || undefined,
      sortBy: sortBy as ListingFilters['sortBy'],
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
      condition: condition.length > 0 ? condition as any : undefined,
    };

    try {
      if (contentType === 'all' || contentType === 'listings') {
        let listingsResult;
        if (userLocation && (sortBy === 'distance')) {
          listingsResult = await getListingsNearby(userLocation, 50000, selectedCategory || undefined);
        } else {
          listingsResult = await getListings(filters);
        }
        setListings(listingsResult.data || []);
      }

      if (contentType === 'all' || contentType === 'restaurants') {
        const { data: restaurantsData } = await getRestaurants();
        setRestaurants(restaurantsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contentType, searchQuery, selectedCategory, sortBy, priceRange, condition, userLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
    setCondition([]);
  };

  const hasActiveFilters = searchQuery || selectedCategory || priceRange.min || priceRange.max || condition.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none">
              Le <span className="text-primary italic">Marketplace.</span>
            </h1>
            <p className="text-lg text-gray-500 mt-4 font-bold max-w-xl">
              Explorez les meilleures offres de <span className="text-primary italic">Gafsa, Moulares et Redeyef</span>. 
              Vérifiées et prêtes pour vous.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl shrink-0"
          >
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all",
                viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Grid className="w-4 h-4" />
              GRILLE
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all",
                viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <List className="w-4 h-4" />
              LISTE
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all",
                viewMode === 'map' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <MapPin className="w-4 h-4" />
              CARTE
            </button>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide">
             {[
               { id: 'all', label: 'Tout Explorer', icon: Grid },
               { id: 'listings', label: 'Produits', icon: ShoppingBag },
               { id: 'restaurants', label: 'Restaurants', icon: Utensils }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setContentType(tab.id as any)}
                 className={cn(
                   "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap",
                   contentType === tab.id ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                 )}
               >
                 <tab.icon className="w-4 h-4" />
                 {tab.label.toUpperCase()}
               </button>
             ))}
          </div>

          <div className="flex-1" />

          <Button 
            variant={showFilters ? 'primary' : 'glass'} 
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-2xl"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            FILTRES {hasActiveFilters && <span className="ml-2 bg-white text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px]">!</span>}
          </Button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="glass p-8 rounded-[2.5rem] border-primary/10 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3 block">Catégorie</label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none transition-all"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3 block">Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none transition-all"
                  >
                    <option value="newest">Plus récent</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3 block">Gamme de Prix (DT)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="flex-1 bg-white/50 border-2 border-transparent focus:border-primary rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none transition-all"
                    />
                    <span className="text-gray-300">à</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="flex-1 bg-white/50 border-2 border-transparent focus:border-primary rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-gray-400 font-black italic tracking-widest text-xs">RÉCUPÉRATION DES MEILLEURES OFFRES...</p>
          </div>
        ) : viewMode === 'map' ? (
          <MapSearch 
            initialCenter={userLocation || undefined}
            categoryId={selectedCategory || undefined}
          />
        ) : (
          <div className={cn(
            "grid gap-8",
            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
          )}>
            {/* Empty State */}
            {!isLoading && listings.length === 0 && restaurants.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-32 text-center glass rounded-[4rem] border-primary/5 flex flex-col items-center justify-center gap-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center animate-bounce">
                  <ShoppingBag className="w-12 h-12 text-primary/40" />
                </div>
                <div>
                   <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic mb-4 uppercase">Le Futur est <span className="text-primary">à Vous.</span></h2>
                   <p className="text-lg text-gray-400 font-bold max-w-lg mx-auto">
                     Le marketplace s'apprête à accueillir les meilleures offres de Gafsa. 
                     Soyez le premier à dynamiser le commerce local !
                   </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                   <Link href="/listings/new">
                    <Button size="lg" className="rounded-3xl shadow-xl shadow-primary/20 px-12 h-20 text-2xl group">
                      <Plus className="mr-3 w-8 h-8 group-hover:rotate-90 transition-transform" />
                      CRÉER UNE ANNONCE
                    </Button>
                   </Link>
                </div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic mt-8">PAS D'ANNONCES POUR LE MOMENT • SOYEZ LE PREMIER</p>
              </motion.div>
            )}

            {/* List/Grid Results */}
            {listings.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "group glass rounded-[2.5rem] overflow-hidden border-primary/5 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500",
                  viewMode === 'list' ? "flex flex-col md:flex-row h-auto md:h-64" : "h-full"
                )}
              >
                <div className={cn(
                  "relative overflow-hidden",
                   viewMode === 'list' ? "w-full md:w-80 h-64 md:h-full shrink-0" : "aspect-square w-full"
                )}>
                  <Link href={`/listings/${item.id}`} className="block h-full">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </Link>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary tracking-widest border border-primary/10">
                    {item.condition || 'Occasion'}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{item.category_name}</span>
                  </div>
                  
                  <Link href={`/listings/${item.id}`}>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-none mb-4">
                      {item.title}
                    </h3>
                  </Link>
                  
                  {viewMode === 'list' && (
                    <p className="text-gray-500 font-medium line-clamp-2 mb-6">{item.description}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-6">
                    <div>
                      <p className="text-2xl font-black text-primary tracking-tighter">
                        {item.price} <span className="text-sm">DT</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                       <Link href={`/listings/${item.id}`} className="w-11 h-11 glass rounded-xl flex items-center justify-center hover:bg-white transition-colors">
                        <Eye className="w-5 h-5 text-gray-500" />
                       </Link>
                       {item.seller_id && (
                         <Link href={`/messages?userId=${item.seller_id}&listingId=${item.id}`} className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20">
                          <MessageCircle className="w-5 h-5 text-white" />
                         </Link>
                       )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
