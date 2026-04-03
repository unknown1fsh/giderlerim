import { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, useTheme, Button, ActivityIndicator, Chip, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { services } from '../../../lib/apiClient';
import { AiMesajBalonu } from '../../../components/AiMesajBalonu';
import { SohbetOturumResponse, SohbetMesajiResponse } from '@giderlerim/shared/types/ai.types';

export default function AiKocEkrani() {
  const theme = useTheme();
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

    // Optimistic: show user message immediately
    const geciciMesaj: SohbetMesajiResponse = {
      id: Date.now(),
      rol: 'KULLANICI',
      icerik: gonderilecek,
      createdAt: new Date().toISOString(),
    };
    setMesajlar((prev) => [...prev, geciciMesaj]);

    try {
      const res = await services.aiSohbet.mesajGonder(oturum.id, gonderilecek);
      // Refresh all messages to get both user + assistant messages
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
      <View style={styles.header}>
        <Menu
          visible={menuGorunur}
          onDismiss={() => setMenuGorunur(false)}
          anchor={
            <IconButton
              icon="chat-processing-outline"
              onPress={() => setMenuGorunur(true)}
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

        <Text variant="titleLarge" style={{ fontWeight: '700', flex: 1, textAlign: 'center' }}>
          AI Koc
        </Text>

        <IconButton
          icon="plus-circle-outline"
          onPress={yeniOturumBaslat}
        />
      </View>

      {aktifOturum && (
        <View style={styles.oturumBilgi}>
          <Chip compact icon="chat-outline" style={{ backgroundColor: theme.colors.surfaceVariant }}>
            {aktifOturum.baslik || `Sohbet #${aktifOturum.id}`}
          </Chip>
        </View>
      )}

      {!aktifOturum && mesajlar.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🤖</Text>
          <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
            AI Finansal Kociniz
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}
          >
            Harcamalariniz hakkinda sorular sorun, butce tavsiyeleri alin ve finansal hedeflerinize ulasin.
          </Text>
          <Button
            mode="contained"
            onPress={yeniOturumBaslat}
            style={{ marginTop: 24, borderRadius: 12 }}
            icon="chat-plus"
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
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
            AI dusunuyor...
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
          <TextInput
            value={mesaj}
            onChangeText={setMesaj}
            placeholder="Mesajinizi yazin..."
            mode="outlined"
            style={styles.input}
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
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  oturumBilgi: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
  },
  mesajListesi: {
    padding: 16,
    flexGrow: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    maxHeight: 120,
  },
});
