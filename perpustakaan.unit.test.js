/**
 * UNIT TEST - Perpustakaan Digital
 * Matkul: Testing dan Implementasi SI (SIFS124603)
 *
 * Unit test menguji logika/fungsi secara terisolasi (tanpa HTTP request).
 * Setiap fungsi diuji dengan berbagai skenario: valid, invalid, edge case.
 */

// ============================================================
// HELPER FUNCTIONS (pure functions yang akan diuji)
// ============================================================

/**
 * Validasi data buku
 */
const validateBook = (data) => {
  const errors = [];
  if (!data.title || data.title.trim() === '') errors.push('Judul buku wajib diisi');
  if (!data.author || data.author.trim() === '') errors.push('Nama penulis wajib diisi');
  if (!data.year) errors.push('Tahun terbit wajib diisi');
  if (data.year && (typeof data.year !== 'number' || data.year < 1900 || data.year > new Date().getFullYear())) {
    errors.push('Tahun tidak valid');
  }
  if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0)) {
    errors.push('Stok tidak boleh negatif');
  }
  return { valid: errors.length === 0, errors };
};

/**
 * Format nama penulis: "budi santoso" → "Budi Santoso"
 */
const formatAuthorName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name.trim().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

/**
 * Hitung status stok buku
 */
const getStockStatus = (stock) => {
  if (stock === 0) return 'habis';
  if (stock <= 2) return 'hampir habis';
  if (stock <= 5) return 'tersedia';
  return 'melimpah';
};

/**
 * Hitung denda keterlambatan pengembalian
 * @param {string} borrowedAt - ISO date string
 * @param {string} returnedAt - ISO date string
 * @param {number} maxDays - batas hari peminjaman (default 7)
 * @param {number} finePerDay - denda per hari dalam rupiah (default 1000)
 */
const calculateFine = (borrowedAt, returnedAt, maxDays = 7, finePerDay = 1000) => {
  const borrow = new Date(borrowedAt);
  const returnD = new Date(returnedAt);
  const diffMs = returnD - borrow;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const lateDays = Math.max(0, diffDays - maxDays);
  return {
    diffDays,
    lateDays,
    fine: lateDays * finePerDay,
    status: lateDays > 0 ? 'terlambat' : 'tepat waktu',
  };
};

/**
 * Cari buku berdasarkan query (search)
 */
const searchBooks = (books, query) => {
  if (!query) return books;
  const q = query.toLowerCase();
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q)
  );
};

/**
 * Urutkan buku
 */
const sortBooks = (books, sortBy = 'title', order = 'asc') => {
  return [...books].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'string') {
      return order === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return order === 'asc' ? valA - valB : valB - valA;
  });
};

// ============================================================
// UNIT TESTS
// ============================================================

