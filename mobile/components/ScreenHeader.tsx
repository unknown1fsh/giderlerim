import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { appColors, spacing, radius } from '../theme';

interface Props {
  baslik: string;
  geriGoster?: boolean;
  sagIkon?: string;
  sagIkonPress?: () => void;
  sagBilesen?: ReactNode;
}

export function ScreenHeader({
  baslik,
  geriGoster = true,
  sagIkon,
  sagIkonPress,
  sagBilesen,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: appColors.ink, borderBottomColor: '#2B211A' },
      ]}
    >
      <View style={styles.sol}>
        {geriGoster ? (
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            iconColor="#FFF7ED"
            style={styles.iconButton}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text
        variant="titleLarge"
        style={styles.baslik}
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
              iconColor="#FFF7ED"
              style={styles.iconButton}
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
    minHeight: 60,
  },
  sol: {
    width: 48,
    alignItems: 'flex-start',
  },
  baslik: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '900',
    color: '#FFF7ED',
  },
  sag: {
    width: 48,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 48,
    height: 48,
  },
  iconButton: {
    borderRadius: radius.full,
  },
});
