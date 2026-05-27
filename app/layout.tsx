import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'shopping-list',
  description: 'Sélection de produits pour préparer une future commande'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body style={{ fontFamily: 'var(--font-manrope)' }} className="antialiased">
        {children}
      </body>
    </html>
  );
}
