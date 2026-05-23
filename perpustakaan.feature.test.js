/**
 * FEATURE TEST - Perpustakaan Digital
 * Matkul: Testing dan Implementasi SI (SIFS124603)
 *
 * Feature test menguji alur aplikasi secara end-to-end melalui HTTP request.
 * Menggunakan supertest untuk simulasi request tanpa menjalankan server.
 */

const request = require('supertest');
const { app, resetData } = require('../../src/app');

// Reset data sebelum setiap test agar tidak saling mempengaruhi
beforeEach(() => resetData());

// ============================================================
// FEATURE TEST: GET /books
// ============================================================
describe('📋 Feature Test: GET /books', () => {

  test('Mengambil semua buku → 200 OK + daftar buku', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.total).toBe(3);
  });

  test('Pencarian buku berdasarkan judul', async () => {
    const res = await request(app).get('/books?search=Node.js');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].title).toMatch(/Node\.js/i);
  });

  test('Pencarian buku berdasarkan penulis', async () => {
    const res = await request(app).get('/books?search=Dewi');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].author).toMatch(/Dewi/i);
  });

  test('Pencarian buku yang tidak ada → array kosong', async () => {
    const res = await request(app).get('/books?search=PythonXYZ99');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

});

// ============================================================
// FEATURE TEST: GET /books/:id
// ============================================================
describe('🔎 Feature Test: GET /books/:id', () => {

  test('Mengambil buku berdasarkan ID valid → 200 OK', async () => {
    const res = await request(app).get('/books/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('author');
    expect(res.body.data).toHaveProperty('year');
  });

  test('Mengambil buku ID yang tidak ada → 404 Not Found', async () => {
    const res = await request(app).get('/books/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Buku tidak ditemukan');
  });

});

// ============================================================
// FEATURE TEST: POST /books
// ============================================================
describe('➕ Feature Test: POST /books', () => {

  test('Tambah buku baru dengan data valid → 201 Created', async () => {
    const newBook = { title: 'Testing dengan Jest', author: 'Siti Nurhaliza', year: 2024, stock: 4 };
    const res = await request(app).post('/books').send(newBook);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Testing dengan Jest');
    expect(res.body.data.id).toBeDefined();
  });

  test('Tambah buku tanpa judul → 400 Bad Request', async () => {
    const res = await request(app).post('/books').send({ author: 'Andi', year: 2022 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Title');
  });

  test('Tambah buku tanpa penulis → 400 Bad Request', async () => {
    const res = await request(app).post('/books').send({ title: 'Buku Tanpa Penulis', year: 2022 });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Tambah buku dengan tahun tidak valid → 400 Bad Request', async () => {
    const res = await request(app).post('/books').send({ title: 'Buku Baru', author: 'Penulis', year: 1800 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Tahun tidak valid');
  });

  test('Tambah buku duplikat (judul + penulis sama) → 409 Conflict', async () => {
    const bookData = { title: 'Basis Data Relasional', author: 'Ahmad Fauzi', year: 2020 };
    const res = await request(app).post('/books').send(bookData);
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('sudah ada');
  });

  test('Buku baru dapat langsung diambil dengan GET', async () => {
    const newBook = { title: 'Microservices Node.js', author: 'Rizky Pratama', year: 2023, stock: 2 };
    const postRes = await request(app).post('/books').send(newBook);
    const newId = postRes.body.data.id;

    const getRes = await request(app).get(`/books/${newId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.data.title).toBe('Microservices Node.js');
  });

});

// ============================================================
// FEATURE TEST: PUT /books/:id
// ============================================================
describe('✏️ Feature Test: PUT /books/:id', () => {

  test('Update judul buku → 200 OK dengan data terbaru', async () => {
    const res = await request(app).put('/books/1').send({ title: 'Node.js Advanced Guide' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Node.js Advanced Guide');
    expect(res.body.data.id).toBe(1);
  });

  test('Update stok buku', async () => {
    const res = await request(app).put('/books/2').send({ stock: 10 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.stock).toBe(10);
  });

  test('Update buku yang tidak ada → 404 Not Found', async () => {
    const res = await request(app).put('/books/999').send({ title: 'Test' });
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

});

// ============================================================
// FEATURE TEST: DELETE /books/:id
// ============================================================
describe('🗑️ Feature Test: DELETE /books/:id', () => {

  test('Hapus buku yang ada → 200 OK', async () => {
    const res = await request(app).delete('/books/3');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('berhasil dihapus');
  });

  test('Buku yang dihapus tidak bisa diakses lagi', async () => {
    await request(app).delete('/books/3');
    const getRes = await request(app).get('/books/3');
    expect(getRes.statusCode).toBe(404);
  });

  test('Hapus buku yang tidak ada → 404 Not Found', async () => {
    const res = await request(app).delete('/books/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('Hapus buku yang sedang dipinjam → 400 Bad Request', async () => {
    // Pinjam dulu
    await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Mahasiswa A' });
    // Lalu coba hapus
    const res = await request(app).delete('/books/1');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('sedang dipinjam');
  });

});

// ============================================================
// FEATURE TEST: POST /borrow (Peminjaman)
// ============================================================
describe('📤 Feature Test: POST /borrow', () => {

  test('Meminjam buku yang tersedia → 201 Created', async () => {
    const res = await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Ni Luh Ayu' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookId).toBe(1);
    expect(res.body.data.borrowerName).toBe('Ni Luh Ayu');
    expect(res.body.data.returnedAt).toBeNull();
    expect(res.body.data.borrowedAt).toBeDefined();
  });

  test('Stok berkurang setelah dipinjam', async () => {
    const before = await request(app).get('/books/1');
    const stockBefore = before.body.data.stock;

    await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Putu Agus' });

    const after = await request(app).get('/books/1');
    expect(after.body.data.stock).toBe(stockBefore - 1);
  });

  test('Meminjam buku tanpa bookId → 400 Bad Request', async () => {
    const res = await request(app).post('/borrow').send({ borrowerName: 'Andi' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Meminjam buku tanpa nama peminjam → 400 Bad Request', async () => {
    const res = await request(app).post('/borrow').send({ bookId: 1 });
    expect(res.statusCode).toBe(400);
  });

  test('Meminjam buku yang tidak ada → 404 Not Found', async () => {
    const res = await request(app).post('/borrow').send({ bookId: 999, borrowerName: 'Andi' });
    expect(res.statusCode).toBe(404);
  });

  test('Stok habis → tidak bisa dipinjam', async () => {
    // Habiskan semua stok buku ID 3 (stok = 2)
    await request(app).post('/borrow').send({ bookId: 3, borrowerName: 'Peminjam 1' });
    await request(app).post('/borrow').send({ bookId: 3, borrowerName: 'Peminjam 2' });

    // Pinjam ke-3 harus gagal
    const res = await request(app).post('/borrow').send({ bookId: 3, borrowerName: 'Peminjam 3' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Stok buku habis');
  });

});

// ============================================================
// FEATURE TEST: POST /return (Pengembalian)
// ============================================================
describe('📥 Feature Test: POST /return', () => {

  test('Mengembalikan buku → 200 OK + stok kembali naik', async () => {
    const borrowRes = await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Made Arta' });
    const borrowId = borrowRes.body.data.id;
    const stockBeforeReturn = (await request(app).get('/books/1')).body.data.stock;

    const returnRes = await request(app).post('/return').send({ borrowId });
    expect(returnRes.statusCode).toBe(200);
    expect(returnRes.body.success).toBe(true);
    expect(returnRes.body.data.returnedAt).not.toBeNull();

    const stockAfterReturn = (await request(app).get('/books/1')).body.data.stock;
    expect(stockAfterReturn).toBe(stockBeforeReturn + 1);
  });

  test('Mengembalikan buku yang sudah dikembalikan → 400 Bad Request', async () => {
    const borrowRes = await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Ketut Sari' });
    const borrowId = borrowRes.body.data.id;

    // Kembalikan pertama kali
    await request(app).post('/return').send({ borrowId });

    // Kembalikan kedua kali → harus gagal
    const returnRes = await request(app).post('/return').send({ borrowId });
    expect(returnRes.statusCode).toBe(400);
    expect(returnRes.body.message).toContain('sudah dikembalikan');
  });

  test('Mengembalikan dengan borrowId yang tidak ada → 404', async () => {
    const res = await request(app).post('/return').send({ borrowId: 9999 });
    expect(res.statusCode).toBe(404);
  });

  test('Mengembalikan tanpa borrowId → 400 Bad Request', async () => {
    const res = await request(app).post('/return').send({});
    expect(res.statusCode).toBe(400);
  });

});

// ============================================================
// FEATURE TEST: GET /borrow/history
// ============================================================
describe('📜 Feature Test: GET /borrow/history', () => {

  test('History kosong di awal → array kosong', async () => {
    const res = await request(app).get('/borrow/history');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  test('History bertambah setelah peminjaman', async () => {
    await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Wayan Gede' });
    await request(app).post('/borrow').send({ bookId: 2, borrowerName: 'Komang Ayu' });

    const res = await request(app).get('/borrow/history');
    expect(res.body.total).toBe(2);
    expect(res.body.data[0].borrowerName).toBe('Wayan Gede');
  });

});

// ============================================================
// FEATURE TEST: GET /stats
// ============================================================
describe('📊 Feature Test: GET /stats', () => {

  test('Stats awal → total 3 buku, tidak ada peminjaman aktif', async () => {
    const res = await request(app).get('/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalBooks).toBe(3);
    expect(res.body.data.activeBorrows).toBe(0);
    expect(res.body.data.totalBorrows).toBe(0);
  });

  test('Stats berubah setelah peminjaman', async () => {
    await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Agus' });
    await request(app).post('/borrow').send({ bookId: 2, borrowerName: 'Sari' });

    const res = await request(app).get('/stats');
    expect(res.body.data.activeBorrows).toBe(2);
    expect(res.body.data.totalBorrows).toBe(2);
  });

  test('Stats activeBorrows berkurang setelah pengembalian', async () => {
    const borrowRes = await request(app).post('/borrow').send({ bookId: 1, borrowerName: 'Agus' });
    const borrowId = borrowRes.body.data.id;
    await request(app).post('/return').send({ borrowId });

    const res = await request(app).get('/stats');
    expect(res.body.data.activeBorrows).toBe(0);
    expect(res.body.data.totalBorrows).toBe(1); // history tetap ada
  });

});

// ============================================================
// FEATURE TEST: ALUR LENGKAP (End-to-End Scenario)
// ============================================================
describe('🔄 Feature Test: Skenario Alur Lengkap Perpustakaan', () => {

  test('Skenario: Tambah buku → Pinjam → Kembalikan → Hapus', async () => {
    // 1. Tambah buku baru
    const addRes = await request(app).post('/books').send({
      title: 'Express.js Masterclass', author: 'I Gede Putra', year: 2024, stock: 1
    });
    expect(addRes.statusCode).toBe(201);
    const bookId = addRes.body.data.id;

    // 2. Pinjam buku tersebut
    const borrowRes = await request(app).post('/borrow').send({ bookId, borrowerName: 'Ni Made Dewi' });
    expect(borrowRes.statusCode).toBe(201);
    const borrowId = borrowRes.body.data.id;

    // 3. Pastikan stok jadi 0
    const stockCheck = await request(app).get(`/books/${bookId}`);
    expect(stockCheck.body.data.stock).toBe(0);

    // 4. Kembalikan buku
    const returnRes = await request(app).post('/return').send({ borrowId });
    expect(returnRes.statusCode).toBe(200);

    // 5. Stok kembali ke 1
    const stockAfter = await request(app).get(`/books/${bookId}`);
    expect(stockAfter.body.data.stock).toBe(1);

    // 6. Hapus buku (sekarang tidak ada yang meminjam)
    const deleteRes = await request(app).delete(`/books/${bookId}`);
    expect(deleteRes.statusCode).toBe(200);

    // 7. Buku sudah tidak ada
    const finalCheck = await request(app).get(`/books/${bookId}`);
    expect(finalCheck.statusCode).toBe(404);
  });

});
