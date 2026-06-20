# Best Practices: Deklarasi Akun Admin Menggunakan Environment Variables (.env)

Keputusan menggunakan `.env` untuk deklarasi akun admin awal dibuat karena beberapa alasan praktik terbaik (*best practices*) dalam pengembangan perangkat lunak, terutama terkait keamanan dan arsitektur database:

### 1. Keamanan Kredensial (Tidak Boleh Masuk Git)
Jika kita memasukkan email dan password Super Admin langsung ke dalam file kode (seperti di script seed atau file migrasi), kredensial tersebut akan ikut ter-commit ke **Git Repository**. Ini sangat berbahaya karena siapapun yang bisa melihat *source code* akan tahu password akun tertinggi di aplikasi Anda. 
Dengan menggunakan `.env`, file kode utama kita tetap bersih dari password. File `.env` tidak pernah di-upload ke Git (karena masuk `.gitignore`), sehingga aman.

### 2. Password Harus Di-hash (Diacak)
Kita tidak bisa langsung meng-inject akun admin lewat query SQL murni/file migrasi (`INSERT INTO users...`) karena password di aplikasi harus dienkripsi menggunakan library `bcrypt` sebelum masuk ke database. Script seed membaca dari `.env`, kemudian menggunakan fungsi *hash* internal aplikasi kita untuk mengenkripsi password tersebut sebelum menyimpannya ke tabel user.

### 3. Fleksibilitas Antar Lingkungan (Dev vs Prod)
Biasanya, akun admin di tahap *development* (lokal) dan *production* (saat aplikasi rilis) itu berbeda. 
- Di lokal, Anda mungkin ingin menggunakan `admin@localhost.com` dengan password sederhana.
- Di server *production* (seperti Vercel), Anda wajib menyetel akun email asli dan password yang sangat kuat.

Dengan menggunakan `.env`, Anda cukup mengganti isi *Environment Variables* di dashboard Vercel tanpa perlu menyentuh atau mengubah kode sumber database migrasi sama sekali.

### 4. Pemisahan Tugas (Separation of Concerns)
Secara konsep ORM, proses **Migrate / DB Push** bertugas murni untuk membangun *struktur/kerangka tabel* (misal: menambah kolom role). Sedangkan untuk memasukkan *isi data awal* (seperti pembuatan akun admin default), standar operasionalnya menggunakan proses terpisah yang dinamakan **Seeding**. 

Itulah mengapa alurnya menjadi: 
1. `prisma db push` (membuat kolom role di tabel).
2. `prisma:seed` (mengisi data Super Admin pertama membaca kredensial dari `.env`).

> **Catatan:** Seed script ini sengaja hanya membuat 1 akun (Super Admin). Nantinya, Super Admin ini bisa login ke dashboard dan mempromosikan user-user lain menjadi Admin/Super Admin langsung lewat tabel UI. Kita tidak perlu melakukan *hardcode* banyak akun sekaligus di awal.
