import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { spacing } from '../theme';

interface Props {
  baslik: string;
  geriGoster?: boolean;
  sagIkon?: string;
  sagIkonPress?: () => void;
  sagBilesen?: React.ReactNode;
}

export function ScreenHeader({
  baslik,
  geriGoster = true,
  sagIkon,
  sagIkonPress,
  sagBilesen,
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: theme.colors.outline + '40' },
      ]}
    >
      <View style={styles.sol}>
        {geriGoster ? (
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            iconColor={theme.colors.onBackground}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text
        variant="titleLarge"
        style={[styles.baslik, { color: theme.colors.onBackground }]}
        numberOfLines={1}
      >
        {baslik}
      </Text>

      <View style={styles.sag}>
        {sagBilesen ??
          (sagIkon ? (
            <IconButton
              icon={sagIkon}
              size={24}
              onPress={sagIkonPress}
              iconColor={theme.colors.onBackground}
            />
          ) : (
            <View style={styles.placeholder} />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  sol: {
    width: 48,
    alignItems: 'flex-start',
  },
  baslik: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  sag: {
    width: 48,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 48,
    height: 48,
  },
});
