import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNoteStore, Note } from '../../src/store/useNoteStore';
import { CategoryFilterBar } from '../../src/components/Notes/CategoryFilterBar';
import { NoteCard } from '../../src/components/Notes/NoteCard';
import { theme } from '../../src/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NotesScreen() {
  const {
    notes,
    categories,
    loadNotesData,
    addNote,
    updateNote,
    deleteNote,
    addCategory,
    deleteCategory,
  } = useNoteStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Modals visibility
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Note form state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategoryId, setNoteCategoryId] = useState<string | null>(null);

  // Category form state
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadNotesData();
  }, [loadNotesData]);

  // Filter notes based on selection
  const filteredNotes = selectedCategoryId
    ? notes.filter((n) => n.category_id === selectedCategoryId)
    : notes;

  // Open note modal for Add
  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategoryId(selectedCategoryId); // prefill with current selected category
    setNoteModalVisible(true);
  };

  // Open note modal for Edit
  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategoryId(note.category_id);
    setNoteModalVisible(true);
  };

  // Save note
  const handleSaveNote = () => {
    if (noteTitle.trim() === '' && noteContent.trim() === '') return;

    if (editingNote) {
      updateNote(editingNote.id, noteTitle.trim(), noteContent.trim(), noteCategoryId);
    } else {
      addNote(noteTitle.trim(), noteContent.trim(), noteCategoryId);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNoteModalVisible(false);
  };

  // Add category
  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subTitle}>KNOWLEDGE BASE</Text>
          <Text style={styles.title}>Categorized Notes</Text>
        </View>

        {/* Categories Bar */}
        <CategoryFilterBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onManageCategories={() => setCategoryModalVisible(true)}
        />

        {/* Notes Grid/List */}
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notes yet.</Text>
            <TouchableOpacity onPress={handleOpenAddNote} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Create First Note</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.notesGrid}
            showsVerticalScrollIndicator={false}
          >
            {filteredNotes.map((note) => (
              <View key={note.id} style={styles.gridItem}>
                <NoteCard
                  note={note}
                  categories={categories}
                  onEdit={handleOpenEditNote}
                  onDelete={(id) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    deleteNote(id);
                  }}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {/* FAB: Add Note */}
        <TouchableOpacity
          onPress={handleOpenAddNote}
          style={styles.fab}
          activeOpacity={0.8}
        >
          <IconSymbol size={28} name="checkmark.circle.fill" color="#FFFFFF" />
        </TouchableOpacity>

      </View>

      {/* Add/Edit Note Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>

            <TextInput
              style={styles.titleInput}
              placeholder="Note Title"
              placeholderTextColor={theme.colors.textDark}
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            {/* Category Selector inside Note Form */}
            <Text style={styles.selectorLabel}>Select Category:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectorRow}
            >
              <TouchableOpacity
                onPress={() => setNoteCategoryId(null)}
                style={[
                  styles.selectorChip,
                  noteCategoryId === null ? styles.selectorChipActive : null
                ]}
              >
                <Text style={[
                  styles.selectorChipText,
                  noteCategoryId === null ? styles.selectorChipTextActive : null
                ]}>Uncategorized</Text>
              </TouchableOpacity>

              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setNoteCategoryId(cat.id)}
                  style={[
                    styles.selectorChip,
                    noteCategoryId === cat.id ? styles.selectorChipActive : null
                  ]}
                >
                  <Text style={[
                    styles.selectorChipText,
                    noteCategoryId === cat.id ? styles.selectorChipTextActive : null
                  ]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.contentInput}
              placeholder="Write your note here..."
              placeholderTextColor={theme.colors.textDark}
              value={noteContent}
              onChangeText={setNoteContent}
              multiline={true}
              numberOfLines={10}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveNote}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Manager Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Categories</Text>

            {/* List existing categories */}
            <View style={styles.categoryListWrapper}>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 200 }}
                renderItem={({ item }) => (
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryNameText}>{item.name}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        deleteCategory(item.id);
                      }}
                      style={styles.catDeleteBtn}
                    >
                      <IconSymbol size={16} name="trash.fill" color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyCatText}>No custom categories yet.</Text>
                }
              />
            </View>

            {/* Add new category form */}
            <View style={styles.addCategoryForm}>
              <TextInput
                style={styles.addCategoryInput}
                placeholder="New category name..."
                placeholderTextColor={theme.colors.textDark}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TouchableOpacity
                onPress={handleAddCategory}
                style={styles.addCategoryBtn}
              >
                <Text style={styles.addCategoryBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
  },
  subTitle: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: theme.fonts.sans,
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: theme.fonts.sans,
    marginTop: 2,
  },
  notesGrid: {
    paddingBottom: theme.spacing.xl * 2,
  },
  gridItem: {
    width: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    color: theme.colors.textDark,
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.md,
  },
  emptyBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  emptyBtnText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
    fontFamily: theme.fonts.sans,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.lg,
  },
  titleInput: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    height: 44,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectorLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    marginBottom: 6,
  },
  selectorRow: {
    gap: 8,
    marginBottom: theme.spacing.md,
    paddingBottom: 4,
  },
  selectorChip: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  selectorChipActive: {
    backgroundColor: theme.colors.primaryGlow,
    borderColor: theme.colors.primary,
  },
  selectorChipText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
  },
  selectorChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  contentInput: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    height: 180,
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: theme.fonts.sans,
    fontSize: 14,
  },
  categoryListWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  categoryNameText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.fonts.sans,
  },
  catDeleteBtn: {
    padding: 4,
  },
  emptyCatText: {
    color: theme.colors.textDark,
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  addCategoryForm: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  addCategoryInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    height: 40,
    fontSize: 14,
    fontFamily: theme.fonts.sans,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addCategoryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: theme.fonts.sans,
  },
  closeBtn: {
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeBtnText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.sans,
    fontSize: 14,
  },
});
