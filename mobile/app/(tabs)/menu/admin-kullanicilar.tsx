import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Searchbar,
  Chip,
  Button,
  Portal,
  Modal,
  SegmentedButtons,
  Switch,
  Avatar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '../../../lib/apiClient';
import { AdminKullaniciDto, AdminKullaniciGuncelleRequest } from '@giderlerim/shared/types/admin.types';
import type { PlanTuru } from '@giderlerim/shared/types/kullanici.types';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { spacing, radius } from '../../../theme';

const PLAN_ETIKET: Record<string, { ad: string; renk: string }> = {
  FREE: { ad: 'Ucretsiz', renk: '#6b7280' },
  PREMIUM: { ad: 'Pro', renk: '#2563eb' },
  ULTRA: { ad: 'Ultra', renk: '#7c3aed' },
};

const tarihFormatla = (tarih: string | null) => {
  if (!tarih) return '—';
  const d = new Date(tarih);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

export default function AdminKullanicilarEkrani() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [arama, setArama] = useState('');
  const [planFiltre, setPlanFiltre] = useState('');
  const [sayfa, setSayfa] = useState(0);

  const [modal, setModal] = useState<AdminKullaniciDto | null>(null);
  const [formPlan, setFormPlan] = useState<PlanTuru>('FREE');
  const [formAdmin, setFormAdmin] = useState(false);
  const [formAktif, setFormAktif] = useState(true);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'kullanicilar', { arama, planFiltre, sayfa }],
    queryFn: () =>
      services.admin.kullanicilariGetir({
        arama: arama || undefined,
        plan: planFiltre || undefined,
        sayfa,
        boyut: 20,
      }),
  });

  const guncelle = useMutation({
    mutationFn: ({ id, req }: { id: number; req: AdminKullaniciGuncelleRequest }) =>
      services.admin.kullaniciGuncelle(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kullanicilar'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'istatistikler'] });
      setModal(null);
    },
    onError: () => Alert.alert('Hata', 'Guncelleme basarisiz.'),
  });

  const sil = useMutation({
    mutationFn: (id: number) => services.admin.kullaniciSil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kullanicilar'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'istatistikler'] });
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const modalAc = (k: AdminKullaniciDto) => {
    setFormPlan(k.plan);
    setFormAdmin(k.adminMi);
    setFormAktif(k.aktif);
    setModal(k);
  };

  const silOnay = (k: AdminKullaniciDto) => {
    Alert.alert(
      'Kullaniciyi Sil',
      `${k.ad} ${k.soyad} adli kullanici ve tum verileri silinecek. Bu islem geri alinamaz.`,
      [
        { text: 'Iptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => sil.mutate(k.id) },
      ],
    );
  };

  const kullanicilar = data?.content ?? [];
  const toplamSayfa = data?.totalPages ?? 1;

  const renderKullanici = ({ item: k }: { item: AdminKullaniciDto }) => {
    const plan = PLAN_ETIKET[k.plan] ?? PLAN_ETIKET.FREE;
    return (
      <Card
        style={[styles.userCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => modalAc(k)}
      >
        <Card.Content style={styles.userContent}>
          <View style={styles.userTopRow}>
            <Avatar.Text
              size={48}
              label={`${k.ad[0]}${k.soyad[0]}`}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{ fontSize: 16, fontWeight: '700', color: theme.colors.primary }}
            />
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface, flex: 1 }} numberOfLines={1}>
                  {k.ad} {k.soyad}
                </Text>
                {k.adminMi && (
                  <View style={[styles.adminTag, { backgroundColor: '#7c3aed' + '20' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#7c3aed' }}>ADMIN</Text>
                  </View>
                )}
              </View>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }} numberOfLines={1}>
                {k.email}
              </Text>
            </View>
          </View>

          <View style={[styles.metaDivider, { backgroundColor: theme.colors.outlineVariant + '40' }]} />

          <View style={styles.metaRow}>
            <View style={[styles.metaItem, { backgroundColor: plan.renk + '14' }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: plan.renk }}>
                {plan.ad}
              </Text>
            </View>
            <View style={[styles.metaItem, { backgroundColor: k.aktif ? '#16a34a14' : '#dc262614' }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: k.aktif ? '#16a34a' : '#dc2626' }}>
                {k.aktif ? 'Aktif' : 'Pasif'}
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {k.giderSayisi} gider
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 'auto' }}>
              {tarihFormatla(k.createdAt)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader baslik="Kullanici Yonetimi" />

      <View style={styles.filters}>
        <Searchbar
          placeholder="Ad, soyad, e-posta..."
          value={arama}
          onChangeText={(v) => { setArama(v); setSayfa(0); }}
          style={[styles.searchbar, { backgroundColor: theme.colors.surface }]}
          inputStyle={{ fontSize: 14 }}
        />
        <View style={styles.chipRow}>
          {['', 'FREE', 'PREMIUM', 'ULTRA'].map((p) => (
            <Chip
              key={p}
              selected={planFiltre === p}
              onPress={() => { setPlanFiltre(p); setSayfa(0); }}
              compact
              style={styles.filterChip}
              textStyle={{ fontSize: 12 }}
            >
              {p === '' ? 'Tumu' : PLAN_ETIKET[p]?.ad ?? p}
            </Chip>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>Kullanicilar yuklenemedi.</Text>
          <Button mode="outlined" onPress={() => refetch()} style={{ marginTop: spacing.md }}>Tekrar Dene</Button>
        </View>
      ) : (
        <>
          <Text variant="labelSmall" style={[styles.totalLabel, { color: theme.colors.onSurfaceVariant }]}>
            {data?.totalElements ?? 0} kullanici
          </Text>
          <FlatList
            data={kullanicilar}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderKullanici}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Kullanici bulunamadi.
                </Text>
              </View>
            }
          />
          {toplamSayfa > 1 && (
            <View style={styles.pagination}>
              <Button
                mode="text"
                compact
                disabled={sayfa === 0}
                onPress={() => setSayfa((s) => Math.max(0, s - 1))}
              >
                Onceki
              </Button>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {sayfa + 1} / {toplamSayfa}
              </Text>
              <Button
                mode="text"
                compact
                disabled={sayfa >= toplamSayfa - 1}
                onPress={() => setSayfa((s) => s + 1)}
              >
                Sonraki
              </Button>
            </View>
          )}
        </>
      )}

      {/* Düzenle Modal */}
      <Portal>
        <Modal
          visible={!!modal}
          onDismiss={() => setModal(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {modal && (
            <View>
              <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                Kullaniciyi Duzenle
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                {modal.ad} {modal.soyad} — {modal.email}
              </Text>

              <Text variant="labelMedium" style={[styles.formLabel, { color: theme.colors.onSurface }]}>
                Plan
              </Text>
              <SegmentedButtons
                value={formPlan}
                onValueChange={(v) => setFormPlan(v as PlanTuru)}
                buttons={[
                  { value: 'FREE', label: 'Ucretsiz' },
                  { value: 'PREMIUM', label: 'Pro' },
                  { value: 'ULTRA', label: 'Ultra' },
                ]}
                style={{ marginTop: spacing.xs }}
              />

              <View style={styles.switchRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Admin</Text>
                <Switch value={formAdmin} onValueChange={setFormAdmin} />
              </View>

              <View style={styles.switchRow}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>Aktif</Text>
                <Switch value={formAktif} onValueChange={setFormAktif} />
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => silOnay(modal)}
                  textColor={theme.colors.error}
                  style={{ borderColor: theme.colors.error, borderRadius: radius.sm }}
                >
                  Sil
                </Button>
                <View style={{ flex: 1 }} />
                <Button
                  mode="text"
                  onPress={() => setModal(null)}
                  style={{ marginRight: spacing.sm }}
                >
                  Iptal
                </Button>
                <Button
                  mode="contained"
                  loading={guncelle.isPending}
                  disabled={guncelle.isPending}
                  onPress={() =>
                    guncelle.mutate({
                      id: modal.id,
                      req: { plan: formPlan, adminMi: formAdmin, aktif: formAktif },
                    })
                  }
                  style={{ borderRadius: radius.sm }}
                >
                  Kaydet
                </Button>
              </View>
            </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  searchbar: {
    borderRadius: radius.md,
    elevation: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterChip: {
    borderRadius: radius.full,
  },
  totalLabel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 20,
    gap: spacing.sm,
  },
  userCard: {
    borderRadius: radius.md,
    elevation: 1,
  },
  userContent: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adminTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  modal: {
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.lg,
  },
  formLabel: {
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
});
