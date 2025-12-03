import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { protectMePalette, spacing } from '@/theme';

type Props = {
  title: string;
  action?: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
};

export function SectionHeader({ title, subtitle, action, icon }: Props) {
  return (
    <View style={styles.container}>
      {icon}
      <View style={{ flex: 1, marginLeft: icon ? spacing.sm : 0 }}>
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

