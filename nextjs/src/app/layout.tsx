import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'HannaShop - Le Marketplace du Bassin Minier',
  description:
    'Achetez and vendez localement à Gafsa, Moulares, Redeyef et Metlaoui. Rapide, simple et sécurisé.',
  keywords: ['tunisie', 'gafsa', 'moulares', 'redeyef', 'metlaoui', 'marketplace', 'hannashop', 'e-commerce'],
  authors: [{ name: 'HannaShop' }],
  openGraph: {
    title: 'HannaShop - Marketplace local Gafsa',
    description: 'Le futur du commerce local dans le bassin minier tunisien.',
    url: 'https://hannashop.netlify.app',
    siteName: 'HannaShop',
    locale: 'fr_TN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HannaShop - Marketplace local Gafsa',
    description: 'Achetez et vendez facilement dans le bassin minier.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#CC5500',
};

import MainLayout from '@/components/layout/MainLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={cairo.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
