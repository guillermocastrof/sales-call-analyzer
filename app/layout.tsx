import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sales Call Analyzer',
  description: 'AI-powered sales call analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0C0C0C] text-white min-h-screen`}>
        <nav className="border-b border-[#1E1E1E] bg-[#0C0C0C] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="text-white font-semibold text-lg flex items-center gap-2">
              <span className="text-[#7C3AED]">▶</span> Sales Analyzer
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-[#A0A0A0] hover:text-white text-sm transition-colors">Dashboard</Link>
              <Link href="/calls" className="text-[#A0A0A0] hover:text-white text-sm transition-colors">All Calls</Link>
              <Link href="/webhook" className="text-[#A0A0A0] hover:text-white text-sm transition-colors">Webhook</Link>
              <Link href="/upload" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
                + Upload Call
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
