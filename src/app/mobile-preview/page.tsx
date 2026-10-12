'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Smartphone, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  UploadCloud, 
  X, 
  Send, 
  Bot, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function MobilePreviewPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [studentName, setStudentName] = useState('Zeynep Kaya');
  
  // Homework State
  const [homeworks, setHomeworks] = useState([
    {
      id: 'hw-1',
      title: 'İntegral Alan Hesabı - Test 7 & 8',
      course: 'Matematik',
      dueDate: '14 Ekim 2026',
      status: 'pending',
    },
    {
      id: 'hw-2',
      title: 'Türev Teğet Denklemi Çözümlü Sorular',
      course: 'Matematik',
      dueDate: '16 Ekim 2026',
      status: 'pending',
    },
  ]);

  const [activeUploadHw, setActiveUploadHw] = useState<any | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Floating AI Chatbot State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'ai' | 'user'; text: string }>>([
    {
      id: '1',
      sender: 'ai',
      text: 'Merhaba Zeynep! 👋 Ben senin yapay zeka ders koçunum. Takıldığın bir soru veya formül olursa bana sorabilirsin! Bugün nasılsın?',
    },
  ]);

  const quickPrompts = [
    '📐 Trigonometri Formülü İpucu',
    '📝 Ödevlerimi Hatırlat',
    '✨ Biraz Motivasyon Ver',
    '⏰ Sıradaki Dersim Ne Zaman?',
  ];

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isAiLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text: text.trim(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const historyPayload = chatMessages.slice(-4).map((m) => ({
        role: m.sender === 'ai' ? ('model' as const) : ('user' as const),
        content: m.text,
      }));

      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          studentName,
          course: 'AYT Matematik & Fizik',
          history: historyPayload,
        }),
      });

      if (!res.ok) throw new Error('API Hatası');
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.reply || 'Harika bir soru! Adım adım çözelim.',
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Selam Zeynep! 💡 Sorun için ilk ipucum: Önce verilen bağıntıyı dikkatlice yazıp x değerlerini yerine koymayı dene. Ne bulduğunu bana yaz!',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCompleteUpload = () => {
    if (!activeUploadHw) return;
    setHomeworks((prev) =>
      prev.map((h) => (h.id === activeUploadHw.id ? { ...h, status: 'submitted' } : h))
    );
    setActiveUploadHw(null);
    setUploadedFileName(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Eğitmen Paneline Dön
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                Expo (React Native) Mobil Simülatörü & Arayüzü
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              mobile/screens & components
            </span>
          </div>
        </div>
      </header>

      {/* Main Container with Smartphone Mockup */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-10">
        {/* Info Column */}
        <div className="max-w-md space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Öğrenci Pastel-Gece Teması
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Öğrenciler İçin <span className="text-emerald-400">Mobil Deneyim</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Koyu ama gözü yormayan Soft Slate zemin (<code className="text-indigo-300">#0f172a</code>), pastel mor ve nane tonları ile tasarlandı.
          </p>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <span className="text-lg">⏳</span>
              <div>
                <strong className="text-white block">Sıradaki Dersim Kartı</strong>
                <span>Geri sayım, konu ve eğitmen bilgisi anlık güncellenir.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <span className="text-lg">📊</span>
              <div>
                <strong className="text-white block">Kalan Kredi & Haftalık Bar</strong>
                <span>Paket saati takibi ve haftalık ders tamamlama oranı.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <span className="text-lg">🤖</span>
              <div>
                <strong className="text-white block">Sağ Altta Yapay Zeka Koçu</strong>
                <span>Tıklandığında alttan açılan, ipucu ve motivasyon veren diyalog penceresi.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smartphone Mockup */}
        <div className="relative w-[375px] h-[760px] rounded-[48px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col overflow-hidden">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-3" />
          </div>

          {/* Screen Container */}
          <div className="w-full h-full rounded-[40px] bg-[#0f172a] text-slate-100 flex flex-col overflow-hidden relative font-sans">
            {!isLoggedIn ? (
              /* ================= LOGIN SCREEN ================= */
              <div className="flex-1 p-6 pt-14 flex flex-col justify-between overflow-y-auto">
                <div className="text-center pt-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#1e293b] border border-purple-400/40 mx-auto flex items-center justify-center text-2xl shadow-lg shadow-purple-500/10 mb-3">
                    ✨
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Dersly</h2>
                  <p className="text-xs text-slate-400 mt-1">Öğrenci Mobil Portalı</p>
                </div>

                {/* Role Switcher */}
                <div className="bg-[#1e293b] p-1 rounded-2xl flex border border-slate-700/80 my-4">
                  <button
                    onClick={() => setRole('student')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      role === 'student'
                        ? 'bg-[#8b5cf6] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎓 Öğrenci Girişi
                  </button>
                  <button
                    onClick={() => setRole('teacher')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      role === 'teacher'
                        ? 'bg-[#8b5cf6] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    👨‍🏫 Öğretmen Girişi
                  </button>
                </div>

                {/* Form */}
                <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-700/80 space-y-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Telefon Numarası veya E-Posta
                    </label>
                    <input
                      type="text"
                      defaultValue={role === 'student' ? '0542 111 22 33' : '0532 999 88 77'}
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Şifre
                    </label>
                    <input
                      type="password"
                      defaultValue="••••••••"
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setStudentName(role === 'student' ? 'Zeynep Kaya' : 'Ahmet Yılmaz (Öğretmen)');
                      setIsLoggedIn(true);
                    }}
                    className="w-full mt-2 py-3 rounded-xl bg-[#6ee7b7] text-[#0f172a] font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 hover:bg-[#5eead4] transition-all"
                  >
                    {role === 'student' ? 'Öğrenci Olarak Giriş Yap' : 'Öğretmen Olarak Giriş Yap'}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-slate-500">
                    Dersly © 2026 • Güvenli Supabase Kimlik Doğrulama
                  </span>
                </div>
              </div>
            ) : (
              /* ================= STUDENT HOME SCREEN ================= */
              <div className="flex-1 flex flex-col pt-10 overflow-hidden relative">
                {/* Top App Bar */}
                <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#1e293b] border border-purple-400/30 flex items-center justify-center text-sm">
                      👩‍🎓
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">{studentName}</h4>
                        <span className="text-[10px] text-purple-400 font-mono font-semibold">@zeynep.kaya</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Hedef: Boğaziçi Bilgisayar 🚀</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="px-2.5 py-1 rounded-lg bg-[#1e293b] text-[10px] text-slate-400 hover:text-white"
                  >
                    Çıkış
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                  {/* Instagram-style Social Stats Bar */}
                  <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/20 p-2.5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block">TYT Net</span>
                      <span className="text-xs font-bold text-white font-mono">98.5</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">AYT Net</span>
                      <span className="text-xs font-bold text-[#6ee7b7] font-mono">72.0</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Haftalık Soru</span>
                      <span className="text-xs font-bold text-purple-300 font-mono">600 / 750</span>
                    </div>
                  </div>

                  {/* 1. Sıradaki Dersim Kartı */}
                  <div className="rounded-3xl bg-[#1e293b] border-2 border-[#8b5cf6]/50 p-4 shadow-lg shadow-purple-900/10">
                    <div className="inline-block px-2.5 py-1 rounded-lg bg-purple-500/15 text-[10px] font-bold text-purple-300 mb-2">
                      ⏳ SIRADAKİ DERSİN • 1 Gün 13 Saat Kaldı
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      AYT Matematik: Türevin Geometrik Yorumu
                    </h3>

                    <div className="mt-3 p-2.5 rounded-xl bg-[#0f172a] flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Eğitmen</span>
                        <span className="font-semibold text-slate-200">Ahmet Hoca</span>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <span className="text-[9px] text-slate-500 block">Tarih & Saat</span>
                        <span className="font-semibold text-slate-200">12 Ekim • 10:00 - 11:30</span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>📍</span>
                      <span>Yüz Yüze Özel Ders Ofisi</span>
                    </div>
                  </div>

                  {/* 2. Kalan Kredi & İlerleme */}
                  <div className="rounded-3xl bg-[#1e293b] border border-slate-800 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium">Kalan Ders Paketi</span>
                        <div className="text-xl font-black text-[#6ee7b7] font-mono">
                          8 <span className="text-xs text-slate-500 font-normal">/ 20 Saat</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-[10px] font-bold text-[#6ee7b7]">
                        %60 Kullanıldı
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#0f172a] overflow-hidden">
                      <div className="h-full bg-[#6ee7b7] rounded-full w-[60%]" />
                    </div>

                    <p className="text-[10px] text-slate-400 pt-0.5">
                      Bu hafta 2 ders tamamlandı (Haftalık Hedef: 3)
                    </p>
                  </div>

                  {/* 3. Teslim Bekleyen Ödevlerim */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold text-white">Teslim Bekleyen Ödevlerim</h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                        {homeworks.filter((h) => h.status === 'pending').length} Ödev
                      </span>
                    </div>

                    {homeworks.map((hw) => {
                      const isSubmitted = hw.status === 'submitted';
                      return (
                        <div
                          key={hw.id}
                          className="rounded-2xl bg-[#1e293b] border border-slate-800 p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold">
                              {hw.course}
                            </span>
                            <span className={isSubmitted ? 'text-[#6ee7b7] font-bold' : 'text-amber-400 font-semibold'}>
                              {isSubmitted ? '✓ Teslim Edildi' : 'Bekliyor'}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white">{hw.title}</h5>
                          <span className="text-[10px] text-slate-400 block">
                            📅 Son Teslim: {hw.dueDate}
                          </span>

                          {!isSubmitted ? (
                            <button
                              onClick={() => setActiveUploadHw(hw)}
                              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              📷 Çözüm Fotoğrafı / PDF Yükle
                            </button>
                          ) : (
                            <div className="py-1.5 px-3 rounded-xl bg-emerald-500/10 text-[#6ee7b7] text-[11px] font-semibold text-center">
                              Öğretmenin incelemesi bekleniyor ✨
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. SAĞ ALT KÖŞEDE YAPAY ZEKA ÖĞRENCİ ASİSTANI BUTTON */}
                <button
                  onClick={() => setIsAiOpen(true)}
                  className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-[#8b5cf6] border-2 border-[#6ee7b7] shadow-xl shadow-purple-600/30 flex items-center justify-center text-2xl hover:scale-105 transition-transform z-30"
                >
                  🤖
                  <span className="absolute -top-1 -right-1 bg-[#6ee7b7] text-[#0f172a] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                    AI
                  </span>
                </button>

                {/* ================= ALTTAN AÇILAN AI DİYALOG PENCERESİ ================= */}
                {isAiOpen && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col justify-end animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] rounded-t-[32px] border-t border-slate-700 h-[75%] flex flex-col p-4 shadow-2xl">
                      {/* Sheet Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-purple-400/40 flex items-center justify-center text-lg">
                            🤖
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Akıllı Öğrenci Asistanı</h4>
                            <span className="text-[10px] text-[#6ee7b7] block">● Çevrim içi • İpucu & Motivasyon</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsAiOpen(false)}
                          className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Quick Chips */}
                      <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                        {quickPrompts.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendChatMessage(p)}
                            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      {/* Messages Container */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 py-2 pr-1">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                                msg.sender === 'user'
                                  ? 'bg-[#8b5cf6] text-white rounded-br-sm'
                                  : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}

                        {/* Typing Indicator */}
                        {isAiLoading && (
                          <div className="flex justify-start items-end gap-1.5 animate-in fade-in">
                            <span className="text-xs">✍️</span>
                            <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-emerald-300 flex items-center gap-2 italic">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                              <span className="text-[11px] ml-1">Koç ipucu hazırlıyor...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChatMessage();
                        }}
                        className="pt-2 flex gap-2 border-t border-slate-800"
                      >
                        <input
                          type="text"
                          placeholder="Takıldığın bir soru veya konu sor..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 bg-[#6ee7b7] text-[#0f172a] rounded-xl font-bold text-xs hover:bg-[#5eead4] transition-colors"
                        >
                          Gönder
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Ödev Yükleme Modalı */}
                {activeUploadHw && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-3xl p-5 border border-slate-700 w-full space-y-3">
                      <h4 className="text-sm font-bold text-white">Ödev Çözümü Yükle</h4>
                      <p className="text-[11px] text-slate-400">{activeUploadHw.title}</p>

                      <div
                        onClick={() => setUploadedFileName('cozum_sayfa_1_2.pdf')}
                        className="border-2 border-dashed border-slate-700 hover:border-purple-400 p-6 rounded-2xl text-center bg-[#0f172a] cursor-pointer transition-colors"
                      >
                        <span className="text-2xl block mb-1">📁</span>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {uploadedFileName ? uploadedFileName : 'Fotoğraf Çek veya Dosya Seç'}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">PDF, JPG (Maks 15MB)</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            setActiveUploadHw(null);
                            setUploadedFileName(null);
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          Vazgeç
                        </button>
                        <button
                          onClick={handleCompleteUpload}
                          className="flex-1 py-2 rounded-xl bg-[#6ee7b7] text-[#0f172a] text-xs font-bold"
                        >
                          Öğretmene İlet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
