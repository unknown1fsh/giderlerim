import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { planYukseltmeUrl } from '../../../lib/googlePlayPlan';
import { useAuthStore } from '../../../lib/stores';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

export default function ProfilEkrani() {
  const theme = useTheme();
  const kullanici = useAuthStore((s) => s.kullanici);

  const handlePlanYukselt = () => {
    WebBrowser.openBrowserAsync(planYukseltmeUrl(kullanici?.plan));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Profil" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="account"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="titleLarge" style={{ fontWeight: '700', color: theme.colors.onSurface, marginTop: spacing.md }}>
            {kullanici?.ad} {kullanici?.soyad}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}>
            {kullanici?.email}
          </Text>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <DetailRow
              label="Ad Soyad"
              value={`${kullanici?.ad || ''} ${kullanici?.soyad || ''}`}
              theme={theme}
            />
            <Divider style={{ marginVertical: spacing.md }} />
            <DetailRow label="Email" value={kullanici?.email || ''} theme={theme} />
            <Divider style={{ marginVertical: spacing.md }} />
            <DetailRow label="Plan" value={kullanici?.plan || 'FREE'} theme={theme} />
            <Divider style={{ marginVertical: spacing.md }} />
            <DetailRow label="Para Birimi" value={kullanici?.paraBirimi || 'TRY'} theme={theme} />
          </Card.Content>
        </Card>

        {(kullanici?.plan === 'FREE' || kullanici?.plan === 'PREMIUM') && (
          <Button
            mode="contained"
            onPress={handlePlanYukselt}
            style={styles.upgradeButton}
            contentStyle={{ height: 52 }}
            icon="arrow-up-bold"
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            {kullanici?.plan === 'PREMIUM' ? "Ultra'ya yukselt" : "Pro'ya yukselt"}
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text
        variant="bodyMedium"
        style={{ fontWeight: '600', color: theme.colors.onSurface }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardContent: {
    padding: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
  },
  upgradeButton: {
    borderRadius: radius.md,
  },
});
