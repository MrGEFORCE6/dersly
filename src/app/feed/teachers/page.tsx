'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  BookOpen, 
  MessageSquare, 
  Share2, 
  Send, 
  Sparkles, 
  GraduationCap, 
  HelpCircle, 
  AlertTriangle, 
  ArrowLeft,
  Users,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { 
  fetchPosts, 
  createPost, 
  fetchComments, 
  createComment, 
  toggleLike, 
  fetchProfiles 
} from '@/lib/services/supabaseService';
import type { Post, Comment, Profile } from '@/types/database.types';

export default function TeachersLoungeFeedPage() {
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('teacher');
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>({
    id: 't-001',
    full_name: 'Ahmet Hoca',
    username: 'ahmethoca',
    role: 'teacher',
    bio: 'Özel Ders Koçu & Matematik/Fizik Eğitmeni',
    phone: '+90 532 555 1020',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    exam_stats: null,
    privacy_settings: null,
    theme_preference: null,
    created_at: '2026-10-11T00:00:00.000Z',
    updated_at: '2026-10-11T00:00:00.000Z',
  });

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostTag, setNewPostTag] = useState<'resource' | 'announcement' | 'general'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    // Check role from cookies
    const cookieMatch =
      document.cookie.match(/dersly_user_role=([^;]+)/) ||
      document.cookie.match(/derspompa_user_role=([^;]+)/);
    if (cookieMatch) {
      setUserRole(cookieMatch[1] as any);
    }

    async function loadLounge() {
      const fetched = await fetchPosts('teachers_lounge');
      if (!fetched || fetched.length === 0) {
        const seedLoungePosts: Post[] = [
          {
            id: 'post-t1',
            author_id: 't-001',
            feed_type: 'teachers_lounge',
            title: '2026 YKS Matematik: Yeni Nesil Analitik Geometri Soru Dağılımı',
            content: 'Değerli zümre arkadaşlarım, son MEB müfredat kazanımlarında çember analitiğindeki parametrik denklem ağırlığı azaltıldı. Öğrencilerinize deneme hazırlarken doğruda analitik ve katı cisim hacim bağıntılarına öncelik vermenizi öneririm.',
            media_urls: [],
            tag: 'resource',
            likes_count: 32,
            comments_count: 5,
            created_at: '2026-10-10T14:00:00.000Z',
            updated_at: '2026-10-10T14:00:00.000Z',
          },
          {
            id: 'post-t2',
            author_id: 't-002',
            feed_type: 'teachers_lounge',
            title: 'Öğrencilerde Deneme Sınavı Kaygısını Yönetme Rehberi',
            content: 'Öğrencinin neti 80 den 70 e düştüğünde veli baskısıyla motivasyon kırılması çok sık yaşanıyor. Bu gibi durumlarda öğrenciye haftalık net dalgalanmalarının öğrenme sürecinin doğal bir parçası olduğunu vurgulayan rehberlik notumuzu ekteki gibi paylaşıyorum.',
            media_urls: [],
            tag: 'announcement',
            likes_count: 45,
            comments_count: 12,
            created_at: '2026-10-09T11:20:00.000Z',
            updated_at: '2026-10-09T11:20:00.000Z',
          },
        ];
        setPosts(seedLoungePosts);
      } else {
        setPosts(fetched);
      }
    }
    loadLounge();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);

    const created = await createPost({
      author_id: currentUser.id,
      feed_type: 'teachers_lounge',
      title: newPostTitle.trim() || 'Akademi Zümre Notu',
      content: newPostContent.trim(),
      media_urls: [],
      tag: newPostTag,
    });

    setPosts([created, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setIsSubmitting(false);
    showToast('✓ Zümre paylaşımınız Öğretmenler Odasına kaydedildi!');
  };

  const handleCopyBridgeLink = (postId: string) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    showToast('✓ Özel Gönderi Köprüsü linki kopyalandı! Bu linkle öğrenciniz sadece bu gönderiyi görebilir.');
  };

  // SECURITY FIREWALL CHECK FOR STUDENTS
  if (userRole === 'student') {
    return (
      <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl glass-panel bg-white dark:bg-slate-900 border border-amber-500/30 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Güvenlik Duvarı Aktif • HTTP 403
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Öğretmenler Odası (Akademi) Gizlidir
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bu alan yalnızca onaylı eğitmenlerin zümre toplantıları ve müfredat paylaşımları için ayrılmıştır. Öğrenci veya veli hesapları bu akışa erişemez.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/feed/students"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <ArrowLeft className="w-4 h-4" /> Öğrenci Kampüsüne Dön
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

      <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Öğretmenler Odası (Akademi) • Kapalı Devre
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Eğitmen Zümre & Müfredat Akışı
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Öğrencilere kapalı, yalnızca branş hocaları ve eğitim koçlarının yer aldığı mesleki tartışma ve paylaşım ağı.
            </p>
          </div>

          {/* New Academic Post Form */}
          <div className="p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Yeni Zümre / Akademi Paylaşımı
            </h2>

            <input
              type="text"
              placeholder="Başlık (örn: 2026 AYT Fizik Deneme Analiz Notları)"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />

            <textarea
              rows={3}
              placeholder="Kazanım değerlendirmeleri, öğrenci gelişim tavsiyeleri veya sınav hazırlık notlarınızı buraya yazın..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <select
                value={newPostTag}
                onChange={(e) => setNewPostTag(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="general">☕ Zümre Tartışması</option>
                <option value="resource">📑 Müfredat & Kaynak Tavsiyesi</option>
                <option value="announcement">📢 Zümre Duyurusu</option>
              </select>

              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || !newPostContent.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 disabled:opacity-40 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Paylaş
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-amber-500/40 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                        alt="Eğitmen"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Ahmet Hoca
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Matematik Zümresi
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400">#Akademi</span>
                </div>

                <div className="space-y-1.5">
                  {post.title && (
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {post.title}
                    </h3>
                  )}
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Footer Bridge Link */}
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Zümreye Açık ({post.likes_count} Beğeni)
                  </span>

                  {/* Bridge link to share with student safely */}
                  <button
                    onClick={() => handleCopyBridgeLink(post.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
                    title="Öğrenciye Tekil Gönderi Linki Ver"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Öğrenciye Tekil Link Gönder 🔗
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <aside className="space-y-6">
          <div className="p-6 rounded-3xl bg-stone-100/60 dark:bg-slate-800/40 border border-stone-200 dark:border-slate-700 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Öğrenci Güvenlik Protokolü
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Öğretmenler Odası paylaşımları öğrencilerin arama ve ana sayfalarında listelenmez. Bir öğrenciye tekil link (<code className="font-mono text-indigo-500">/posts/[id]</code>) verdiğinizde yalnızca o içeriği okuyabilir; bu odadaki diğer yazıları göremez.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              Zümre Konuları
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-center justify-between">
                <span>📐 Geometri Müfredat Değişiklikleri</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-slate-700">12 yazı</span>
              </li>
              <li className="flex items-center justify-between">
                <span>⏱️ Sınav Süresi Yönetim Taktikleri</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-slate-700">8 yazı</span>
              </li>
              <li className="flex items-center justify-between">
                <span>🧠 Sözel Mantık & Paragraf Teknikleri</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-slate-700">15 yazı</span>
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
