import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SohbetMesajiResponse } from '@giderlerim/shared/types/ai.types';
import { spacing, radius } from '../theme';

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
            : theme.colors.onSurface,
          lineHeight: 24,
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
          opacity: 0.7,
          marginTop: spacing.sm,
          alignSelf: kullaniciMi ? 'flex-end' : 'flex-start',
          fontSize: 11,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    marginVertical: spacing.xs,
  },
  kullanici: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: spacing.xs,
  },
  asistan: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: spacing.xs,
  },
});
