# 📚 Perpustakaan Digital - Unit Testing & Feature Testing

**Matkul:** Testing dan Implementasi SI (SIFS124603-20252)  
**Topik:** Unit Testing and Feature Testing dengan Node.js + Jest

---

## 🗂️ Deskripsi Project

Project **Mini Perpustakaan Digital** adalah REST API yang dibangun menggunakan **Express.js**. Project ini dibuat sebagai implementasi dari materi *Unit Testing* dan *Feature Testing* menggunakan **Jest** dan **Supertest**.

### Fitur Aplikasi
- CRUD Buku (tambah, lihat, update, hapus)
- Sistem Peminjaman dan Pengembalian Buku
- Pencarian Buku
- Kalkulasi Denda Keterlambatan
- Statistik Perpustakaan

---

## 🛠️ Teknologi

| Tools | Keterangan |
|-------|------------|
| Node.js | Runtime JavaScript |
| Express.js | Framework web |
| Jest | Testing framework |
| Supertest | HTTP assertion library |

---

## 📁 Struktur Project

```
perpustakaan-digital/
├── src/
│   └── app.js                          # Aplikasi utama (Express)
├── tests/
│   ├── unit/
│   │   └── perpustakaan.unit.test.js   # Unit Tests (38 test)
│   └── feature/
│       └── perpustakaan.feature.test.js # Feature Tests (33 test)
├── index.js                            # Entry point server
├── package.json
└── README.md
```

---

## ⚙️ Instalasi & Menjalankan

```bash
# Clone repository
git clone <URL_REPO>
cd perpustakaan-digital

# Install dependencies
npm install

# Jalankan server
npm start

# Jalankan semua test
npm test

# Jalankan unit test saja
npm run test:unit

# Jalankan feature test saja
npm run test:feature

# Jalankan test dengan laporan coverage
npm run test:coverage
```

---

## 🧪 Daftar Test

### Unit Test (38 test)

Unit test menguji **fungsi/logika bisnis secara terisolasi** tanpa ketergantungan HTTP.

| Kelompok | Jumlah | Deskripsi |
|----------|--------|-----------|
| `validateBook()` | 8 | Validasi data buku (valid, judul kosong, tahun invalid, dll) |
| `formatAuthorName()` | 7 | Format nama penulis ke Title Case |
| `getStockStatus()` | 6 | Status stok buku (habis/hampir habis/tersedia/melimpah) |
| `calculateFine()` | 5 | Hitung denda keterlambatan pengembalian |
| `searchBooks()` | 6 | Pencarian buku berdasarkan judul/penulis |
| `sortBooks()` | 4 | Pengurutan buku (asc/desc) |

### Feature Test (33 test)

Feature test menguji **alur aplikasi end-to-end** melalui HTTP request menggunakan Supertest.

| Endpoint | Jumlah | Skenario |
|----------|--------|----------|
| `GET /books` | 4 | Ambil semua, pencarian judul, pencarian penulis, not found |
| `GET /books/:id` | 2 | ID valid, ID tidak ada |
| `POST /books` | 6 | Data valid, tanpa judul, tanpa penulis, tahun invalid, duplikat, integrasi GET |
| `PUT /books/:id` | 3 | Update judul, update stok, ID tidak ada |
| `DELETE /books/:id` | 4 | Berhasil hapus, verifikasi terhapus, tidak ada, sedang dipinjam |
| `POST /borrow` | 6 | Berhasil pinjam, stok berkurang, tanpa bookId, tanpa nama, not found, stok habis |
| `POST /return` | 4 | Berhasil kembali, stok naik, sudah dikembalikan, not found |
| `GET /borrow/history` | 2 | History kosong, history bertambah |
| `GET /stats` | 3 | Stats awal, setelah pinjam, setelah kembalikan |
| Skenario E2E | 1 | Tambah → Pinjam → Kembalikan → Hapus |

---

## ✅ Hasil Test

```
Test Suites: 2 passed, 2 total
Tests:       71 passed, 71 total
Time:        ~1.5s
```

---

## 📡 API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/books` | Ambil semua buku (support `?search=`) |
| GET | `/books/:id` | Ambil buku berdasarkan ID |
| POST | `/books` | Tambah buku baru |
| PUT | `/books/:id` | Update data buku |
| DELETE | `/books/:id` | Hapus buku |
| POST | `/borrow` | Pinjam buku |
| POST | `/return` | Kembalikan buku |
| GET | `/borrow/history` | Riwayat peminjaman |
| GET | `/stats` | Statistik perpustakaan |

---

## 📌 Ketentuan Tugas

- ✅ Push tugas pada GitHub masing-masing
- ✅ Link GitHub tidak di-private
- ✅ Tidak meng-copy code orang lain
- ✅ Case yang unik dan bervariasi (71 test cases)
