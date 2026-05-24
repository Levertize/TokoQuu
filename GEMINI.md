# GEMINI.md — Kasir Dashboard Project

Ini adalah file konfigurasi proyek untuk Gemini AI agent.
Baca seluruh file ini sebelum menulis kode apapun.

---

## Identitas Proyek

- **Nama**: Kasir Dashboard
- **Deskripsi**: Aplikasi dashboard kasir full-stack dengan fitur manajemen produk, point of sale (POS), laporan penjualan, manajemen stok, dan AI chat assistant yang terhubung ke database secara real-time.
- **Target pengguna**: Admin / pemilik toko kecil-menengah
- **Bahasa komentar & variabel**: Indonesia (UI) dan English (kode/variabel)

---

## Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS v3
- **Icons**: Tabler Icons (`@tabler/icons-react`)
- **Routing**: React Router v6
- **State management**: Zustand
- **HTTP client**: Axios
- **Charts**: Recharts
- **Tanggal**: date-fns (dengan locale id-ID)

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: SQLite3 via `better-sqlite3`
- **ORM/Query builder**: Knex.js
- **Validasi**: Zod
- **AI Integration**: Google Gemini API (`@google/generative-ai`) atau Ollama (lokal)
- **Autentikasi**: JWT (`jsonwebtoken`) + bcrypt

### Dev Tools
- **Linter**: ESLint + Prettier
- **Testing**: Vitest (frontend), Jest (backend)
- **API testing**: Thunder Client / REST file

---

## Struktur Folder

```
kasir-dashboard/
├── frontend/                    # React + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Halaman utama dengan statistik
│   │   │   ├── POS.jsx          # Point of Sale / kasir
│   │   │   ├── Products.jsx     # Manajemen produk & stok
│   │   │   ├── Reports.jsx      # Laporan penjualan & analitik
│   │   │   ├── AIChat.jsx       # Chat dengan AI assistant
│   │   │   └── Settings.jsx     # Pengaturan toko & akun
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Topbar.jsx
│   │   │   ├── ui/              # Komponen UI reusable
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── StockAlerts.jsx
│   │   │   │   └── RecentTransactions.jsx
│   │   │   ├── pos/
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── PaymentModal.jsx
│   │   │   └── chat/
│   │   │       ├── ChatWindow.jsx
│   │   │       ├── MessageBubble.jsx
│   │   │       └── QuickPrompts.jsx
│   │   ├── stores/              # Zustand stores
│   │   │   ├── useCartStore.js
│   │   │   ├── useProductStore.js
│   │   │   └── useAuthStore.js
│   │   ├── services/            # API calls via Axios
│   │   │   ├── api.js           # Axios instance + interceptors
│   │   │   ├── productService.js
│   │   │   ├── transactionService.js
│   │   │   ├── reportService.js
│   │   │   └── aiService.js
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useDebounce.js
│   │   │   └── useToast.js
│   │   ├── utils/
│   │   │   ├── formatCurrency.js   # Format Rupiah: Rp 10.000
│   │   │   └── formatDate.js       # Format tanggal Indonesia
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # Express API Server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── products.js      # CRUD produk & stok
│   │   │   ├── transactions.js  # Transaksi & POS
│   │   │   ├── reports.js       # Laporan & analitik
│   │   │   ├── ai.js            # AI chat endpoint
│   │   │   └── auth.js          # Login & autentikasi
│   │   ├── controllers/         # Business logic
│   │   │   ├── productController.js
│   │   │   ├── transactionController.js
│   │   │   ├── reportController.js
│   │   │   └── aiController.js
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT middleware
│   │   │   ├── validate.js      # Zod validation middleware
│   │   │   └── errorHandler.js
│   │   ├── db/
│   │   │   ├── connection.js    # Setup better-sqlite3
│   │   │   ├── schema.js        # Definisi tabel SQLite
│   │   │   └── seed.js          # Data dummy untuk development
│   │   ├── services/
│   │   │   └── aiService.js     # Logic Gemini / Ollama
│   │   └── utils/
│   │       └── queryBuilder.js  # Helper query SQL
│   ├── server.js                # Entry point Express
│   ├── .env.example
│   └── package.json
│
├── .env                         # Environment variables (jangan di-commit!)
├── .gitignore
├── GEMINI.md                    # File ini
└── README.md
```

---

## Database Schema (SQLite)

