PROMPT MASTER: WORKSMART (REVISED FULL-STACK MOBILE APP PRD)

1. RINGKASAN EKSEKUTIF & VISI APLIKASI
-------------------------------------------------------------------
Nama Aplikasi: WorkSmart
Platform: Mobile App (Android/iOS)
Tech Stack: React Native + Expo (Managed Workflow), Expo Router, Expo SQLite, Zustand, NativeWind (Tailwind CSS), Expo Notifications.

Konsep Utama: 
WorkSmart adalah aplikasi manajemen produktivitas pribadi yang 100% OFFLINE, tanpa backend eksternal, tanpa server, dan TANPA SISTEM LOGIN. Saat aplikasi pertama kali diunduh, sistem berada dalam kondisi kosong murni (blank state). Semua data tersimpan aman di dalam sandbox lokal HP pengguna (Expo SQLite) sehingga tidak mencemari OS.

Aplikasi ini menggunakan navigasi Bottom Tab Bar (`/app/(tabs)/`) dengan struktur multi-halaman yang modular dan terisolasi.

-------------------------------------------------------------------
2. ARSITEKTUR TEMA & WARNA (CENTRALIZED SYSTEM)
-------------------------------------------------------------------
* Seluruh variabel warna WAJIB disimpan tersentralisasi di file `src/constants/theme.ts`.
* Gunakan pendekatan Dark Mode/Minimalist UI sebagai basis, dengan variabel Aksen Warna yang mudah diganti (Single Source of Truth).
* Dilarang keras menuliskan warna secara hardcoded (hex code langsung) di dalam komponen UI. All styles must read from `theme.ts` or NativeWind config.

-------------------------------------------------------------------
3. NAVIGASI UTAMA & BOTTOM TAB BAR (`app/(tabs)/`)
-------------------------------------------------------------------
Aplikasi menggunakan Bottom Tab Bar dengan 5 Tab Utama:
1. Tab 1: `/home` (Pengganti Dashboard)
2. Tab 2: `/task-tracker` (Hub Pengelola Task)
3. Tab 3: `/pomodoro` (Timer Fokus)
4. Tab 4: `/notes` (Catatan Terkategori)
5. Tab 5: `/calendar` (Jadwal & Agenda)

-------------------------------------------------------------------
4. SPESIFIKASI DETIL FITUR PER HALAMAN
-------------------------------------------------------------------

