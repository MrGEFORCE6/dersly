'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  Share2, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { 
  fetchPostById, 
  fetchComments, 
  createComment, 
  toggleLike, 
  checkUserLiked, 
  fetchProfiles 
} from '@/lib/services/supabaseService';
import type { Post, Comment, Profile } from '@/types/database.types';

function SinglePostBridgeContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const postId = unwrappedParams.id;

  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<Profile>({
    id: 's-001',
    full_name: 'Zeynep Kaya',
    username: 'zeynep.kaya',
    role: 'student',
    bio: 'Hedef: Boğaziçi Bilgisayar Müh.',
    phone: '+90 542 111 2233',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    exam_stats: null,
    privacy_settings: null,
    theme_preference: null,
    created_at: '2026-10-11T00:00:00.000Z',
    updated_at: '2026-10-11T00:00:00.000Z',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function loadPostData() {
      setIsLoading(true);
      const [foundPost, allComments, profiles] = await Promise.all([
        fetchPostById(postId),
        fetchComments(postId),
        fetchProfiles(),
      ]);

      if (foundPost) {
        setPost(foundPost);
        const auth = profiles.find((p) => p.id === foundPost.author_id);
        if (auth) setAuthor(auth);
      } else {
        // Fallback demo bridge post for testing
        setPost({
          id: postId,
          author_id: 't-001',
          feed_type: 'teachers_lounge',
          title: 'Hocandan Özel Soru & Rehberlik Notu 📌',
          content: 'Sevgili öğrencim, bugün derste üzerinde durduğumuz teğet denklemi ve türevin geometrik yorumu ile ilgili bu soru çözüm yöntemini dikkatle incele. Soruları çözerken takıldığın adımı bu gönderinin altına yorum olarak yazabilirsin.',
          media_urls: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'],
          tag: 'question',
          likes_count: 18,
          comments_count: 2,
          created_at: '2026-10-11T10:00:00.000Z',
          updated_at: '2026-10-11T10:00:00.000Z',
        });
      }

      setComments(allComments || []);
      setIsLoading(false);
    }
    loadPostData();
  }, [postId]);

  const handleToggleLike = async () => {
    if (!post) return;
    const res = await toggleLike(post.id, currentUser.id);
    setPost({ ...post, likes_count: res.count });
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !post) return;
    const created = await createComment({
      post_id: post.id,
      author_id: currentUser.id,
      content: newComment.trim(),
    });
    setComments([...comments, created]);
    setNewComment('');
    showToast('✓ Çözüm / Yorumunuz hocanıza iletildi!');
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('✓ Özel gönderi linki kopyalandı!');
  };

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

      <main id="main-content" className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/feed/students"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Akışa Geri Dön
          </Link>

          {/* Security Notice: Single Post Isolation Bridge */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            İzole Gönderi Köprüsü (Güvenli Paylaşım)
          </div>
        </div>

        {/* Post Card */}
        {post && (
          <article className="p-6 sm:p-8 rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-xl space-y-6">
            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                  <img
                    src={author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={author?.full_name || 'Eğitmen'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {author?.full_name || 'Ahmet Hoca'}
                  </h2>
                  <span className="text-xs text-indigo-500 font-mono">
                    @{author?.username || 'ahmethoca'} • {author?.role === 'teacher' ? 'Eğitmen' : 'Öğrenci'}
                  </span>
                </div>
              </div>

              <span className="text-xs text-slate-400">
                {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
              </span>
            </div>

            {/* Title & Content */}
            <div className="space-y-3">
              {post.title && (
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  {post.title}
                </h1>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Media Image */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-700 max-h-[480px]">
                <img
                  src={post.media_urls[0]}
                  alt="Gönderi Eki"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Interaction Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleLike}
                  className="flex items-center gap-2 font-bold text-xs text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  <span>{post.likes_count} Beğeni</span>
                </button>

                <span className="flex items-center gap-2 font-bold text-xs text-slate-600 dark:text-slate-300">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>{comments.length} Çözüm / Yorum</span>
                </span>
              </div>

              <button
                onClick={handleShareLink}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Linki Paylaş
              </button>
            </div>

            {/* Comments & Discussion Thread */}
            <div className="pt-4 border-t border-stone-100 dark:border-slate-800 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Soru Çözümleri & İpuçları ({comments.length})
              </h3>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Henüz yorum veya çözüm adımı girilmemiş. İlk çözümü sen paylaş!
                  </p>
                ) : (
                  comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Öğrenci / Eğitmen Notu
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(cmt.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {cmt.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Bu soruya dair çözümünü veya sorun olan noktayı yaz..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-40"
                >
                  Gönder
                </button>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

export default function SinglePostBridgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F172A] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SinglePostBridgeContent params={params} />
    </React.Suspense>
  );
}
