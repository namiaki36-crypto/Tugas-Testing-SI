const express = require('express');
const app = express();
app.use(express.json());

// =============================================
// MINI PERPUSTAKAAN DIGITAL - SIFS124603
// =============================================

// In-memory database
let books = [
  { id: 1, title: 'Pemrograman Web dengan Node.js', author: 'Budi Santoso', year: 2022, stock: 3, borrowed: false },
  { id: 2, title: 'Algoritma dan Struktur Data', author: 'Dewi Rahayu', year: 2021, stock: 5, borrowed: false },
  { id: 3, title: 'Basis Data Relasional', author: 'Ahmad Fauzi', year: 2020, stock: 2, borrowed: false },
];
let nextId = 4;

let borrowRecords = [];
let nextBorrowId = 1;

// ---- Utility: reset state (untuk testing) ----
const resetData = () => {
  books = [
    { id: 1, title: 'Pemrograman Web dengan Node.js', author: 'Budi Santoso', year: 2022, stock: 3, borrowed: false },
    { id: 2, title: 'Algoritma dan Struktur Data', author: 'Dewi Rahayu', year: 2021, stock: 5, borrowed: false },
    { id: 3, title: 'Basis Data Relasional', author: 'Ahmad Fauzi', year: 2020, stock: 2, borrowed: false },
  ];
  nextId = 4;
  borrowRecords = [];
  nextBorrowId = 1;
};

// =============================================
// ROUTES - BUKU
// =============================================

// GET /books - Ambil semua buku
app.get('/books', (req, res) => {
  const { search } = req.query;
  if (search) {
    const filtered = books.filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    );
    return res.json({ success: true, data: filtered, total: filtered.length });
  }
  res.json({ success: true, data: books, total: books.length });
});

// GET /books/:id - Ambil buku berdasarkan ID
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  res.json({ success: true, data: book });
});

// POST /books - Tambah buku baru
app.post('/books', (req, res) => {
  const { title, author, year, stock } = req.body;
  if (!title || !author || !year) {
    return res.status(400).json({ success: false, message: 'Title, author, dan year wajib diisi' });
  }
  if (typeof year !== 'number' || year < 1900 || year > new Date().getFullYear()) {
    return res.status(400).json({ success: false, message: 'Tahun tidak valid' });
  }
  const duplicate = books.find(b => b.title.toLowerCase() === title.toLowerCase() && b.author.toLowerCase() === author.toLowerCase());
  if (duplicate) {
    return res.status(409).json({ success: false, message: 'Buku dengan judul dan penulis yang sama sudah ada' });
  }
  const newBook = { id: nextId++, title, author, year, stock: stock || 1, borrowed: false };
  books.push(newBook);
  res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', data: newBook });
});

// PUT /books/:id - Update buku
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  books[index] = { ...books[index], ...req.body, id };
  res.json({ success: true, message: 'Buku berhasil diperbarui', data: books[index] });
});

// DELETE /books/:id - Hapus buku
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  const isBorrowed = borrowRecords.find(r => r.bookId === id && !r.returnedAt);
  if (isBorrowed) return res.status(400).json({ success: false, message: 'Buku sedang dipinjam, tidak bisa dihapus' });
  const deleted = books.splice(index, 1);
  res.json({ success: true, message: 'Buku berhasil dihapus', data: deleted[0] });
});

// =============================================
// ROUTES - PEMINJAMAN
// =============================================

// POST /borrow - Pinjam buku
app.post('/borrow', (req, res) => {
  const { bookId, borrowerName } = req.body;
  if (!bookId || !borrowerName) {
    return res.status(400).json({ success: false, message: 'bookId dan borrowerName wajib diisi' });
  }
  const book = books.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
  if (book.stock <= 0) {
    return res.status(400).json({ success: false, message: 'Stok buku habis, tidak bisa dipinjam' });
  }
  book.stock -= 1;
  const record = {
    id: nextBorrowId++,
    bookId,
    bookTitle: book.title,
    borrowerName,
    borrowedAt: new Date().toISOString(),
    returnedAt: null,
  };
  borrowRecords.push(record);
  res.status(201).json({ success: true, message: 'Peminjaman berhasil', data: record });
});

// POST /return - Kembalikan buku
app.post('/return', (req, res) => {
  const { borrowId } = req.body;
  if (!borrowId) return res.status(400).json({ success: false, message: 'borrowId wajib diisi' });
  const record = borrowRecords.find(r => r.id === borrowId);
  if (!record) return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
  if (record.returnedAt) return res.status(400).json({ success: false, message: 'Buku sudah dikembalikan sebelumnya' });
  record.returnedAt = new Date().toISOString();
  const book = books.find(b => b.id === record.bookId);
  if (book) book.stock += 1;
  res.json({ success: true, message: 'Pengembalian buku berhasil', data: record });
});

// GET /borrow/history - Riwayat peminjaman
app.get('/borrow/history', (req, res) => {
  res.json({ success: true, data: borrowRecords, total: borrowRecords.length });
});

// =============================================
// UTILITY ROUTES
// =============================================

// GET /stats - Statistik perpustakaan
app.get('/stats', (req, res) => {
  const totalBooks = books.length;
  const totalStock = books.reduce((sum, b) => sum + b.stock, 0);
  const activeBorrows = borrowRecords.filter(r => !r.returnedAt).length;
  const totalBorrows = borrowRecords.length;
  res.json({
    success: true,
    data: { totalBooks, totalStock, activeBorrows, totalBorrows }
  });
});

module.exports = { app, resetData };
