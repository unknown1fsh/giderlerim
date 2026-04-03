import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useUyariSayac } from '../../lib/hooks';

function TabBarIcon({ label, color, size }: { label: string; color: string; size: number }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size - 4, color }}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const { data: uyariSayisi } = useUyariSayac();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ozet',
          tabBarIcon: ({ color, size }) => <TabBarIcon label="O" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="giderler"
        options={{
          title: 'Giderler',
          tabBarIcon: ({ color, size }) => <TabBarIcon label="G" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ai-koc"
        options={{
          title: 'AI Koc',
          tabBarIcon: ({ color, size }) => <TabBarIcon label="AI" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="butceler"
        options={{
          title: 'Butceler',
          tabBarIcon: ({ color, size }) => <TabBarIcon label="B" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <TabBarIcon label="M" color={color} size={size} />,
          tabBarBadge: uyariSayisi && uyariSayisi > 0 ? uyariSayisi : undefined,
        }}
      />
    </Tabs>
  );
}