### Tabel `products`
```sql
CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,             -- 'minuman' | 'makanan' | 'snack' | 'rumah_tangga'
  buy_price   INTEGER NOT NULL,          -- Harga beli (dalam Rupiah)
  sell_price  INTEGER NOT NULL,          -- Harga jual (dalam Rupiah)
  stock       INTEGER NOT NULL DEFAULT 0,
  min_stock   INTEGER NOT NULL DEFAULT 10, -- Batas minimum stok (alert)
  unit        TEXT NOT NULL DEFAULT 'pcs',
  barcode     TEXT,
  image_url   TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1, -- 0 = dihapus (soft delete)
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Tabel `transactions`
```sql
CREATE TABLE transactions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number  TEXT NOT NULL UNIQUE,  -- Format: TRX-YYYYMMDD-XXXX
  total_amount    INTEGER NOT NULL,
  discount        INTEGER NOT NULL DEFAULT 0,
  tax             INTEGER NOT NULL DEFAULT 0,
  payment_method  TEXT NOT NULL DEFAULT 'cash', -- 'cash' | 'qris' | 'transfer'
  payment_amount  INTEGER NOT NULL,
  change_amount   INTEGER NOT NULL DEFAULT 0,
  cashier_name    TEXT,
  customer_name   TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'completed', -- 'completed' | 'cancelled'
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Tabel `transaction_items`
```sql
CREATE TABLE transaction_items (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id),
  product_id     INTEGER NOT NULL REFERENCES products(id),
  product_name   TEXT NOT NULL,          -- Snapshot nama produk saat transaksi
  quantity       INTEGER NOT NULL,
  unit_price     INTEGER NOT NULL,       -- Snapshot harga saat transaksi
  subtotal       INTEGER NOT NULL
);
```

### Tabel `stock_logs`
```sql
CREATE TABLE stock_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  type        TEXT NOT NULL,  -- 'sale' | 'restock' | 'adjustment' | 'return'
  quantity    INTEGER NOT NULL, -- Positif = masuk, negatif = keluar
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Tabel `users`
```sql
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT NOT NULL UNIQUE,
  password     TEXT NOT NULL,  -- Bcrypt hash
  full_name    TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'cashier', -- 'admin' | 'cashier'
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## API Endpoints

### Products
```
GET    /api/products              Ambil semua produk (support ?search=&category=&low_stock=true)
GET    /api/products/:id          Ambil satu produk
POST   /api/products              Tambah produk baru
PUT    /api/products/:id          Update produk
DELETE /api/products/:id          Soft delete produk
PATCH  /api/products/:id/stock    Update stok saja (untuk restock)
```

### Transactions
```
GET    /api/transactions           Ambil semua transaksi (support ?date=&status=)
GET    /api/transactions/:id       Detail transaksi + items
POST   /api/transactions           Buat transaksi baru (POS checkout)
PATCH  /api/transactions/:id/cancel Batalkan transaksi
```

### Reports
```
GET    /api/reports/summary        Ringkasan hari ini (pendapatan, jumlah transaksi, dll)
GET    /api/reports/daily          Laporan harian (default 7 hari terakhir)
GET    /api/reports/monthly        Laporan bulanan
GET    /api/reports/top-products   Produk terlaris (support ?limit=&period=)
GET    /api/reports/low-stock      Produk dengan stok di bawah minimum
GET    /api/reports/hourly         Distribusi transaksi per jam
```

### AI Chat
```
POST   /api/ai/chat                Kirim pesan ke AI, terima jawaban berbasis data toko
GET    /api/ai/suggestions         Ambil pertanyaan yang disarankan berdasarkan kondisi toko
```

### Auth
```
POST   /api/auth/login             Login, terima JWT token
POST   /api/auth/logout
GET    /api/auth/me                Info user yang sedang login
```

---

## Konvensi Kode

### Umum
- Gunakan **ES Modules** (`import`/`export`) di seluruh proyek
- Semua fungsi async menggunakan **async/await**, bukan `.then().catch()`
- Validasi input menggunakan **Zod schema** di backend sebelum menyentuh database
- Semua harga disimpan sebagai **integer (Rupiah penuh)** — tidak ada float/desimal
- Format tanggal dan waktu: **ISO 8601** di database, tampil dalam format Indonesia di UI

### Penamaan
- Komponen React: `PascalCase` (misal `ProductGrid.jsx`)
- Fungsi & variabel: `camelCase` (misal `getSellPrice`, `totalAmount`)
- Tabel database: `snake_case` (misal `transaction_items`)
- Konstanta global: `UPPER_SNAKE_CASE` (misal `MIN_STOCK_THRESHOLD`)
- File konfigurasi: `kebab-case` (misal `vite.config.js`)

