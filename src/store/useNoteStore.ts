import { create } from 'zustand';
import { getDb } from '../db/database';

export interface Note {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}

interface NoteState {
  notes: Note[];
  categories: Category[];
  
  loadNotesData: () => Promise<void>;
  
  // Note operations
  addNote: (title: string, content: string, categoryId: string | null) => Promise<void>;
  updateNote: (id: string, title: string, content: string, categoryId: string | null) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Category operations
  addCategory: (name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<void>;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  categories: [],

  loadNotesData: async () => {
    try {
      const db = await getDb();
      const loadedNotes = await db.getAllAsync<Note>(
        'SELECT * FROM notes ORDER BY created_at DESC'
      );
      const loadedCategories = await db.getAllAsync<Category>(
        'SELECT * FROM categories ORDER BY name ASC'
      );
      
      set({ notes: loadedNotes, categories: loadedCategories });
    } catch (error) {
      console.error('Failed to load notes data:', error);
    }
  },

  addNote: async (title, content, categoryId) => {
    try {
      const db = await getDb();
      const id = generateId();
      const createdAt = new Date().toISOString();

      await db.runAsync(
        'INSERT INTO notes (id, title, content, category_id, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, title, content, categoryId, createdAt]
      );

      set((state) => ({
        notes: [
          { id, title, content, category_id: categoryId, created_at: createdAt },
          ...state.notes,
        ],
      }));
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  },

  updateNote: async (id, title, content, categoryId) => {
    try {
      const db = await getDb();
      await db.runAsync(
        'UPDATE notes SET title = ?, content = ?, category_id = ? WHERE id = ?',
        [title, content, categoryId, id]
      );

      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, title, content, category_id: categoryId } : n
        ),
      }));
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  },

  deleteNote: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);

      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },

  addCategory: async (name) => {
    try {
      const db = await getDb();
      const id = generateId();
      
      // Check if duplicate category exists
      const duplicate = await db.getFirstAsync(
        'SELECT id FROM categories WHERE name = ?',
        [name]
      );
      if (duplicate) return false;

      await db.runAsync('INSERT INTO categories (id, name) VALUES (?, ?)', [id, name]);

      set((state) => ({
        categories: [...state.categories, { id, name }].sort((a, b) => a.name.localeCompare(b.name)),
      }));
      return true;
    } catch (error) {
      console.error('Failed to add category:', error);
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);

      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        // If notes had this category assigned, database foreign key ON DELETE SET NULL
        // handles setting category_id to NULL. Sync that in state:
        notes: state.notes.map((n) => (n.category_id === id ? { ...n, category_id: null } : n)),
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  },
}));
