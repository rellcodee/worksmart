import React from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterBarProps {
  categories: Category[];
  selectedCategoryId: string | null; // null means 'Semua'
  onSelectCategory: (id: string | null) => void;
  onManageCategories: () => void;
}

export function CategoryFilterBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onManageCategories,
}: CategoryFilterBarProps) {
  
  const handleSelect = (id: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectCategory(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Default 'Semua' chip */}
        <TouchableOpacity
          onPress={() => handleSelect(null)}
          style={[
            styles.chip,
            selectedCategoryId === null && styles.chipActive
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.chipText,
            selectedCategoryId === null && styles.chipTextActive
          ]}>
            Semua
          </Text>
        </TouchableOpacity>

        {/* Categories from store */}
        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleSelect(cat.id)}
              style={[
                styles.chip,
                isActive && styles.chipActive
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                isActive && styles.chipTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Settings gear shortcut button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onManageCategories();
        }}
        style={styles.settingsButton}
        activeOpacity={0.7}
      >
        <IconSymbol size={18} name="chevron.left.forwardslash.chevron.right" color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm - 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  settingsButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
});
