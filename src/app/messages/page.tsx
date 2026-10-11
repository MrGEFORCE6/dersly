'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  CheckCheck, 
  Smile, 
  Sparkles,
  ArrowLeft,
  Circle
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { fetchProfiles, fetchMessages, sendMessage } from '@/lib/services/supabaseService';
import type { Message, Profile } from '@/types/database.types';

interface DMContact {
  id: string;
  name: string;
  role: string;
  username: string;
  avatar: string;
  online: boolean;
  statusText?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const DEFAULT_CONTACTS: DMContact[] = [
  {
    id: 't-001',
    name: 'Ahmet Hoca',
    role: 'Eğitmen',
    username: 'ahmethoca',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    online: true,
    statusText: 'Müsait • Ders Planlama',
    lastMessage: 'Yarınki Türev dersi için föyü getirmeyi unutma 📚',
    lastMessageTime: '14:26',
    unreadCount: 1,
  },
  {
    id: 's-002',
    name: 'Emre Demir',
    role: 'Öğrenci',
    username: 'emre.demir',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    online: true,
    statusText: 'Kütüphanede çalışıyor',
    lastMessage: 'Fizik 4. sorunun çözümünü bulabildin mi?',
    lastMessageTime: '12:10',
    unreadCount: 0,
  },
  {
    id: 's-003',
    name: 'Selin Yıldız',
    role: 'Öğrenci',
    username: 'selin.yildiz',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    online: false,
    statusText: '1 saat önce aktif',
    lastMessage: 'Deneme analizi çok iyi geçti!',
    lastMessageTime: 'Dün',
    unreadCount: 0,
  },
];

export default function DirectMessagesPage() {
  const [contacts, setContacts] = useState<DMContact[]>(DEFAULT_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('t-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');

  // Conversation messages map
  const [conversations, setConversations] = useState<Record<string, Message[]>>({
    't-001': [
      {
        id: 'msg-1',
        sender_id: 't-001',
        receiver_id: 's-001',
        content: 'Selam Zeynep! Yarınki Türev dersi için föyündeki ilk 20 soruyu çözmeyi unutma.',
        is_read: true,
        created_at: '2026-10-11T11:20:00.000Z',
      },
      {
        id: 'msg-2',
        sender_id: 's-001',
        receiver_id: 't-001',
        content: 'Hocam 14. sorudaki teğet eğimi maksimum olan apsis sorusunda takıldım, derste ona bakabilir miyiz?',
        is_read: true,
        created_at: '2026-10-11T11:25:00.000Z',
      },
      {
        id: 'msg-3',
        sender_id: 't-001',
        receiver_id: 's-001',
        content: 'Tabii ki, derse başladığımızda ilk olarak o soruyu detaylıca analiz edeceğiz. Görüşmek üzere!',
        is_read: true,
        created_at: '2026-10-11T11:26:00.000Z',
      },
    ],
    's-002': [
      {
        id: 'msg-21',
        sender_id: 's-002',
        receiver_id: 's-001',
        content: 'Selam Zeynep! Bugünkü Fizik ödevindeki 4. soruyu çözebildin mi?',
        is_read: true,
        created_at: '2026-10-11T09:10:00.000Z',
      },
      {
        id: 'msg-22',
        sender_id: 's-001',
        receiver_id: 's-002',
        content: 'Evet, eylemsizlik momenti formülünü açısal ivmeyle bağlayınca hemen çıkıyor. PDF çözümümü birazdan atarım!',
        is_read: true,
        created_at: '2026-10-11T09:12:00.000Z',
      },
    ],
  });

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];
  const activeMessages = conversations[activeContactId] || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_id: 's-001',
      receiver_id: activeContactId,
      content: inputText.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setConversations((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg],
    }));

    setInputText('');

    // Simulate instant reply after 1.5s
    setTimeout(() => {
      const replyMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender_id: activeContactId,
        receiver_id: 's-001',
        content: 'Mesajını aldım! Hemen inceliyorum ✍️',
        is_read: true,
        created_at: new Date().toISOString(),
      };
      setConversations((prev) => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), replyMsg],
      }));
    }, 1500);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex">
        <div className="w-full h-[calc(100vh-140px)] rounded-3xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 shadow-2xl flex overflow-hidden">
          {/* Left Contacts Sidebar */}
          <aside className="w-80 sm:w-96 border-r border-stone-200 dark:border-slate-800 flex flex-col bg-stone-50/50 dark:bg-slate-950/40">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Mesajlar (Direct)
                </h2>
                <span className="text-xs text-indigo-500 font-mono">@zeynep.kaya</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Çevrimiçi" />
            </div>

            {/* Search Box */}
            <div className="p-3 border-b border-stone-200 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Kişi veya sohbet ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800/60">
              {filteredContacts.map((contact) => {
                const isSelected = contact.id === activeContactId;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContactId(contact.id)}
                    className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-r-4 border-indigo-600'
                        : 'hover:bg-stone-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full border border-stone-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {contact.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {contact.lastMessageTime}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {contact.lastMessage}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Active Chat Pane */}
          <section className="flex-1 flex flex-col bg-white dark:bg-slate-900">
            {/* Active Contact Header */}
            <div className="p-4 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between bg-[#FBFBF9]/60 dark:bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-stone-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shrink-0">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {activeContact.name}
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {activeContact.role}
                    </span>
                  </h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {activeContact.online ? '● Çevrimiçi' : activeContact.statusText}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <button
                  onClick={() => alert(`${activeContact.name} ile sesli arama başlatılıyor...`)}
                  className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  title="Sesli Arama"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert(`${activeContact.name} ile görüntülü ders başlatılıyor...`)}
                  className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                  title="Görüntülü Ders"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeMessages.map((msg) => {
                const isMe = msg.sender_id === 's-001';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-3xl p-4 shadow-sm text-xs leading-relaxed space-y-1.5 ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-stone-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] opacity-75">
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto border-t border-stone-100 dark:border-slate-800/60">
              <button
                onClick={() => setInputText('Hocam son soru için bir ipucu alabilir miyim?')}
                className="px-3 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap"
              >
                💡 Soru İpucu İste
              </button>
              <button
                onClick={() => setInputText('Yarınki ders saatimiz değişti mi?')}
                className="px-3 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap"
              >
                ⏱️ Ders Saati Kontrolü
              </button>
              <button
                onClick={() => setInputText('Ödevimi PDF olarak sisteme yükledim.')}
                className="px-3 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap"
              >
                📄 Ödev Teslim Notu
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => alert('Fotoğraf veya PDF eki gönderme seçeneği aktif!')}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                title="Dosya veya Görsel Ekle"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={`${activeContact.name} için bir mesaj yaz...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
