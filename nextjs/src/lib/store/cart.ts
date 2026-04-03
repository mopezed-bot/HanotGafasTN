// Simple cart store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Listing } from '@/types';

interface CartItem {
  listing: Listing;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (listing: Listing) => void;
  removeItem: (listingId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (listing: Listing) => {
        const items = get().items;
        const existing = items.find(item => item.listing.id === listing.id);
        
        if (existing) {
          set({
            items: items.map(item =>
              item.listing.id === listing.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { listing, quantity: 1 }] });
        }
      },
      
      removeItem: (listingId: string) => {
        set({
          items: get().items.filter(item => item.listing.id !== listingId),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.listing.price * item.quantity,
          0
        );
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'gafas-cart',
    }
  )
);
