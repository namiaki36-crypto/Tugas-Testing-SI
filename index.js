const { app } = require('./src/app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server Perpustakaan Digital berjalan di http://localhost:${PORT}`);
  console.log(`📚 Endpoint tersedia:`);
  console.log(`   GET    /books           - Ambil semua buku`);
  console.log(`   GET    /books/:id       - Ambil buku by ID`);
  console.log(`   POST   /books           - Tambah buku baru`);
  console.log(`   PUT    /books/:id       - Update buku`);
  console.log(`   DELETE /books/:id       - Hapus buku`);
  console.log(`   POST   /borrow          - Pinjam buku`);
  console.log(`   POST   /return          - Kembalikan buku`);
  console.log(`   GET    /borrow/history  - Riwayat peminjaman`);
  console.log(`   GET    /stats           - Statistik perpustakaan`);
});