### Frontend
- Setiap halaman di `pages/` hanya berisi layout & logika tingkat tinggi
- Komponen UI kecil yang reusable diletakkan di `components/ui/`
- Semua pemanggilan API melalui fungsi di `services/` — **tidak boleh** fetch langsung dari komponen
- Format Rupiah selalu menggunakan fungsi `formatCurrency()` dari `utils/`
- Gunakan Tailwind utility classes — hindari CSS custom kecuali sangat perlu

### Backend
- Setiap route hanya memanggil controller — logika bisnis ada di controller atau service
- Semua response API mengikuti format standar:
  ```json
  { "success": true, "data": {...}, "message": "..." }
  { "success": false, "error": "Pesan error", "details": [...] }
  ```
- Transaksi database (insert + update stok) menggunakan SQLite transaction untuk atomicity
- Jangan pernah return password/hash ke client

---

## AI Chat — Cara Kerja

Ketika user mengirim pesan ke `/api/ai/chat`, backend akan:

1. **Ambil konteks dari database** — ringkasan stok, transaksi hari ini, produk terlaris, alert stok menipis
2. **Susun system prompt** yang menyertakan konteks tersebut
3. **Kirim ke Gemini / Ollama** dengan prompt user
4. **Return jawaban** ke frontend

### System Prompt Template (di `aiService.js`)
```
Kamu adalah AI assistant untuk toko "${STORE_NAME}".
Kamu memiliki akses ke data toko berikut (diambil real-time):

=== DATA TOKO SAAT INI ===
Tanggal: ${today}
Pendapatan hari ini: Rp ${todayRevenue}
Jumlah transaksi hari ini: ${todayTransactions}

Produk terlaris minggu ini:
${topProducts}

Stok yang perlu diperhatikan (di bawah minimum):
${lowStockProducts}

=== AKHIR DATA ===

Jawab pertanyaan admin dengan ramah, singkat, dan berdasarkan data di atas.
Gunakan Bahasa Indonesia. Jika diminta saran, berikan saran yang praktis dan spesifik.
```

### AI Provider (pilih salah satu via `.env`)
- **Gemini**: Set `AI_PROVIDER=gemini` dan `GEMINI_API_KEY=...`
- **Ollama**: Set `AI_PROVIDER=ollama` dan `OLLAMA_URL=http://localhost:11434` dan `OLLAMA_MODEL=llama3`

---

## Environment Variables (`.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./database.db

# JWT
JWT_SECRET=ganti_dengan_secret_yang_panjang_dan_random
JWT_EXPIRES_IN=7d

# AI Provider: 'gemini' atau 'ollama'
AI_PROVIDER=gemini

# Gemini (jika AI_PROVIDER=gemini)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Ollama (jika AI_PROVIDER=ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Toko
STORE_NAME=Toko Maju Jaya
```

---

## Format Rupiah

Selalu gunakan helper ini untuk format harga di UI:

```js
// frontend/src/utils/formatCurrency.js
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
// Output: "Rp 10.000"
```

---

## Panduan untuk Gemini Agent

- Jika diminta membuat fitur baru, **selalu** buat frontend (komponen + service) dan backend (route + controller) sekaligus
- Jika mengubah skema database, **selalu** update `schema.js` dan `seed.js` sekaligus
- Saat membuat endpoint baru, **selalu** tambahkan validasi Zod
- Jangan hardcode data dummy di komponen — selalu fetch dari API
- Setiap komponen yang fetch data harus punya state: `loading`, `error`, dan `data`
- Gunakan `better-sqlite3` yang synchronous — jangan pakai `sqlite3` yang callback-based
- Ketika membuat transaksi POS, **wajib** kurangi stok produk dalam satu database transaction
- Format invoice number: `TRX-YYYYMMDD-XXXX` (XXXX = nomor urut hari ini, 4 digit)

---

## Status Proyek

- [x] Desain UI / mockup selesai
- [x] Setup struktur folder & konfigurasi
- [x] Database schema & seed data
- [x] Backend API (Express + SQLite)
- [x] Frontend — Layout & navigasi
- [x] Frontend — Halaman Dashboard
- [x] Frontend — Halaman POS
- [x] Frontend — Halaman Produk & Stok
- [x] Frontend — Halaman Laporan
- [x] Frontend — AI Chat
- [x] Autentikasi (login/logout)
- [x] Testing & bug fix
- [ ] Deploy / dokumentasi

---

*File ini diperbarui seiring perkembangan proyek.*