'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  UserPlus, 
  Search, 
  Send, 
  QrCode, 
  Smartphone, 
  Sparkles,
  Users
} from 'lucide-react';
import { matchStudentDirect, createTeacherInvite } from '@/lib/services/supabaseService';
import type { Profile } from '@/types/database.types';

interface AddStudentInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  teacherName: string;
  onStudentMatched?: (student: Profile) => void;
  showToast: (msg: string) => void;
}

export function AddStudentInviteModal({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  onStudentMatched,
  showToast,
}: AddStudentInviteModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'search'>('link');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedPreview, setMatchedPreview] = useState<Profile | null>(null);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://derspompa.app';
  const teacherCode = `HOCA-${teacherId.slice(0, 6).toUpperCase()}`;
  const inviteUrl = `${origin}/join?teacherCode=${teacherCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    showToast('✓ Özel davet bağlantısı panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSearchStudent = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Search simulation from known students
    setTimeout(() => {
      setIsSearching(false);
      setMatchedPreview({
        id: 's-001',
        full_name: 'Zeynep Kaya',
        username: searchQuery.replace('@', '') || 'zeynep.kaya',
        role: 'student',
        bio: 'Hedef: Boğaziçi Üniversitesi Bilgisayar Müh.',
        phone: '+90 542 111 2233',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        exam_stats: { tyt_net: 98.5, ayt_net: 72.0, weekly_question_target: 750 },
        privacy_settings: null,
        theme_preference: null,
        created_at: '2026-10-11T00:00:00.000Z',
        updated_at: '2026-10-11T00:00:00.000Z',
      });
    }, 400);
  };

  const handleSendMatchRequest = async () => {
    if (!matchedPreview) return;
    await matchStudentDirect(teacherId, matchedPreview.id);
    showToast(`✓ "${matchedPreview.full_name}" başarıyla öğrenci portföyünüze eklendi!`);
    if (onStudentMatched) {
      onStudentMatched(matchedPreview);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl glass-panel bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Yeni Öğrenci Ekle & Davet Et
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Öğrencinizi sınıfınıza bağlayın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'link'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Özel Davet Bağlantısı
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Kullanıcı Adı ile Eşleş
          </button>
        </div>

        {/* TAB 1: INVITE LINK */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Aşağıdaki özel davet bağlantısını öğrencinize WhatsApp veya SMS ile gönderin. Öğrenci bu linke tıkladığında doğrudan sizin portföyünüze bağlanır.
            </p>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Öğretmen Davet Kodu
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                  {teacherCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Öğrenci kaydolduğunda takvim ve ödevler otomatik senkronize olur.
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: SEARCH BY USERNAME / PHONE */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Öğrencinizin sistemde kayıtlı kullanıcı adını (<code className="font-mono">@zeynep.kaya</code>) veya telefon numarasını girerek doğrudan portföyünüze ekleyin:
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="@kullaniciadi veya +90 5..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleSearchStudent}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs transition-colors disabled:opacity-40"
              >
                {isSearching ? 'Aranıyor...' : 'Ara'}
              </button>
            </div>

            {/* Matched Preview */}
            {matchedPreview && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={matchedPreview.avatar_url || ''}
                    alt={matchedPreview.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-stone-300 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {matchedPreview.full_name}
                    </h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                      @{matchedPreview.username}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {matchedPreview.bio}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSendMatchRequest}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Eşleştir
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
