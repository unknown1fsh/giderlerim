import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SohbetMesajiResponse } from '@giderlerim/shared/types/ai.types';

interface Props {
  mesaj: SohbetMesajiResponse;
}

export function AiMesajBalonu({ mesaj }: Props) {
  const theme = useTheme();
  const kullaniciMi = mesaj.rol === 'KULLANICI';

  return (
    <View
      style={[
        styles.container,
        kullaniciMi ? styles.kullanici : styles.asistan,
        {
          backgroundColor: kullaniciMi
            ? theme.colors.primary
            : theme.colors.surfaceVariant,
        },
      ]}
    >
      <Text
        variant="bodyMedium"
        style={{
          color: kullaniciMi
            ? theme.colors.onPrimary
            : theme.colors.onSurfaceVariant,
          lineHeight: 22,
        }}
      >
        {mesaj.icerik}
      </Text>
      <Text
        variant="labelSmall"
        style={{
          color: kullaniciMi
            ? theme.colors.onPrimary
            : theme.colors.onSurfaceVariant,
          opacity: 0.6,
          marginTop: 4,
          alignSelf: kullaniciMi ? 'flex-end' : 'flex-start',
        }}
      >
        {new Date(mesaj.createdAt).toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  kullanici: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  asistan: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
});
