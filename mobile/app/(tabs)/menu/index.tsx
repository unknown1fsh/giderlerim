import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, useTheme, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../../lib/stores';
import { useUyariSayac } from '../../../lib/hooks';
import { AppSurface, HeroHeader } from '../../../components/AppChrome';
import { appColors, spacing, radius, shadows } from '../../../theme';

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
    <SafeAreaView style={styles.container}>
      <AppSurface>
      <HeroHeader
        title="Menü"
        subtitle="Hesap, destek, veri aktarımı ve yönetim araçları."
        icon="cog-outline"
        meta="Ayarlar"
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {kullanici && (
          <View style={[styles.profileSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
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

        <List.Section>
          <List.Subheader style={styles.subheader}>Özellikler</List.Subheader>

          <List.Item
            title="Uyarılar"
            description={uyariSayisi ? `${uyariSayisi} okunmamış` : 'Tüm uyarılar okundu'}
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
            description="Harcama analizi, bütçe önerileri"
            left={(props) => <List.Icon {...props} icon="chart-bar" />}
            onPress={() => router.push('/(tabs)/menu/analizler')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />

          <List.Item
            title="Belge Yükle"
            description="Fiş ve fatura taratın"
            left={(props) => <List.Icon {...props} icon="camera-outline" />}
            onPress={() => router.push('/(tabs)/menu/belge-yukle')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />

          <List.Item
            title="CSV Yükle"
            description="CSV dosyasından toplu gider aktar"
            left={(props) => <List.Icon {...props} icon="file-delimited-outline" />}
            onPress={() => router.push('/(tabs)/menu/csv-yukle')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />

          <List.Item
            title="Destek"
            description="Yardım ve destek talepleri"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            onPress={() => router.push('/(tabs)/menu/destek')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
          />
        </List.Section>

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
            <List.Section>
              <List.Subheader style={styles.subheader}>Yonetim</List.Subheader>

              <List.Item
                title="Admin Paneli"
                description="Sistem istatistikleri ve yönetim"
                left={(props) => <List.Icon {...props} icon="shield-crown-outline" color={theme.colors.primary} />}
                onPress={() => router.push('/(tabs)/menu/admin')}
                style={styles.listItem}
                titleStyle={[styles.listTitle, { color: theme.colors.primary }]}
              />

              <List.Item
                title="Kullanıcı Yönetimi"
                description="Kullanıcıları görüntüle ve düzenle"
                left={(props) => <List.Icon {...props} icon="account-group-outline" />}
                onPress={() => router.push('/(tabs)/menu/admin-kullanicilar')}
                style={styles.listItem}
                titleStyle={styles.listTitle}
              />

              <List.Item
                title="Destek Talepleri"
                description="Kullanıcı destek taleplerini yönet"
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
            Çıkış Yap
          </Button>
        </View>
      </ScrollView>
      </AppSurface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 116,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...shadows.card,
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
    fontWeight: '900',
    color: appColors.orange,
  },
  listItem: {
    minHeight: 64,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  listTitle: {
    fontWeight: '800',
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
    paddingTop: spacing.lg,
    paddingBottom: 40,
  },
  logoutBtn: {
    borderRadius: radius.md,
  },
});
