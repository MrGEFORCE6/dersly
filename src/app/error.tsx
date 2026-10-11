'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dersly unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <main id="main-content" className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl glass-panel border border-slate-800 space-y-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Beklenmeyen Bir Hata Oluştu</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              İşleminiz gerçekleştirilirken teknik bir sorun meydana geldi. Lütfen sayfayı yenilemeyi deneyin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tekrar Dene</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Ana Sayfaya Git</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800">
        Dersly © 2026 • Yeni Nesil Özel Ders Yönetim Platformu
      </footer>
    </div>
  );
}
