'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  ArrowUpRight, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface BillingSectionProps {
  activeStudentCount: number;
}

export function BillingSection({ activeStudentCount }: BillingSectionProps) {
  const [simulatedStudents, setSimulatedStudents] = useState<number>(activeStudentCount || 15);

  const basePrice = 50; // Taban ücret: 50 TL/ay
  const perStudentPrice = 15; // Öğrenci başı: 15 TL/ay

  // Güncel gerçek tutar
  const currentTotal = basePrice + (activeStudentCount * perStudentPrice);

  // Simülasyon tutarı
  const simulatedTotal = basePrice + (simulatedStudents * perStudentPrice);

  const invoices = [
    { id: 'INV-2026-009', date: '01 Ekim 2026', students: 4, amount: 110.00, status: 'Ödendi' },
    { id: 'INV-2026-008', date: '01 Eylül 2026', students: 3, amount: 95.00, status: 'Ödendi' },
    { id: 'INV-2026-007', date: '01 Ağustos 2026', students: 2, amount: 80.00, status: 'Ödendi' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Eğitmen Abonelik & Fatura Modeli
          </div>
          <h3 className="text-xl font-bold text-white">Şeffaf ve Kullandığın Kadar Öde Fiyatlandırma</h3>
          <p className="text-xs text-slate-400 mt-1">
            Sabit yüksek maliyetler yok. Taban 50 TL/ay + her aktif öğrenci için sadece 15 TL/ay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Abonelik Aktif
          </span>
        </div>
      </div>

      {/* 2. Ana Fatura Özeti & Dinamik Hesaplama Kartı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Güncel Ay Fatura Özeti (Gerçek Öğrenci Sayısına Göre) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Güncel Dönem Fatura Özeti</h4>
                  <p className="text-xs text-slate-400">1 Ekim 2026 - 31 Ekim 2026 Dönemi</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">Sonraki Kesim: 01 Kas 2026</span>
            </div>

            {/* Breakdown Table */}
            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <div>
                    <span className="font-semibold text-white block">Platform Taban Hizmet Bedeli</span>
                    <span className="text-[11px] text-slate-400">Sunucu altyapısı, sınırsız takvim ve dosya depolama</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-white text-sm">50,00 ₺</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <span className="font-semibold text-white block">
                      Aktif Öğrenci Ücreti ({activeStudentCount} Öğrenci × 15,00 ₺)
                    </span>
                    <span className="text-[11px] text-slate-400">Sistemde kayıtlı ve ders alan aktif öğrenci lisansları</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {(activeStudentCount * perStudentPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>

            {/* Total Box */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-300 block">Bu Ayki Tahmini Toplam Tutar</span>
                <span className="text-2xl font-black text-white font-mono mt-0.5 block">
                  {currentTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  <span className="text-xs font-normal text-slate-400 ml-1">/ ay</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-mono">Taban: 50 ₺ + ({activeStudentCount} × 15 ₺)</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Otomatik Çekilecek
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-slate-400" />
              MasterCard •••• 4022 (Varsayılan Kart)
            </span>
            <button className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Kartı Değiştir
            </button>
          </div>
        </div>

        {/* 3. Dinamik Fiyat Simülatörü */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Büyüme & Fiyat Simülatörü</h4>
                <p className="text-[11px] text-slate-400">Öğrenci sayısına göre maliyetini gör</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-medium">Öğrenci Sayısı:</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">{simulatedStudents} Öğrenci</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={simulatedStudents}
                  onChange={(e) => setSimulatedStudents(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>1 Öğrenci</span>
                  <span>15 Öğrenci</span>
                  <span>30 Öğrenci</span>
                  <span>50 Öğrenci</span>
                </div>
              </div>

              {/* Hızlı Seçim Butonları */}
              <div className="flex gap-2">
                {[5, 10, 15, 25].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSimulatedStudents(count)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      simulatedStudents === count
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {count} Öğr.
                  </button>
                ))}
              </div>

              {/* Simülasyon Sonuç Kutusu */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Taban Ücret:</span>
                  <span className="font-mono text-white">50 ₺</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{simulatedStudents} × 15 ₺ Öğrenci:</span>
                  <span className="font-mono text-white">{simulatedStudents * 15} ₺</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-sm text-indigo-300">
                  <span>Toplam Aylık:</span>
                  <span className="font-mono text-base text-white">{simulatedTotal} TL / ay</span>
                </div>
              </div>

              {simulatedStudents === 15 && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Örnek Doğrulama: 15 öğrenci = 50 + (15×15) = <strong>275 TL/ay</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>İstediğiniz zaman iptal edebilir veya öğrenci sayısını düşürebilirsiniz.</span>
          </div>
        </div>
      </div>

      {/* 4. Geçmiş Faturalar Listesi */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Fatura Geçmişi & Makbuzlar
            </h4>
            <p className="text-xs text-slate-400">Önceki aylara ait kesilmiş faturalarınız</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-300 font-semibold">
              <tr>
                <th className="p-3 rounded-l-lg">Fatura No</th>
                <th className="p-3">Tarih</th>
                <th className="p-3">Aktif Öğrenci</th>
                <th className="p-3">Tutar</th>
                <th className="p-3">Durum</th>
                <th className="p-3 text-right rounded-r-lg">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-semibold text-white">{inv.id}</td>
                  <td className="p-3 text-slate-400">{inv.date}</td>
                  <td className="p-3">{inv.students} Öğrenci</td>
                  <td className="p-3 font-bold text-white">{inv.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans inline-flex items-center gap-1 transition-colors">
                      <Download className="w-3 h-3 text-indigo-400" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
