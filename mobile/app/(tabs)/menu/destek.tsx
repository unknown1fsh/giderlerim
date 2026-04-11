import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { services } from '../../../lib/apiClient';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

export default function DestekEkrani() {
  const theme = useTheme();
  const [konu, setKonu] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState<'basarili' | 'hata' | null>(null);

  const handleGonder = async () => {
    if (!konu || !mesaj) return;
    setYukleniyor(true);
    setSonuc(null);
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
      <ScreenHeader baslik="Destek" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconSection}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name="headset"
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.md }}>
              Sorulariniz veya sorunlariniz icin bize iletin. En kisa surede doneriz.
            </Text>
          </View>

          <TextInput
            label="Konu"
            value={konu}
            onChangeText={setKonu}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: radius.md }}
          />

          <TextInput
            label="Mesajiniz"
            value={mesaj}
            onChangeText={setMesaj}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={[styles.input, { minHeight: 140 }]}
            outlineStyle={{ borderRadius: radius.md }}
          />

          {sonuc === 'basarili' && (
            <View style={[styles.successBadge, { backgroundColor: '#22c55e18' }]}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#22c55e" />
              <Text variant="bodySmall" style={{ color: '#22c55e', marginLeft: spacing.sm, fontWeight: '600' }}>
                Talebiniz basariyla iletildi.
              </Text>
            </View>
          )}
          {sonuc === 'hata' && (
            <HelperText type="error" visible>
              Gonderilemedi. Tekrar deneyin.
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleGonder}
            loading={yukleniyor}
            disabled={yukleniyor || !konu || !mesaj}
            style={styles.sendBtn}
            contentStyle={{ height: 52 }}
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
            icon="send"
          >
            Gonder
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
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
  iconSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'transparent',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  sendBtn: {
    borderRadius: radius.md,
  },
});
