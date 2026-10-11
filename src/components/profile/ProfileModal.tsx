'use client';

import { useState } from 'react';
import type { Profile, ExamStats, StatsVisibility } from '@/types/database.types';
import { updateProfile, uploadFileToStorage } from '@/lib/services/supabaseService';
import { 
  X, 
  User, 
  Camera, 
  AtSign, 
  FileText, 
  Target, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Users,
  Sparkles,
  BarChart3
} from 'lucide-react';

interface ProfileModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updated: Profile) => void;
  onSave?: (updated: Profile) => void;
}

export function ProfileModal({
  profile,
  isOpen,
  onClose,
  onProfileUpdated,
  onSave,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [username, setUsername] = useState(profile.username || `user_${profile.id.slice(0, 6)}`);
  const [bio, setBio] = useState(profile.bio || 'YKS 2027 Sayısal Hedef 🎯 Hedef İTÜ Bilgisayar');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Exam stats
  const initialStats = profile.exam_stats || {
    tyt_net: 85.5,
    ayt_net: 68.25,
    weekly_question_target: 750,
    weekly_questions_solved: 540,
    latest_trial_rank: '12 / 180',
  };
  const [tytNet, setTytNet] = useState(initialStats.tyt_net?.toString() || '85.5');
  const [aytNet, setAytNet] = useState(initialStats.ayt_net?.toString() || '68.25');
  const [weeklyTarget, setWeeklyTarget] = useState(initialStats.weekly_question_target?.toString() || '750');
  const [weeklySolved, setWeeklySolved] = useState(initialStats.weekly_questions_solved?.toString() || '540');
  const [trialRank, setTrialRank] = useState(initialStats.latest_trial_rank || '12 / 180');

  // Privacy settings
  const [visibility, setVisibility] = useState<StatsVisibility>(
    profile.privacy_settings?.stats_visibility || 'public'
  );

  if (!isOpen) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadFileToStorage('avatars', file, file.name);
      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedExamStats: ExamStats = {
      tyt_net: parseFloat(tytNet) || 0,
      ayt_net: parseFloat(aytNet) || 0,
      weekly_question_target: parseInt(weeklyTarget, 10) || 0,
      weekly_questions_solved: parseInt(weeklySolved, 10) || 0,
      latest_trial_rank: trialRank.trim(),
    };

    const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();

    const result = await updateProfile(profile.id, {
      full_name: fullName.trim(),
      username: cleanUsername,
      bio: bio.trim(),
      avatar_url: avatarUrl,
      exam_stats: updatedExamStats,
      privacy_settings: { stats_visibility: visibility },
    });

    setIsSaving(false);
    if (result) {
      if (onProfileUpdated) onProfileUpdated(result);
      if (onSave) onSave(result);
      setNotice('Profil ve net istatistikleri başarıyla Supabase veri tabanına kaydedildi!');
      setTimeout(() => {
        setNotice(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instagram Tarzı Profil & Net İstatistikleri</h3>
              <p className="text-xs text-slate-400">Sosyal profilinizi ve sınav hedeflerinizi yönetin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notice && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Avatar & Basic Info Card */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="relative group">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={fullName}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
              />
              <label className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] text-white mt-1">Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center text-[10px] text-indigo-400 font-mono">
                  Yükleniyor...
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Kullanıcı Adı (Benzersiz @tag)
                </label>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-indigo-400 font-mono text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="kullaniciadi"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Bio (Hakkında / Hedef) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Biyografi & Sınav Hedefi
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Örn: 2027 Sayısal Hedef 🎯 Boğaziçi & İTÜ"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Exam Stats Grid (TYT & AYT Netleri, Soru Hedefi) */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Sınav & Net İstatistikleri
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Doğrudan Veritabanına Yazılır</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Son TYT Neti
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={tytNet}
                  onChange={(e) => setTytNet(e.target.value)}
                  placeholder="85.50"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Son AYT Neti
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={aytNet}
                  onChange={(e) => setAytNet(e.target.value)}
                  placeholder="68.25"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Haftalık Soru Hedefi</label>
                <input
                  type="number"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Çözülen Soru</label>
                <input
                  type="number"
                  value={weeklySolved}
                  onChange={(e) => setWeeklySolved(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Deneme Sırası</label>
                <input
                  type="text"
                  value={trialRank}
                  onChange={(e) => setTrialRank(e.target.value)}
                  placeholder="12 / 180"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings (Kimler Görebilir?) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              İstatistikleri Kimler Görebilir? (Gizlilik Ayarı)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'public' as StatsVisibility, label: 'Herkese Açık', desc: 'Tüm öğrenciler ve hoca', icon: Globe },
                { id: 'followers_only' as StatsVisibility, label: 'Takipçiler', desc: 'Ortak ders arkadaşları', icon: Users },
                { id: 'only_me_and_teacher' as StatsVisibility, label: 'Özel', desc: 'Sadece ben ve hocam', icon: Lock },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = visibility === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVisibility(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                        : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="block text-xs font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet ve Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
