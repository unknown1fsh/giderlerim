import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { services } from '../../../lib/apiClient';

export default function DestekEkrani() {
  const theme = useTheme();
  const [konu, setKonu] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<'basarili' | 'hata' | null>(null);

  const handleGonder = async () => {
    if (!konu || !mesaj) return;
    setYukleniyor(true);
    try {
      await services.destek.olustur({ konu, mesaj });
      setSonuc('basarili');
      setKonu('');
      setMesaj('');
    } catch {
      setSonuc('hata');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button onPress={() => router.back()} textColor={theme.colors.onBackground}>Geri</Button>
        <Text variant="titleLarge" style={{ fontWeight: '700' }}>Destek</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput label="Konu" value={konu} onChangeText={setKonu} mode="outlined" />
        <TextInput
          label="Mesajiniz"
          value={mesaj}
          onChangeText={setMesaj}
          mode="outlined"
          multiline
          numberOfLines={6}
        />

        {sonuc === 'basarili' && <HelperText type="info" visible>Talebiniz iletildi.</HelperText>}
        {sonuc === 'hata' && <HelperText type="error" visible>Gonderilemedi. Tekrar deneyin.</HelperText>}

        <Button
          mode="contained"
          onPress={handleGonder}
          loading={yukleniyor}
          disabled={yukleniyor || !konu || !mesaj}
          style={styles.sendBtn}
          contentStyle={{ height: 52 }}
        >
          Gonder
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  content: { padding: 20, gap: 16 },
  sendBtn: { borderRadius: 12 },
});
