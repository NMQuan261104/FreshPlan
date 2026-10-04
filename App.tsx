import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Lora_600SemiBold, useFonts } from '@expo-google-fonts/lora';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/screens/MainTabs';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, error] = useFonts({ Lora_600SemiBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null; // lỗi nạp font -> vẫn chạy với font hệ thống

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      {loggedIn ? <MainTabs onLogout={() => setLoggedIn(false)} /> : <LoginScreen onLogin={() => setLoggedIn(true)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } });
