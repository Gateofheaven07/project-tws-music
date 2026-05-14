Buat sebuah website music player modern fullstack bernama “SoundWave” dengan konsep seperti Spotify modern menggunakan teknologi berikut:

Frontend:

* Next.js App Router
* React
* Tailwind CSS
* Framer Motion
* TypeScript

Backend:

* Express.js
* RESTful API Architecture
* JWT Authentication
* Prisma ORM
* PostgreSQL Neon Database

External APIs:

* Deezer API → metadata lagu (title, artist, album, cover)
* YouTube API / YouTube Iframe API → playback audio full music

Tujuan website:
Membuat platform music player modern yang dapat mencari lagu populer dan memutar audio secara realtime dengan UI modern seperti Spotify.

Fitur utama:

1. Authentication

* Register
* Login
* JWT access token
* Protected routes
* Middleware auth
* Logout

2. Music Features

* Search lagu realtime
* Trending songs
* Featured playlists
* Recently played
* Favorite songs
* Queue music
* Music detail page
* Artist page
* Album page

3. Music Player

* Play/Pause
* Next/Previous
* Progress bar
* Duration
* Volume control
* Repeat
* Shuffle
* Mini player fixed bottom
* Full responsive player

4. User Features

* User profile
* Favorite playlist
* History music
* Save playlist
* Like songs

5. UI/UX

* Spotify-like dark UI
* Smooth animation
* Glassmorphism
* Gradient modern design
* Responsive mobile & desktop
* Skeleton loading
* Toast notification
* Sidebar navigation
* Floating music player

6. Backend REST API
   Backend Express bertugas:

* menerima request frontend
* mengakses Deezer API
* mengakses YouTube API
* menggabungkan response menjadi satu JSON
* mengelola authentication
* mengelola database

Contoh flow:
Frontend → Express API → Deezer API + YouTube API → JSON Response → Frontend

Gunakan:

* axios
* bcryptjs
* jsonwebtoken
* cors
* dotenv
* zod validation
* react-query / tanstack query

Database menggunakan:

* Neon PostgreSQL
* Prisma ORM

Buat schema database lengkap:

* users
* playlists
* favorites
* recently_played
* songs_cache
* history

Tambahkan relasi Prisma yang benar.

Gunakan struktur folder professional dan scalable.

Buat struktur folder lengkap seperti project production modern.

Frontend structure:
frontend/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── store/
├── types/
├── utils/
├── styles/
├── providers/
├── middleware/

Backend structure:
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── prisma/
│   ├── utils/
│   ├── validations/
│   ├── config/
│   ├── types/
│   ├── lib/
│   └── app.ts

Buat arsitektur clean code:

* separation of concerns
* reusable components
* reusable services
* scalable architecture
* modular folder structure

Gunakan TypeScript penuh untuk frontend dan backend.

Buat RESTful API endpoint lengkap:

* /auth/register
* /auth/login
* /music/search
* /music/trending
* /playlist/create
* /favorite/add
* dll

Tambahkan:

* API response standardization
* error handling middleware
* async handler
* request validation
* loading states
* caching strategy sederhana

Gunakan environment variable:

* DATABASE_URL
* JWT_SECRET
* DEEZER_API_KEY
* YOUTUBE_API_KEY

Buat UI yang sangat modern:

* seperti Spotify + Apple Music
* neon glow
* dark mode
* rounded card
* smooth hover animation
* animated sidebar
* animated player controls

Tambahkan:

* custom audio player
* animated music card
* hover play button
* loading shimmer
* responsive grid

PENTING:

* gunakan code yang clean dan production-ready
* jangan gunakan code terlalu sederhana
* gunakan best practice modern
* gunakan naming convention professional
* gunakan reusable architecture

Terakhir:
buat dokumentasi project lengkap seperti ditulis manusia asli, bukan seperti AI atau robot.

Dokumentasi harus:

* natural
* mudah dipahami mahasiswa
* penjelasan realistis
* ada alasan pemilihan teknologi
* ada penjelasan arsitektur sistem
* ada penjelasan flow request-response
* ada penjelasan REST API
* ada penjelasan database
* ada penjelasan authentication JWT
* ada penjelasan web service
* ada penjelasan frontend dan backend

Gunakan gaya penulisan:

* santai tapi professional
* seperti laporan developer asli
* jangan terlalu formal akademik
* jangan terlalu kaku
* jangan terlalu “AI generated”

Tambahkan:

* ERD explanation
* API flow explanation
* deployment explanation
* environment setup
* cara menjalankan project
* struktur folder explanation
* future improvement

Buat project terlihat seperti startup music streaming modern.