describe('📚 Unit Test: validateBook()', () => {

  test('✅ Valid - data buku lengkap dan benar', () => {
    const result = validateBook({ title: 'Node.js Handbook', author: 'Andi', year: 2023, stock: 5 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('❌ Invalid - judul kosong', () => {
    const result = validateBook({ title: '', author: 'Andi', year: 2023 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Judul buku wajib diisi');
  });

  test('❌ Invalid - penulis tidak diisi', () => {
    const result = validateBook({ title: 'Buku A', year: 2022 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Nama penulis wajib diisi');
  });

  test('❌ Invalid - tahun di bawah 1900', () => {
    const result = validateBook({ title: 'Buku Kuno', author: 'Penulis', year: 1800 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Tahun tidak valid');
  });

  test('❌ Invalid - tahun di masa depan', () => {
    const result = validateBook({ title: 'Buku Masa Depan', author: 'Penulis', year: 9999 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Tahun tidak valid');
  });

  test('❌ Invalid - stok negatif', () => {
    const result = validateBook({ title: 'Buku', author: 'Penulis', year: 2022, stock: -3 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Stok tidak boleh negatif');
  });

  test('✅ Valid - tanpa stok (opsional)', () => {
    const result = validateBook({ title: 'Buku', author: 'Penulis', year: 2022 });
    expect(result.valid).toBe(true);
  });

  test('❌ Invalid - beberapa field kosong sekaligus', () => {
    const result = validateBook({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

});

// ------------------------------------------------------------

describe('✍️ Unit Test: formatAuthorName()', () => {

  test('Mengubah huruf kecil semua menjadi Title Case', () => {
    expect(formatAuthorName('budi santoso')).toBe('Budi Santoso');
  });

  test('Mengubah HURUF BESAR menjadi Title Case', () => {
    expect(formatAuthorName('DEWI RAHAYU')).toBe('Dewi Rahayu');
  });

  test('Menangani satu kata', () => {
    expect(formatAuthorName('soekarno')).toBe('Soekarno');
  });

  test('Menangani nama dengan tiga kata', () => {
    expect(formatAuthorName('ahmad budi santoso')).toBe('Ahmad Budi Santoso');
  });

  test('Menangani string kosong', () => {
    expect(formatAuthorName('')).toBe('');
  });

  test('Menangani input null', () => {
    expect(formatAuthorName(null)).toBe('');
  });

  test('Menghapus spasi berlebih di awal/akhir', () => {
    expect(formatAuthorName('  andi wijaya  ')).toBe('Andi Wijaya');
  });

});

// ------------------------------------------------------------

describe('📦 Unit Test: getStockStatus()', () => {

  test('Stok 0 → habis', () => {
    expect(getStockStatus(0)).toBe('habis');
  });

  test('Stok 1 → hampir habis', () => {
    expect(getStockStatus(1)).toBe('hampir habis');
  });

  test('Stok 2 → hampir habis', () => {
    expect(getStockStatus(2)).toBe('hampir habis');
  });

  test('Stok 3 → tersedia', () => {
    expect(getStockStatus(3)).toBe('tersedia');
  });

  test('Stok 5 → tersedia', () => {
    expect(getStockStatus(5)).toBe('tersedia');
  });

  test('Stok 10 → melimpah', () => {
    expect(getStockStatus(10)).toBe('melimpah');
  });

});

// ------------------------------------------------------------

describe('💰 Unit Test: calculateFine()', () => {

  test('Dikembalikan tepat 7 hari → denda Rp 0', () => {
    const borrowed = '2025-01-01T00:00:00.000Z';
    const returned = '2025-01-08T00:00:00.000Z';
    const result = calculateFine(borrowed, returned);
    expect(result.lateDays).toBe(0);
    expect(result.fine).toBe(0);
    expect(result.status).toBe('tepat waktu');
  });

  test('Terlambat 3 hari → denda Rp 3000', () => {
    const borrowed = '2025-01-01T00:00:00.000Z';
    const returned = '2025-01-11T00:00:00.000Z';
    const result = calculateFine(borrowed, returned);
    expect(result.lateDays).toBe(3);
    expect(result.fine).toBe(3000);
    expect(result.status).toBe('terlambat');
  });

  test('Dikembalikan sebelum 7 hari → tidak ada denda', () => {
    const borrowed = '2025-01-01T00:00:00.000Z';
    const returned = '2025-01-04T00:00:00.000Z';
    const result = calculateFine(borrowed, returned);
    expect(result.fine).toBe(0);
    expect(result.status).toBe('tepat waktu');
  });

  test('Custom maxDays dan finePerDay', () => {
    const borrowed = '2025-01-01T00:00:00.000Z';
    const returned = '2025-01-06T00:00:00.000Z';
    const result = calculateFine(borrowed, returned, 3, 2000);
    expect(result.lateDays).toBe(2);
    expect(result.fine).toBe(4000);
  });

  test('Terlambat 1 hari → denda Rp 1000', () => {
    const borrowed = '2025-05-01T00:00:00.000Z';
    const returned = '2025-05-09T00:00:00.000Z';
    const result = calculateFine(borrowed, returned);
    expect(result.lateDays).toBe(1);
    expect(result.fine).toBe(1000);
  });

});

// ------------------------------------------------------------

describe('🔍 Unit Test: searchBooks()', () => {

  const sampleBooks = [
    { id: 1, title: 'Pemrograman Web', author: 'Budi' },
    { id: 2, title: 'Algoritma Data', author: 'Dewi' },
    { id: 3, title: 'Basis Data', author: 'Ahmad' },
  ];

  test('Mencari berdasarkan judul (cocok)', () => {
    const result = searchBooks(sampleBooks, 'web');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  test('Mencari berdasarkan penulis', () => {
    const result = searchBooks(sampleBooks, 'dewi');
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('Dewi');
  });

  test('Pencarian case-insensitive', () => {
    const result = searchBooks(sampleBooks, 'DATA');
    expect(result).toHaveLength(2);
  });

  test('Query tidak ditemukan → array kosong', () => {
    const result = searchBooks(sampleBooks, 'python');
    expect(result).toHaveLength(0);
  });

  test('Query kosong → semua buku dikembalikan', () => {
    const result = searchBooks(sampleBooks, '');
    expect(result).toHaveLength(3);
  });

  test('Query null → semua buku dikembalikan', () => {
    const result = searchBooks(sampleBooks, null);
    expect(result).toHaveLength(3);
  });

});

// ------------------------------------------------------------

describe('🔀 Unit Test: sortBooks()', () => {

  const sampleBooks = [
    { id: 1, title: 'Zeta', author: 'Budi', year: 2022 },
    { id: 2, title: 'Alpha', author: 'Dewi', year: 2020 },
    { id: 3, title: 'Mango', author: 'Ahmad', year: 2023 },
  ];

  test('Urutkan berdasarkan title ascending', () => {
    const result = sortBooks(sampleBooks, 'title', 'asc');
    expect(result[0].title).toBe('Alpha');
    expect(result[2].title).toBe('Zeta');
  });

  test('Urutkan berdasarkan title descending', () => {
    const result = sortBooks(sampleBooks, 'title', 'desc');
    expect(result[0].title).toBe('Zeta');
    expect(result[2].title).toBe('Alpha');
  });

  test('Urutkan berdasarkan year ascending', () => {
    const result = sortBooks(sampleBooks, 'year', 'asc');
    expect(result[0].year).toBe(2020);
    expect(result[2].year).toBe(2023);
  });

  test('Array asli tidak berubah (immutable)', () => {
    sortBooks(sampleBooks, 'title', 'asc');
    expect(sampleBooks[0].title).toBe('Zeta');
  });

});

module.exports = { validateBook, formatAuthorName, getStockStatus, calculateFine, searchBooks, sortBooks };
