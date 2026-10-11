import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

interface AiStudentAssistantProps {
  studentName?: string;
  course?: string;
  apiUrl?: string;
}

export function AiStudentAssistant({
  studentName = 'Zeynep',
  course = 'AYT Matematik & Fizik',
  apiUrl = 'http://localhost:3000/api/ai-tutor',
}: AiStudentAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Merhaba ${studentName}! 👋 Ben senin yapay zeka özel ders koçunum. Takıldığın bir soru veya formül olursa buradayım. Bugün hangi konuya odaklanıyoruz?`,
      time: '14:30',
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOpen, messages, isLoading]);

  const quickPrompts = [
    '📐 Trigonometri İpucu',
    '📝 Ödevlerimi Hatırlat',
    '✨ Biraz Motivasyon Ver',
    '⏱️ Sıradaki Dersim Ne Zaman?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // API'ye konuşma geçmişi ile birlikte istek gönder
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.sender === 'ai' ? ('model' as const) : ('user' as const),
        content: m.text,
      }));

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          studentName,
          course,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`API hatası: ${res.status}`);
      }

      const data = await res.json();
      const aiReply = data.reply || 'Harika bir soru! Adım adım çözelim.';

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('API isteği başarısız oldu, yerel pedagojik yanıt dönülüyor:', err);

      // Ağ veya bağlantı sorunu olursa yerel fallback
      const fallbackReply = `💡 İnternet bağlantısı veya sunucu gecikmesi oldu ama ben buradayım! Formülünü yazıp adım adım ilerleyelim. ${studentName}, sorunun ilk adımında ne görüyorsun?`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (Sağ Alt Köşe) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingEmoji}>🤖</Text>
        <View style={styles.badgePulse}>
          <Text style={styles.badgeText}>AI</Text>
        </View>
      </TouchableOpacity>

      {/* Alttan Açılan Sevecen Sohbet Penceresi (Bottom Sheet Modal) */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.aiHeaderInfo}>
                <View style={styles.aiAvatar}>
                  <Text style={{ fontSize: 22 }}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.aiTitle}>Akıllı Özel Ders Koçu</Text>
                  <Text style={styles.aiStatus}>
                    {isLoading ? '● Yanıt hazırlıyor...' : '● Çevrim içi • Gemini AI Destekli'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Prompts */}
            <View style={styles.quickBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickPrompts.map((p, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.promptChip}
                    onPress={() => handleSend(p)}
                    disabled={isLoading}
                  >
                    <Text style={styles.promptChipText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Chat Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={{ paddingVertical: 12 }}
            >
              {messages.map((m) => {
                const isAi = m.sender === 'ai';
                return (
                  <View
                    key={m.id}
                    style={[
                      styles.messageRow,
                      isAi ? styles.messageRowAi : styles.messageRowUser,
                    ]}
                  >
                    {isAi && (
                      <View style={styles.miniAvatar}>
                        <Text style={{ fontSize: 13 }}>🤖</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isAi ? styles.bubbleAi : styles.bubbleUser,
                      ]}
                    >
                      <Text style={[styles.messageText, isAi ? styles.textAi : styles.textUser]}>
                        {m.text}
                      </Text>
                      <Text style={[styles.timeText, isAi ? styles.timeAi : styles.timeUser]}>
                        {m.time}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Loading / Typing Indicator */}
              {isLoading && (
                <View style={[styles.messageRow, styles.messageRowAi]}>
                  <View style={styles.miniAvatar}>
                    <Text style={{ fontSize: 13 }}>✍️</Text>
                  </View>
                  <View style={[styles.messageBubble, styles.bubbleAi, styles.typingBubble]}>
                    <ActivityIndicator size="small" color="#6ee7b7" style={{ marginRight: 6 }} />
                    <Text style={styles.typingText}>Koç ipucu hazırlıyor...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Takıldığın bir soru veya konu sor..."
                placeholderTextColor="#64748b"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => handleSend()}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.sendButtonText}>
                  {isLoading ? '...' : 'Gönder'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8b5cf6', // pastel violet
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 2,
    borderColor: '#6ee7b7', // Mint border
    elevation: 8,
    zIndex: 99,
  },
  floatingEmoji: {
    fontSize: 28,
  },
  badgePulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#6ee7b7',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '78%',
    borderWidth: 1,
    borderColor: '#334155',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  aiHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#a78bfa',
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  aiStatus: {
    fontSize: 11,
    color: '#6ee7b7',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  quickBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  promptChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  miniAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleAi: {
    backgroundColor: '#334155',
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#8b5cf6', // pastel violet
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  textAi: {
    color: '#f1f5f9',
  },
  textUser: {
    color: '#ffffff',
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
  },
  timeAi: {
    color: '#94a3b8',
  },
  timeUser: {
    color: '#e9d5ff',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typingText: {
    fontSize: 12,
    color: '#6ee7b7',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 13,
  },
  sendButton: {
    backgroundColor: '#6ee7b7',
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
});
