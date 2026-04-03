import { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { services } from '../../../lib/apiClient';
import { AiAnalizResponse } from '@giderlerim/shared/types/ai.types';

export default function AnalizlerEkrani() {
  const theme = useTheme();
  const [analiz, setAnaliz] = useState<AiAnalizResponse | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const analizCalistir = async (tip: 'harcama' | 'butce' | 'anomali' | 'tasarruf') => {
    setYukleniyor(true);
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
    } catch {
      setAnaliz(null);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>AI Analizler</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.buttonGrid}>
          <Button mode="outlined" onPress={() => analizCalistir('harcama')} style={styles.gridBtn}>
            Harcama Analizi
          </Button>
          <Button mode="outlined" onPress={() => analizCalistir('butce')} style={styles.gridBtn}>
            Butce Onerisi
          </Button>
          <Button mode="outlined" onPress={() => analizCalistir('anomali')} style={styles.gridBtn}>
            Anomali Tespiti
          </Button>
          <Button mode="outlined" onPress={() => analizCalistir('tasarruf')} style={styles.gridBtn}>
            Tasarruf Firsatlari
          </Button>
        </View>

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
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridBtn: { width: '47%', borderRadius: 12 },
  card: { borderRadius: 16 },
});
