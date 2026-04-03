'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  MapPin,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  Package,
  Plus,
  CheckCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '@/lib/supabase/client';
import { createListing } from '@/lib/api/listings';
import { getCategories } from '@/lib/api/categories';
import type { ListingCondition, Category, GeoPoint } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ListingFormProps {
  userId?: string;
  onSuccess?: () => void;
}

const CONDITIONS: { value: ListingCondition; label: string; description: string }[] = [
  { value: 'new', label: 'Neuf', description: 'Jamais utilisé, emballage original' },
  { value: 'like-new', label: 'Comme Neuf', description: 'Utilisé une ou deux fois' },
  { value: 'good', label: 'Bon État', description: 'Légères traces, fonctionne parfaitement' },
  { value: 'fair', label: 'Correct', description: 'Traces visibles, mais fonctionnel' },
  { value: 'poor', label: 'État Moyen', description: 'Peut nécessiter des réparations' },
];

const MAIN_PLACES: { name: string; location: GeoPoint }[] = [
  { name: 'Moulares, Gafsa', location: { lat: 34.204, lng: 8.273 } },
  { name: 'Redeyef, Gafsa', location: { lat: 34.382, lng: 8.156 } },
];

export default function ListingForm({ userId, onSuccess }: ListingFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TND');
  const [condition, setCondition] = useState<ListingCondition>('good');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [address, setAddress] = useState('Moulares, Gafsa');
  const [location, setLocation] = useState<GeoPoint | null>(MAIN_PLACES[0].location);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completionSteps = [
    images.length > 0,
    title.trim().length > 3,
    !!price && parseFloat(price) > 0,
    !!categoryId,
    address.trim().length > 2,
    phoneNumber.trim().length > 7,
  ];
  const completion = Math.round((completionSteps.filter(Boolean).length / completionSteps.length) * 100);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length + images.length > 5) {
        setError('Maximum 5 images autorisées');
        return;
      }

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setImages((prev) => [...prev, ...files]);
    },
    [images]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setMainPlace = (placeName: string) => {
    const selected = MAIN_PLACES.find((place) => place.name === placeName);
    if (selected) {
      setAddress(selected.name);
      setLocation(selected.location);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!title.trim()) throw new Error('Le titre est requis');
      if (!price || parseFloat(price) <= 0) throw new Error('Un prix valide est requis');
      if (!phoneNumber.trim()) throw new Error('Un numéro de téléphone est requis');
      if (images.length === 0) throw new Error('Au moins une image est requise');

      let sellerId = userId;
      if (!sellerId) {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/auth/login?redirect=/listings/new');
          return;
        }
        sellerId = user.id;
      }

      const { data: listing, error: createError } = await createListing(
        {
          seller_id: sellerId,
          title: title.trim(),
          description: description.trim() || undefined,
          price: parseFloat(price),
          currency,
          condition,
          category_id: categoryId || undefined,
          location: location ? `POINT(${location.lng} ${location.lat})` : undefined,
          address: address.trim() || undefined,
          phone_number: phoneNumber.trim(),
        },
        images
      );

      if (createError) throw createError;

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/listings/${listing?.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Échec de la création de l'annonce");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenLocationPicker = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setAddress('Ma Position Actuelle');
        },
        () => {
          setLocation(MAIN_PLACES[0].location);
          setAddress(MAIN_PLACES[0].name);
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 text-red-600 px-6 py-4 rounded-3xl border border-red-100 font-bold flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          {error}
        </motion.div>
      )}

      {/* Completion Tracker */}
      <div className="glass p-8 rounded-[2.5rem] border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Progression de l'annonce</p>
            <span className="text-lg font-black text-primary italic">{completion}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              className="h-full bg-primary"
             />
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-4 italic">
            Astuce: Des photos claires et une localisation exacte attirent <span className="text-primary">3x plus d'acheteurs</span>.
          </p>
        </div>
      </div>

      {/* Sections Wrapper */}
      <div className="space-y-6">
        
        {/* Photos Section */}
        <div className="glass p-8 rounded-[3rem] border-primary/5 space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Photos de l'item <span className="text-red-500">*</span></h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {imagePreviews.map((preview, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-primary/5 group"
                >
                  <img src={preview} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur text-red-500 rounded-xl p-2 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 right-2 bg-primary/90 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center rounded-lg backdrop-blur">
                      Image Principale
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {images.length < 5 && (
              <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Plus className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3 group-hover:text-primary transition-colors">Ajouter</span>
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="glass p-8 rounded-[3rem] border-primary/5 space-y-8">
           <div className="flex items-center gap-3 ml-2">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Informations de base</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Titre de l'annonce <span className="text-red-500">*</span></label>
               <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: iPhone 13 Pro Max - État Neuf"
                maxLength={100}
                required
                className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Prix <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 pr-24 text-sm font-bold focus:outline-none transition-all"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary/10 rounded-xl text-primary font-black italic text-xs">
                       DT
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Catégorie</label>
                  <select
                    value={categoryId || ''}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parent_id ? '↳ ' : ''}{cat.name}
                      </option>
                    ))}
                  </select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Numéro de Téléphone (WhatsApp) <span className="text-red-500">*</span></label>
               <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 55 123 456"
                required
                className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
              />
              <p className="text-[10px] text-gray-400 font-bold italic ml-1">Les acheteurs pourront vous contacter directement sur WhatsApp.</p>
            </div>
          </div>
        </div>

        {/* Condition & Description */}
        <div className="glass p-8 rounded-[3rem] border-primary/5 space-y-8">
           <div className="flex items-center gap-3 ml-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">État & Détails</h2>
          </div>

          <div className="space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">État de l'objet <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.value}
                      type="button"
                      onClick={() => setCondition(cond.value)}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-center transition-all group",
                        condition === cond.value
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-transparent bg-white/50 hover:border-primary/20"
                      )}
                    >
                      <p className={cn("text-[10px] font-black uppercase tracking-wider mb-1", condition === cond.value ? "text-primary" : "text-gray-600")}>{cond.label}</p>
                      <p className="text-[8px] font-bold text-gray-400 leading-tight">{cond.description}</p>
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Description détaillée</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre item en détail (taille, marque, défauts éventuels...)"
                  rows={6}
                  className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-[2rem] p-6 text-sm font-bold focus:outline-none transition-all resize-none"
                />
             </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="glass p-8 rounded-[3rem] border-primary/5 space-y-8">
           <div className="flex items-center gap-3 ml-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Zone de Vente</h2>
          </div>

          <div className="space-y-6">
             <div className="flex flex-wrap gap-2">
                {MAIN_PLACES.map((place) => (
                  <button
                    key={place.name}
                    type="button"
                    onClick={() => setMainPlace(place.name)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      address === place.name ? "bg-primary text-white shadow-lg" : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    {place.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleOpenLocationPicker}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all flex items-center gap-2"
                >
                  <MapPin className="w-3 h-3" /> MA POSITION
                </button>
             </div>

             <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Entrez le quartier ou l'adresse précise"
                  className="w-full bg-white/50 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col items-center">
         <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full md:w-auto md:px-24 h-20 rounded-[2.5rem] text-2xl group shadow-2xl shadow-primary/30"
        >
          {isSubmitting ? 'CRÉATION...' : 'PUBLIER MON ANNONCE'}
          <ChevronRight className="ml-3 w-8 h-8 group-hover:translate-x-1 transition-transform" />
         </Button>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 italic">En publiant, vous acceptez nos conditions d'utilisation.</p>
      </div>
    </form>
  );
}
