import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Send, CheckCheck, ArrowLeft, MoreVertical, Sparkles } from 'lucide-react-native';
import { useTheme } from '../lib/theme';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

const CONTACTS: Contact[] = [
  {
    id: 'teacher-1',
    name: 'Ahmet Hoca',
    role: 'Matematik Eğitmeni',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'online',
  },
  {
    id: 'peer-1',
    name: 'Zeynep Kaya',
    role: 'AYT Sayısal Öğrenci',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'online',
  },
  {
    id: 'peer-2',
    name: 'Can Demir',
    role: '11. Sınıf Öğrenci',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'offline',
    lastSeen: '1 saat önce',
  },
];

export function ChatScreen({ onBack }: { onBack?: () => void }) {
  const { colors } = useTheme();
  const [selectedContact, setSelectedContact] = useState<Contact>(CONTACTS[0]);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'teacher-1': [
      {
        id: 'm-1',
        senderId: 'teacher-1',
        senderName: 'Ahmet Hoca',
        text: 'Selam! Yarınki Türev dersi için föyündeki ilk 20 soruyu çözmeyi unutma.',
        timestamp: '14:20',
        isMe: false,
        status: 'read',
      },
      {
        id: 'm-2',
        senderId: 'me',
        senderName: 'Ben',
        text: 'Hocam 14. sorudaki teğet doğrusunda takıldım, derste ona bakabilir miyiz?',
        timestamp: '14:25',
        isMe: true,
        status: 'read',
      },
      {
        id: 'm-3',
        senderId: 'teacher-1',
        senderName: 'Ahmet Hoca',
        text: 'Tabii ki, ilk olarak o soruyu detaylıca analiz edeceğiz. Görüşürüz!',
        timestamp: '14:26',
        isMe: false,
        status: 'read',
      },
    ],
    'peer-1': [
      {
        id: 'm-p1',
        senderId: 'peer-1',
        senderName: 'Zeynep Kaya',
        text: 'Bugünkü Fizik ödevini bitirdin mi?',
        timestamp: '11:15',
        isMe: false,
        status: 'read',
      },
    ],
    'peer-2': [
      {
        id: 'm-p2',
        senderId: 'peer-2',
        senderName: 'Can Demir',
        text: 'Matematik kaynak önerin var mı?',
        timestamp: 'Dün',
        isMe: false,
        status: 'read',
      },
    ],
  });

  const activeMessages = messages[selectedContact.id] || [];

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: 'm-' + Date.now(),
      senderId: 'me',
      senderName: 'Ben',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));

    setInputText('');

    // Simulated reply after 1.5s
    setTimeout(() => {
      const replyMsg: Message = {
        id: 'm-' + (Date.now() + 1),
        senderId: selectedContact.id,
        senderName: selectedContact.name,
        text: 'Mesajını aldım! En kısa sürede inceleyip döneceğim ✍️',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        status: 'read',
      };
      setMessages((prev) => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), replyMsg],
      }));
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Contact Switcher Bar */}
        <View style={[styles.contactsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CONTACTS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedContact.id;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedContact(item)}
                  style={[
                    styles.contactChip,
                    {
                      borderColor: isSelected ? colors.accent : colors.border,
                      backgroundColor: isSelected ? colors.accentBg : colors.surface,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarWrapper}>
                    <Image source={{ uri: item.avatar }} style={styles.chipAvatar} />
                    {item.status === 'online' && <View style={styles.onlineDot} />}
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.chipName,
                        { color: isSelected ? colors.accent : colors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.chipRole, { color: colors.textMuted }]} numberOfLines={1}>
                      {item.role.split(' ')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Active Conversation Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={{ marginRight: 8 }}>
                <ArrowLeft size={22} color={colors.text} />
              </TouchableOpacity>
            )}
            <Image source={{ uri: selectedContact.avatar }} style={styles.headerAvatar} />
            <View>
              <Text style={[styles.headerName, { color: colors.text }]}>{selectedContact.name}</Text>
              <Text style={[styles.headerStatus, { color: colors.success }]}>
                {selectedContact.status === 'online' ? '● Çevrimiçi' : selectedContact.lastSeen}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <MoreVertical size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Message Feed */}
        <FlatList
          data={activeMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageRow,
                item.isMe ? styles.messageRowMe : styles.messageRowOther,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.isMe
                    ? [styles.bubbleMe, { backgroundColor: colors.accent }]
                    : [
                        styles.bubbleOther,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.isMe
                      ? { color: '#FFFFFF' }
                      : { color: colors.text },
                  ]}
                >
                  {item.text}
                </Text>
                <View style={styles.metaRow}>
                  <Text
                    style={[
                      styles.timestampText,
                      item.isMe
                        ? { color: 'rgba(255,255,255,0.7)' }
                        : { color: colors.textMuted },
                    ]}
                  >
                    {item.timestamp}
                  </Text>
                  {item.isMe && (
                    <CheckCheck size={14} color="rgba(255,255,255,0.8)" style={{ marginLeft: 4 }} />
                  )}
                </View>
              </View>
            </View>
          )}
        />

        {/* Quick Suggestion Chips */}
        <View style={styles.quickChipsRow}>
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setInputText('Hocam bir sorum vardı, müsait misiniz?')}
          >
            <Sparkles size={12} color={colors.accent} style={{ marginRight: 4 }} />
            <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>Soru Sor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setInputText('Ders saatimiz değişti mi?')}
          >
            <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>Saat Değişikliği?</Text>
          </TouchableOpacity>
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder={`${selectedContact.name} için bir mesaj yaz...`}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.accent : colors.border,
              },
            ]}
            disabled={!inputText.trim()}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contactsBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  chipAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chipName: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipRole: {
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerIconBtn: {
    padding: 6,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
