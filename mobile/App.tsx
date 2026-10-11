import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from './lib/theme';
import { LoginScreen } from './screens/LoginScreen';
import { StudentHomeScreen } from './screens/StudentHomeScreen';

function MainAppContent() {
  const { colors, mode } = useTheme();
  const [user, setUser] = useState<{ role: 'student' | 'parent'; name: string } | null>({
    role: 'student',
    name: 'Zeynep Kaya',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      {user ? (
        <StudentHomeScreen
          studentName={user.name}
          onLogout={() => setUser(null)}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={(role, name) => setUser({ role, name })}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainAppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
