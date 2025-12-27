import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { StacksProvider } from '@/context/StacksContext';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Stacks Capsule - Decentralized Time-Locked Assets on Bitcoin',
  description: 'Lock STX tokens with Bitcoin block-height based time locks. Secure, trustless, and powered by Stacks.',
  keywords: ['Stacks', 'Bitcoin', 'STX', 'Time Lock', 'Crypto', 'DeFi', 'Blockchain'],
  authors: [{ name: 'Stacks Capsule Team' }],
  openGraph: {
    title: 'Stacks Capsule',
    description: 'Decentralized Time-Locked Assets on Bitcoin',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="animated-gradient grid-pattern min-h-screen font-sans">
        <StacksProvider>
          {children}
        </StacksProvider>
      </body>
    </html>
  );
}
