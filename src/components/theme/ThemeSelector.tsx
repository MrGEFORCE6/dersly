'use client';

import { useTheme } from '@/context/ThemeContext';
import type { ThemeMode, AccentColor } from '@/types/database.types';
import { Sun, Moon, Laptop, Palette, Check } from 'lucide-react';
import { useState } from 'react';

export function ThemeSelector() {
  const { mode, accent, setMode, setAccent, resolvedMode, accentClasses } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const accents: { id: AccentColor; label: string; colorHex: string; dotClass: string }[] = [
    { id: 'system', label: 'Sistem (Auto)', colorHex: '#2563eb', dotClass: 'bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500' },
    { id: 'sapphire', label: 'Sapphire', colorHex: '#2563eb', dotClass: 'bg-blue-600' },
    { id: 'emerald', label: 'Emerald', colorHex: '#10b981', dotClass: 'bg-emerald-500' },
    { id: 'lavender', label: 'Lavender', colorHex: '#8b5cf6', dotClass: 'bg-violet-500' },
    { id: 'amber', label: 'Amber', colorHex: '#f59e0b', dotClass: 'bg-amber-500' },
  ];

  const isCurrentAccent = (id: AccentColor) => {
    if (accent === id) return true;
    if (id === 'sapphire' && accent === 'blue') return true;
    if (id === 'lavender' && accent === 'violet') return true;
    return false;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Tema ve Vurgu Rengi Ayarları"
        className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
          resolvedMode === 'dark'
            ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-600'
            : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
        }`}
        title="Tema & Vurgu Rengi Ayarları"
      >
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: accentClasses.colorHex }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline font-medium">Tema</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 mt-2 w-72 rounded-2xl p-4 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
              resolvedMode === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 mb-3">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-400" />
                Tema & Vurgu Motoru
              </span>
              <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aktif
              </span>
            </div>

            {/* Mode Selector */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                Arayüz Modu
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-800/40 border border-slate-700/50">
                {[
                  { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
                  { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
                  { id: 'system' as ThemeMode, label: 'System', icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setMode(item.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        active
                          ? `${accentClasses.bg} text-white shadow`
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Palette Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                Vurgu Rengi (Accent)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {accents.map((item) => {
                  const active = isCurrentAccent(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAccent(item.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/15 font-bold text-white shadow-sm'
                          : 'border-slate-700/60 hover:border-slate-600 text-slate-300'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${item.dotClass} flex items-center justify-center shrink-0`}>
                        {active && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </span>
                      <span className="text-xs truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
