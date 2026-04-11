import { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { AxiosError } from 'axios';
import { services } from '../../../lib/apiClient';
import { useAuthStore } from '../../../lib/stores';
import { shopierProfilYukseltUrl } from '../../../lib/shopier';
import { AiAnalizResponse } from '@giderlerim/shared/types/ai.types';
import type { PlanTuru } from '@giderlerim/shared/types/kullanici.types';

const PLAN_SIRALAMA: Record<PlanTuru, number> = { FREE: 0, PREMIUM: 1, ULTRA: 2 };
const PLAN_AD: Record<PlanTuru, string> = { FREE: 'Ucretsiz', PREMIUM: 'Pro', ULTRA: 'Ultra' };

type AnalizTipi = 'harcama' | 'butce' | 'anomali' | 'tasarruf';

const ANALIZ_META: Record<
  AnalizTipi,
  { baslik: string; gerekliPlan: 'PREMIUM' | 'ULTRA' }
> = {
  harcama: { baslik: 'Harcama Analizi', gerekliPlan: 'PREMIUM' },
  butce: { baslik: 'Butce Onerisi', gerekliPlan: 'PREMIUM' },
  anomali: { baslik: 'Anomali Tespiti', gerekliPlan: 'ULTRA' },
  tasarruf: { baslik: 'Tasarruf Firsatlari', gerekliPlan: 'ULTRA' },
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
  const kullanici = useAuthStore((s) => s.kullanici);
  const plan: PlanTuru = kullanici?.plan ?? 'FREE';

  const [analiz, setAnaliz] = useState<AiAnalizResponse | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  const analizCalistir = async (tip: AnalizTipi) => {
    const { gerekliPlan } = ANALIZ_META[tip];
    if (!planYetkiliMi(plan, gerekliPlan)) {
      setHata(
        `${PLAN_AD[gerekliPlan]} plani gerekli. Mevcut plan: ${PLAN_AD[plan]}.`
      );
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

  const yukseltUrl = shopierProfilYukseltUrl(plan);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>AI Analizler</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {plan === 'FREE' && (
          <Card style={[styles.banner, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Card.Content>
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                Pro planina gecerek harcama analizi ve butce onerisine erisirsiniz. Ultra ile anomali ve tasarruf
                analizleri acilir.
              </Text>
              <Button
                mode="text"
                compact
                onPress={() => Linking.openURL(yukseltUrl)}
                style={{ marginTop: 4 }}
              >
                Plani yukselt (Shopier)
              </Button>
            </Card.Content>
          </Card>
        )}

        {plan === 'PREMIUM' && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
            Ultra plani: Anomali tespiti ve Tasarruf firsatlari.
          </Text>
        )}

        <View style={styles.buttonGrid}>
          {(Object.keys(ANALIZ_META) as AnalizTipi[]).map((tip) => {
            const { baslik, gerekliPlan } = ANALIZ_META[tip];
            const yetkili = planYetkiliMi(plan, gerekliPlan);
            return (
              <View key={tip} style={styles.gridCell}>
                <Button
                  mode="outlined"
                  onPress={() => analizCalistir(tip)}
                  disabled={yukleniyor || !yetkili}
                  style={[styles.gridBtn, !yetkili && styles.gridBtnDisabled]}
                >
                  {baslik}
                </Button>
                {!yetkili && (
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
                    {PLAN_AD[gerekliPlan]} gerekli
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {hata ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
            {hata}
          </Text>
        ) : null}

        {yukleniyor && <ActivityIndicator size="large" style={{ marginTop: 32 }} />}

        {analiz && !yukleniyor && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 8 }}>{analiz.ozet}</Text>

              {analiz.bulgular.length > 0 && (
                <>
                  <Text variant="labelLarge" style={{ marginTop: 12, marginBottom: 4 }}>Bulgular</Text>
                  {analiz.bulgular.map((b, i) => (
                    <Text key={i} variant="bodySmall" style={{ marginBottom: 4 }}>- {b}</Text>
                  ))}
                </>
              )}

              {analiz.oneriler.length > 0 && (
                <>
                  <Text variant="labelLarge" style={{ marginTop: 12, marginBottom: 4 }}>Oneriler</Text>
                  {analiz.oneriler.map((o, i) => (
                    <Text key={i} variant="bodySmall" style={{ marginBottom: 4 }}>- {o}</Text>
                  ))}
                </>
              )}

              <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 12, fontWeight: '600' }}>
                Oncelikli Eylem: {analiz.oncelikliEylem}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  content: { padding: 16, gap: 16 },
  banner: { borderRadius: 12 },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCell: { width: '47%' },
  gridBtn: { borderRadius: 12 },
  gridBtnDisabled: { opacity: 0.45 },
  card: { borderRadius: 16 },
});
