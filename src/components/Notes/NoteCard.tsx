import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Note, Category } from '../../store/useNoteStore';

interface NoteCardProps {
  note: Note;
  categories: Category[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({
  note,
  categories,
  onEdit,
  onDelete,
}: NoteCardProps) {
  
  const handleDelete = async () => {
    onDelete(note.id);
  };

  const formatShortDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
    } catch {
      return '';
    }
  };

  const categoryName = categories.find((c) => c.id === note.category_id)?.name || null;

  return (
    <TouchableOpacity
      onPress={() => onEdit(note)}
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title || 'Catatan Tanpa Judul'}
        </Text>
        {categoryName && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryName}</Text>
          </View>
        )}
      </View>

      <Text style={styles.content} numberOfLines={4}>
        {note.content || 'Tidak ada teks tambahan.'}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatShortDate(note.created_at)}</Text>
        
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <IconSymbol size={16} name="trash.fill" color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: theme.fonts.sans,
  },
  badge: {
    backgroundColor: theme.colors.primaryGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  content: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xs,
  },
  date: {
    color: theme.colors.textDark,
    fontSize: 10,
    fontWeight: '500',
    fontFamily: theme.fonts.mono,
  },
  deleteButton: {
    padding: 4,
  },
});
