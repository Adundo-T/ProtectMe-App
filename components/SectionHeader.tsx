import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { protectMePalette, spacing } from '@/theme';

type Props = {
  title: string;
  action?: ReactNode;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle, action }: Props) {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  subtitle: {
    color: protectMePalette.muted,
    fontSize: 14,
    marginTop: 2,
  },
});

