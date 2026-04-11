import { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Linking, useWindowDimensions } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { AxiosError } from 'axios';
import { services } from '../../../lib/apiClient';
import { useAuthStore } from '../../../lib/stores';
import { planYukseltmeUrl } from '../../../lib/googlePlayPlan';
import { AiAnalizResponse } from '@giderlerim/shared/types/ai.types';
import type { PlanTuru } from '@giderlerim/shared/types/kullanici.types';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

const PLAN_SIRALAMA: Record<PlanTuru, number> = { FREE: 0, PREMIUM: 1, ULTRA: 2 };
const PLAN_AD: Record<PlanTuru, string> = { FREE: 'Ucretsiz', PREMIUM: 'Pro', ULTRA: 'Ultra' };

type AnalizTipi = 'harcama' | 'butce' | 'anomali' | 'tasarruf';

const ANALIZ_META: Record<
  AnalizTipi,
  { baslik: string; ikon: string; gerekliPlan: 'PREMIUM' | 'ULTRA' }
> = {
  harcama: { baslik: 'Harcama Analizi', ikon: 'chart-timeline-variant', gerekliPlan: 'PREMIUM' },
  butce: { baslik: 'Butce Onerisi', ikon: 'lightbulb-outline', gerekliPlan: 'PREMIUM' },
  anomali: { baslik: 'Anomali Tespiti', ikon: 'alert-circle-outline', gerekliPlan: 'ULTRA' },
  tasarruf: { baslik: 'Tasarruf Firsatlari', ikon: 'piggy-bank-outline', gerekliPlan: 'ULTRA' },
};

function planYetkiliMi(kullaniciPlan: PlanTuru, gerekli: 'PREMIUM' | 'ULTRA'): boolean {
  return PLAN_SIRALAMA[kullaniciPlan] >= PLAN_SIRALAMA[gerekli];
}

function apiHataMesaji(e: unknown): string {
  const err = e as AxiosError<{ message?: string }>;
  const msg = err.response?.data?.message;
  return typeof msg === 'string' && msg.trim() ? msg : 'Analiz yapilamadi. Tekrar deneyin.';
}

export default function AnalizlerEkrani() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const kullanici = useAuthStore((s) => s.kullanici);
  const plan: PlanTuru = kullanici?.plan ?? 'FREE';

  const [analiz, setAnaliz] = useState<AiAnalizResponse | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  const analizCalistir = async (tip: AnalizTipi) => {
    const { gerekliPlan } = ANALIZ_META[tip];
    if (!planYetkiliMi(plan, gerekliPlan)) {
      setHata(`${PLAN_AD[gerekliPlan]} plani gerekli. Mevcut plan: ${PLAN_AD[plan]}.`);
      setAnaliz(null);
      return;
    }

    setYukleniyor(true);
    setHata('');
    try {
      const now = new Date();
      let result;
      switch (tip) {
        case 'harcama':
          result = await services.aiAnaliz.harcamaAnaliziYap(now.getMonth() + 1, now.getFullYear());
          break;
        case 'butce':
          result = await services.aiAnaliz.butceOnerisiAl();
          break;
        case 'anomali':
          result = await services.aiAnaliz.anomaliTespitEt();
          break;
        case 'tasarruf':
          result = await services.aiAnaliz.tasarrufFirsatlari();
          break;
      }
      setAnaliz(result.data);
    } catch (e: unknown) {
      setAnaliz(null);
      setHata(apiHataMesaji(e));
    } finally {
      setYukleniyor(false);
    }
  };

  const yukseltUrl = planYukseltmeUrl(plan);
  const gridItemWidth = (width - spacing.xl * 2 - spacing.md) / 2;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="AI Analizler" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {plan === 'FREE' && (
          <Card style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={{ gap: spacing.sm }}>
              <Text variant="bodySmall" style={{ color: theme.colors.primary, lineHeight: 20 }}>
                Pro planina Google Play uzerinden abonelikle gecerek harcama analizi ve butce onerisine erisirsiniz. Ultra ile anomali ve tasarruf analizleri acilir.
              </Text>
              <Button
                mode="text"
                compact
                onPress={() => Linking.openURL(yukseltUrl)}
                icon="arrow-right"
              >
                Google Play'de abonelik
              </Button>
            </Card.Content>
          </Card>
        )}

        {plan === 'PREMIUM' && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Ultra plani: Anomali tespiti ve Tasarruf firsatlari.
          </Text>
        )}

        <View style={styles.buttonGrid}>
          {(Object.keys(ANALIZ_META) as AnalizTipi[]).map((tip) => {
            const { baslik, ikon, gerekliPlan } = ANALIZ_META[tip];
            const yetkili = planYetkiliMi(plan, gerekliPlan);
            return (
              <Card
                key={tip}
                style={[
                  styles.gridCard,
                  {
                    width: gridItemWidth,
                    backgroundColor: theme.colors.surface,
                    opacity: yetkili ? 1 : 0.5,
                  },
                ]}
                onPress={() => !yukleniyor && yetkili && analizCalistir(tip)}
              >
                <Card.Content style={styles.gridCardContent}>
                  <MaterialCommunityIcons
                    name={ikon as any}
                    size={28}
                    color={yetkili ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="labelMedium"
                    style={{
                      fontWeight: '600',
                      marginTop: spacing.sm,
                      textAlign: 'center',
                      color: theme.colors.onSurface,
                    }}
                    numberOfLines={2}
                  >
                    {baslik}
                  </Text>
                  {!yetkili && (
                    <Text
                      variant="labelSmall"
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        marginTop: spacing.xs,
                        textAlign: 'center',
                      }}
                    >
                      {PLAN_AD[gerekliPlan]} gerekli
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </View>

        {hata ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {hata}
          </Text>
        ) : null}

        {yukleniyor && <ActivityIndicator size="large" style={{ marginTop: spacing.xxxl }} />}

        {analiz && !yukleniyor && (
          <Card style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={{ gap: spacing.md }}>
              <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                {analiz.ozet}
              </Text>

              {analiz.bulgular.length > 0 && (
                <View style={{ gap: spacing.xs }}>
                  <Text variant="labelLarge" style={{ fontWeight: '600', marginTop: spacing.sm }}>
                    Bulgular
                  </Text>
                  {analiz.bulgular.map((b, i) => (
                    <Text key={i} variant="bodySmall" style={{ lineHeight: 20, color: theme.colors.onSurface }}>
                      - {b}
                    </Text>
                  ))}
                </View>
              )}

              {analiz.oneriler.length > 0 && (
                <View style={{ gap: spacing.xs }}>
                  <Text variant="labelLarge" style={{ fontWeight: '600', marginTop: spacing.sm }}>
                    Oneriler
                  </Text>
                  {analiz.oneriler.map((o, i) => (
                    <Text key={i} variant="bodySmall" style={{ lineHeight: 20, color: theme.colors.onSurface }}>
                      - {o}
                    </Text>
                  ))}
                </View>
              )}

              <View style={[styles.actionBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                  Oncelikli Eylem: {analiz.oncelikliEylem}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  banner: {
    borderRadius: radius.md,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridCard: {
    borderRadius: radius.md,
    elevation: 1,
  },
  gridCardContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    minHeight: 110,
    justifyContent: 'center',
  },
  resultCard: {
    borderRadius: radius.lg,
    elevation: 2,
  },
  actionBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
});
