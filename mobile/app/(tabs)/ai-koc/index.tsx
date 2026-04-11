import { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Text, TextInput, IconButton, useTheme, Button, ActivityIndicator, Chip, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { services } from '../../../lib/apiClient';
import { useAuthStore } from '../../../lib/stores';
import { shopierProfilYukseltUrl } from '../../../lib/shopier';
import { AiMesajBalonu } from '../../../components/AiMesajBalonu';
import { SohbetOturumResponse, SohbetMesajiResponse } from '@giderlerim/shared/types/ai.types';
import type { PlanTuru } from '@giderlerim/shared/types/kullanici.types';
import { spacing, radius } from '../../../theme';

export default function AiKocEkrani() {
  const theme = useTheme();
  const kullanici = useAuthStore((s) => s.kullanici);
  const plan: PlanTuru = kullanici?.plan ?? 'FREE';
  const flatListRef = useRef<FlatList>(null);

  const [oturumlar, setOturumlar] = useState<SohbetOturumResponse[]>([]);
  const [aktifOturum, setAktifOturum] = useState<SohbetOturumResponse | null>(null);
  const [mesajlar, setMesajlar] = useState<SohbetMesajiResponse[]>([]);
  const [mesaj, setMesaj] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [menuGorunur, setMenuGorunur] = useState(false);

  const oturumlariGetir = useCallback(async () => {
    try {
      const res = await services.aiSohbet.getOturumlar();
      setOturumlar(res.data || []);
    } catch {}
  }, []);

  const mesajlariGetir = useCallback(async (oturumId: number) => {
    try {
      const res = await services.aiSohbet.getMesajlar(oturumId);
      setMesajlar(res.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      setYukleniyor(true);
      await oturumlariGetir();
      setYukleniyor(false);
    })();
  }, [oturumlariGetir]);

  useEffect(() => {
    if (aktifOturum) {
      mesajlariGetir(aktifOturum.id);
    }
  }, [aktifOturum, mesajlariGetir]);

  const yeniOturumBaslat = async () => {
    try {
      const res = await services.aiSohbet.yeniOturumBaslat();
      const yeniOturum = res.data;
      setOturumlar((prev) => [yeniOturum, ...prev]);
      setAktifOturum(yeniOturum);
      setMesajlar([]);
    } catch {}
  };

  const mesajGonder = async () => {
    if (!mesaj.trim() || gonderiliyor) return;

    let oturum = aktifOturum;
    if (!oturum) {
      try {
        const res = await services.aiSohbet.yeniOturumBaslat();
        oturum = res.data;
        setOturumlar((prev) => [oturum!, ...prev]);
        setAktifOturum(oturum);
      } catch {
        return;
      }
    }

    const gonderilecek = mesaj.trim();
    setMesaj('');
    setGonderiliyor(true);

    const geciciMesaj: SohbetMesajiResponse = {
      id: Date.now(),
      rol: 'KULLANICI',
      icerik: gonderilecek,
      createdAt: new Date().toISOString(),
    };
    setMesajlar((prev) => [...prev, geciciMesaj]);

    try {
      await services.aiSohbet.mesajGonder(oturum.id, gonderilecek);
      await mesajlariGetir(oturum.id);
    } catch {
      setMesajlar((prev) => prev.filter((m) => m.id !== geciciMesaj.id));
      setMesaj(gonderilecek);
    } finally {
      setGonderiliyor(false);
    }
  };

  const oturumSec = (oturum: SohbetOturumResponse) => {
    setAktifOturum(oturum);
    setMenuGorunur(false);
  };

  if (plan === 'FREE') {
    const yukseltUrl = shopierProfilYukseltUrl(plan);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.outline + '40' }]}>
          <View style={{ width: 48 }} />
          <Text
            variant="titleLarge"
            style={{ fontWeight: '700', flex: 1, textAlign: 'center', color: theme.colors.onBackground }}
          >
            AI Koc
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.center}>
          <View style={[styles.lockCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="lock-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text
            variant="headlineSmall"
            style={{ fontWeight: '700', color: theme.colors.onBackground, marginTop: spacing.xl }}
          >
            Pro Plani Gerekiyor
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginTop: spacing.sm,
              paddingHorizontal: 40,
              lineHeight: 22,
            }}
          >
            AI Finansal Koc ozelligini kullanmak icin Pro planina yukseltmeniz gerekiyor.
          </Text>
          <Button
            mode="contained"
            onPress={() => Linking.openURL(yukseltUrl)}
            style={{ marginTop: spacing.xxxl, borderRadius: radius.md }}
            contentStyle={{ height: 48 }}
            icon="arrow-up-bold-circle-outline"
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            Pro Planina Yukselt
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (yukleniyor) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.outline + '40' }]}>
        <Menu
          visible={menuGorunur}
          onDismiss={() => setMenuGorunur(false)}
          anchor={
            <IconButton
              icon="chat-processing-outline"
              size={24}
              onPress={() => setMenuGorunur(true)}
              iconColor={theme.colors.onBackground}
            />
          }
          anchorPosition="bottom"
        >
          <Menu.Item
            title="Yeni Sohbet"
            leadingIcon="plus"
            onPress={() => {
              setMenuGorunur(false);
              yeniOturumBaslat();
            }}
          />
          {oturumlar.length > 0 && (
            <>
              {oturumlar.slice(0, 10).map((o) => (
                <Menu.Item
                  key={o.id}
                  title={o.baslik || `Sohbet #${o.id}`}
                  onPress={() => oturumSec(o)}
                />
              ))}
            </>
          )}
        </Menu>

        <Text
          variant="titleLarge"
          style={{ fontWeight: '700', flex: 1, textAlign: 'center', color: theme.colors.onBackground }}
        >
          AI Koc
        </Text>

        <IconButton
          icon="plus-circle-outline"
          size={24}
          onPress={yeniOturumBaslat}
          iconColor={theme.colors.primary}
        />
      </View>

      {aktifOturum && (
        <View style={styles.oturumBilgi}>
          <Chip
            compact
            icon="chat-outline"
            style={{ backgroundColor: theme.colors.surfaceVariant }}
            textStyle={{ fontSize: 12 }}
          >
            {aktifOturum.baslik || `Sohbet #${aktifOturum.id}`}
          </Chip>
        </View>
      )}

      {!aktifOturum && mesajlar.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.robotCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="robot-happy-outline"
              size={56}
              color={theme.colors.primary}
            />
          </View>
          <Text
            variant="titleMedium"
            style={{ fontWeight: '700', color: theme.colors.onBackground, marginTop: spacing.xl }}
          >
            AI Finansal Kociniz
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginTop: spacing.sm,
              paddingHorizontal: 48,
              lineHeight: 22,
            }}
          >
            Harcamalariniz hakkinda sorular sorun, butce tavsiyeleri alin ve finansal hedeflerinize ulasin.
          </Text>
          <Button
            mode="contained"
            onPress={yeniOturumBaslat}
            style={{ marginTop: spacing.xxxl, borderRadius: radius.md }}
            contentStyle={{ height: 48 }}
            icon="chat-plus"
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            Sohbet Baslat
          </Button>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mesajlar}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AiMesajBalonu mesaj={item} />}
          contentContainerStyle={styles.mesajListesi}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Bir mesaj gondererek sohbeti baslatin
              </Text>
            </View>
          }
        />
      )}

      {gonderiliyor && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}>
            AI dusunuyor...
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline + '40' }]}>
          <TextInput
            value={mesaj}
            onChangeText={setMesaj}
            placeholder="Mesajinizi yazin..."
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: radius.xl }}
            dense
            multiline
            maxLength={2000}
            right={
              <TextInput.Icon
                icon="send"
                disabled={!mesaj.trim() || gonderiliyor}
                onPress={mesajGonder}
                color={mesaj.trim() ? theme.colors.primary : undefined}
              />
            }
            onSubmitEditing={mesajGonder}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  robotCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oturumBilgi: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
  },
  mesajListesi: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    maxHeight: 120,
    backgroundColor: 'transparent',
  },
});