FITUR 1: HOME SCREEN (`/home`)
* Real-time WIB Clock: Widget jam digital real-time berformat HH:mm:ss WIB di bagian paling atas.
* Rotational Quotes Carousel: Widget kutipan motivasi yang berganti secara otomatis atau swipeable.
  - Default Quote List: "Lebih baik merasakan susahnya belajar, daripada merasakan kebodohan" (Imam Syafi'i), dan kutipan perjuangan/produktivitas terpilih lainnya.
* Mini Calendar Summary: Tampilan kalender ringkas bulan berjalan. Tanggal yang memiliki Agenda/Event atau Due Date dari Weekly Task akan ditandai dengan indikator visual (titik warna aksen).
* Recent Weekly Task Widget: Komponen tabel/list yang HANYA menampilkan 5 data tugas terbaru dari Weekly Tracker.
* Quick Pomodoro Button: Tombol akses cepat yang langsung mengarahkan navigasi ke tab `/pomodoro`.

FITUR 2: TASK TRACKER HUB (`/task-tracker`)
* Halaman ini bertindak sebagai hub/penghubung visual berupa 2 Card/Tombol Utama:
  1. Card "Daily Tracker" -> Navigasi ke sub-halaman `/task-tracker/daily`
  2. Card "Weekly Tracker" -> Navigasi ke sub-halaman `/task-tracker/weekly`

FITUR 3: DAILY TRACKER (`/task-tracker/daily`)
* Circular Filled Round Progress Bar:
  - Di bagian atas halaman, tampilkan progress bar melingkar (Circular Progress) yang menghitung persentase tugas harian yang sudah dicentang secara real-time (misal: 3/4 selesai = 75%).
  - Tujuannya memicu psikologi pengguna untuk mencapai 100% penyelesaian setiap hari.
* Logika Reset Otomatis (00:00 Malam):
  - Sistem memeriksa stempel waktu (timestamp) setiap pergantian hari pukul 00:00.
  - Tugas harian yang SUDAH selesai (Checked = true) akan di-reset otomatis menjadi BELUM selesai (Checked = false) untuk hari yang baru.
  - Tugas harian yang BELUM selesai tetap berada pada status belum selesai (normal task tanpa pinalti).

FITUR 4: WEEKLY TRACKER (`/task-tracker/weekly`)
* Tugas dengan tenggat waktu (due date) yang lebih fleksibel/kompleks.
* Memiliki bidang isian: Judul, Deskripsi, Tenggat Tanggal (Due Date), dan Status Selesai.
* Data dari Weekly Tracker otomatis mengumpan (feed) ke widget "5 Data Terbaru" di Home Screen dan penanda tanggal di Calendar.

FITUR 5: POMODORO FOCUS TIMER (`/pomodoro`)
* Fitur Timer Independen: Murni alat fokus sadar pengguna (tidak terikat/terhubung langsung ke sistem task).
* Customizable Timer Durations:
  - Input kustomisasi durasi untuk 3 Mode: Pomodoro (Focus Time), Short Break, dan Long Break.
  - Durasi terakhir yang di-set oleh pengguna WAJIB disimpan ke local storage (SQLite/AsyncStorage) dan menjadi durasi default saat aplikasi dibuka kembali.
* Background Execution & Alert: Memanfaatkan Expo Audio / Expo Notifications lokal untuk membunyikan sinyal/notifikasi saat waktu timer habis, meskipun aplikasi diminimize.

FITUR 6: MASTER CALENDAR & EVENT ENGINE (`/calendar`)
* Tampilan Kalender Bulanan/Mingguan Interaktif.
* Pembuatan Event Manual: Pengguna dapat menambah agenda manual pada tanggal tertentu (misal: Ujian, Meeting, Deadline).
* Aggregator Agenda: Menampilkan kombinasi antara Event Manual dan Due Date dari Weekly Task.
* Local Notification Scheduler (Expo Notifications):
  - Pemicu Notifikasi Otomatis: Dibuat tepat pada pukul 07:00 AM (jam mulai kerja) di hari-H jadwal/event tersebut tiba.
  - Tidak menggunakan server cloud; semua penjadwalan dikirim ke OS lokal HP.

FITUR 7: NOTES MANAGEMENT (`/notes`)
* Kemampuan CRUD (Create, Read, Update, Delete) Catatan Teks Bebas.
* Custom Category System: Pengguna dapat membuat tag/kategori kustom secara dinamis (contoh: "Akademik", "Pribadi", "Pekerjaan").
* Dynamic Category Filter Bar:
  - Dibagian atas daftar catatan, sediakan Filter Pills/Chips.
  - Opsi Default: "Semua" (Menampilkan seluruh catatan).
  - Jika chip kategori (misal: "Akademik") diklik, UI hanya menampilkan catatan dengan kategori tersebut.

-------------------------------------------------------------------
5. SKEMA DATABASE LOKAL (EXPO SQLITE)
-------------------------------------------------------------------
Buat struktur tabel relasional berikut di file `src/db/database.ts`:

1. Table: `daily_tasks`
   - id (TEXT PRIMARY KEY)
   - title (TEXT)
   - is_completed (INTEGER - 0 atau 1)
   - last_updated_date (TEXT - ISO format YYYY-MM-DD untuk memicu reset 00:00)

2. Table: `weekly_tasks`
   - id (TEXT PRIMARY KEY)
   - title (TEXT)
   - description (TEXT)
   - due_date (TEXT - ISO format)
   - is_completed (INTEGER)
   - created_at (TEXT)

3. Table: `events`
   - id (TEXT PRIMARY KEY)
   - title (TEXT)
   - event_date (TEXT - ISO format)
   - description (TEXT)

4. Table: `notes`
   - id (TEXT PRIMARY KEY)
   - title (TEXT)
   - content (TEXT)
   - category_id (TEXT)
   - created_at (TEXT)

5. Table: `categories`
   - id (TEXT PRIMARY KEY)
   - name (TEXT UNIQUE)

6. Table: `pomodoro_settings`
   - id (INTEGER PRIMARY KEY DEFAULT 1)
   - focus_time (INTEGER)
   - short_break (INTEGER)
   - long_break (INTEGER)

-------------------------------------------------------------------
6. ATURAN STRUKTUR KODE (ANTI-SINGLE FILE POLICY)
-------------------------------------------------------------------
Agent WAJIB membagi arsitektur menjadi modular dan terorganisir:

/app
  _layout.tsx
  index.tsx -> (Redirect ke /(tabs)/home)
  /(tabs)
    _layout.tsx (Konfigurasi Bottom Tab Bar)
    home.tsx
    task-tracker/
      index.tsx (Hub UI)
      daily.tsx
      weekly.tsx
    pomodoro.tsx
    notes.tsx
    calendar.tsx
/src
  /components
    /Home
      WibClock.tsx
      QuotesCarousel.tsx
      CalendarSummary.tsx
      RecentWeeklyList.tsx
    /Daily
      CircularProgressBar.tsx
      DailyTaskItem.tsx
    /Pomodoro
      TimerDisplay.tsx
      TimerSettingsModal.tsx
    /Notes
      CategoryFilterBar.tsx
      NoteCard.tsx
    /Calendar
      EventModal.tsx
  /db
    database.ts
  /store
    useTaskStore.ts
    useNoteStore.ts
    usePomodoroStore.ts
  /constants
    theme.ts (Pusat variabel warna & style)
  /services
    notificationService.ts (Pemicu notifikasi lokal 07:00 AM)