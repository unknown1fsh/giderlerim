import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Divider, useTheme, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../../lib/stores';
import { useUyariSayac } from '../../../lib/hooks';
import { spacing, radius } from '../../../theme';

export default function MenuEkrani() {
  const theme = useTheme();
  const kullanici = useAuthStore((s) => s.kullanici);
  const cikisYap = useAuthStore((s) => s.cikisYap);
  const { data: uyariSayisi } = useUyariSayac();

  const handleCikis = () => {
    cikisYap();
    router.replace('/(auth)/giris');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {kullanici && (
          <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
            <Avatar.Text
              size={64}
              label={`${kullanici.ad?.[0] || ''}${kullanici.soyad?.[0] || ''}`}
              style={{ backgroundColor: theme.colors.primary }}
              labelStyle={{ fontSize: 24, fontWeight: '700' }}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                {kullanici.ad} {kullanici.soyad}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                {kullanici.email}
              </Text>
              <View style={[styles.planBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                  {kullanici.plan} Plan
                </Text>
              </View>
            </View>
          </View>
        )}

        <Divider />

        <List.Section>
          <List.Subheader style={styles.subheader}>Ozellikler</List.Subheader>

          <List.Item
            title="Uyarilar"
            description={uyariSayisi ? `${uyariSayisi} okunmamis` : 'Tum uyarilar okundu'}
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() =>
              uyariSayisi ? (
                <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                  <Text variant="labelSmall" style={{ color: '#fff', fontWeight: '700' }}>
                    {uyariSayisi}
                  </Text>
                </View>
              ) : null
            }
            onPress={() => router.push('/(tabs)/menu/uyarilar')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />

          <List.Item
            title="AI Analizler"
            description="Harcama analizi, butce onerileri"
            left={(props) => <List.Icon {...props} icon="chart-bar" />}
            onPress={() => router.push('/(tabs)/menu/analizler')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />

          <List.Item
            title="Belge Yukle"
            description="Fis ve fatura taratin"
            left={(props) => <List.Icon {...props} icon="camera-outline" />}
            onPress={() => router.push('/(tabs)/menu/belge-yukle')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />

          <List.Item
            title="CSV Yukle"
            description="CSV dosyasindan toplu gider aktar"
            left={(props) => <List.Icon {...props} icon="file-delimited-outline" />}
            onPress={() => router.push('/(tabs)/menu/csv-yukle')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />

          <List.Item
            title="Destek"
            description="Yardim ve destek talepleri"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            onPress={() => router.push('/(tabs)/menu/destek')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader style={styles.subheader}>Hesap</List.Subheader>

          <List.Item
            title="Profil"
            description="Hesap bilgileri ve ayarlar"
            left={(props) => <List.Icon {...props} icon="account-outline" />}
            onPress={() => router.push('/(tabs)/menu/profil')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />
        </List.Section>

        {kullanici?.adminMi && (
          <>
            <Divider />
            <List.Section>
              <List.Subheader style={styles.subheader}>Yonetim</List.Subheader>

              <List.Item
                title="Admin Paneli"
                description="Sistem istatistikleri ve yonetim"
                left={(props) => <List.Icon {...props} icon="shield-crown-outline" color={theme.colors.primary} />}
                onPress={() => router.push('/(tabs)/menu/admin')}
                style={styles.listItem}
                titleStyle={[styles.listTitle, { color: theme.colors.primary }]}
              />

              <List.Item
                title="Kullanici Yonetimi"
                description="Kullanicilari goruntule ve duzenle"
                left={(props) => <List.Icon {...props} icon="account-group-outline" />}
                onPress={() => router.push('/(tabs)/menu/admin-kullanicilar')}
                style={styles.listItem}
                titleStyle={styles.listTitle}
              />

              <List.Item
                title="Destek Talepleri"
                description="Kullanici destek taleplerini yonet"
                left={(props) => <List.Icon {...props} icon="headset" />}
                onPress={() => router.push('/(tabs)/menu/admin-destek')}
                style={styles.listItem}
                titleStyle={styles.listTitle}
              />
            </List.Section>
          </>
        )}

        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleCikis}
            textColor={theme.colors.error}
            style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
            contentStyle={{ height: 48 }}
            icon="logout"
          >
            Cikis Yap
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
  },
  profileInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  subheader: {
    fontWeight: '600',
  },
  listItem: {
    minHeight: 64,
    paddingVertical: spacing.xs,
  },
  listTitle: {
    fontWeight: '500',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 6,
  },
  logoutSection: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  logoutBtn: {
    borderRadius: radius.md,
  },
});
