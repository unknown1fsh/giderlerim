import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { shopierProfilYukseltUrl } from '../../../lib/shopier';
import { useAuthStore } from '../../../lib/stores';

export default function ProfilEkrani() {
  const theme = useTheme();
  const kullanici = useAuthStore((s) => s.kullanici);

  const handlePlanYukselt = () => {
    WebBrowser.openBrowserAsync(shopierProfilYukseltUrl(kullanici?.plan));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>Profil</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <DetailRow label="Ad" value={`${kullanici?.ad || ''} ${kullanici?.soyad || ''}`} />
            <Divider style={{ marginVertical: 8 }} />
            <DetailRow label="Email" value={kullanici?.email || ''} />
            <Divider style={{ marginVertical: 8 }} />
            <DetailRow label="Plan" value={kullanici?.plan || 'FREE'} />
            <Divider style={{ marginVertical: 8 }} />
            <DetailRow label="Para Birimi" value={kullanici?.paraBirimi || 'TRY'} />
          </Card.Content>
        </Card>

        {(kullanici?.plan === 'FREE' || kullanici?.plan === 'PREMIUM') && (
          <Button
            mode="contained"
            onPress={handlePlanYukselt}
            style={styles.upgradeButton}
            contentStyle={{ height: 52 }}
          >
            {kullanici?.plan === 'PREMIUM' ? "Ultra'ya yukselt" : "Pro'ya yukselt (Shopier)"}
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="bodyMedium" style={{ color: '#6B7280' }}>{label}</Text>
      <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  upgradeButton: { borderRadius: 12 },
});
