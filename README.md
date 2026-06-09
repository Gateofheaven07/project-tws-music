# SoundWave - Platform Streaming Musik Modern

SoundWave adalah platform streaming musik fullstack yang terinspirasi dari Spotify. Dibuat menggunakan Next.js (Frontend) dan Express.js (Backend), platform ini memungkinkan pengguna untuk mencari lagu, membuat playlist, menandai lagu favorit, dan memutar musik secara real-time lewat integrasi YouTube Iframe API.

## 🚀 Fitur Utama

- **Autentikasi User**: Daftar, login, dan manajemen sesi menggunakan JWT (JSON Web Token).
- **Pencarian Musik**: Integrasi dengan Deezer API untuk metadata lagu yang lengkap.
- **Playback Real-time**: Menggunakan YouTube Iframe API untuk pemutaran audio yang lancar tanpa gangguan.
- **Playlist Management**: Bikin playlist sendiri dan atur lagu-lagu kesukaanmu.
- **Lagu Favorit**: Simpan lagu yang kamu suka dengan satu klik (ikon hati).
- **Riwayat Putar**: Catat otomatis lagu-lagu yang baru saja kamu dengar.
- **User Interface Premium**: Desain dark mode yang elegan, responsif, dan animasi halus ala Spotify.

## 🛠️ Stack Teknologi

### Monorepo Structure

Proyek ini menggunakan struktur monorepo agar pengembangan frontend dan backend bisa dilakukan secara bersamaan dengan mudah.

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Lucide React, Zustand (State Management), TanStack Query (Data Fetching).
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL (Neon).
- **Auth**: JWT (jsonwebtoken), bcryptjs.
- **APIs**: Deezer API (Metadata), YouTube Data API v3 (Playback).

## 📁 Struktur Proyek

```text
project-tws/
├── backend/                # Server Express.js
│   ├── src/
│   │   ├── controllers/    # Logika API (Auth, Music, Playlist, etc.)
│   │   ├── services/       # Integrasi API Eksternal (Deezer, YouTube)
│   │   ├── routes/         # Definisi Endpoint
│   │   ├── middlewares/    # Proteksi Auth & Error Handling
│   │   └── prisma/         # Database Schema
├── frontend/               # Aplikasi Next.js
│   ├── app/                # Halaman (Discover, Favorites, Playlists)
│   ├── components/         # UI Components (PlayerBar, Sidebar, etc.)
│   ├── hooks/              # Custom Hooks (useAuth, useMusic)
│   ├── store/              # Zustand Stores
│   └── lib/                # API Client (Axios Interceptor)
└── package.json            # Root config (Concurrently)
```

## 🏁 Cara Menjalankan

### 1. Persiapan Database & API

- Siapkan database PostgreSQL (disarankan pake Neon.tech).
- Dapatkan `YOUTUBE_API_KEY` dari Google Cloud Console.

### 2. Setup Environment Variables

Buat file `.env` di folder `backend/`:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="rahasia_banget"
YOUTUBE_API_KEY="AIza..."
```

Buat file `.env` di folder `frontend/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 3. Install & Jalankan

Jalankan perintah ini di root directory:

```bash
# Install semua dependencies
npm install

# Jalankan frontend & backend sekaligus
npm run dev
```

Frontend akan jalan di `http://localhost:3000` dan Backend di `http://localhost:5000`.

## 📝 Catatan Implementasi

- Kode ini menggunakan **Indonesian Comments** agar lebih mudah dipahami oleh pengembang lokal.
- Menggunakan **YouTube Iframe API** yang disembunyikan untuk menangani playback audio saja, sehingga tampilan tetap bersih.
- Data fetching di frontend diproteksi oleh **Axios Interceptors** yang otomatis menyisipkan token JWT.

---
