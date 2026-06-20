# Visualisasi Diagram Sistem — SoundWave

Dokumen ini berisi seluruh diagram perancangan sistem aplikasi **SoundWave** (music streaming platform).
Seluruh diagram ditulis menggunakan sintaks **Mermaid** sehingga dapat dirender langsung di GitHub, VS Code (ekstensi Markdown Preview Mermaid), maupun editor Markdown lain yang mendukung Mermaid.

**Tech Stack:** Next.js 16 / React 19 (Frontend) · Express.js · TypeScript · Prisma ORM · PostgreSQL · JWT · Google OAuth · Deezer/YouTube API · Vercel

---

## Daftar Isi
1. [Use Case Diagram](#1-use-case-diagram)
2. [Entity Relationship Diagram (ERD)](#2-entity-relationship-diagram-erd)
3. [Logical Record Structure (LRS)](#3-logical-record-structure-lrs)
4. [Class Diagram](#4-class-diagram)
5. [Arsitektur Sistem (System Architecture)](#5-arsitektur-sistem-system-architecture)
6. [Component Diagram](#6-component-diagram)
7. [Deployment Diagram](#7-deployment-diagram)
8. [Sequence Diagram](#8-sequence-diagram)
9. [Activity Diagram](#9-activity-diagram)
10. [Data Flow Diagram (DFD)](#10-data-flow-diagram-dfd)
11. [Arsitektur Full-Stack (FE · BE · API · DB)](#11-arsitektur-full-stack-fe--be--api--db)
12. [Sequence Diagram End-to-End (Alur Pemakaian Web Lengkap)](#12-sequence-diagram-end-to-end-alur-pemakaian-web-lengkap)

---

## 1. Use Case Diagram

Aktor: **Guest** (tanpa login), **User**, **Admin**, **Super Admin**. Relasi pewarisan menunjukkan setiap aktor di atasnya mewarisi kemampuan aktor di bawahnya.

```mermaid
flowchart LR
    Guest([Guest])
    User([User])
    Admin([Admin])
    SuperAdmin([Super Admin])

    %% Pewarisan aktor
    User -. inherits .-> Guest
    Admin -. inherits .-> User
    SuperAdmin -. inherits .-> Admin

    subgraph PUBLIC[" Akses Publik "]
        UC1((Register))
        UC2((Login))
        UC3((Login via Google))
        UC4((Cari Musik))
        UC5((Lihat Trending))
        UC6((Lihat Genre))
        UC7((Lihat Review Publik))
    end

    subgraph USERZONE[" Fitur User Terautentikasi "]
        UC8((Kelola Profil))
        UC9((Kelola Playlist))
        UC10((Like / Unlike Lagu))
        UC11((Riwayat Putar))
        UC12((Rekomendasi Musik))
        UC13((Stream Lagu))
        UC14((Kirim / Ubah Review))
    end

    subgraph ADMINZONE[" Fitur Admin "]
        UC15((Lihat Dashboard & Statistik))
        UC16((Kelola User))
        UC17((Moderasi Review))
        UC18((Lihat Analitik))
    end

    subgraph SUPERZONE[" Fitur Super Admin "]
        UC19((Ubah Role User))
        UC20((Kelola Akun Admin))
        UC21((Cek System Health))
    end

    Guest --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7
    User --> UC8 & UC9 & UC10 & UC11 & UC12 & UC13 & UC14
    Admin --> UC15 & UC16 & UC17 & UC18
    SuperAdmin --> UC19 & UC20 & UC21
```

**Catatan relasi `<<include>>`:**
- `Kelola Playlist` meng-*include* `Tambah Lagu ke Playlist` dan `Hapus Lagu dari Playlist`.
- `Stream Lagu` meng-*include* `Riwayat Putar` (setiap pemutaran dicatat).
- `Moderasi Review` meng-*include* `Balas Review` dan `Hapus Review`.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ PLAYLIST : "membuat"
    USER ||--o{ LIKED_SONG : "menyukai"
    USER ||--o{ PLAY_HISTORY : "memutar"
    USER ||--o| APP_REVIEW : "menulis"
    PLAYLIST ||--o{ PLAYLIST_SONG : "berisi"
    SONG ||--o{ PLAY_HISTORY : "tercatat di"

    USER {
        string id PK "cuid"
        string email UK
        string username UK
        string password "nullable"
        string googleId UK "nullable"
        string authProvider "default local"
        enum   role "USER|ADMIN|SUPER_ADMIN"
        string avatar "nullable"
        datetime createdAt
        datetime updatedAt
    }

    SONG {
        string id PK "cuid"
        string title
        string artist
        string album "nullable"
        int    duration "detik"
        string deezerUrl UK "nullable"
        string youtubeUrl UK "nullable"
        string thumbnail "nullable"
        string genre "nullable"
        datetime releaseDate "nullable"
        datetime createdAt
        datetime updatedAt
    }

    PLAYLIST {
        string id PK "cuid"
        string userId FK
        string name
        string description "nullable"
        boolean isPublic "default false"
        string thumbnail "nullable"
        datetime createdAt
        datetime updatedAt
    }

    PLAYLIST_SONG {
        string id PK "cuid"
        string playlistId FK
        string musicId
        string title
        string artist
        string cover
        int    duration
        string videoId "nullable"
        datetime addedAt
    }

    LIKED_SONG {
        string id PK "cuid"
        string userId FK
        string musicId
        string title
        string artist
        string cover
        int    duration
        string videoId "nullable"
        string genre "nullable"
        datetime createdAt
    }

    PLAY_HISTORY {
        string id PK "cuid"
        string userId FK
        string songId FK
        datetime playedAt
    }

    APP_REVIEW {
        string id PK "cuid"
        string userId FK,UK
        int    rating
        string review
        string adminReply "nullable"
        datetime repliedAt "nullable"
        datetime createdAt
        datetime updatedAt
    }
```

**Kardinalitas:**
| Relasi | Tipe | Keterangan |
|--------|------|------------|
| User – Playlist | 1 : N | Satu user punya banyak playlist |
| User – LikedSong | 1 : N | Satu user menyukai banyak lagu |
| User – PlayHistory | 1 : N | Satu user punya banyak riwayat |
| User – AppReview | 1 : 1 | Satu user satu review (userId unik) |
| Playlist – PlaylistSong | 1 : N | Satu playlist berisi banyak lagu |
| Song – PlayHistory | 1 : N | Satu lagu tercatat di banyak riwayat |

*Constraint unik gabungan:* `PlaylistSong(playlistId, musicId)` dan `LikedSong(userId, musicId)`.

---

## 3. Logical Record Structure (LRS)

LRS menggambarkan struktur record logis hasil transformasi ERD ke tabel relasional, lengkap dengan Primary Key (PK) dan Foreign Key (FK). Tanda panah menunjukkan arah referensi FK.

```mermaid
flowchart TB
    USER["<b>users</b><br/>───────────────<br/>🔑 id (PK)<br/>email (UK)<br/>username (UK)<br/>password<br/>googleId (UK)<br/>authProvider<br/>role<br/>avatar<br/>createdAt<br/>updatedAt"]

    SONG["<b>songs</b><br/>───────────────<br/>🔑 id (PK)<br/>title<br/>artist<br/>album<br/>duration<br/>deezerUrl (UK)<br/>youtubeUrl (UK)<br/>thumbnail<br/>genre<br/>releaseDate"]

    PLAYLIST["<b>playlists</b><br/>───────────────<br/>🔑 id (PK)<br/>🔗 userId (FK)<br/>name<br/>description<br/>isPublic<br/>thumbnail<br/>createdAt"]

    PSONG["<b>playlist_songs</b><br/>───────────────<br/>🔑 id (PK)<br/>🔗 playlistId (FK)<br/>musicId<br/>title<br/>artist<br/>cover<br/>duration<br/>videoId<br/>UK(playlistId,musicId)"]

    LIKED["<b>liked_songs</b><br/>───────────────<br/>🔑 id (PK)<br/>🔗 userId (FK)<br/>musicId<br/>title<br/>artist<br/>cover<br/>duration<br/>videoId<br/>genre<br/>UK(userId,musicId)"]

    HISTORY["<b>play_history</b><br/>───────────────<br/>🔑 id (PK)<br/>🔗 userId (FK)<br/>🔗 songId (FK)<br/>playedAt"]

    REVIEW["<b>app_reviews</b><br/>───────────────<br/>🔑 id (PK)<br/>🔗 userId (FK, UK)<br/>rating<br/>review<br/>adminReply<br/>repliedAt<br/>createdAt"]

    PLAYLIST -->|userId| USER
    PSONG -->|playlistId| PLAYLIST
    LIKED -->|userId| USER
    HISTORY -->|userId| USER
    HISTORY -->|songId| SONG
    REVIEW -->|userId| USER
```

---

## 4. Class Diagram

Struktur kelas mengikuti pola arsitektur MVC (Routes → Controller → Service → Prisma Model).

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String username
        +String password
        +String googleId
        +Role role
        +String avatar
        +playlists() Playlist[]
        +likedSongs() LikedSong[]
        +playHistory() PlayHistory[]
    }
    class Playlist {
        +String id
        +String userId
        +String name
        +Boolean isPublic
        +songs() PlaylistSong[]
    }
    class PlaylistSong {
        +String id
        +String playlistId
        +String musicId
        +Int duration
    }
    class LikedSong {
        +String id
        +String userId
        +String musicId
        +String genre
    }
    class Song {
        +String id
        +String title
        +String artist
        +Int duration
    }
    class PlayHistory {
        +String id
        +String userId
        +String songId
        +DateTime playedAt
    }
    class AppReview {
        +String id
        +String userId
        +Int rating
        +String review
        +String adminReply
    }
    class Role {
        <<enumeration>>
        USER
        ADMIN
        SUPER_ADMIN
    }

    User "1" --> "*" Playlist
    User "1" --> "*" LikedSong
    User "1" --> "*" PlayHistory
    User "1" --> "0..1" AppReview
    User --> Role
    Playlist "1" --> "*" PlaylistSong
    Song "1" --> "*" PlayHistory
```

---

## 5. Arsitektur Sistem (System Architecture)

Arsitektur 3-tier dengan integrasi layanan musik eksternal.

```mermaid
flowchart TB
    subgraph CLIENT["🖥️ Client Layer"]
        WEB[Web App / SPA]
    end

    subgraph API["⚙️ Application Layer — Express.js (Vercel)"]
        direction TB
        ROUTES[Routes / API Endpoints]
        subgraph MW[Middlewares]
            AUTHMW[JWT Auth]
            ADMINMW[Admin RBAC]
            UPLOAD[Multer Upload]
        end
        CTRL[Controllers]
        SVC[Services / Business Logic]
        LIB[Lib: JWT · bcrypt · Zod · Logger]
    end

    subgraph DATA["🗄️ Data Layer"]
        PRISMA[Prisma ORM]
        DB[(PostgreSQL)]
    end

    subgraph EXT["🌐 External Services"]
        DEEZER[Deezer API]
        YT[YouTube API]
        GOOGLE[Google OAuth]
    end

    WEB -->|HTTPS / REST + JWT| ROUTES
    ROUTES --> MW --> CTRL --> SVC
    SVC --> LIB
    SVC --> PRISMA --> DB
    SVC -->|cari & metadata lagu| DEEZER
    SVC -->|stream id| YT
    CTRL -->|OAuth flow| GOOGLE
```

---

## 6. Component Diagram

```mermaid
flowchart LR
    subgraph App[Backend Modules]
        AUTH[Auth Module]
        MUSIC[Music Module]
        PLAYLIST[Playlist Module]
        FAV[Favorites Module]
        HIST[History Module]
        PROFILE[Profile Module]
        REVIEW[Review Module]
        ADMIN[Admin Module]
    end

    DB[(PostgreSQL)]
    EXT[External Music APIs]
    OAUTH[Google OAuth]

    AUTH --> DB
    AUTH --> OAUTH
    MUSIC --> EXT
    PLAYLIST --> DB
    FAV --> DB
    HIST --> DB
    PROFILE --> DB
    REVIEW --> DB
    ADMIN --> DB

    ADMIN -.RBAC.-> AUTH
    PLAYLIST -.uses.-> MUSIC
    FAV -.uses.-> MUSIC
```

---

## 7. Deployment Diagram

```mermaid
flowchart TB
    subgraph USERNODE["👤 Client Device"]
        BROWSER[Web Browser]
    end

    subgraph VERCEL["☁️ Vercel (Serverless)"]
        NODE[Node.js Runtime<br/>Express API]
    end

    subgraph DBHOST["🗄️ Managed PostgreSQL"]
        PG[(PostgreSQL Database)]
    end

    subgraph CLOUD["🌐 Third-Party Cloud"]
        DEEZER[Deezer API]
        YT[YouTube]
        GAUTH[Google OAuth 2.0]
    end

    BROWSER -->|HTTPS 443| NODE
    NODE -->|TCP 5432 / SSL| PG
    NODE -->|HTTPS| DEEZER
    NODE -->|HTTPS| YT
    NODE -->|HTTPS| GAUTH
```

---

## 8. Sequence Diagram

### 8.1 Login (Local Authentication)

```mermaid
sequenceDiagram
    actor U as User
    participant R as Routes
    participant C as AuthController
    participant S as AuthService
    participant DB as Prisma/PostgreSQL

    U->>R: POST /api/auth/login {email, password}
    R->>C: login()
    C->>S: validateCredentials(email, password)
    S->>DB: findUnique(email)
    DB-->>S: user record
    S->>S: bcrypt.compare(password)
    alt Password valid
        S->>S: generateJWT(user)
        S-->>C: { token, user }
        C-->>U: 200 OK { token, user }
    else Password invalid
        S-->>C: error
        C-->>U: 401 Unauthorized
    end
```

### 8.2 Tambah Lagu ke Playlist

```mermaid
sequenceDiagram
    actor U as User
    participant MW as JWT Middleware
    participant C as PlaylistController
    participant S as PlaylistService
    participant DB as PostgreSQL

    U->>MW: POST /api/playlists/:id/songs {musicId,...}
    MW->>MW: verify JWT
    MW->>C: addSong()
    C->>S: addSongToPlaylist(playlistId, song)
    S->>DB: cek ownership playlist
    DB-->>S: playlist
    S->>DB: create PlaylistSong (unique playlistId+musicId)
    alt Lagu belum ada
        DB-->>S: created
        S-->>U: 201 Created
    else Lagu sudah ada
        DB-->>S: unique violation
        S-->>U: 409 Conflict
    end
```

### 8.3 Stream Lagu + Pencatatan Riwayat

```mermaid
sequenceDiagram
    actor U as User
    participant C as MusicController
    participant S as MusicService
    participant YT as YouTube API
    participant DB as PostgreSQL

    U->>C: GET /api/music/stream-id (JWT)
    C->>S: getStreamId(song)
    S->>YT: resolve stream id
    YT-->>S: streamId
    S->>DB: create PlayHistory(userId, songId)
    S-->>U: { streamId }
```

---

## 9. Activity Diagram

### 9.1 Registrasi & Autentikasi

```mermaid
flowchart TD
    START([Mulai]) --> CHOICE{Metode Daftar?}
    CHOICE -->|Email/Password| FORM[Isi form register]
    CHOICE -->|Google| GOAUTH[Redirect Google OAuth]

    FORM --> VALIDATE{Validasi Zod & email/username unik?}
    VALIDATE -->|Tidak| ERR[Tampilkan error] --> FORM
    VALIDATE -->|Ya| HASH[Hash password bcrypt]
    HASH --> CREATE[Buat User role=USER]

    GOAUTH --> CALLBACK[Callback Google]
    CALLBACK --> EXIST{User googleId ada?}
    EXIST -->|Ya| LOADUSER[Ambil user]
    EXIST -->|Tidak| CREATEG[Buat User authProvider=google]
    CREATEG --> LOADUSER

    CREATE --> JWT[Generate JWT]
    LOADUSER --> JWT
    JWT --> DONE([Selesai - User login])
```

### 9.2 Moderasi Review oleh Admin

```mermaid
flowchart TD
    A([Admin login]) --> B[Buka daftar review]
    B --> C{Aksi?}
    C -->|Balas| D[Tulis adminReply] --> E[Update review + repliedAt] --> F([Selesai])
    C -->|Hapus| G[Konfirmasi hapus] --> H[Delete review] --> F
    C -->|Abaikan| F
```

---

## 10. Data Flow Diagram (DFD)

### Context Diagram (Level 0)

```mermaid
flowchart LR
    USER([User]) -->|kredensial, request musik| SYS((Sistem SoundWave))
    ADMIN([Admin]) -->|kelola user & review| SYS
    SYS -->|hasil pencarian, playlist, token| USER
    SYS -->|statistik & laporan| ADMIN
    MUSICAPI([Deezer / YouTube]) -->|metadata & stream| SYS
    SYS -->|query pencarian| MUSICAPI
    GOOGLE([Google OAuth]) -->|profil OAuth| SYS
```

### DFD Level 1

```mermaid
flowchart TB
    USER([User])
    ADMIN([Admin])

    P1((1.0 Autentikasi))
    P2((2.0 Manajemen Musik))
    P3((3.0 Playlist & Favorit))
    P4((4.0 Riwayat & Rekomendasi))
    P5((5.0 Review))
    P6((6.0 Admin & Analitik))

    D1[(users)]
    D2[(playlists / playlist_songs)]
    D3[(liked_songs)]
    D4[(play_history / songs)]
    D5[(app_reviews)]

    USER --> P1 --> D1
    USER --> P2
    USER --> P3 --> D2
    P3 --> D3
    USER --> P4 --> D4
    USER --> P5 --> D5
    ADMIN --> P6
    P6 --> D1
    P6 --> D5
    P6 --> D4
```

---

## 11. Arsitektur Full-Stack (FE · BE · API · DB)

Diagram arsitektur teknologi nyata yang digunakan: **Frontend** (Next.js/React), **Backend** (Express REST API), **Database** (PostgreSQL via Prisma), serta **layanan eksternal** (Deezer, YouTube, Google OAuth). Warna menandai tiap layer.

```mermaid
flowchart TB
    subgraph CLIENT["FRONTEND - Next.js 16 / React 19 (Vercel)"]
        direction TB
        PAGES["App Router Pages<br/>landing, auth, discover,<br/>playlists, favorites, profile, admin"]
        STORES["State - Zustand<br/>authStore, playerStore, musicStore"]
        QUERY["Data Layer<br/>TanStack Query + SWR"]
        UI["UI - Radix UI + Tailwind + Framer Motion"]
        YTPLAYER["YouTube Iframe Player<br/>(headless audio)"]
        APICLIENT["Axios Instance lib/api.ts<br/>+ Bearer token interceptor"]
    end

    subgraph BACKEND["BACKEND - Express.js + TypeScript (Vercel)"]
        direction TB
        ROUTES["REST API Routes - /api/*"]
        MW["Middlewares<br/>JWT Auth, Admin RBAC, Multer"]
        CTRL["Controllers"]
        SVC["Services - Business Logic"]
        LIB["Lib: JWT, bcrypt, Zod, Logger"]
        PRISMA["Prisma ORM"]
    end

    DB[("PostgreSQL<br/>(Managed)")]

    subgraph EXT["EXTERNAL SERVICES"]
        DEEZER["Deezer API<br/>(search & metadata)"]
        YT["YouTube API<br/>(stream id)"]
        GOOGLE["Google OAuth 2.0"]
    end

    PAGES --> STORES
    PAGES --> QUERY
    PAGES --> UI
    STORES --> YTPLAYER
    QUERY --> APICLIENT
    STORES --> APICLIENT

    APICLIENT -->|"HTTPS REST + JWT"| ROUTES
    YTPLAYER -->|"embed videoId"| YT

    ROUTES --> MW --> CTRL --> SVC
    SVC --> LIB
    SVC --> PRISMA --> DB
    SVC -->|"cari lagu"| DEEZER
    SVC -->|"resolve stream"| YT
    CTRL -->|"OAuth flow"| GOOGLE

    classDef fe fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    classDef be fill:#dcfce7,stroke:#22c55e,color:#14532d
    classDef ext fill:#fef9c3,stroke:#eab308,color:#713f12
    classDef db fill:#fae8ff,stroke:#a855f7,color:#581c87
    class PAGES,STORES,QUERY,UI,YTPLAYER,APICLIENT fe
    class ROUTES,MW,CTRL,SVC,LIB,PRISMA be
    class DEEZER,YT,GOOGLE ext
    class DB db
```

| Layer | Teknologi | Tanggung Jawab |
|-------|-----------|----------------|
| **Frontend (FE)** | Next.js 16, React 19, Zustand, TanStack Query, Radix UI, Tailwind | UI, state management, pemutar audio (YouTube iframe), pemanggilan API |
| **API / Backend (BE)** | Express.js, TypeScript, JWT, Zod | REST endpoint, autentikasi, RBAC, validasi, business logic |
| **Data** | Prisma ORM + PostgreSQL | Persistensi user, playlist, favorit, riwayat, review |
| **External** | Deezer, YouTube, Google OAuth | Metadata lagu, streaming audio, login pihak ketiga |

---

## 12. Sequence Diagram End-to-End (Alur Pemakaian Web Lengkap)

Alur lengkap seorang **User** menggunakan web dari awal (buka situs) hingga akhir (logout): autentikasi → cari musik → putar lagu → like & playlist → rekomendasi → review → logout.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend (Next.js)
    participant ST as Zustand Store
    participant API as Backend API (Express)
    participant DB as PostgreSQL
    participant DZ as Deezer API
    participant YT as YouTube
    participant GO as Google OAuth

    Note over U,FE: 1. Membuka Aplikasi
    U->>FE: Buka situs (landing page)
    FE-->>U: Tampilkan landing page (publik)

    Note over U,GO: 2. Autentikasi
    alt Login Email/Password
        U->>FE: Isi form login & submit
        FE->>API: POST /api/auth/login {email, password}
        API->>DB: findUnique(email)
        DB-->>API: user record
        API->>API: bcrypt.compare + generateJWT
        API-->>FE: { token, user }
    else Login dengan Google
        U->>FE: Klik "Login with Google"
        FE->>API: GET /api/auth/google
        API->>GO: Redirect OAuth consent
        GO-->>API: callback (profil google)
        API->>DB: upsert user (googleId)
        DB-->>API: user
        API-->>FE: { token, user }
    end
    FE->>ST: simpan token & user (persist localStorage)
    FE-->>U: Redirect ke Home / Dashboard

    Note over U,DZ: 3. Mencari & Menjelajah Musik
    U->>FE: Ketik kata kunci di search
    FE->>API: GET /api/music/search?q=...
    API->>DZ: cari lagu
    DZ-->>API: daftar lagu + metadata
    API-->>FE: hasil pencarian
    FE-->>U: Tampilkan daftar lagu

    Note over U,YT: 4. Memutar Lagu
    U->>FE: Klik lagu untuk diputar
    FE->>ST: set currentSong
    alt videoId belum ada
        FE->>API: GET /api/music/stream-id (JWT)
        API->>YT: resolve stream by artist+title
        YT-->>API: videoId
        API->>DB: create PlayHistory(userId, songId)
        API-->>FE: { videoId }
    end
    FE->>YT: player.loadVideoById(videoId)
    YT-->>U: Audio diputar (player bar)

    Note over U,DB: 5. Like / Tambah ke Playlist
    U->>FE: Klik tombol Like
    FE->>API: POST /api/liked-songs {musicId} (JWT)
    API->>DB: create LikedSong (unique userId+musicId)
    DB-->>API: created
    API-->>FE: 201 Created
    U->>FE: Tambah lagu ke playlist
    FE->>API: POST /api/playlists/:id/songs (JWT)
    API->>DB: create PlaylistSong
    DB-->>API: created
    API-->>FE: 201 Created
    FE-->>U: Notifikasi sukses (toast)

    Note over U,DB: 6. Rekomendasi & Riwayat
    U->>FE: Buka halaman Discover
    FE->>API: GET /api/music/recommendations (JWT)
    API->>DB: ambil genre favorit user
    DB-->>API: genre
    API->>DZ: cari lagu berdasarkan genre
    DZ-->>API: rekomendasi
    API-->>FE: daftar rekomendasi
    FE-->>U: Tampilkan rekomendasi

    Note over U,DB: 7. Memberi Review
    U->>FE: Isi rating & review aplikasi
    FE->>API: PUT /api/reviews/me {rating, review} (JWT)
    API->>DB: upsert AppReview (userId unik)
    DB-->>API: saved
    API-->>FE: 200 OK

    Note over U,FE: 8. Logout
    U->>FE: Klik Logout
    FE->>API: POST /api/auth/logout (JWT)
    API-->>FE: 200 OK
    FE->>ST: hapus token & user
    FE-->>U: Kembali ke landing page
```

---

> **Cara render:** buka file ini di VS Code dengan ekstensi *Markdown Preview Mermaid Support*, atau langsung di GitHub. Untuk mengekspor ke gambar, gunakan [Mermaid Live Editor](https://mermaid.live) dengan menyalin tiap blok ```mermaid```. Versi gambar PNG siap-pakai tersedia di folder [diagrams/png/](diagrams/png/).
