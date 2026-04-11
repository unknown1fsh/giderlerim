import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Chip,
  Button,
  Portal,
  Modal,
  TextInput,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { services } from '../../../lib/apiClient';
import {
  DestekTalebiResponse,
  DestekDurumu,
} from '@giderlerim/shared/types/destek.types';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

const DURUM_ETIKET: Record<DestekDurumu, { ad: string; renk: string; bg: string }> = {
  ACIK: { ad: 'Acik', renk: '#2563eb', bg: '#dbeafe' },
  YANITLANDI: { ad: 'Yanitlandi', renk: '#16a34a', bg: '#dcfce7' },
  COZULDU: { ad: 'Cozuldu', renk: '#6b7280', bg: '#f3f4f6' },
  KAPATILDI: { ad: 'Kapatildi', renk: '#dc2626', bg: '#fee2e2' },
};

const ONCELIK_RENK: Record<string, string> = {
  DUSUK: '#6b7280',
  NORMAL: '#2563eb',
  YUKSEK: '#f97316',
  ACIL: '#dc2626',
};

const KATEGORI_AD: Record<string, string> = {
  GENEL: 'Genel',
  TEKNIK: 'Teknik',
  FATURA: 'Fatura',
  ONERI: 'Oneri',
  HATA: 'Hata',
};

