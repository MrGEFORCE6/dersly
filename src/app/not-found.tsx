import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b transition-colors glass-nav">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Dersly
          </span>
        </Link>
      </header>

      {/* 404 Center */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-slate-800 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-6xl font-black text-indigo-500 font-mono block">404</span>
            <h1 className="text-2xl font-black text-white">Sayfa Bulunamadı</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aradığınız sayfa taşınmış, silinmiş veya geçici olarak kullanım dışı kalmış olabilir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Ana Sayfaya Dön</span>
            </Link>
            <Link
              href="/help"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 inline-flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Yardım Merkezi</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Yeni Nesil Özel Ders Yönetim Platformu
      </footer>
    </div>
  );
}
