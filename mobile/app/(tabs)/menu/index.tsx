import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Divider, useTheme, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../../lib/stores';
import { useUyariSayac } from '../../../lib/hooks';

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
      <ScrollView>
        {kullanici && (
          <View style={styles.profileSection}>
            <Avatar.Text
              size={56}
              label={`${kullanici.ad?.[0] || ''}${kullanici.soyad?.[0] || ''}`}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                {kullanici.ad} {kullanici.soyad}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {kullanici.email}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: 4 }}>
                {kullanici.plan} Plan
              </Text>
            </View>
          </View>
        )}

        <Divider />

        <List.Section>
          <List.Subheader>Ozellikler</List.Subheader>

          <List.Item
            title="Uyarilar"
            description={uyariSayisi ? `${uyariSayisi} okunmamis` : 'Tum uyarilar okundu'}
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => uyariSayisi ? <Text style={{ color: '#ef4444', alignSelf: 'center' }}>{uyariSayisi}</Text> : null}
            onPress={() => router.push('/(tabs)/menu/uyarilar')}
          />

          <List.Item
            title="AI Analizler"
            description="Harcama analizi, butce onerileri"
            left={(props) => <List.Icon {...props} icon="chart-bar" />}
            onPress={() => router.push('/(tabs)/menu/analizler')}
          />

          <List.Item
            title="Belge Yukle"
            description="Fis ve fatura taratin"
            left={(props) => <List.Icon {...props} icon="camera" />}
            onPress={() => router.push('/(tabs)/menu/belge-yukle')}
          />

          <List.Item
            title="CSV Yukle"
            description="CSV dosyasindan toplu gider aktar"
            left={(props) => <List.Icon {...props} icon="file-delimited" />}
            onPress={() => router.push('/(tabs)/menu/csv-yukle')}
          />

          <List.Item
            title="Destek"
            description="Yardim ve destek talepleri"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            onPress={() => router.push('/(tabs)/menu/destek')}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Hesap</List.Subheader>

          <List.Item
            title="Profil"
            description="Hesap bilgileri ve ayarlar"
            left={(props) => <List.Icon {...props} icon="account-outline" />}
            onPress={() => router.push('/(tabs)/menu/profil')}
          />
        </List.Section>

        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleCikis}
            textColor={theme.colors.error}
            style={{ borderColor: theme.colors.error, borderRadius: 12 }}
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
  profileSection: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  logoutSection: { padding: 20 },
});
