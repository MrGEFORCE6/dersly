'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  HelpCircle, 
  MessageCircle, 
  Heart, 
  Share2, 
  Send, 
  Image as ImageIcon, 
  CheckCircle2, 
  UserPlus, 
  UserCheck, 
  Filter, 
  BookOpen, 
  Compass,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { 
  fetchPosts, 
  createPost, 
  fetchComments, 
  createComment, 
  toggleLike, 
  checkUserLiked, 
  toggleFollow, 
  checkUserFollowing, 
  fetchProfiles 
} from '@/lib/services/supabaseService';
import type { Post, Comment, Profile, PostTag } from '@/types/database.types';

export default function StudentCampusFeedPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'questions'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>({
    id: 's-001',
    full_name: 'Zeynep Kaya',
    username: 'zeynep.kaya',
    role: 'student',
    bio: 'Hedef: Boğaziçi Bilgisayar Müh. 🚀',
    phone: '+90 542 111 2233',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    exam_stats: { tyt_net: 98.5, ayt_net: 72.0, weekly_question_target: 750 },
    privacy_settings: null,
    theme_preference: null,
    created_at: '2026-10-11T00:00:00.000Z',
    updated_at: '2026-10-11T00:00:00.000Z',
  });

  // New Post Form State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState<PostTag>('general');
  const [newPostMedia, setNewPostMedia] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active expanded comments
  const [expandedComments, setExpandedComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadFeed() {
      const [fetchedPosts, fetchedProfiles] = await Promise.all([
        fetchPosts('student_campus'),
        fetchProfiles(),
      ]);

      if (fetchedProfiles && fetchedProfiles.length > 0) {
        setProfiles(fetchedProfiles);
        const me = fetchedProfiles.find((p) => p.role === 'student');
        if (me) setCurrentUser(me);
      }

      // If empty state, provide initial vibrant campus questions/posts
      if (!fetchedPosts || fetchedPosts.length === 0) {
        const seedCampusPosts: Post[] = [
          {
            id: 'post-c1',
            author_id: 's-001',
            feed_type: 'student_campus',
            title: 'Türevde teğet eğimi maksimum olan nokta sorusu (AYT Matematik)',
            content: 'Arkadaşlar Apotemi Türev test 8 soru 14 te f(x) = -x³ + 3x² fonksiyonunun eğiminin maksimum olduğu apsisi soruyor. İkinci türevi sıfırlayıp x=1 buldum ama yerel ekstremumla karıştırdım, bakar mısınız?',
            media_urls: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'],
            tag: 'question',
            likes_count: 14,
            comments_count: 3,
            created_at: '2026-10-11T09:30:00.000Z',
            updated_at: '2026-10-11T09:30:00.000Z',
          },
          {
            id: 'post-c2',
            author_id: 's-002',
            feed_type: 'student_campus',
            title: 'Haftalık 750 soru barajını geçen var mı?',
            content: 'Bu hafta limit-türevi bitirdim ve toplam 820 soru çözdüm. Deneme netlerim TYT 96 ya fırladı! Çalışma programını isteyen olursa DM den atabilirim ✨',
            media_urls: [],
            tag: 'general',
            likes_count: 28,
            comments_count: 7,
            created_at: '2026-10-10T18:15:00.000Z',
            updated_at: '2026-10-10T18:15:00.000Z',
          },
        ];
        setPosts(seedCampusPosts);
      } else {
        setPosts(fetchedPosts);
      }
    }
    loadFeed();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);

    const created = await createPost({
      author_id: currentUser.id,
      feed_type: 'student_campus',
      title: newPostTag === 'question' ? 'İmece Soru Havuzu Sorusu' : null,
      content: newPostContent.trim(),
      media_urls: newPostMedia ? [newPostMedia] : [],
      tag: newPostTag,
    });

    setPosts([created, ...posts]);
    setNewPostContent('');
    setNewPostMedia('');
    setNewPostTag('general');
    setIsSubmitting(false);
    showToast('✓ Gönderiniz Öğrenci Kampüsünde paylaşıldı!');
  };

  const handleToggleLike = async (postId: string) => {
    const res = await toggleLike(postId, currentUser.id);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: res.count } : p))
    );
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedComments[postId]) {
      const next = { ...expandedComments };
      delete next[postId];
      setExpandedComments(next);
    } else {
      const cmts = await fetchComments(postId);
      setExpandedComments((prev) => ({ ...prev, [postId]: cmts }));
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const created = await createComment({
      post_id: postId,
      author_id: currentUser.id,
      content: text.trim(),
    });

    setExpandedComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), created],
    }));

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p))
    );
    showToast('✓ Çözüm/Yorumunuz paylaşıldı!');
  };

  const handleShareLink = (postId: string) => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    showToast('✓ Gönderi bağlantısı kopyalandı! Arkadaşına veya hocana gönderebilirsin.');
  };

  const filteredPosts = activeTab === 'questions'
    ? posts.filter((p) => p.tag === 'question')
    : posts;

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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feed Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feed Title & Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Öğrenci Sosyal Ağı
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Öğrenci Kampüsü ✨
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Soru sor, çözüm paylaş, çalışma arkadaşlarınla yarış
              </p>
            </div>

            {/* Sub-tab pills */}
            <div className="flex bg-stone-100 dark:bg-slate-800 p-1 rounded-2xl border border-stone-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Tüm Akış
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'questions'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                İmece Soru Havuzu
              </button>
            </div>
          </div>

          {/* Create Post Box */}
          <div className="p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-stone-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.full_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={
                    activeTab === 'questions'
                      ? 'Çözemediğin soruyu buraya yaz, ipucu veya çözüm iste...'
                      : 'Kampüste ne var ne yok? Bugün kaç soru çözdün, bir soru veya not paylaş...'
                  }
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />

                {/* Media URL Input Option */}
                {newPostMedia !== '' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Görsel URL'si (ör: https://...)"
                      value={newPostMedia}
                      onChange={(e) => setNewPostMedia(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={() => setNewPostMedia('')}
                      className="text-xs text-rose-500 font-bold px-2 py-1"
                    >
                      Kaldır
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    {/* Tag Switcher */}
                    <select
                      value={newPostTag}
                      onChange={(e) => setNewPostTag(e.target.value as PostTag)}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="general">💬 Genel Paylaşım</option>
                      <option value="question">❓ Soru Havuzuna Gönder</option>
                      <option value="resource">📚 Ders Notu / Kaynak</option>
                    </select>

                    <button
                      onClick={() => setNewPostMedia('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80')}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                      title="Soru Fotoğrafı Ekle"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleCreatePost}
                    disabled={isSubmitting || !newPostContent.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Paylaş
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const author = profiles.find((p) => p.id === post.author_id) || currentUser;
              const isLiked = checkUserLiked(post.id, currentUser.id);
              const isCommentsOpen = !!expandedComments[post.id];
              const commentsList = expandedComments[post.id] || [];

              return (
                <article
                  key={post.id}
                  className="p-5 sm:p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-sm space-y-4 transition-all hover:border-indigo-500/30"
                >
                  {/* Post Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-stone-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                        <img
                          src={author.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                          alt={author.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {author.full_name}
                          </span>
                          <span className="text-xs text-indigo-500 font-mono font-medium">
                            @{author.username || 'ogrenci'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} • YKS Sayısal
                        </span>
                      </div>
                    </div>

                    {/* Tag Badge */}
                    <div>
                      {post.tag === 'question' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          Soru Havuzu
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Kampüs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-2">
                    {post.title && (
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Media Attachment if any */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-800 max-h-96 bg-stone-100 dark:bg-slate-800">
                      <img
                        src={post.media_urls[0]}
                        alt="Soru Görseli"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Action Bar (Likes, Comments, Share Link) */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-4">
                      {/* Heart Like */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-bold transition-colors ${
                          isLiked
                            ? 'text-rose-500'
                            : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                        <span>{post.likes_count}</span>
                      </button>

                      {/* Comment */}
                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments_count} Yorum / Çözüm</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShareLink(post.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                        title="Tekil Gönderi Bağlantısını Kopyala"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Detay <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Expanded Comments / Solutions */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-stone-100 dark:border-slate-800 space-y-3">
                      {commentsList.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          Henüz bir çözüm veya yorum yazılmamış. İlk ipucunu sen ver!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {commentsList.map((cmt) => (
                            <div
                              key={cmt.id}
                              className="p-3 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Öğrenci Çözümü
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(cmt.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">
                                {cmt.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Çözüm veya fikir yaz..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                        >
                          Gönder
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Right Column: Campus Sidebar (1 col) */}
        <aside className="space-y-6">
          {/* Soru Havuzu Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
              <HelpCircle className="w-4 h-4" />
              İmece Soru Havuzu
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Takıldığın bir soruyu fotoğraflayıp sor; yüzlerce öğrenci ve hocalar anında çözüm adımlarını yollasın.
            </p>
            <button
              onClick={() => {
                setActiveTab('questions');
                setNewPostTag('question');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              + Soru Paylaş
            </button>
          </div>

          {/* Haftanın Soru Liderleri (Leaderboard) */}
          <div className="p-5 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Bu Haftanın Liderleri
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Zeynep Kaya', net: '98.5 TYT', solved: '820 Soru', rank: '1' },
                { name: 'Emre Demir', net: '94.0 TYT', solved: '760 Soru', rank: '2' },
                { name: 'Selin Yıldız', net: '91.5 TYT', solved: '690 Soru', rank: '3' },
              ].map((ldr) => (
                <div
                  key={ldr.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                      {ldr.rank}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {ldr.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{ldr.solved}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {ldr.net}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Akıllı Kitaplığım Quick Link */}
          <div className="p-5 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
              Öğrenci Kütüphanem
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gemini Vision OCR ile kitaplarının kapağını tarat, konuları profiline ekle.
            </p>
            <Link
              href="/student/library"
              className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              Kitaplığıma Git <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
