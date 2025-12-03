import { StyleSheet, View } from 'react-native';
import { protectMePalette, radii, spacing } from '@/theme';

type Props = {
  lines?: number;
};

export function LoadingPlaceholder({ lines = 3 }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: lines }).map((_, index) => (
        <View key={index} style={[styles.line, { width: `${80 - index * 10}%` }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radii.md,
    backgroundColor: '#EADFF9',
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: {
    height: 12,
    borderRadius: radii.sm,
    backgroundColor: protectMePalette.background,
  },
});