const tarihFormatla = (tarih: string) => {
  const d = new Date(tarih);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export default function AdminDestekEkrani() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [filtreDurum, setFiltreDurum] = useState('');
  const [secili, setSecili] = useState<DestekTalebiResponse | null>(null);
  const [yanitMetni, setYanitMetni] = useState('');
  const [yanitDurum, setYanitDurum] = useState<DestekDurumu>('YANITLANDI');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'destek-talepleri', filtreDurum],
    queryFn: async () => {
      try {
        return await services.destek.adminListele({
          durum: filtreDurum || undefined,
          sayfa: 0,
          boyut: 50,
        });
      } catch {
        return { icerik: [], sayfa: 0, boyut: 50, toplamEleman: 0, toplamSayfa: 0 };
      }
    },
  });

  const yanitla = useMutation({
    mutationFn: ({ id, yanit, durum }: { id: number; yanit: string; durum: DestekDurumu }) =>
      services.destek.adminYanitla(id, { adminYaniti: yanit, durum }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'destek-talepleri'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'istatistikler'] });
      setSecili(null);
      setYanitMetni('');
    },
  });

  const durumGuncelle = useMutation({
    mutationFn: ({ id, durum }: { id: number; durum: string }) =>
      services.destek.adminDurumGuncelle(id, durum),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'destek-talepleri'] });
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const talepler = data?.icerik ?? [];

  const renderTalep = ({ item: t }: { item: DestekTalebiResponse }) => {
    const durum = DURUM_ETIKET[t.durum];
    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          setSecili(t);
          setYanitMetni(t.adminYaniti ?? '');
          setYanitDurum('YANITLANDI');
        }}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="bodyLarge" style={{ fontWeight: '600', color: theme.colors.onSurface, flex: 1 }} numberOfLines={1}>
              {t.konu}
            </Text>
            <Chip
              compact
              textStyle={{ fontSize: 10, color: durum.renk, fontWeight: '700' }}
              style={{ backgroundColor: durum.bg, borderRadius: 12, height: 22 }}
            >
              {durum.ad}
            </Chip>
          </View>

          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }} numberOfLines={2}>
            {t.mesaj}
          </Text>

          <View style={styles.cardMeta}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t.kullaniciAdi}
            </Text>
            <Chip
              compact
              textStyle={{ fontSize: 9, color: ONCELIK_RENK[t.oncelik] ?? '#6b7280', fontWeight: '600' }}
              style={{ height: 20, borderRadius: 10 }}
            >
              {t.oncelik}
            </Chip>
            <Chip
              compact
              textStyle={{ fontSize: 9, fontWeight: '500' }}
              style={{ height: 20, borderRadius: 10 }}
            >
              {KATEGORI_AD[t.kategori] ?? t.kategori}
            </Chip>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 'auto' }}>
              {tarihFormatla(t.createdAt)}
            </Text>
          </View>

          {t.durum === 'ACIK' && (
            <Button
              mode="text"
              compact
              textColor={theme.colors.error}
              onPress={() => durumGuncelle.mutate({ id: t.id, durum: 'KAPATILDI' })}
              style={{ alignSelf: 'flex-end', marginTop: spacing.xs }}
              labelStyle={{ fontSize: 12 }}
            >
              Kapat
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Destek Talepleri" />

      <View style={styles.filters}>
        {(['', 'ACIK', 'YANITLANDI', 'COZULDU', 'KAPATILDI'] as const).map((d) => (
          <Chip
            key={d}
            selected={filtreDurum === d}
            onPress={() => setFiltreDurum(d)}
            compact
            style={styles.filterChip}
            textStyle={{ fontSize: 11 }}
          >
            {d === '' ? 'Tumu' : DURUM_ETIKET[d].ad}
          </Chip>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={talepler}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTalep}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="check-circle-outline" size={48} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.md }}>
                Destek talebi bulunamadi.
              </Text>
            </View>
          }
          ListHeaderComponent={
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.sm }}>
              {data?.toplamEleman ?? 0} talep
            </Text>
          }
        />
      )}

      {/* Detay / Yanıtlama Modal */}
      <Portal>
        <Modal
          visible={!!secili}
          onDismiss={() => setSecili(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {secili && (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                {secili.konu}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                {secili.kullaniciAdi} ({secili.kullaniciEmail})
              </Text>

              <View style={styles.detailChips}>
                <Chip compact textStyle={{ fontSize: 10, color: DURUM_ETIKET[secili.durum].renk, fontWeight: '700' }}
                  style={{ backgroundColor: DURUM_ETIKET[secili.durum].bg, height: 22, borderRadius: 11 }}
                >
                  {DURUM_ETIKET[secili.durum].ad}
                </Chip>
                <Chip compact textStyle={{ fontSize: 10, color: ONCELIK_RENK[secili.oncelik], fontWeight: '600' }}
                  style={{ height: 22, borderRadius: 11 }}
                >
                  {secili.oncelik}
                </Chip>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {tarihFormatla(secili.createdAt)}
                </Text>
              </View>

              {/* Kullanıcı Mesajı */}
              <View style={[styles.messageBox, { backgroundColor: theme.colors.background }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                  Kullanici Mesaji
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface, marginTop: 4, lineHeight: 20 }}>
                  {secili.mesaj}
                </Text>
              </View>

              {/* Önceki Yanıt */}
              {secili.adminYaniti && (
                <View style={[styles.messageBox, { backgroundColor: '#f0fdf4' }]}>
                  <Text variant="labelSmall" style={{ color: '#16a34a', fontWeight: '600' }}>
                    Onceki Yanit{secili.yanitlayanAdminAdi ? ` — ${secili.yanitlayanAdminAdi}` : ''}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#166534', marginTop: 4, lineHeight: 20 }}>
                    {secili.adminYaniti}
                  </Text>
                </View>
              )}

              {/* Yanıt Formu */}
              <TextInput
                label="Yanit"
                value={yanitMetni}
                onChangeText={setYanitMetni}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={{ marginTop: spacing.md, backgroundColor: 'transparent' }}
                outlineStyle={{ borderRadius: radius.md }}
                placeholder="Kullaniciya yanitinizi yazin..."
              />

              <Text variant="labelMedium" style={{ fontWeight: '600', color: theme.colors.onSurface, marginTop: spacing.md }}>
                Durum
              </Text>
              <SegmentedButtons
                value={yanitDurum}
                onValueChange={(v) => setYanitDurum(v as DestekDurumu)}
                buttons={[
                  { value: 'YANITLANDI', label: 'Yanitla' },
                  { value: 'COZULDU', label: 'Cozuldu' },
                  { value: 'KAPATILDI', label: 'Kapat' },
                ]}
                style={{ marginTop: spacing.xs }}
              />

              {yanitla.isError && (
                <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: spacing.sm }}>
                  Yanit gonderilemedi. Tekrar deneyin.
                </Text>
              )}

              <View style={styles.modalActions}>
                <Button mode="text" onPress={() => setSecili(null)}>
                  Iptal
                </Button>
                <Button
                  mode="contained"
                  loading={yanitla.isPending}
                  disabled={yanitla.isPending || !yanitMetni.trim()}
                  onPress={() =>
                    yanitla.mutate({
                      id: secili.id,
                      yanit: yanitMetni,
                      durum: yanitDurum,
                    })
                  }
                  style={{ borderRadius: radius.sm }}
                >
                  Yanitla
                </Button>
              </View>
            </KeyboardAvoidingView>
          )}
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    borderRadius: 20,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 20,
    gap: spacing.sm,
  },
  card: {
    borderRadius: radius.md,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  modal: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    maxHeight: '85%',
  },
  detailChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  messageBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
