// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dovepeak Quotation Master',
  description:
    'Dovepeak Quotation Master is a powerful tool for businesses to effortlessly generate, customize, and manage quotations — with analytics, templates, and business profile support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <div className="pt-16 lg:pl-64 min-h-screen bg-gray-50">
          <main className="px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
