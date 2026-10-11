import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  Moon,
  Sun,
  Smartphone,
  Shield,
  Bell,
  GraduationCap,
  Award,
  ChevronRight,
  LogOut,
  Target,
  BookOpen,
} from 'lucide-react-native';
import { useTheme, ThemeMode } from '../lib/theme';

interface ProfileScreenProps {
  studentName?: string;
  onLogout?: () => void;
}

export function ProfileScreen({
  studentName = 'Zeynep Kaya',
  onLogout,
}: ProfileScreenProps) {
  const { mode, colors, setMode } = useTheme();

  // Privacy & Settings toggles
  const [privacyNets, setPrivacyNets] = useState(true);
  const [notifyReschedule, setNotifyReschedule] = useState(true);
  const [notifyHomework, setNotifyHomework] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header - Clean Luxury Avatar WITHOUT Story Ring */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            {/* Clean circular border - NO INSTAGRAM STORY GRADIENTS */}
            <View style={[styles.avatarFrame, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImage}
              />
            </View>
            <View style={[styles.roleBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.roleBadgeText}>Öğrenci</Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>{studentName}</Text>
          <Text style={[styles.userSchool, { color: colors.textMuted }]}>
            Galatasaray Lisesi • 12. Sınıf
          </Text>

          {/* Goal Chip */}
          <View style={[styles.goalChip, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
            <Target size={14} color={colors.accent} />
            <Text style={[styles.goalChipText, { color: colors.accent }]}>
              Hedef: Boğaziçi Üniversitesi Bilgisayar Müh.
            </Text>
          </View>

          {/* Mini Stats Grid */}
          <View style={[styles.statsGrid, { borderTopColor: colors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>94.5</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>TYT Net Ort.</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>68.0</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>AYT Net Ort.</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>%92</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Ödev Başarısı</Text>
            </View>
          </View>
        </View>

        {/* 1. TEMA SEÇİCİ (Warm Paper / Dark Slate / Sistem) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Arayüz & Tema Motoru</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
            Gözünü yormayan sıcak kağıt veya gece modunu seç
          </Text>

          <View style={styles.themeSelectorRow}>
            {/* Warm Paper Button */}
            <TouchableOpacity
              onPress={() => setMode('warmLight')}
              style={[
                styles.themeBtn,
                mode === 'warmLight' && {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentBg,
                },
                { borderColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <Sun size={20} color={mode === 'warmLight' ? colors.accent : colors.textMuted} />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: mode === 'warmLight' ? colors.accent : colors.text },
                ]}
              >
                Sıcak Kağıt
              </Text>
              <Text style={[styles.themeBtnSub, { color: colors.textMuted }]}>#FBFBF9</Text>
            </TouchableOpacity>

            {/* Dark Slate Button */}
            <TouchableOpacity
              onPress={() => setMode('darkSlate')}
              style={[
                styles.themeBtn,
                mode === 'darkSlate' && {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentBg,
                },
                { borderColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <Moon size={20} color={mode === 'darkSlate' ? colors.accent : colors.textMuted} />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: mode === 'darkSlate' ? colors.accent : colors.text },
                ]}
              >
                Koyu Slate
              </Text>
              <Text style={[styles.themeBtnSub, { color: colors.textMuted }]}>#0F172A</Text>
            </TouchableOpacity>

            {/* System Button */}
            <TouchableOpacity
              onPress={() => setMode('system')}
              style={[
                styles.themeBtn,
                mode === 'system' && {
                  borderColor: colors.accent,
                  backgroundColor: colors.accentBg,
                },
                { borderColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <Smartphone size={20} color={mode === 'system' ? colors.accent : colors.textMuted} />
              <Text
                style={[
                  styles.themeBtnText,
                  { color: mode === 'system' ? colors.accent : colors.text },
                ]}
              >
                Sistem
              </Text>
              <Text style={[styles.themeBtnSub, { color: colors.textMuted }]}>Otomatik</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. BİLDİRİMLER & GİZLİLİK */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bildirim & Güvenlik</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: colors.accentBg }]}>
                <Bell size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Ders Saati Değişikliği Bildirimi
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                  Hoca saati kaydırdığında anlık onay iste
                </Text>
              </View>
            </View>
            <Switch
              value={notifyReschedule}
              onValueChange={setNotifyReschedule}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: colors.successBg }]}>
                <BookOpen size={18} color={colors.success} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Ödev Teslim Hatırlatıcıları
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                  Son güne 12 saat kala bildirim gönder
                </Text>
              </View>
            </View>
            <Switch
              value={notifyHomework}
              onValueChange={setNotifyHomework}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: colors.warningBg }]}>
                <Shield size={18} color={colors.warning} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Netlerimi Arkadaşlarıma Göster
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                  Deneme sıralama tablosunda gizlilik
                </Text>
              </View>
            </View>
            <Switch
              value={privacyNets}
              onValueChange={setPrivacyNets}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 3. LOGOUT BUTTON */}
        {onLogout && (
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.danger, backgroundColor: colors.dangerBg }]}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <LogOut size={18} color={colors.danger} />
            <Text style={[styles.logoutButtonText, { color: colors.danger }]}>
              Oturumu Kapat
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    padding: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userSchool: {
    fontSize: 13,
    marginTop: 2,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  goalChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: -8,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeBtnSub: {
    fontSize: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
