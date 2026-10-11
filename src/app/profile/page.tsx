'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { currentTeacher, initialStudents } from '@/data/mockData';
import { fetchProfiles, updateProfile, uploadFileToStorage } from '@/lib/services/supabaseService';
import type { Profile, ExamStats, StatsVisibility } from '@/types/database.types';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { 
  ArrowLeft, 
  Camera, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink,
  Edit3,
  Lock,
  Globe,
  Settings,
  Flame,
  Award,
  TrendingUp,
  Share2
} from 'lucide-react';

export default function ProfilePage() {
  const { accentClasses, resolvedMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'me' | 'explore'>('me');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile>(initialStudents[0].profile);

  // Edit fields
  const [fullName, setFullName] = useState(initialStudents[0].profile.full_name);
  const [username, setUsername] = useState(initialStudents[0].profile.username || 'zeynep.kaya');
  const [bio, setBio] = useState(initialStudents[0].profile.bio || 'Hedef Boğaziçi Bilgisayar Müh. 🚀');
  const [avatarUrl, setAvatarUrl] = useState(initialStudents[0].profile.avatar_url || '');
  const [tytNet, setTytNet] = useState(initialStudents[0].profile.exam_stats?.tyt_net || 98.5);
  const [aytNet, setAytNet] = useState(initialStudents[0].profile.exam_stats?.ayt_net || 72.0);
  const [weeklyTarget, setWeeklyTarget] = useState(initialStudents[0].profile.exam_stats?.weekly_question_target || 750);
  const [solvedQuestions, setSolvedQuestions] = useState(610);
  const [targetUniversity, setTargetUniversity] = useState(initialStudents[0].profile.exam_stats?.target_university || 'Boğaziçi Üniv. - Bilgisayar');
  const [visibility, setVisibility] = useState<StatsVisibility>('public');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const dbProfiles = await fetchProfiles();
      if (dbProfiles && dbProfiles.length > 0) {
        setProfiles(dbProfiles);

        let currentId = 's-001';
        let currentRole = 'student';
        if (typeof window !== 'undefined') {
          currentId = localStorage.getItem('derspompa_current_user_id') || 's-001';
          currentRole = localStorage.getItem('derspompa_current_role') || 'student';
        }

        const activeUser = dbProfiles.find((p) => p.id === currentId) || 
                           dbProfiles.find((p) => p.role === currentRole) || 
                           dbProfiles[0];

        if (activeUser) {
          setCurrentProfile(activeUser);
          setFullName(activeUser.full_name);
          setUsername(activeUser.username || (activeUser.role === 'teacher' ? 'ahmethoca' : 'zeynep.kaya'));
          setBio(activeUser.bio || '');
          setAvatarUrl(activeUser.avatar_url || '');
          if (activeUser.exam_stats) {
            setTytNet(activeUser.exam_stats.tyt_net || 98.5);
            setAytNet(activeUser.exam_stats.ayt_net || 72.0);
            setWeeklyTarget(activeUser.exam_stats.weekly_question_target || 750);
            setTargetUniversity(activeUser.exam_stats.target_university || 'Boğaziçi Üniv.');
          }
          if (activeUser.privacy_settings?.stats_visibility) {
            setVisibility(activeUser.privacy_settings.stats_visibility);
          }
        }
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadedUrl = await uploadFileToStorage('avatars', file, `${currentProfile.id}_social.jpg`);
    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
      showToast('Avatar fotoğrafı Supabase Storage (avatars) bucketına yüklendi!');
    }
    setIsUploading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedExamStats: ExamStats = {
      tyt_net: Number(tytNet),
      ayt_net: Number(aytNet),
      weekly_question_target: Number(weeklyTarget),
      weekly_questions_solved: Number(solvedQuestions),
      target_university: targetUniversity.trim(),
    };

    const updated = await updateProfile(currentProfile.id, {
      full_name: fullName.trim(),
      username: username.replace(/^@/, '').trim().toLowerCase(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
      exam_stats: updatedExamStats,
      privacy_settings: { stats_visibility: visibility },
    });

    setIsSaving(false);
    if (updated) {
      setCurrentProfile(updated);
      showToast('✓ Instagram profili ve net istatistikleri başarıyla güncellendi!');
    }
  };

  const progressPercent = Math.min(100, Math.round((solvedQuestions / (weeklyTarget || 1)) * 100));

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b transition-colors glass-nav">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/40 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri Dön</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
              @{username || 'profil'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 rounded-xl border border-slate-700/60 hover:bg-slate-800/40 text-slate-300 hover:text-white transition-colors"
              title="Ayarlar"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Instagram Profile Card Header */}
        <div className="rounded-3xl p-6 sm:p-8 glass-panel shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20" style={{ background: 'var(--accent-primary)' }} />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Camera badge */}
            <div className="relative group shrink-0">
              <div className="p-1 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                  alt={fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
                />
              </div>
              <label className="absolute bottom-1 right-1 p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-transform hover:scale-110">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info & Instagram Style Stats */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{fullName}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Doğrulanmış Öğrenci
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">@{username}</span>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-medium border border-slate-700/60 bg-slate-900/60 text-slate-300 flex items-center gap-1.5">
                    {visibility === 'public' ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Herkese Açık</span>
                      </>
                    ) : visibility === 'followers_only' ? (
                      <>
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>Sadece Arkadaşlar</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Özel & Eğitmen</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-slate-300 max-w-xl">
                {bio || 'Hedeflerine emin adımlarla ilerleyen YKS & Özel Ders öğrencisi.'}
              </p>

              {/* Quick Counter Row */}
              <div className="flex items-center justify-center sm:justify-start gap-6 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div>
                  <strong className="text-white font-mono text-sm">24</strong> Ders Tamamlandı
                </div>
                <div>
                  <strong className="text-white font-mono text-sm">18</strong> Teslim Edilen Ödev
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>14 Gün Seri</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('me')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'me'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sınav & Net Vitrinim (TYT / AYT)</span>
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'explore'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Diğer Öğrencilerin Vitrini ({profiles.filter((p) => p.role === 'student').length || initialStudents.length})</span>
          </button>
        </div>

        {/* Tab 1: Sınav & Net Vitrinim Form & Display */}
        {activeTab === 'me' && (
          <div className="space-y-6">
            {/* Net Cards Showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border bg-slate-900/60 flex flex-col justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs text-slate-400 font-medium">TYT Güncel Net</span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-2">
                  {tytNet}
                </div>
                <span className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Son denemede +3.5 net
                </span>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 flex flex-col justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs text-slate-400 font-medium">AYT Güncel Net</span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-400 mt-2">
                  {aytNet}
                </div>
                <span className="text-[10px] text-indigo-300 font-medium mt-1">
                  Matematik & Fen Odaklı
                </span>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 flex flex-col justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs text-slate-400 font-medium">Haftalık Soru Hedefi</span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-2">
                  {solvedQuestions} <span className="text-xs text-slate-500 font-normal">/ {weeklyTarget}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border bg-slate-900/60 flex flex-col justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs text-slate-400 font-medium">Hedef Üniversite & Bölüm</span>
                <div className="text-sm font-bold text-amber-300 mt-2 line-clamp-2">
                  {targetUniversity}
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  2027 YKS Adayı
                </span>
              </div>
            </div>

            {/* Profile & Net Edit Form */}
            <form onSubmit={handleSaveProfile} className="rounded-3xl p-6 sm:p-8 glass-panel shadow-xl space-y-6">
              <div className="pb-4 border-b border-slate-700/40 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                    Profil ve Sınav İstatistiklerini Düzenle
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Netlerinizi ve hedeflerinizi güncelleyerek hocanızla ve arkadaşlarınızla paylaşın.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet & Paylaş'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kullanıcı Adı (@kullaniciadi)
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Gizlilik (Kimler Görebilir?)
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as StatsVisibility)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="public">🌍 Herkese Açık</option>
                    <option value="followers_only">👥 Sadece Takipçiler / Arkadaşlar</option>
                    <option value="only_me_and_teacher">🔒 Sadece Ben ve Öğretmenim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    TYT Net
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={tytNet}
                    onChange={(e) => setTytNet(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    AYT Net
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={aytNet}
                    onChange={(e) => setAytNet(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Haftalık Soru Hedefi
                  </label>
                  <input
                    type="number"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hedef Üniversite / Bölüm
                  </label>
                  <input
                    type="text"
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    placeholder="Örn: Boğaziçi Üniversitesi Bilgisayar Mühendisliği"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Biyografi
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Diğer Öğrencilerin Vitrini (Salt Okunur Vitrin) */}
        {activeTab === 'explore' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <strong>Salt Okunur Vitrin Kartları:</strong> Diğer öğrencilerin başarı ve net istatistiklerini sadece görüntüleyebilirsiniz, düzenleme yetkiniz kısıtlıdır.
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20">
                RBAC Korumalı
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialStudents.map((st) => (
                <div
                  key={st.profile.id}
                  className="p-5 rounded-2xl glass-panel shadow-lg border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={st.profile.avatar_url || ''}
                      alt={st.profile.full_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{st.profile.full_name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          Salt Okunur
                        </span>
                      </div>
                      <span className="text-xs font-mono text-indigo-400 block">@{st.profile.username || 'ogrenci'}</span>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{st.profile.bio}</p>
                    </div>
                  </div>

                  {st.profile.exam_stats && (
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">TYT Net</span>
                        <strong className="text-white font-mono">{st.profile.exam_stats.tyt_net}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">AYT Net</span>
                        <strong className="text-indigo-400 font-mono">{st.profile.exam_stats.ayt_net}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Hedef Soru</span>
                        <strong className="text-emerald-400 font-mono">{st.profile.exam_stats.weekly_question_target}</strong>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{st.profile.exam_stats?.target_university || 'Hedef Boğaziçi / İTÜ'}</span>
                    <Link
                      href="/chat"
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Sohbet Başlat</span>
                      <Share2 className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
