import { StyleSheet, Text, View } from 'react-native';
import { protectMePalette, radii, spacing } from '@/theme';
import type { ReportStatus } from '@/types';

type Props = {
  status: ReportStatus | 'pending-alert' | 'active';
};

const statusMap: Record<Props['status'], { label: string; color: string; background: string }> = {
  draft: {
    label: 'Draft',
    color: protectMePalette.muted,
    background: '#E5D9F5',
  },
  pending: {
    label: 'Pending',
    color: protectMePalette.warning,
    background: '#FFF3D6',
  },
  synced: {
    label: 'Synced',
    color: protectMePalette.success,
    background: '#DCF7EA',
  },
  active: {
    label: 'Active',
    color: protectMePalette.primary,
    background: '#E3F2FD',
  },
  'pending-alert': {
    label: 'SOS Pending',
    color: protectMePalette.danger,
    background: '#FCE1E7',
  },
};

export function StatusPill({ status }: Props) {
  const map = statusMap[status];
  return (
    <View style={[styles.pill, { backgroundColor: map.background }]}>
      <Text style={[styles.text, { color: map.color }]}>{map.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    fontSize: 12,
  },
});

