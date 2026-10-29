import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import WalletProvider from '@/components/wallet/WalletProvider';
import DisconnectWatcher from '@/components/app/DisconnectWatcher';
import { StoreProvider } from '@/lib/store';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HopFlow — Payments that move themselves',
  description:
    'Automate payments across wallets, teams, and tokens with programmable on-chain routes on MultiHopper (Solana).',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'HopFlow — Payments that move themselves',
    description:
      'Automate payments across wallets, teams, and tokens with programmable on-chain routes on MultiHopper (Solana).',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-bg text-text font-sans antialiased selection:bg-solanaPurple selection:text-white">
        <WalletProvider>
          <DisconnectWatcher />
          <StoreProvider>{children}</StoreProvider>
        </WalletProvider>
      </body>
    </html>
  );
}