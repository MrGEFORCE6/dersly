'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { initialStudents, currentTeacher } from '@/data/mockData';
import { fetchProfiles, fetchMessages, sendMessage, subscribeToMessages } from '@/lib/services/supabaseService';
import type { Profile, Message } from '@/types/database.types';
import { 
  ArrowLeft, 
  Send, 
  Smile, 
  Paperclip, 
  Search, 
  CheckCheck, 
  GraduationCap, 
  MoreVertical, 
  Phone, 
  Video, 
  Circle,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ChatFriend {
  profile: Profile;
  online: boolean;
  statusText: string;
  lastActive: string;
}

export default function ChatPage() {
  const { accentClasses } = useTheme();

  // Current logged in user (defaults to student s-001 Zeynep Kaya)
  const [currentUser, setCurrentUser] = useState<Profile>(initialStudents[0].profile);
  const [friends, setFriends] = useState<ChatFriend[]>([
    {
      profile: initialStudents[1]?.profile || {
        id: 's-002',
        full_name: 'Emre Demir',
        username: 'emre.demir',
        role: 'student',
        avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        bio: 'Hedef İTÜ Endüstri Müh. | Sayısal 12. Sınıf',
        created_at: '2026-10-11T00:00:00.000Z',
        updated_at: '2026-10-11T00:00:00.000Z',
      },
      online: true,
      statusText: 'Ders çalışıyor 📚',
      lastActive: 'Şimdi aktif',
    },
    {
      profile: initialStudents[2]?.profile || {
        id: 's-003',
        full_name: 'Selin Yıldız',
        username: 'selin.yildiz',
        role: 'student',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        bio: 'Hedef Cerrahpaşa Tıp 🩺',
        created_at: '2026-10-11T00:00:00.000Z',
        updated_at: '2026-10-11T00:00:00.000Z',
      },
      online: true,
      statusText: 'AYT Biyoloji tekrarı',
      lastActive: '5 dk önce',
    },
    {
      profile: initialStudents[3]?.profile || {
        id: 's-004',
        full_name: 'Barış Koç',
        username: 'baris.koc',
        role: 'student',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        bio: 'ODTÜ Havacılık & Uzay',
        created_at: '2026-10-11T00:00:00.000Z',
        updated_at: '2026-10-11T00:00:00.000Z',
      },
      online: false,
      statusText: 'Deneme sınavında',
      lastActive: '35 dk önce',
    },
    {
      profile: currentTeacher,
      online: true,
      statusText: 'Eğitmen & Koç',
      lastActive: 'Çevrimiçi',
    },
  ]);

  const [selectedFriend, setSelectedFriend] = useState<ChatFriend>(friends[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load profiles and set current user if stored in cookie/localStorage
  useEffect(() => {
    async function initUser() {
      if (typeof window !== 'undefined') {
        const storedRole = localStorage.getItem('derspompa_current_role');
        const storedId = localStorage.getItem('derspompa_current_user_id');
        if (storedRole === 'teacher' || storedId === currentTeacher.id) {
          setCurrentUser(currentTeacher);
          setSelectedFriend(friends[0]); // student
        }
      }

      const allProfiles = await fetchProfiles();
      if (allProfiles && allProfiles.length > 0) {
        // Find other users to populate friends list
        const otherProfiles = allProfiles.filter(p => p.id !== currentUser.id);
        if (otherProfiles.length > 0) {
          const mapped: ChatFriend[] = otherProfiles.map((p, idx) => ({
            profile: p,
            online: idx % 2 === 0,
            statusText: p.role === 'teacher' ? 'Eğitmen & Koç' : 'Soru çözüyor ✍️',
            lastActive: idx % 2 === 0 ? 'Şimdi aktif' : '15 dk önce',
          }));
          setFriends(mapped);
          setSelectedFriend(mapped[0]);
        }
      }
    }
    initUser();
  }, []);

  // Fetch conversation messages when selected friend changes
  useEffect(() => {
    async function loadChat() {
      if (!selectedFriend) return;
      const msgs = await fetchMessages(currentUser.id, selectedFriend.profile.id);
      setMessages(msgs);
    }
    loadChat();

    // Subscribe to incoming messages
    const unsubscribe = subscribeToMessages((newMsg) => {
      if (
        (newMsg.sender_id === selectedFriend.profile.id && newMsg.receiver_id === currentUser.id) ||
        (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedFriend.profile.id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedFriend, currentUser.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const created = await sendMessage({
        sender_id: currentUser.id,
        receiver_id: selectedFriend.profile.id,
        content,
        is_read: false,
      });

      if (created) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === created.id)) return prev;
          return [...prev, created];
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.profile.username && f.profile.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Top Header */}
      <header className="border-b transition-colors glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href={currentUser.role === 'teacher' ? '/dashboard' : '/student'}
              className="p-2 rounded-xl hover:bg-slate-800/40 text-slate-400 hover:text-white transition-colors"
              title="Geri Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">DersPompa</span>
            </Link>

            <span className="text-slate-600 hidden sm:inline">/</span>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Öğrenci & Arkadaş Canlı Sohbet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            <Link
              href={currentUser.role === 'teacher' ? '/dashboard' : '/student'}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/40 transition-colors"
            >
              {currentUser.role === 'teacher' ? 'Eğitmen Paneli' : 'Öğrenci Portalı'}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Friends Sidebar (4 cols on md+) */}
        <div className="md:col-span-4 lg:col-span-4 rounded-3xl glass-panel border border-slate-800/80 flex flex-col h-[calc(100vh-7.5rem)] overflow-hidden shadow-xl">
          {/* Search Header */}
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Mesajlar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {friends.length} Arkadaş
                </span>
              </h2>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Realtime Aktif
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Arkadaş veya hoca ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {filteredFriends.map((f) => {
              const isSelected = selectedFriend.profile.id === f.profile.id;
              return (
                <button
                  key={f.profile.id}
                  onClick={() => setSelectedFriend(f)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left group ${
                    isSelected
                      ? 'bg-indigo-600/15 border border-indigo-500/30 shadow-md'
                      : 'hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={f.profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={f.profile.full_name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700/80 shadow"
                    />
                    {f.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {f.profile.full_name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                        {f.lastActive}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[11px] text-slate-400 truncate">
                        {f.statusText}
                      </span>
                      {f.profile.role === 'teacher' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          Koç
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Thread Panel (8 cols on md+) */}
        <div className="md:col-span-8 lg:col-span-8 rounded-3xl glass-panel border border-slate-800/80 flex flex-col h-[calc(100vh-7.5rem)] overflow-hidden shadow-2xl">
          {/* Active Conversation Top Bar (Instagram Direct Style) */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedFriend.profile.avatar_url || ''}
                  alt={selectedFriend.profile.full_name}
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow"
                />
                {selectedFriend.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{selectedFriend.profile.full_name}</span>
                  {selectedFriend.online ? (
                    <span className="text-[10px] font-normal text-emerald-400">● Çevrimiçi</span>
                  ) : (
                    <span className="text-[10px] font-normal text-slate-500">{selectedFriend.lastActive}</span>
                  )}
                </h3>
                <span className="text-[11px] text-slate-400 block font-mono">
                  @{selectedFriend.profile.username || 'ogrenci'} • {selectedFriend.statusText}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <button 
                className="p-2 rounded-xl hover:bg-slate-800/60 hover:text-white transition-colors"
                title="Sesli Arama (Simüle)"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded-xl hover:bg-slate-800/60 hover:text-white transition-colors"
                title="Görüntülü Çalışma Odası (Simüle)"
              >
                <Video className="w-4 h-4" />
              </button>
              <Link 
                href="/profile" 
                className="p-2 rounded-xl hover:bg-slate-800/60 hover:text-white transition-colors"
                title="Profili Gör"
              >
                <MoreVertical className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            <div className="text-center my-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800/60">
                Uçtan Uca Güvenli & Şifreli Sohbet
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white">Henüz mesaj yok</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  {selectedFriend.profile.full_name} ile soru tartışmaya veya çalışma planı yapmaya başla!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;
                const timeString = new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={selectedFriend.profile.avatar_url || ''}
                        alt="Avatar"
                        className="w-7 h-7 rounded-xl object-cover border border-slate-700 shrink-0 mb-1"
                      />
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[70%] px-4 py-2.5 shadow-md text-xs leading-relaxed transition-all ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-xs shadow-indigo-600/20'
                          : 'bg-slate-800/80 text-slate-100 rounded-2xl rounded-bl-xs border border-slate-700/60'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div
                        className={`flex items-center gap-1.5 mt-1 text-[9px] ${
                          isMe ? 'text-indigo-200 justify-end' : 'text-slate-400 justify-start'
                        }`}
                      >
                        <span>{timeString}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box (Instagram Direct rounded bubble) */}
          <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/40 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Dosya veya PDF Ekle"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setInputText((prev) => prev + ' 🚀 ')}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors hidden sm:block"
                title="Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`${selectedFriend.profile.full_name} kullanıcısına mesaj gönder...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 pr-10 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className={`p-3 rounded-2xl font-semibold flex items-center justify-center transition-all ${
                  inputText.trim() && !isSending
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-100'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title="Gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
