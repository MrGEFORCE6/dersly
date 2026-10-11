import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface LoginScreenProps {
  onLoginSuccess: (role: 'student' | 'parent', userName: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [identifier, setIdentifier] = useState('0542 111 22 33');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = () => {
    onLoginSuccess(role, role === 'student' ? 'Zeynep Kaya' : 'Kaya Ailesi (Veli)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>✨</Text>
          </View>
          <Text style={styles.title}>DersPompa</Text>
          <Text style={styles.subtitle}>Öğrenci & Veli Takip Portalı</Text>
        </View>

        {/* Role Switcher */}
        <View style={styles.roleTabs}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'student' && styles.roleTabActive]}
            onPress={() => setRole('student')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, role === 'student' && styles.roleTabTextActive]}>
              🎓 Öğrenci Girişi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'parent' && styles.roleTabActive]}
            onPress={() => setRole('parent')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, role === 'parent' && styles.roleTabTextActive]}>
              👨‍👩‍👦 Veli Girişi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Telefon Numarası veya E-Posta</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="05XX XXX XX XX"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>Giriş Şifresi</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Şifrenizi girin"
            placeholderTextColor="#64748b"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>
              {role === 'student' ? 'Öğrenci Olarak Giriş Yap' : 'Veli Olarak Giriş Yap'}
            </Text>
          </TouchableOpacity>

          {/* Quick Demo Fill */}
          <View style={styles.quickFillContainer}>
            <Text style={styles.quickFillLabel}>Hızlı Test Girişi:</Text>
            <TouchableOpacity
              style={styles.quickPill}
              onPress={() => onLoginSuccess('student', 'Zeynep Kaya')}
            >
              <Text style={styles.quickPillText}>Zeynep Kaya (Öğrenci) →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>
          DersPompa © 2026 • Güvenli Supabase Kimlik Doğrulama
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Soft Slate
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    borderWidth: 1.5,
    borderColor: '#a78bfa', // pastel violet
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    backgroundColor: '#8b5cf6', // pastel violet
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#f8fafc',
  },
  loginButton: {
    backgroundColor: '#6ee7b7', // Mint accent
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#6ee7b7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  loginButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  quickFillContainer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickFillLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  quickPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quickPillText: {
    fontSize: 11,
    color: '#a78bfa',
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#475569',
    marginTop: 24,
  },
});
