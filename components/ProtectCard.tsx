import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { protectMePalette, radii, shadow, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  background?: string;
};

export function ProtectCard({ children, onPress, background = protectMePalette.card }: Props) {
  const content = <View style={[styles.card, { backgroundColor: background }]}>{children}</View>;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          {
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.card,
  },
});

