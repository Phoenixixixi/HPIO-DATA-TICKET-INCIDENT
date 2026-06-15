# DOKUMENTASI TEKNIS PROJECT
## HPIO Data Ticket Incident Management System

**Versi Dokumentasi:** 1.0.0  
**Tanggal:** 15 Juni 2026  
**Disusun Oleh:** Senior Software Engineer & System Analyst  
**Status Project:** Active Development — Sebagian fitur dalam kondisi Work In Progress  

---

## DAFTAR ISI

1. [Analisis Struktur Project](#1-analisis-struktur-project)
2. [Analisis Database](#2-analisis-database)
3. [Analisis Fitur](#3-analisis-fitur)
4. [Dokumentasi Development per Modul](#4-dokumentasi-development-per-modul)
5. [Tabel Ringkasan Progress Development](#5-tabel-ringkasan-progress-development)
6. [Identifikasi Masalah](#6-identifikasi-masalah)
7. [Rekomendasi Pengembangan](#7-rekomendasi-pengembangan)

---

## 1. ANALISIS STRUKTUR PROJECT

### 1.1 Framework dan Teknologi

| Layer | Teknologi | Versi | Keterangan |
|---|---|---|---|
| **Backend Framework** | Laravel | ^12.0 | PHP ^8.2 |
| **Frontend Framework** | React | ^19.0.0 | TypeScript |
| **SSR Bridge** | Inertia.js | ^2.0 (Laravel) / ^2.0 (React) | Full-stack SPA |
| **Build Tool** | Vite | ^6.0 | + laravel-vite-plugin |
| **CSS Framework** | TailwindCSS | ^4.0.0 | @tailwindcss/vite |
| **Database** | PostgreSQL | — | DB `hpiodb` |
| **State Management** | Zustand | ^5.0.13 | Client-side store |
| **Routing (Client)** | Ziggy | ^2.4 | Laravel routes ke JS |
| **Package Manager** | Composer (PHP) + npm (JS) | — | |

### 1.2 Peta Struktur Folder

```
HPIO-DATA-TICKET-INCIDENT/
├── app/
│   ├── Console/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                          # Controller autentikasi
│   │   │   │   ├── AuthenticatedSessionController.php
│   │   │   │   ├── ConfirmablePasswordController.php
│   │   │   │   ├── EmailVerificationNotificationController.php
│   │   │   │   ├── EmailVerificationPromptController.php
│   │   │   │   ├── NewPasswordController.php
│   │   │   │   ├── PasswordResetLinkController.php
│   │   │   │   ├── RegisteredUserController.php
│   │   │   │   └── VerifyEmailController.php
│   │   │   ├── Settings/
│   │   │   │   ├── PasswordController.php     # Ubah password akun
│   │   │   │   └── ProfileController.php      # Kelola profil pengguna
│   │   │   ├── Controller.php                 # Base controller
│   │   │   ├── Dashboard.php                  # Controller dashboard & report-problem
│   │   │   ├── Incident.php                   # Controller incident management
│   │   │   ├── ShiftScheduleController.php    # Controller jadwal shift
│   │   │   └── WhatsAppController.php         # Controller integrasi WhatsApp (WAHA)
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php      # Middleware Inertia.js (share global props)
│   │   └── Requests/
│   │       ├── Auth/
│   │       └── Settings/
│   ├── Models/
│   │   ├── LaporanHpio.php                    # Model tabel incidents
│   │   ├── ShiftConfig.php                    # Model konfigurasi shift
│   │   ├── ShiftSchedule.php                  # Model jadwal shift karyawan
│   │   └── User.php                           # Model pengguna (autentikasi)
│   └── Providers/
├── bootstrap/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2026_06_01_152206_create_shift_schedules_table.php
│   │   └── 2026_06_03_000000_create_shift_configs_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── LaporanHpioSeeder.php
├── public/
├── resources/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── app.tsx                            # Entry point React
│   │   ├── ssr.jsx                            # Entry point SSR
│   │   ├── blueprints.ts                      # Data blueprint (statis)
│   │   ├── data.ts                            # Data statis stasiun, kereta, teknisi
│   │   ├── incident_data.ts                   # Data awal insiden & kategori
│   │   ├── incidentStore.ts                   # Zustand store: manajemen insiden
│   │   ├── systemStore.ts                     # Zustand store: alerts & trains
│   │   ├── types.ts                           # Type definitions domain utama
│   │   ├── components/                        # Komponen React
│   │   │   ├── DashboardView.tsx              # Tampilan dashboard
│   │   │   ├── IncidentView.tsx               # Tampilan manajemen insiden
│   │   │   ├── ShiftScheduleView.tsx          # Tampilan jadwal shift
│   │   │   ├── StationsView.tsx               # Tampilan stasiun
│   │   │   ├── ArchitectureView.tsx           # Tampilan blueprint arsitektur
│   │   │   ├── app-header.tsx                 # Header aplikasi
│   │   │   ├── app-sidebar.tsx                # Sidebar navigasi
│   │   │   └── ui/                            # Komponen UI primitif (Radix-based)
│   │   ├── hooks/
│   │   ├── layouts/
│   │   │   ├── app-layout.tsx                 # Layout utama aplikasi
│   │   │   └── auth-layout.tsx                # Layout halaman autentikasi
│   │   ├── pages/
│   │   │   ├── auth/                          # Halaman autentikasi
│   │   │   ├── settings/                      # Halaman pengaturan akun
│   │   │   ├── dashboard.tsx                  # Halaman dashboard
│   │   │   ├── incident.tsx                   # Halaman incident management
│   │   │   ├── report-problem.tsx             # Halaman laporan masalah
│   │   │   ├── stations.tsx                   # Halaman station health
│   │   │   ├── shift-schedule.tsx             # Halaman jadwal shift
│   │   │   └── blueprints.tsx                 # Halaman architecture blueprints
│   │   └── types/
│   │       └── index.ts                       # Interface User, Auth, SharedData, NavItem
│   └── views/
│       └── app.blade.php                      # Root Blade template (entry Inertia)
├── routes/
│   ├── auth.php                               # Route autentikasi
│   ├── console.php                            # Route Artisan console
│   ├── settings.php                           # Route pengaturan profil & password
│   └── web.php                               # Route web utama
├── .env                                        # Konfigurasi environment
├── composer.json                              # Dependensi PHP
├── package.json                               # Dependensi JavaScript
└── vite.config.js                             # Konfigurasi Vite
```

### 1.3 Library & Package Pihak Ketiga

#### Backend (PHP/Laravel) — `composer.json`

| Package | Versi | Fungsi |
|---|---|---|
| `laravel/framework` | ^12.0 | Framework utama |
| `inertiajs/inertia-laravel` | ^2.0 | Bridge Inertia untuk Laravel |
| `tightenco/ziggy` | ^2.4 | Generate named routes ke JavaScript |
| `laravel/tinker` | ^2.10.1 | REPL interaktif Laravel |
| `fakerphp/faker` | ^1.23 | Fake data untuk testing |
| `pestphp/pest` | ^3.8 | Framework testing PHP |
| `laravel/sail` | ^1.41 | Docker development environment |

#### Frontend (JavaScript/TypeScript) — `package.json`

| Package | Versi | Fungsi |
|---|---|---|
| `@inertiajs/react` | ^2.0.0 | Client adapter Inertia |
| `react` + `react-dom` | ^19.0.0 | Library UI utama |
| `typescript` | ^5.7.2 | Static typing |
| `tailwindcss` | ^4.0.0 | Utility-first CSS |
| `zustand` | ^5.0.13 | State management ringan |
| `@tanstack/react-query` | ^5.100.14 | Server state & data fetching |
| `recharts` | ^3.8.1 | Library grafik/chart |
| `@dnd-kit/core` + sortable + modifiers | ^6.x-^10.x | Drag-and-drop (jadwal shift) |
| `@radix-ui/*` | Beragam | UI primitif headless (dialog, select, dll) |
| `react-hook-form` | ^7.76.1 | Manajemen form |
| `zod` | ^4.4.3 | Validasi skema TypeScript |
| `@hookform/resolvers` | ^5.4.0 | Integrasi react-hook-form + zod |
| `lucide-react` | ^0.475.0 | Library ikon |
| `motion` | ^12.40.0 | Animasi (Framer Motion) |
| `xlsx` | ^0.18.5 | Export Excel |
| `use-debounce` | ^10.1.1 | Debounce hook |
| `class-variance-authority` | ^0.7.1 | Variant class styling |
| `clsx` + `tailwind-merge` | ^2.x + ^3.x | Helper class CSS |

---

## 2. ANALISIS DATABASE

### 2.1 Konfigurasi Koneksi Database

**Sumber:** `.env`

```
DB_CONNECTION=pgsql
DB_HOST=100.112.27.4
DB_PORT=5432
DB_DATABASE=hpiodb
DB_USERNAME=admin
```

Database engine: **PostgreSQL** (`pgsql`), diakses melalui IP internal `100.112.27.4`.

### 2.2 Daftar Tabel dan Fungsinya

#### Tabel 1: `incidents`
**Sumber Model:** `app/Models/LaporanHpio.php`  
**Sumber Migrasi:** Tidak ada file migrasi eksplisit — tabel ini **sudah ada di database PostgreSQL** (bukan dibuat via migrasi Laravel).  
**Sumber Seeder:** `database/seeders/LaporanHpioSeeder.php`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `string` (UUID) | Primary key, non-auto-increment |
| `nomor_tiket` | `string` | Nomor tiket laporan, format: `HPIO-INC-DDMMYY-NNN` |
| `tanggal_lapor` | `date` | Tanggal laporan diajukan |
| `nama_pelapor` | `string` | Nama pengirim laporan |
| `nama_penerima_laporan` | `string` | Nama penerima/handler awal |
| `stasiun` | `string` | Nama stasiun terkait (HALIM, KARAWANG, dll.) |
| `kategori_aset` | `string` | Jenis aset yang bermasalah (TVM, Gate, PIDS, dll.) |
| `deskripsi_masalah` | `text` | Deskripsi lengkap masalah yang dilaporkan |
| `prioritas` | `string` | Prioritas penanganan (P1, P2, P3) |
| `status` | `string` | Status laporan (Open, Closed, On Progress, dll.) |
| `nama_teknisi` | `string` | Teknisi yang menangani |
| `waktu_melapor` | `datetime` | Waktu laporan diterima sistem |
| `waktu_respon` | `datetime` | Waktu teknisi merespons |
| `waktu_selesai` | `datetime` | Waktu penanganan selesai |
| `response_time` | `string` | Durasi respon (format bervariasi) |
| `solving_time` | `string` | Durasi penyelesaian (format bervariasi) |
| `wr_doc_no` | `string` | Nomor dokumen Work Request |
| `status_eskalasi` | `string` | Status eskalasi (NO, Sent, dll.) |
| `bulan` | `string` | Label bulan laporan (contoh: "Mei 2026") |
| `merged_doc_id` | `string` | ID dokumen gabungan eksternal |
| `merged_doc_url` | `string` | URL dokumen gabungan eksternal |
| `created_at` | `timestamp` | Waktu record dibuat |
| `updated_at` | `timestamp` | Waktu record diperbarui |

---

#### Tabel 2: `shift_schedules`
**Sumber Migrasi:** `database/migrations/2026_06_01_152206_create_shift_schedules_table.php`  
**Sumber Model:** `app/Models/ShiftSchedule.php`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `bigint` (auto) | Primary key |
| `employee_name` | `string` | Nama karyawan |
| `nip` | `string` (nullable) | Nomor Induk Pegawai |
| `no_hp` | `string` (nullable) | Nomor HP karyawan |
| `month` | `string` | Bulan aktif, format: `YYYY-MM` |
| `shifts` | `json` | Object JSON: `{1: "LIBUR", 2: "Shift 1", ...}` per hari |
| `sort_order` | `integer` (default: 0) | Urutan tampil pada tabel |
| `created_at` | `timestamp` | Waktu record dibuat |
| `updated_at` | `timestamp` | Waktu record diperbarui |

---

#### Tabel 3: `shift_configs`
**Sumber Migrasi:** `database/migrations/2026_06_03_000000_create_shift_configs_table.php`  
**Sumber Model:** `app/Models/ShiftConfig.php`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `bigint` (auto) | Primary key |
| `shift_name` | `string` (unique) | Nama shift: Shift 1, Shift 2, Shift 3, Middle |
| `start_time` | `string` | Jam mulai shift (contoh: "07:00") |
| `end_time` | `string` | Jam selesai shift (contoh: "15:00") |
| `created_at` | `timestamp` | Waktu record dibuat |
| `updated_at` | `timestamp` | Waktu record diperbarui |

---

#### Tabel 4: `users`
**Sumber:** Default Laravel, model `app/Models/User.php`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `bigint` (auto) | Primary key |
| `name` | `string` | Nama pengguna |
| `email` | `string` (unique) | Email pengguna |
| `email_verified_at` | `timestamp` (nullable) | Waktu verifikasi email |
| `password` | `string` | Password terenkripsi (bcrypt) |
| `remember_token` | `string` (nullable) | Token "remember me" |
| `created_at` | `timestamp` | Waktu akun dibuat |
| `updated_at` | `timestamp` | Waktu akun diperbarui |

---

#### Tabel 5: `cache` dan `jobs`
Tabel sistem Laravel untuk mekanisme cache berbasis database dan antrian pekerjaan (queue).

| Tabel | Fungsi |
|---|---|
| `cache` | Menyimpan data cache sesi/aplikasi |
| `cache_locks` | Mutex lock untuk cache |
| `jobs` | Antrian pekerjaan asinkron |
| `job_batches` | Batch job (digunakan untuk proses paralel) |
| `failed_jobs` | Log pekerjaan yang gagal dieksekusi |

### 2.3 Relasi Antar Tabel

| Tabel Sumber | Kolom | Relasi | Tabel Target | Kolom |
|---|---|---|---|---|
| `shift_schedules` | `month` | Logis (bukan FK) | `shift_configs` | `shift_name` (via kolom `shifts`) |

> **Catatan:** Tidak ada foreign key eksplisit yang terdeteksi dalam kode migrasi. Tabel `incidents` tidak memiliki migrasi yang ditemukan dalam repository ini — diasumsikan sudah tersedia di database server PostgreSQL. Relasi antara tabel bersifat logis (through aplikasi), bukan relasional melalui constraint database.

### 2.4 Ringkasan ERD (Entity Relationship Diagram)

```
┌──────────────────────────────────┐
│           incidents              │
│──────────────────────────────────│
│ PK  id (string/UUID)             │
│     nomor_tiket                  │
│     tanggal_lapor                │
│     nama_pelapor                 │
│     nama_penerima_laporan        │
│     stasiun                      │
│     kategori_aset                │
│     deskripsi_masalah            │
│     prioritas                    │
│     status                       │
│     nama_teknisi                 │
│     waktu_melapor                │
│     waktu_respon                 │
│     waktu_selesai                │
│     response_time                │
│     solving_time                 │
│     wr_doc_no                    │
│     status_eskalasi              │
│     bulan                        │
│     merged_doc_id                │
│     merged_doc_url               │
└──────────────────────────────────┘

┌──────────────────────────────────┐     (logis via shift.shifts JSON)
│         shift_schedules          │────────────────────────────────────┐
│──────────────────────────────────│                                    │
│ PK  id (bigint)                  │     ┌──────────────────────────────┤
│     employee_name                │     │         shift_configs         │
│     nip (nullable)               │     │──────────────────────────────│
│     no_hp (nullable)             │     │ PK  id (bigint)              │
│     month (YYYY-MM)              │     │ UK  shift_name (unique)      │
│     shifts (json)                │     │     start_time               │
│     sort_order                   │     │     end_time                 │
└──────────────────────────────────┘     └──────────────────────────────┘

┌──────────────────────────────────┐
│              users               │
│──────────────────────────────────│
│ PK  id (bigint)                  │
│     name                         │
│ UK  email (unique)               │
│     email_verified_at            │
│     password                     │
│     remember_token               │
└──────────────────────────────────┘
```

---

## 3. ANALISIS FITUR

### Fitur 1: Dashboard Hub

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Dashboard Hub |
| **Tujuan** | Menampilkan ringkasan KPI bulanan insiden, grafik kategori aset, daftar insiden, serta jadwal shift hari ini |
| **Halaman** | `/dashboard` → `pages/dashboard.tsx` → `components/DashboardView.tsx` |
| **Tabel Database** | `incidents`, `shift_schedules` |
| **Endpoint** | `GET /dashboard?month=YYYY-MM` |
| **Hak Akses** | Pengguna terautentikasi (`auth` middleware) |
| **Alur Bisnis** | 1. Pengguna mengakses `/dashboard` (dapat memfilter bulan via query `?month=`) → 2. Controller `Dashboard::Index()` mengambil data insiden dari tabel `incidents` untuk rentang bulan yang dipilih → 3. Data di-mapping ke format UI (normalisasi status & prioritas) → 4. Data jadwal shift (`shift_schedules`) untuk bulan berjalan diambil → 5. Semua data dikirim ke frontend via Inertia props → 6. Komponen `DashboardView.tsx` merender grafik, KPI cards, dan tabel insiden → 7. Data statis (train, alert, station, maintenance order) dari `data.ts` dirender secara terpisah oleh `systemStore` |

### Fitur 2: Incident Management

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Incident Management |
| **Tujuan** | Menampilkan seluruh riwayat laporan insiden dengan kemampuan filter multikriteria dan pagination |
| **Halaman** | `/incident` → `pages/incident.tsx` → `components/IncidentView.tsx` |
| **Tabel Database** | `incidents` |
| **Endpoint** | `GET /incident` (dengan parameter opsional: `nomor_ticket`, `stasiun`, `status`, `kategori_aset`, `from_date`, `end_date`) |
| **Hak Akses** | Pengguna terautentikasi (`auth` middleware) |
| **Alur Bisnis** | 1. Pengguna membuka `/incident` → 2. Controller `Incident::Index()` membangun query dengan filter opsional dari query string → 3. Data dipaginasi 20 item per halaman → 4. Statistik prioritas (total, P1, P2, closed) dihitung → 5. Data dikirim via Inertia ke `IncidentView.tsx` → 6. Pengguna dapat memfilter berdasarkan nomor tiket, stasiun, status, kategori aset, dan rentang tanggal |

### Fitur 3: Report Problem (Laporan HPIO)

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Report Problem |
| **Tujuan** | Menampilkan laporan masalah HPIO berbasis database dengan filtering waktu, stasiun, kategori, status, dan rentang tanggal |
| **Halaman** | `/report-problem` → `pages/report-problem.tsx` (self-contained, 676 baris) |
| **Tabel Database** | `incidents` |
| **Endpoint** | `GET /report-problem` (route diarahkan ke `Dashboard::Index()`) |
| **Hak Akses** | Pengguna terautentikasi (`auth` middleware) |
| **Alur Bisnis** | 1. Pengguna mengakses halaman Report Problem → 2. Filter tersedia: periode waktu (hari ini/minggu/bulan/tahun), bulan, stasiun, kategori aset, rentang tanggal, dan status → 3. Filter diterapkan secara realtime via `router.get()` Inertia → 4. Data ditampilkan dalam tabel dengan detail tiket (nomor, tanggal, stasiun, kategori, prioritas, status, teknisi) → 5. Panel detail ditampilkan via drawer overlay saat pengguna klik tombol "Lihat" → 6. KPI cards menampilkan total laporan, open/baru, on progress, dan closed |

> **Catatan Penting:** Halaman `report-problem` di route saat ini diarahkan ke `Dashboard::Index()` — yang mengirimkan data `data_dashboard`. Namun komponen React `report-problem.tsx` mengharapkan props `laporans`, `summary`, `filterOptions`, dan `filters` yang **tidak** dikirim oleh controller tersebut. Ini merupakan inkonsistensi (WIP).

### Fitur 4: Station Health

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Station Health |
| **Tujuan** | Menampilkan status kesehatan stasiun hari ini, jadwal shift on-duty, dan ringkasan insiden per stasiun |
| **Halaman** | `/stations` → `pages/stations.tsx` → `components/StationsView.tsx` |
| **Tabel Database** | `shift_schedules`, `incidents` |
| **Endpoint** | `GET /stations` |
| **Hak Akses** | Pengguna terautentikasi (`auth` middleware) |
| **Alur Bisnis** | 1. Route `/stations` mengambil jadwal shift bulan berjalan → 2. Query insiden hari ini dari tabel `incidents` dikelompokkan per stasiun → 3. Insiden dihitung: total dan yang berstatus closed/selesai/done → 4. Data dikirim ke frontend → 5. `StationsView.tsx` merender informasi per stasiun dengan data statis (dari `data.ts`) untuk info kereta, teknisi, dan maintenance order |

### Fitur 5: Shift Schedule Management

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Shift Schedule |
| **Tujuan** | Manajemen jadwal shift karyawan IT HPIO per bulan, mendukung input manual, drag-and-drop, copy bulan, dan konfigurasi waktu shift |
| **Halaman** | `/shift-schedule` → `pages/shift-schedule.tsx` → `components/ShiftScheduleView.tsx` |
| **Tabel Database** | `shift_schedules`, `shift_configs` |
| **Endpoint** | Lihat detail pada bagian Route |
| **Hak Akses** | Pengguna terautentikasi (`auth` middleware) |
| **Alur Bisnis** | 1. Halaman menampilkan jadwal shift bulan aktif (dapat berpindah bulan) → 2. Pengguna dapat menambah karyawan baru → 3. Setiap sel jadwal dapat diedit secara langsung → 4. Drag-and-drop didukung untuk pertukaran shift antar karyawan/hari → 5. Seluruh baris dapat diurutkan ulang (reorder) → 6. Tersedia opsi salin jadwal dari bulan sebelumnya → 7. Jam mulai/selesai per shift dapat dikonfigurasi → 8. Pengiriman WhatsApp jadwal dapat dilakukan via integrasi WAHA |

### Fitur 6: WhatsApp Notification (WAHA)

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Notifikasi WhatsApp via WAHA |
| **Tujuan** | Mengirim pesan WhatsApp ke nomor teknisi atau pihak terkait menggunakan WAHA API |
| **Halaman** | Dipanggil dari `ShiftScheduleView.tsx` / halaman manapun |
| **Tabel Database** | — |
| **Endpoint** | `POST /send-whatsapp` |
| **Hak Akses** | Pengguna terautentikasi (`auth` middleware) |
| **Alur Bisnis** | 1. Input nomor HP dan pesan → 2. Nomor HP di-sanitize (format internasional 62xxx) → 3. Request dikirim ke WAHA API (`/api/sendText`) dengan session dan API key → 4. Respons WAHA dikembalikan ke client |

### Fitur 7: Architecture Blueprints

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Architecture Blueprints |
| **Tujuan** | Menampilkan dokumentasi blueprint arsitektur teknis sistem |
| **Halaman** | `/blueprints` → `pages/blueprints.tsx` → `components/ArchitectureView.tsx` |
| **Tabel Database** | — |
| **Endpoint** | `GET /blueprints` |
| **Hak Akses** | Pengguna terautentikasi (`auth` middleware) |
| **Alur Bisnis** | Halaman statis yang merender blueprint arsitektur (data dari `blueprints.ts`). Menu navigasi fitur ini **dikomentari** di sidebar sehingga tidak dapat diakses melalui navigasi normal |

### Fitur 8: Autentikasi

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Autentikasi Pengguna |
| **Tujuan** | Login, logout, lupa password, reset password, verifikasi email |
| **Halaman** | `pages/auth/login.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `verify-email.tsx`, `confirm-password.tsx` |
| **Tabel Database** | `users` |
| **Endpoint** | Lihat detail pada bagian Route |
| **Hak Akses** | Tamu (`guest` middleware) untuk login/register, terautentikasi untuk logout/verifikasi |
| **Alur Bisnis** | Standar autentikasi Laravel: login email+password → session berbasis database → logout |

> **Catatan:** Fitur registrasi (route `register`) **dikomentari** dalam `routes/auth.php`. Pengguna tidak dapat mendaftar sendiri; akun dibuat manual (contoh: via seeder atau Tinker).

### Fitur 9: Pengaturan Akun

| Atribut | Detail |
|---|---|
| **Nama Fitur** | Pengaturan Profil & Password |
| **Tujuan** | Pengguna dapat mengedit nama/email, mengganti password, mengubah tampilan (light/dark), dan menghapus akun |
| **Halaman** | `pages/settings/profile.tsx`, `password.tsx`, `appearance.tsx` |
| **Tabel Database** | `users` |
| **Endpoint** | Lihat detail pada bagian Route |
| **Hak Akses** | Pengguna terautentikasi |

---

## 4. DOKUMENTASI DEVELOPMENT PER MODUL

---

### Modul 1: Dashboard Hub

#### Tujuan
Memberikan ringkasan operasional bulanan kepada operator HPIO, mencakup statistik insiden, distribusi per kategori aset, distribusi per stasiun, daftar insiden aktif, dan informasi jadwal shift yang sedang bertugas.

#### Deskripsi Implementasi
Controller `Dashboard.php` menerima parameter `month` opsional dari query string untuk memfilter data berdasarkan bulan tertentu. Data insiden dari PostgreSQL di-mapping ke format UI dengan normalisasi nilai status (`CLOSE`/`SELESAI`/`DONE` → `Closed`, `ON PROGRESS`/`PROSES` → `On Progress`, dll.) dan normalisasi prioritas (`P1`/`TINGGI`/`URGENT` → `P1 (URGENT)`, dll.). Data jadwal shift (`shift_schedules`) diambil sesuai bulan aktif. Semua data dikirim ke frontend React melalui Inertia.

#### Komponen Terlibat

| Komponen | File |
|---|---|
| **Route** | `routes/web.php` — `GET /dashboard` |
| **Controller** | `app/Http/Controllers/Dashboard.php` — method `Index()` |
| **Model** | `app/Models/LaporanHpio.php`, `app/Models/ShiftSchedule.php` |
| **View (Page)** | `resources/js/pages/dashboard.tsx` |
| **View (Component)** | `resources/js/components/DashboardView.tsx` |
| **State Management** | `resources/js/systemStore.ts` (data alerts & trains statis) |
| **Middleware** | `auth` |

#### Alur Sistem

```
Browser [GET /dashboard?month=YYYY-MM]
    → Middleware auth (cek sesi)
    → Dashboard::Index()
        → LaporanHpio::whereBetween('tanggal_lapor', [...]) → $db_incidents
        → map() normalisasi status & prioritas → $mapped_incidents
        → count() incidents berstatus 'Open' → $data_close
        → selectRaw('kategori_aset, COUNT(*) as total') groupBy → $data_perangkat
        → selectRaw('stasiun, COUNT(*) as total') groupBy → $data_station_count
        → ShiftSchedule::where('month', ...) → $shift_schedules
    → Inertia::render('dashboard', ['data_dashboard' => {...}])
    → React: pages/dashboard.tsx → DashboardView.tsx
        → Recharts: grafik kategori aset
        → KPI Cards: jumlah insiden
        → Tabel insiden dengan status & prioritas
        → Informasi shift hari ini
```

#### Database yang Digunakan
- **Tabel:** `incidents`, `shift_schedules`
- **Query Utama:** `whereBetween` berdasarkan `tanggal_lapor`, `COUNT(*) GROUP BY kategori_aset`, `COUNT(*) GROUP BY stasiun`

#### Status Implementasi
**✅ Sebagian Implementasi**
- Data insiden dari database: ✅ Sudah
- Grafik kategori aset: ✅ Sudah
- Jadwal shift hari ini: ✅ Sudah
- Data train/alerts/maintenance order: ⚠️ Masih menggunakan data statis (`data.ts`) — belum dari database
- **Variabel `data_close` salah** (menghitung `status = 'Open'` tetapi diberi nama `data_close`) — lihat bagian Identifikasi Masalah

---

### Modul 2: Incident Management

#### Tujuan
Memberikan tampilan komprehensif seluruh riwayat laporan insiden dengan kemampuan pencarian dan filter multikriteria, dilengkapi statistik ringkasan prioritas.

#### Deskripsi Implementasi
Controller `Incident.php` membangun query Eloquent secara dinamis berdasarkan parameter yang ada di query string. Filter yang didukung: nomor tiket (LIKE), stasiun (LIKE), status (exact), kategori aset (exact), dan rentang tanggal (`whereBetween`). Data dipaginasi 20 item per halaman. Terpisah dari query utama, statistik prioritas dihitung menggunakan query `countQuery` tersendiri dari seluruh data (tanpa filter).

#### Komponen Terlibat

| Komponen | File |
|---|---|
| **Route** | `routes/web.php` — `GET /incident` |
| **Controller** | `app/Http/Controllers/Incident.php` — method `Index()` |
| **Model** | `app/Models/LaporanHpio.php` |
| **View (Page)** | `resources/js/pages/incident.tsx` |
| **View (Component)** | `resources/js/components/IncidentView.tsx` |
| **Middleware** | `auth` |

#### Alur Sistem

```
Browser [GET /incident?nomor_ticket=...&stasiun=...&status=...&kategori_aset=...&from_date=...&end_date=...]
    → Middleware auth
    → Incident::Index()
        → LaporanHpio::query() → $query (dengan filter dinamis)
        → $query->paginate(20) → $data_incident
        → LaporanHpio::query() → $countQuery (tanpa filter)
        → count total, P1, P2, closed → $data_count_priority
    → Inertia::render('incident', ['incident_log' => {...}, 'data_count' => {...}])
    → React: pages/incident.tsx → IncidentView.tsx
        → Tabel insiden terpaginasi
        → Statistik KPI prioritas
        → Filter panel multikriteria
```

#### Database yang Digunakan
- **Tabel:** `incidents`
- **Query:** Dynamic query builder dengan kondisi `where`, `whereBetween`, `paginate(20)`

#### Status Implementasi
**✅ Sudah Implementasi**
- Tampilan tabel data insiden: ✅
- Filter multikriteria: ✅
- Pagination: ✅
- Statistik prioritas: ✅ (namun statistik dihitung dari **seluruh** data, bukan dari data terfilter — lihat Identifikasi Masalah)

---

### Modul 3: Report Problem (Laporan HPIO)

#### Tujuan
Menyediakan antarmuka khusus untuk melihat laporan masalah HPIO (`LaporanHpioSeeder` format) dengan filter waktu, stasiun, bulan, status, dan kategori.

#### Deskripsi Implementasi
Halaman `report-problem.tsx` merupakan komponen yang sepenuhnya self-contained (676 baris), menangani semua logika filter, tampilan tabel, pagination, dan drawer detail di satu file. Navigasi filter menggunakan `router.get()` Inertia (bukan client-side state).

#### Komponen Terlibat

| Komponen | File |
|---|---|
| **Route** | `routes/web.php` — `GET /report-problem` → `Dashboard::Index()` |
| **Controller** | `app/Http/Controllers/Dashboard.php` — method `Index()` |
| **Model** | `app/Models/LaporanHpio.php` |
| **View (Page)** | `resources/js/pages/report-problem.tsx` |
| **Middleware** | `auth` |

#### Alur Sistem

```
Browser [GET /report-problem]
    → Middleware auth
    → Dashboard::Index() → mengirim 'data_dashboard' props
    → React: pages/report-problem.tsx
        → Mengharapkan props: laporans, summary, filterOptions, filters
        → MASALAH: Props yang diterima tidak sesuai dengan yang diharapkan
```

#### Database yang Digunakan
- **Tabel:** `incidents` (melalui Dashboard controller)

#### Status Implementasi
**⚠️ Work In Progress**
- UI halaman sudah dibangun lengkap: ✅
- Backend controller belum dikembangkan khusus untuk halaman ini: ❌
- Route saat ini mengarah ke `Dashboard::Index()` yang mengirim `data_dashboard`, bukan `laporans`/`summary`/`filterOptions` yang dibutuhkan halaman ini: ❌

---

### Modul 4: Station Health

#### Tujuan
Menampilkan ringkasan kesehatan operasional per stasiun KCIC (Halim, Karawang, Padalarang, Tegalluar), mencakup siapa yang bertugas hari ini dan insiden yang terjadi hari ini per stasiun.

#### Deskripsi Implementasi
Route `/stations` di-handle langsung di `routes/web.php` (bukan controller terpisah). Logika mengambil jadwal shift bulan berjalan dan menghitung insiden hari ini per stasiun — termasuk jumlah total dan yang sudah closed. Data dikirim ke `StationsView.tsx`. Data tambahan (info kereta, teknisi, maintenance order, alerts) masih menggunakan data statis dari `data.ts`.

#### Komponen Terlibat

| Komponen | File |
|---|---|
| **Route** | `routes/web.php` — `GET /stations` (inline closure) |
| **Model** | `app/Models/ShiftSchedule.php`, `app/Models/LaporanHpio.php` |
| **View (Page)** | `resources/js/pages/stations.tsx` |
| **View (Component)** | `resources/js/components/StationsView.tsx` |
| **Data Statis** | `resources/js/data.ts` |
| **State Management** | `resources/js/systemStore.ts` |
| **Middleware** | `auth` |

#### Alur Sistem

```
Browser [GET /stations]
    → Middleware auth
    → Route Closure:
        → ShiftSchedule::where('month', currentMonth)->get() → $shift_schedules
        → LaporanHpio::whereDate('tanggal_lapor', today)->get() → $todayIncidents
        → Loop: groupBy stasiun → $stationIncidentMap (total, closed)
    → Inertia::render('stations', ['shift_schedules', 'today_day', 'station_incidents'])
    → React: pages/stations.tsx → StationsView.tsx
        → INITIAL_STATIONS (statis) + shift_schedules (DB) + station_incidents (DB)
```

#### Database yang Digunakan
- **Tabel:** `shift_schedules`, `incidents`
- **Query:** `where('month', ...)`, `whereDate('tanggal_lapor', ...)`

#### Status Implementasi
**✅ Sebagian Implementasi**
- Informasi shift on-duty hari ini: ✅
- Ringkasan insiden hari ini per stasiun: ✅
- Data statis kereta, teknisi, maintenance order: ⚠️ Belum terhubung ke database

---

### Modul 5: Shift Schedule Management

#### Tujuan
Manajemen lengkap jadwal shift karyawan IT HPIO per bulan, termasuk penambahan karyawan, pengeditan sel jadwal, drag-and-drop, pengurutan baris, salin dari bulan sebelumnya, dan konfigurasi jam shift.

#### Deskripsi Implementasi
Controller `ShiftScheduleController.php` mengimplementasikan 8 endpoint terpisah untuk setiap operasi jadwal shift. Data shifts disimpan sebagai JSON dalam satu kolom `shifts` di tabel `shift_schedules`. `ShiftScheduleView.tsx` menggunakan library `@dnd-kit` untuk fitur drag-and-drop. Konfigurasi jam shift (Shift 1, Shift 2, Shift 3, Middle) dapat diubah melalui endpoint `updateConfigs`.

#### Komponen Terlibat

| Komponen | File |
|---|---|
| **Route** | `routes/web.php` — 8 route (`GET`, `POST`, `PATCH`, `DELETE`) |
| **Controller** | `app/Http/Controllers/ShiftScheduleController.php` |
| **Model** | `app/Models/ShiftSchedule.php`, `app/Models/ShiftConfig.php` |
| **View (Page)** | `resources/js/pages/shift-schedule.tsx` |
| **View (Component)** | `resources/js/components/ShiftScheduleView.tsx` |
| **Middleware** | `auth` |

#### Daftar Endpoint Shift Schedule

| Method | URL | Nama Route | Method Controller | Fungsi |
|---|---|---|---|---|
| `GET` | `/shift-schedule` | `shift-schedule` | `index()` | Tampilkan jadwal shift bulan aktif |
| `POST` | `/shift-schedule` | `shift-schedule.store` | `store()` | Tambah karyawan baru ke jadwal |
| `PATCH` | `/shift-schedule/{id}/cell` | `shift-schedule.cell` | `updateCell()` | Update satu sel jadwal |
| `POST` | `/shift-schedule/swap` | `shift-schedule.swap` | `swapCells()` | Tukar dua sel (drag-and-drop) |
| `POST` | `/shift-schedule/reorder` | `shift-schedule.reorder` | `reorder()` | Urutkan ulang baris karyawan |
| `POST` | `/shift-schedule/copy-month` | `shift-schedule.copy-month` | `copyMonth()` | Salin karyawan dari bulan lain |
| `POST` | `/shift-schedule/bulk` | `shift-schedule.bulk` | `bulkUpdate()` | Update massal seluruh data |
| `POST` | `/shift-schedule/configs` | `shift-schedule.configs` | `updateConfigs()` | Update konfigurasi jam shift |
| `DELETE` | `/shift-schedule/{id}` | `shift-schedule.destroy` | `destroy()` | Hapus baris karyawan |

#### Alur Sistem

```
Browser [GET /shift-schedule?month=YYYY-MM]
    → Middleware auth
    → ShiftScheduleController::index()
        → ShiftSchedule::where('month', ...)->orderBy('sort_order')->get()
        → ShiftConfig::orderBy('id')->get()
    → Inertia::render('shift-schedule', [shifts, month, configs])
    → React: ShiftScheduleView.tsx
        → @dnd-kit: drag-and-drop antar sel
        → Tabel jadwal (baris = karyawan, kolom = hari)
        → Modal tambah karyawan, salin bulan
        → Panel konfigurasi shift

Pengeditan Sel:
    PATCH /shift-schedule/{id}/cell → validate day/shift → update JSON shifts
    
Drag-and-Drop (Swap):
    POST /shift-schedule/swap → validate source/target → swap nilai shifts
    
Copy Bulan:
    POST /shift-schedule/copy-month → validasi target kosong → copy karyawan + reset shifts
```

#### Database yang Digunakan
- **Tabel:** `shift_schedules`, `shift_configs`

#### Status Implementasi
**✅ Sudah Implementasi**

---

### Modul 6: WhatsApp Notification

#### Tujuan
Mengirim pesan WhatsApp ke nomor tertentu menggunakan WAHA (WhatsApp HTTP API) self-hosted.

#### Deskripsi Implementasi
`WhatsAppController.php` melakukan sanitasi nomor HP (hapus non-digit, konversi awalan `0` ke `62`), lalu mengirim HTTP POST ke endpoint WAHA API dengan `X-Api-Key` header dan payload JSON (session, chatId, text).

#### Komponen Terlibat

| Komponen | File |
|---|---|
| **Route** | `routes/web.php` — `POST /send-whatsapp` |
| **Controller** | `app/Http/Controllers/WhatsAppController.php` |
| **Konfigurasi** | `.env` — `WAHA_API_URL`, `WAHA_SESSION`, `WAHA_API_KEY` |
| **Middleware** | `auth` |

#### Konfigurasi WAHA

| Parameter | Nilai (dari `.env`) |
|---|---|
| `WAHA_API_URL` | `https://waha.kamargelap.online` |
| `WAHA_SESSION` | `default` |
| `WAHA_API_KEY` | `668949e65e6743de863908f6d6b91911` |

#### Status Implementasi
**✅ Sudah Implementasi**
> **Peringatan:** API Key WAHA tersimpan dalam plaintext di `.env` dan di-commit ke repository.

---

### Modul 7: Autentikasi

#### Tujuan
Mengelola siklus autentikasi pengguna: login, logout, lupa password, reset password, konfirmasi password, dan verifikasi email.

#### Deskripsi Implementasi
Menggunakan controller bawaan Laravel Starter Kit (Breeze). Semua controller berada di `app/Http/Controllers/Auth/`. Fitur registrasi mandiri **dinonaktifkan** (dikomentari di route dan controller).

#### Daftar Route Autentikasi

| Method | URL | Controller | Fungsi |
|---|---|---|---|
| `GET` | `/login` | `AuthenticatedSessionController@create` | Form login |
| `POST` | `/login` | `AuthenticatedSessionController@store` | Proses login |
| `POST` | `/logout` | `AuthenticatedSessionController@destroy` | Logout |
| `GET` | `/forgot-password` | `PasswordResetLinkController@create` | Form lupa password |
| `POST` | `/forgot-password` | `PasswordResetLinkController@store` | Kirim email reset |
| `GET` | `/reset-password/{token}` | `NewPasswordController@create` | Form reset password |
| `POST` | `/reset-password` | `NewPasswordController@store` | Simpan password baru |
| `GET` | `/verify-email` | `EmailVerificationPromptController` | Prompt verifikasi |
| `GET` | `/verify-email/{id}/{hash}` | `VerifyEmailController` | Proses verifikasi |
| `GET` | `/confirm-password` | `ConfirmablePasswordController@show` | Form konfirmasi password |
| `POST` | `/confirm-password` | `ConfirmablePasswordController@store` | Proses konfirmasi |

#### Status Implementasi
**✅ Sudah Implementasi**

---

### Modul 8: Pengaturan Akun

#### Tujuan
Memungkinkan pengguna mengelola profil, mengganti password, dan mengubah preferensi tampilan.

#### Daftar Route Settings

| Method | URL | Controller | Fungsi |
|---|---|---|---|
| `GET` | `/settings/profile` | `ProfileController@edit` | Form edit profil |
| `PATCH` | `/settings/profile` | `ProfileController@update` | Simpan perubahan profil |
| `DELETE` | `/settings/profile` | `ProfileController@destroy` | Hapus akun |
| `GET` | `/settings/password` | `PasswordController@edit` | Form ganti password |
| `PUT` | `/settings/password` | `PasswordController@update` | Simpan password baru |
| `GET` | `/settings/appearance` | Closure (Inertia render) | Pengaturan tampilan |

#### Status Implementasi
**✅ Sudah Implementasi**

---

### Modul 9: Architecture Blueprints *(Work In Progress)*

#### Tujuan
Menampilkan dokumentasi blueprint arsitektur teknis sistem KCIC secara visual.

#### Deskripsi Implementasi
Halaman statis yang merender komponen `ArchitectureView.tsx`. Data blueprint (kode arsitektur) tersimpan dalam file `blueprints.ts` (42 KB, data statis). Menu item untuk halaman ini **dikomentari** dalam `app-sidebar.tsx`.

#### Status Implementasi
**⚠️ Work In Progress**
- UI sudah dibangun: ✅
- Navigasi dinonaktifkan (dikomentari): ⚠️
- Tidak ada backend/database terhubung: —

---

## 5. TABEL RINGKASAN PROGRESS DEVELOPMENT

| Modul | Status | Keterangan |
|---|---|---|
| **Dashboard Hub** | ✅ Sebagian | Data insiden & shift dari DB ✅; Data train/alerts/maintenance masih statis ⚠️ |
| **Incident Management** | ✅ Sudah | Tabel, filter, pagination, statistik prioritas |
| **Report Problem** | ⚠️ WIP | UI selesai; backend belum sesuai (props mismatch dengan controller) |
| **Station Health** | ✅ Sebagian | Shift on-duty & insiden hari ini dari DB ✅; Data kereta/teknisi masih statis ⚠️ |
| **Shift Schedule** | ✅ Sudah | CRUD, drag-and-drop, copy bulan, konfigurasi shift |
| **WhatsApp Notification** | ✅ Sudah | Integrasi WAHA API berfungsi |
| **Architecture Blueprints** | ⚠️ WIP | UI ada, navigasi dinonaktifkan |
| **Autentikasi** | ✅ Sudah | Login, logout, reset password; registrasi mandiri dinonaktifkan |
| **Pengaturan Akun** | ✅ Sudah | Edit profil, ganti password, tampilan |
| **Tabel `incidents` Migration** | ❌ Belum | Tidak ada file migrasi di repository; tabel hanya ada di server DB |
| **Role-Based Access Control** | ❌ Belum | Tidak ada sistem peran/izin (semua pengguna terautentikasi memiliki akses sama) |
| **Export Excel/PDF Laporan** | ⚠️ WIP | Library `xlsx` sudah terpasang (`package.json`) namun belum diimplementasikan |

---

## 6. IDENTIFIKASI MASALAH

### 6.1 Bug & Inkonsistensi Kode

#### [BUG-01] Penamaan Variabel yang Menyesatkan di Dashboard Controller
**File:** `app/Http/Controllers/Dashboard.php` — baris 88–90

```php
// Diberi nama $data_close namun menghitung status 'Open'
$data_close = (clone $baseQuery)
    ->where('status', 'Open')
    ->count();
```

Variabel bernama `$data_close` tetapi query menghitung `status = 'Open'`. Ini akan menghasilkan nilai yang tidak konsisten di frontend karena nama prop yang dikirim ke view adalah `data_close` padahal isinya adalah jumlah insiden Open.

---

#### [BUG-02] Mismatch Props: `report-problem.tsx` vs `Dashboard::Index()`
**File:** `resources/js/pages/report-problem.tsx` — baris 139, `routes/web.php` — baris 20

Halaman `report-problem.tsx` mendeklarasikan fungsi utama dengan parameter `{ laporans, summary, filterOptions, filters, data_perangkat }`, namun route `/report-problem` diarahkan ke `Dashboard::Index()` yang mengirim props `{ data_dashboard }`. Akibatnya, halaman tersebut akan merender kosong atau error karena semua props utama bernilai `undefined`.

---

#### [BUG-03] Data Statistik `Incident::Index()` Tidak Mengikuti Filter
**File:** `app/Http/Controllers/Incident.php` — baris 45–72

`$countQuery` dibuat sebagai `LaporanHpio::query()` baru (tanpa filter apapun), sehingga statistik total, P1, P2, dan closed selalu dihitung dari **seluruh data** — tidak mengikuti filter yang aktif di `$query`. Ini menyebabkan angka statistik tidak konsisten dengan data yang ditampilkan.

---

#### [BUG-04] `console.log` Tertinggal di Kode Produksi
**File:** `resources/js/pages/report-problem.tsx` — baris 145

```javascript
console.log(data_perangkat)
```

Statement debug `console.log` tertinggal dan akan menghasilkan output di browser production.

---

#### [BUG-05] Referensi Model Non-Existent di Seeder
**File:** `database/seeders/LaporanHpioSeeder.php` — baris 295

```php
LaporanHpio::updateOrCreate(['idNumber' => $row['idNumber']], $row);
```

Model `LaporanHpio` tidak memiliki `idNumber` dalam kolom `$fillable`. Kolom yang ada adalah `id` (UUID). Seeder ini kemungkinan tidak akan bekerja dengan benar karena field `idNumber` tidak ada sebagai kolom database, dan banyak field seeder (`stasiun_lokasi`, `skala_prioritas`, `status_laporan`, dll.) tidak sesuai dengan nama kolom di model (`stasiun`, `prioritas`, `status`, dll.).

---

### 6.2 Masalah Keamanan

#### [SEC-01] Kredensial Database Sensitif dalam `.env` yang Dapat Ter-expose
**File:** `.env` — baris 25–29, 66–68

File `.env` mengandung:
- Password database plaintext (`DB_PASSWORD=aliyasin810`)  
- API Key WAHA plaintext (`WAHA_API_KEY=668949e65e...`)

Meskipun `.env` ada di `.gitignore`, jika file ini pernah ter-commit atau ter-expose, informasi sensitif ini dapat digunakan pihak tidak berwenang.

---

#### [SEC-02] Tidak Ada Rate Limiting pada Endpoint WhatsApp
**File:** `routes/web.php` — baris 69

Endpoint `POST /send-whatsapp` tidak memiliki middleware `throttle`, sehingga rentan terhadap penyalahgunaan pengiriman pesan massal.

---

#### [SEC-03] Tidak Ada Validasi Panjang Nomor HP
**File:** `app/Http/Controllers/WhatsAppController.php`

Validasi hanya mengecek `required` untuk field `phone`. Tidak ada pengecekan panjang minimum/maksimum nomor HP, sehingga nomor yang tidak valid dapat dikirimkan ke WAHA API.

---

#### [SEC-04] Tidak Ada Sistem RBAC (Role-Based Access Control)
Seluruh pengguna yang terautentikasi memiliki akses ke **semua fitur** tanpa pembedaan peran (misalnya: operator vs. administrator vs. teknisi). Tidak ada middleware role/permission yang ditemukan.

---

### 6.3 Masalah Kualitas Kode & Struktur

#### [QA-01] Logika Bisnis di Route Closure (bukan Controller)
**File:** `routes/web.php` — baris 25–53

Seluruh logika bisnis untuk halaman `/stations` (query database, loop, mapping) ditulis langsung dalam closure di file route, bukan dalam controller terpisah. Ini melanggar prinsip pemisahan concern (Separation of Concerns) dan membuat kode sulit diuji.

---

#### [QA-02] Tidak Ada Migrasi untuk Tabel `incidents`
Tabel utama aplikasi (`incidents`) tidak memiliki file migrasi di repository. Ini menyebabkan masalah reprodusibilitas — lingkungan development baru tidak dapat membuat skema database secara otomatis.

---

#### [QA-03] Format Data Tidak Konsisten di Tabel `incidents`
Berdasarkan `LaporanHpioSeeder.php`, field seperti `response_time` dan `solving_time` memiliki format yang tidak konsisten:
- `'0'` (string angka)
- `'2026-05-20 22:09:32'` (datetime penuh)
- `'07:15'` (format menit)
- `'15:22:33 menit'` (format campuran dengan teks)

Ketidakkonsistenan ini mempersulit kalkulasi dan komparasi data.

---

#### [QA-04] Import Tidak Digunakan di `Incident.php`
**File:** `app/Http/Controllers/Incident.php` — baris 6

```php
use App\Http\Resources\UserCollection;
```

Class `UserCollection` diimport namun tidak pernah digunakan di controller tersebut.

---

#### [QA-05] Data Statis yang Seharusnya dari Database
File `resources/js/data.ts` berisi data hardcoded untuk:
- Stasiun (`INITIAL_STATIONS`)
- Kereta (`INITIAL_TRAIN_SETS`)
- Teknisi (`INITIAL_TECHNICIANS`)
- Alert (`INITIAL_ALERTS`)
- Maintenance orders (`INITIAL_MAINTENANCE_ORDERS`)

Data ini seharusnya diambil dari database secara dinamis, bukan di-hardcode di frontend.

---

#### [QA-06] Duplikasi Interface Type
**File:** `resources/js/types.ts` — interface `DataIncident` dan `IncidentLog` mendefinisikan struktur yang hampir sama dengan interface `Incident` di file yang sama, namun menggunakan nama field berbeda (contoh: `skala_prioritas` vs `prioritas`, `stasiun_lokasi` vs `stasiun`). Hal ini mencerminkan inkonsistensi skema antara data seeder lama dan model database saat ini.

---

#### [QA-07] Tidak Ada Lazy Loading / Query Optimization
Beberapa query menggunakan `->get()` tanpa batasan kolom spesifik (SELECT *). Untuk tabel `incidents` yang berpotensi besar, ini dapat menjadi bottleneck performa.

---

## 7. REKOMENDASI PENGEMBANGAN

### 7.1 Prioritas Tinggi (Critical)

#### [REC-01] Perbaiki Bug `report-problem.tsx` — Buat Controller Terpisah
Buat `ReportProblemController.php` dengan method yang menangani semua logika filter (periode, bulan, stasiun, kategori, rentang tanggal, status) dan mengirim props yang tepat: `laporans` (paginated), `summary` (agregasi per status/prioritas/stasiun), `filterOptions` (daftar dropdown), dan `filters` (filter aktif).

#### [REC-02] Buat Migrasi untuk Tabel `incidents`
Tambahkan file migrasi `create_incidents_table.php` agar skema tabel terdokumentasi dan dapat direproduksi di lingkungan baru:
```php
Schema::create('incidents', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('nomor_tiket')->unique();
    $table->date('tanggal_lapor')->index();
    // ... kolom lainnya
    $table->timestamps();
});
```

#### [REC-03] Perbaiki Variabel Menyesatkan di Dashboard Controller
Ganti nama `$data_close` menjadi `$data_open` atau ubah query menjadi menghitung status yang benar.

#### [REC-04] Pindahkan Logika Route `/stations` ke Controller
Buat `StationController.php` dan pindahkan logika dari route closure ke sana.

---

### 7.2 Prioritas Menengah

#### [REC-05] Implementasi Role-Based Access Control (RBAC)
Tambahkan sistem peran pengguna (misalnya: admin, operator, teknisi) menggunakan package seperti `spatie/laravel-permission` untuk membatasi akses fitur berdasarkan peran.

#### [REC-06] Tambahkan Rate Limiting pada Endpoint WhatsApp
```php
Route::post('/send-whatsapp', [WhatsAppController::class, 'send'])
    ->middleware('throttle:10,1'); // Max 10 request per menit
```

#### [REC-07] Standarisasi Format Data `response_time` dan `solving_time`
Tentukan satu format standar (misalnya: menit dalam integer, atau format `HH:MM`) dan lakukan migrasi data untuk menyeragamkan seluruh record yang ada.

#### [REC-08] Pindahkan Data Statis ke Database
Buat tabel `stations`, `train_sets`, `technicians` di database dengan migrasi dan seeder yang proper, kemudian ganti `data.ts` dengan API calls dari backend.

#### [REC-09] Implementasi Fitur Export Excel
Library `xlsx` sudah terpasang. Implementasikan tombol export yang mengunduh data insiden dalam format Excel dengan filter yang sedang aktif.

---

### 7.3 Prioritas Rendah (Peningkatan)

#### [REC-10] Aktifkan Fitur Architecture Blueprints
Aktifkan kembali menu navigasi Architecture Blueprints di `app-sidebar.tsx` jika fitur ini siap ditampilkan.

#### [REC-11] Tambahkan Automated Testing
Implementasikan unit test dan feature test menggunakan PestPHP (sudah terpasang) untuk controller utama: `Dashboard`, `Incident`, `ShiftScheduleController`.

#### [REC-12] Tambahkan Index pada Kolom Query Intensif
Tambahkan index database pada kolom yang sering digunakan sebagai filter:
- `incidents.tanggal_lapor`
- `incidents.status`
- `incidents.stasiun`
- `incidents.kategori_aset`
- `shift_schedules.month`

#### [REC-13] Hapus `console.log` dan Import Tidak Terpakai
- Hapus `console.log(data_perangkat)` di `report-problem.tsx` baris 145
- Hapus `use App\Http\Resources\UserCollection;` di `Incident.php` baris 6

#### [REC-14] Nonaktifkan Registrasi atau Dokumentasikan Proses Onboarding
Karena registrasi mandiri dinonaktifkan, buat SOP atau script untuk menambahkan pengguna baru secara manual melalui Tinker atau seeder khusus.

---

## LAMPIRAN

### A. Konfigurasi Environment Produksi

| Parameter | Nilai |
|---|---|
| `APP_ENV` | `production` |
| `APP_URL` | `https://kcic.kamargelap.online` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `100.112.27.4` |
| `DB_DATABASE` | `hpiodb` |
| `SESSION_DRIVER` | `database` |
| `QUEUE_CONNECTION` | `database` |
| `CACHE_STORE` | `database` |
| `WAHA_API_URL` | `https://waha.kamargelap.online` |

### B. Nilai Default Shift Config (dari DatabaseSeeder)

| Shift | Jam Mulai | Jam Selesai |
|---|---|---|
| Shift 1 | 07:00 | 15:00 |
| Shift 2 | 15:00 | 23:00 |
| Shift 3 | 23:00 | 07:00 |
| Middle | 09:00 | 17:00 |

### C. Stasiun KCIC yang Didukung Sistem

| Kode | Nama Stasiun | Lokasi |
|---|---|---|
| HLM | Halim | Jakarta Timur, DKI Jakarta |
| KWG | Karawang | Karawang, Jawa Barat |
| PDL | Padalarang | Bandung Barat, Jawa Barat |
| TGL | Tegalluar | Kabupaten Bandung, Jawa Barat |

### D. Format Nomor Tiket Insiden

Format: `HPIO-INC-DDMMYY-NNN`

Contoh:
- `HPIO-INC-140526-209` → 14 Mei 2026, nomor urut 209
- `HPIO-INC-180526-013` → 18 Mei 2026, nomor urut 013

---

*Dokumentasi ini disusun berdasarkan analisis source code yang ditemukan di repository project `HPIO-DATA-TICKET-INCIDENT`. Seluruh poin analisis merujuk pada implementasi aktual dalam kode. Fitur atau konfigurasi yang tidak ditemukan secara eksplisit dalam source code tidak dimasukkan dalam dokumen ini.*

---
**Akhir Dokumen**  
*Versi 1.0.0 — 15 Juni 2026*
