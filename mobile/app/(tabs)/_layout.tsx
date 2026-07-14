import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUyariSayac } from '../../lib/hooks';
import { appColors, radius } from '../../theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { data: uyariSayisi } = useUyariSayac();

  const bottomInset = Math.max(insets.bottom, 4);
  const tabBarHeight = 64 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appColors.orange,
        tabBarInactiveTintColor: '#9B8B7D',
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Math.max(bottomInset - 2, 8),
          backgroundColor: appColors.ink,
          borderTopColor: '#2B211A',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.xl,
          height: tabBarHeight,
          paddingBottom: bottomInset > 10 ? bottomInset - 4 : 10,
          paddingTop: 8,
          elevation: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Özet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="giderler"
        options={{
          title: 'Giderler',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-koc"
        options={{
          title: 'AI Koç',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="butceler"
        options={{
          title: 'Bütçe',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-pie" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menü',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
          tabBarBadge: uyariSayisi && uyariSayisi > 0 ? uyariSayisi : undefined,
        }}
      />
    </Tabs>
  );
}
