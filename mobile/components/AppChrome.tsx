import type { ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { appColors, radius, shadows, spacing } from '../theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function AppSurface({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={[styles.surface, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.topBand, { backgroundColor: appColors.ink }]} />
      {children}
    </View>
  );
}

export function HeroHeader({
  title,
  subtitle,
  icon,
  meta,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  meta?: string;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroText}>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <Text variant="headlineSmall" style={styles.heroTitle} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodyMedium" style={styles.heroSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {icon ? (
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons name={icon} size={28} color={appColors.ink} />
        </View>
      ) : null}
    </View>
  );
}

export function AppCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }, style]}>
      {children}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description?: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={34} color={theme.colors.primary} />
      </View>
      <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function AccentPill({ children }: { children: ReactNode }) {
  return (
    <View style={styles.pill}>
      <Text variant="labelSmall" style={styles.pillText}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
  },
  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 184,
  },
  hero: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 116,
    borderRadius: radius.xl,
    padding: spacing.xl,
    backgroundColor: appColors.ink2,
    borderWidth: 1,
    borderColor: '#2B211A',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.lift,
  },
  heroText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  meta: {
    color: appColors.orange2,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFF7ED',
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#C8B6A6',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.orange,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    ...shadows.card,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 96,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: spacing.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: '#2B1B0F',
    borderWidth: 1,
    borderColor: '#5A3315',
  },
  pillText: {
    color: appColors.orange2,
    fontWeight: '800',
  },
});
