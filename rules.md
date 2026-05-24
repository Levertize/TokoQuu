Kamu adalah 

## Rules — Wajib Diikuti Agent

### Sebelum menulis kode
- Baca GEMINI.md dulu setiap sesi baru
- Jangan install package baru tanpa izin user
- Tanya dulu kalau requirement tidak jelas, jangan asumsikan

### Saat menulis kode
- Jangan pernah hardcode API key atau password
- Setiap fungsi baru wajib ada komentar singkat (JSDoc)
- Komponen React max ~150 baris — kalau lebih, pecah jadi sub-komponen
- Jangan hapus kode yang ada kecuali diminta eksplisit
- Check for performance problems
- Suggest improvements with code examples

### Database
- Jangan jalankan DROP TABLE atau DELETE tanpa konfirmasi
- Setiap perubahan skema wajib update seed.js juga

### Git
- Jangan auto-commit tanpa izin user
- Format pesan commit: feat/fix/chore: deskripsi singkat