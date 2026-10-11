'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Camera, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  Search, 
  FileText, 
  ExternalLink,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { fetchBooks, createBook, deleteBook } from '@/lib/services/supabaseService';
import type { Book } from '@/types/database.types';

export default function StudentLibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // OCR Camera Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResultNotice, setScanResultNotice] = useState<string | null>(null);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newSubject, setNewSubject] = useState('TYT Matematik');
  const [newTopics, setNewTopics] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadBooks() {
      const fetched = await fetchBooks('s-001');
      if (!fetched || fetched.length === 0) {
        // Initial student library
        const defaultBooks: Book[] = [
          {
            id: 'book-1',
            student_id: 's-001',
            title: '3D TYT Matematik Soru Bankası',
            publisher: '3D Yayınları',
            subject: 'TYT Matematik',
            topics: ['Temel Kavramlar', 'Problemler', 'Fonksiyonlar', 'Kümeler'],
            cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
            created_at: '2026-10-11T00:00:00.000Z',
            updated_at: '2026-10-11T00:00:00.000Z',
          },
          {
            id: 'book-2',
            student_id: 's-001',
            title: 'Apotemi AYT Matematik: Türev Fasikülü',
            publisher: 'Apotemi',
            subject: 'AYT Matematik',
            topics: ['Türev Alma Kuralları', 'Geometrik Yorum', 'Maks-Min Problemleri'],
            cover_image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=80',
            created_at: '2026-10-11T00:00:00.000Z',
            updated_at: '2026-10-11T00:00:00.000Z',
          },
          {
            id: 'book-3',
            student_id: 's-001',
            title: 'Palme AYT Fizik Soru Kitabı',
            publisher: 'Palme Yayıncılık',
            subject: 'AYT Fizik',
            topics: ['Vektörler & Bağıl Hareket', 'Newton Yasaları', 'İş & Enerji'],
            cover_image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
            created_at: '2026-10-11T00:00:00.000Z',
            updated_at: '2026-10-11T00:00:00.000Z',
          },
        ];
        setBooks(defaultBooks);
      } else {
        setBooks(fetched);
      }
    }
    loadBooks();
  }, []);

  // Gemini Vision OCR Camera / Photo Scan Handler
  const handleScanBook = async (file?: File) => {
    setIsScanning(true);
    setScanResultNotice(null);

    try {
      let base64 = '';
      if (file) {
        const reader = new FileReader();
        base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      // Call OCR endpoint
      const res = await fetch('/api/ocr/book-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64 || undefined,
          sampleName: file ? undefined : '3D TYT Matematik',
        }),
      });

      const data = await res.json();
      if (data?.book) {
        const created = await createBook({
          student_id: 's-001',
          title: data.book.title,
          publisher: data.book.publisher,
          subject: data.book.subject,
          topics: data.book.topics,
          cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
        });

        setBooks([created, ...books]);
        setScanResultNotice(
          `✨ "${data.book.title}" (${data.book.publisher}) Gemini Vision OCR ile analiz edildi ve kütüphanenize eklendi!`
        );
        showToast('✓ Kitap başarıyla kütüphanenize eklendi!');
      }
    } catch (err) {
      console.error('Scan error:', err);
      showToast('Kitap taranırken bir hata oluştu.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualAdd = async () => {
    if (!newTitle.trim()) return;

    const topicList = newTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created = await createBook({
      student_id: 's-001',
      title: newTitle.trim(),
      publisher: newPublisher.trim() || 'Özel Yayın',
      subject: newSubject,
      topics: topicList.length > 0 ? topicList : ['Genel Konular'],
      cover_image_url: null,
    });

    setBooks([created, ...books]);
    setNewTitle('');
    setNewPublisher('');
    setNewTopics('');
    setIsAddModalOpen(false);
    showToast(`✓ "${created.title}" kütüphaneye eklendi!`);
  };

  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    setBooks(books.filter((b) => b.id !== id));
    showToast('✓ Kitap kütüphaneden silindi.');
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.publisher && b.publisher.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.topics && b.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesSubject =
      selectedSubject === 'all' || (b.subject && b.subject.toLowerCase().includes(selectedSubject.toLowerCase()));

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 text-xs font-semibold animate-in fade-in duration-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              Öğrenci Akıllı Kaynak Kütüphanesi
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Kitaplığım & Kaynaklarım 📚
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Sahip olduğun TYT/AYT soru bankalarını ve fasikülleri yükle. Hocan ders planlarken bu kitaplardan birini seçip <span className="font-semibold text-indigo-600 dark:text-indigo-400">"Bu derse getir"</span> notu bırakabilir.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Gemini Vision Scan Button */}
            <label className="cursor-pointer px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Camera className="w-4 h-4" />
              <span>{isScanning ? 'Yapay Zeka Tarıyor...' : 'Kameradan / Fotoğraftan Tara'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isScanning}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleScanBook(e.target.files[0]);
                  }
                }}
              />
            </label>

            {/* Manual Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-stone-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Manuel Ekle
            </button>
          </div>
        </div>

        {/* Scan Result Notice Banner */}
        {scanResultNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {scanResultNotice}
            </span>
            <button
              onClick={() => setScanResultNotice(null)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kitap adı, yayınevi veya konu ara (örn: Türev, 3D)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Matematik', 'Fizik', 'Geometri', 'Biyoloji'].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubject === subj
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {subj === 'all' ? 'Tüm Dersler' : subj}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-14 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200/60 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-indigo-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                      {book.subject || 'Ders Kitabı'}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {book.title}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                      {book.publisher || 'Yayınevi'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Kitabı Kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Topics Tags */}
                {book.topics && book.topics.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      İçerik Başlıkları ({book.topics.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {book.topics.slice(0, 4).map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-stone-200/60 dark:border-slate-700/60"
                        >
                          #{topic}
                        </span>
                      ))}
                      {book.topics.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-semibold self-center">
                          +{book.topics.length - 4} konu daha
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status footer: Can be requested by teacher */}
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Kütüphanende Hazır
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(book.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="p-12 rounded-3xl glass-panel bg-white/60 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Kitap Bulunamadı
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Arama kriterlerine uyan kitap bulunamadı. "Kameradan Tara" butonunu kullanarak yeni bir kitap ekleyebilirsiniz.
            </p>
          </div>
        )}
      </main>

      {/* Manual Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Manuel Kitap Ekle
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kitap Adı
                </label>
                <input
                  type="text"
                  placeholder="örn: Orijinal AYT Matematik Soru Bankası"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Yayınevi
                </label>
                <input
                  type="text"
                  placeholder="örn: Orijinal Yayınları"
                  value={newPublisher}
                  onChange={(e) => setNewPublisher(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ders
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="TYT Matematik">TYT Matematik</option>
                  <option value="AYT Matematik">AYT Matematik</option>
                  <option value="AYT Fizik">AYT Fizik</option>
                  <option value="TYT-AYT Geometri">TYT-AYT Geometri</option>
                  <option value="AYT Biyoloji">AYT Biyoloji</option>
                  <option value="TYT Türkçe">TYT Türkçe</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Konu Başlıkları (Virgülle ayırın)
                </label>
                <input
                  type="text"
                  placeholder="örn: Türev, Limit, İntegral, Trigonometri"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Vazgeç
              </button>
              <button
                onClick={handleManualAdd}
                disabled={!newTitle.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-40"
              >
                Kütüphaneye Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
