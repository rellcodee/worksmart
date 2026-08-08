import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('worksmart.db');
  }
  return dbInstance;
}

export async function initializeDatabase() {
  const db = await getDb();
  
  // Enable foreign key constraints
  await db.execAsync('PRAGMA foreign_keys = ON;');
  
  // Execute table definitions
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      last_updated_date TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS weekly_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      description TEXT
    );
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    );
    
    CREATE TABLE IF NOT EXISTS pomodoro_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      focus_time INTEGER DEFAULT 25,
      short_break INTEGER DEFAULT 5,
      long_break INTEGER DEFAULT 15
    );
  `);
  
  // Seed pomodoro settings (Default 25 / 5 / 15)
  const settings = await db.getFirstAsync('SELECT id FROM pomodoro_settings WHERE id = 1');
  if (!settings) {
    await db.runAsync(
      'INSERT INTO pomodoro_settings (id, focus_time, short_break, long_break) VALUES (1, 25, 5, 15)'
    );
  }
  
  // Seed base categories
  const categoryCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );
  if (categoryCount && categoryCount.count === 0) {
    const defaultCategories = [
      { id: '1', name: 'Akademik' },
      { id: '2', name: 'Pribadi' },
      { id: '3', name: 'Pekerjaan' },
    ];
    for (const cat of defaultCategories) {
      await db.runAsync('INSERT INTO categories (id, name) VALUES (?, ?)', [cat.id, cat.name]);
    }
  }
}
