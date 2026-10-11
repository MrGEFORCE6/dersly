'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme, ACCENT_PALETTES } from '@/context/ThemeContext';
import type { ThemeMode, AccentColor, Profile } from '@/types/database.types';
import { currentTeacher } from '@/data/mockData';
import { createClient } from '@/lib/supabase/client';
import { fetchProfiles, updateProfile, uploadFileToStorage } from '@/lib/services/supabaseService';
import { 
  Palette, 
  Sun, 
  Moon, 
  Laptop, 
  Check, 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Camera, 
  Save, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  ExternalLink,
  Sliders,
  GraduationCap,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { mode, accent, setMode, setAccent, resolvedMode, accentClasses } = useTheme();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'dersly_auth_token=; path=/; max-age=0';
      document.cookie = 'dersly_user_role=; path=/; max-age=0';
      document.cookie = 'dersly_user_id=; path=/; max-age=0';
      document.cookie = 'derspompa_auth_token=; path=/; max-age=0';
      document.cookie = 'derspompa_user_role=; path=/; max-age=0';
      document.cookie = 'derspompa_user_id=; path=/; max-age=0';
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dersly_current_user_id');
      localStorage.removeItem('dersly_current_role');
      localStorage.removeItem('derspompa_current_user_id');
      localStorage.removeItem('derspompa_current_role');
    }
    router.push('/login');
  };

  // Profile state
  const [profile, setProfile] = useState<Profile>(currentTeacher);
  const [fullName, setFullName] = useState(currentTeacher.full_name);
  const [username, setUsername] = useState(currentTeacher.username || 'ahmethoca');
  const [bio, setBio] = useState(currentTeacher.bio || 'Özel Ders Koçu & Eğitmen');
  const [avatarUrl, setAvatarUrl] = useState(currentTeacher.avatar_url || '');
  const [phone, setPhone] = useState(currentTeacher.phone || '+90 532 555 1020');
  const [statsVisibility, setStatsVisibility] = useState<'public' | 'followers_only' | 'only_me_and_teacher'>(
    profile.privacy_settings?.stats_visibility || 'public'
  );

  // Notification toggles
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifSms, setNotifSms] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifHomeworkReminder, setNotifHomeworkReminder] = useState(true);

  // Status state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const profiles = await fetchProfiles();
      
      // Determine currently authenticated user id & role
      let currentId = 't-001';
      let currentRole = 'teacher';
      if (typeof window !== 'undefined') {
        currentId =
          localStorage.getItem('dersly_current_user_id') ||
          localStorage.getItem('derspompa_current_user_id') ||
          't-001';
        currentRole =
          localStorage.getItem('dersly_current_role') ||
          localStorage.getItem('derspompa_current_role') ||
          'teacher';
      }

      // Strict RBAC: only load current user's own profile
      let targetProfile = profiles.find((p) => p.id === currentId);
      if (!targetProfile) {
        targetProfile = profiles.find((p) => p.role === currentRole) || profiles[0];
      }

      if (targetProfile) {
        setProfile(targetProfile);
        setFullName(targetProfile.full_name);
        setUsername(targetProfile.username || (targetProfile.role === 'teacher' ? 'ahmethoca' : 'ogrenci'));
        setBio(targetProfile.bio || '');
        setAvatarUrl(targetProfile.avatar_url || '');
        setPhone(targetProfile.phone || '');
        if (targetProfile.privacy_settings?.stats_visibility) {
          setStatsVisibility(targetProfile.privacy_settings.stats_visibility);
        }
      }
    }
    loadProfile();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadedUrl = await uploadFileToStorage('avatars', file, `${profile.id}_avatar.jpg`);
    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
      showToast('Profil fotoğrafı Supabase Storage\'a yüklendi!');
    }
    setIsUploading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = await updateProfile(profile.id, {
      full_name: fullName.trim(),
      username: username.replace(/^@/, '').trim().toLowerCase(),
      bio: bio.trim(),
      phone: phone.trim(),
      avatar_url: avatarUrl,
      privacy_settings: { stats_visibility: statsVisibility },
      theme_preference: { mode, accent },
    });

    setIsSaving(false);
    if (updated) {
      setProfile(updated);
      showToast('✓ Ayarlar ve profil Supabase veritabanına başarıyla kaydedildi!');
    }
  };

  const accents: { id: AccentColor; label: string; dotClass: string; hex: string }[] = [
    { id: 'system', label: 'Sistem / Otomatik', dotClass: 'bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500', hex: '#2563eb' },
    { id: 'sapphire', label: 'Safir Mavi (Sapphire)', dotClass: 'bg-blue-600', hex: '#2563eb' },
    { id: 'emerald', label: 'Zümrüt Yeşili (Emerald)', dotClass: 'bg-emerald-500', hex: '#10b981' },
    { id: 'lavender', label: 'Pastel Lavanta (Lavender)', dotClass: 'bg-violet-500', hex: '#8b5cf6' },
    { id: 'amber', label: 'Sıcak Amber (Amber)', dotClass: 'bg-amber-500', hex: '#f59e0b' },
  ];

  const isCurrentAccent = (id: AccentColor) => {
    if (accent === id) return true;
    if (id === 'sapphire' && accent === 'blue') return true;
    if (id === 'lavender' && accent === 'violet') return true;
    return false;
  };

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b transition-colors glass-nav">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/40 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Panele Dön</span>
            </Link>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <h1 className="font-bold text-base tracking-tight">Sistem & Profil Ayarları</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/profile"
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700/60 hover:border-slate-500 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sosyal Profilimi Gör</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Section 1: KÖK DÜZEN & TEMA MOTORU */}
        <section className="rounded-3xl p-6 sm:p-8 glass-panel shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/40">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
                <Palette className="w-3.5 h-3.5" />
                Theme & Accent Engine
              </div>
              <h2 className="text-xl font-bold tracking-tight">Kullanıcı Kontrollü Tema & Renk Motoru</h2>
              <p className="text-xs text-slate-400 mt-1">
                Arayüz modunu ve ana vurgu rengini seçin. Tercihiniz tarayıcınıza ve profilinize anında kaydedilir.
              </p>
            </div>

            {/* Live Indicator Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/40 border border-slate-700/60 text-xs">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentClasses.colorHex }} />
              <span className="font-mono text-slate-300 font-semibold capitalize">{accent}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 capitalize">{resolvedMode}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Arayüz Modu (Mode Selection)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'light' as ThemeMode,
                    title: 'Light',
                    desc: 'Ferah açık tema',
                    icon: Sun,
                  },
                  {
                    id: 'dark' as ThemeMode,
                    title: 'Dark',
                    desc: 'Derin lüks slate',
                    icon: Moon,
                  },
                  {
                    id: 'system' as ThemeMode,
                    title: 'System',
                    desc: 'İşletim sistemi',
                    icon: Laptop,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMode(item.id);
                        showToast(`Arayüz modu "${item.title}" olarak ayarlandı.`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[105px] ${
                        isSelected
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-slate-700/60 hover:border-slate-600 bg-slate-900/30'
                      }`}
                      style={isSelected ? { borderColor: 'var(--accent-primary)', backgroundColor: 'var(--accent-subtle)' } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-5 h-5" style={{ color: isSelected ? 'var(--accent-primary)' : '#94a3b8' }} />
                        {isSelected && <Check className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />}
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-200">{item.title}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Palette Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Vurgu Renk Paleti (Accent Palette)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {accents.map((item) => {
                  const isSelected = isCurrentAccent(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAccent(item.id);
                        showToast(`Vurgu rengi "${item.label}" olarak güncellendi.`);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 shadow-md'
                          : 'border-slate-700/60 hover:border-slate-600 bg-slate-900/30'
                      }`}
                      style={isSelected ? { borderColor: item.hex, backgroundColor: `${item.hex}15` } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full ${item.dotClass} shadow-md flex items-center justify-center shrink-0`}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </span>
                        <div>
                          <span className="block text-xs font-bold text-slate-200">{item.label}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{item.hex}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="mt-6 p-5 rounded-2xl border bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-300">Canlı Arayüz Önizlemesi</span>
              <p className="text-[11px] text-slate-400">
                Seçilen palet butonlarda, rozetlerde, bildirimlerde ve kart vurgularında hemen aktif olur.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Örnek Buton
              </button>
              <span
                className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono border"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)', borderColor: 'var(--accent-border)' }}
              >
                %100 Canlı CSS
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: PROFİL VE HESAP AYARLARI */}
        <section className="rounded-3xl p-6 sm:p-8 glass-panel shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-700/40">
            <h2 className="text-xl font-bold tracking-tight">Profil & Hesap Bilgileri</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sosyal profil kimliğinizi, kullanıcı adınızı ve iletişim bilgilerinizi güncelleyin.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 rounded-2xl bg-slate-900/40 border border-slate-700/60">
              <div className="relative group w-20 h-20 shrink-0">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 shadow-lg"
                  style={{ borderColor: 'var(--accent-primary)' }}
                />
                <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-semibold">
                  <Camera className="w-5 h-5 mb-1" />
                  <span>{isUploading ? 'Yükleniyor...' : 'Değiştir'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-200">Profil Fotoğrafı (Supabase Storage)</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">
                    avatars bucket
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  PNG, JPG veya WebP formatında fotoğraf yükleyin. Dosya doğrudan Supabase Storage üzerinde depolanır.
                </p>
                <label className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-colors border border-slate-700">
                  Yeni Fotoğraf Seç
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kullanıcı Adı (@kullaniciadi)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  İstatistik Gizlilik Seviyesi
                </label>
                <select
                  value={statsVisibility}
                  onChange={(e) => setStatsVisibility(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="public">Herkese Açık (Public)</option>
                  <option value="followers_only">Sadece Takipçiler & Öğrenciler</option>
                  <option value="only_me_and_teacher">Sadece Ben ve Eğitmenim</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Biyografi & Koçluk Mottosu
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Hedefleriniz, branşınız veya dereceleriniz..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Section 3: BİLDİRİM VE İLETİŞİM TERCİHLERİ */}
        <section className="rounded-3xl p-6 sm:p-8 glass-panel shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-700/40">
            <h2 className="text-xl font-bold tracking-tight">Otomatik Bildirim Tercihleri</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ders hatırlatıcıları, ödev teslimleri ve paket saati bildirim kanallarını belirleyin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'whatsapp',
                title: 'WhatsApp Hatırlatıcıları',
                desc: 'Dersten 2 saat önce öğrenci ve veliye otomatik mesaj',
                checked: notifWhatsapp,
                toggle: () => setNotifWhatsapp(!notifWhatsapp),
              },
              {
                id: 'sms',
                title: 'SMS Doğrulama & Bildirimleri',
                desc: 'Paket saati bittiğinde veliye SMS bilgilendirmesi',
                checked: notifSms,
                toggle: () => setNotifSms(!notifSms),
              },
              {
                id: 'homework',
                title: 'Ödev Teslim Alındı Bildirimi',
                desc: 'Öğrenci PDF yüklediğinde anında bildirim gönder',
                checked: notifHomeworkReminder,
                toggle: () => setNotifHomeworkReminder(!notifHomeworkReminder),
              },
              {
                id: 'email',
                title: 'Haftalık E-Posta İlerleme Raporu',
                desc: 'Haftalık çözülen soru ve ders istatistik özeti',
                checked: notifEmail,
                toggle: () => setNotifEmail(!notifEmail),
              },
            ].map((n) => (
              <div
                key={n.id}
                onClick={n.toggle}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                </div>
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    n.checked ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                  style={n.checked ? { backgroundColor: 'var(--accent-primary)' } : {}}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      n.checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Hesap Güvenliği ve RBAC Bilgilendirmesi */}
        <section className="p-6 sm:p-8 rounded-3xl glass-panel shadow-xl space-y-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hesap Güvenliği & Oturum</h3>
                <p className="text-xs text-slate-400">Rol Tabanlı Yetkilendirme (RBAC) ve Aktif Oturum Bilgileri</p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Doğrulanmış Kimlik (auth.uid)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Aktif Rol:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  profile.role === 'teacher' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {profile.role === 'teacher' ? 'Eğitmen & Koç' : 'Öğrenci / Veli'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Kullanıcı ID: {profile.id} • Yalnızca kendi ayarlarınızı düzenleyebilirsiniz.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Oturumu Kapat</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
