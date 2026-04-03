import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../lib/stores';

export default function Index() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (accessToken === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (accessToken) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/giris" />;
}
