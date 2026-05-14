# SoundWave - Modern Music Player

A fullstack music streaming application inspired by Spotify, built with Next.js, React, TypeScript, and PostgreSQL.

## Features

### Core Features
- **User Authentication**: Register, login, and manage user accounts with JWT-based authentication
- **Music Discovery**: Search for songs via Deezer API with real-time results
- **Trending Songs**: Discover what's trending worldwide
- **Playlists**: Create, manage, and organize your playlists
- **Favorites**: Like and save your favorite songs
- **Music Player**: Full-featured music player with play/pause, skip, volume control
- **Queue Management**: Queue management with repeat and shuffle modes

### Design
- **Spotify-Inspired Dark Theme**: Professional dark UI with green accent colors (#1ed760)
- **Responsive Layout**: Mobile-first design with responsive breakpoints
- **Smooth Animations**: Polished transitions and hover effects
- **Modern Components**: Built with Radix UI and Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19 with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Data Fetching**: axios, SWR
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **API Integration**: Deezer API (no auth required)

### DevTools
- **Language**: TypeScript 5.7
- **Package Manager**: pnpm
- **Linting**: ESLint

## Project Structure

```
soundwave/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── music/             # Music search & trending
│   │   ├── playlists/         # Playlist CRUD operations
│   │   └── favorites/         # Favorite songs management
│   ├── auth/                  # Auth pages (login, register)
│   ├── discover/              # Music discovery page
│   ├── favorites/             # Favorites page
│   ├── playlists/             # Playlists management
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
│
├── components/
│   ├── Sidebar.tsx            # Sidebar navigation
│   ├── Header.tsx             # Header with search
│   ├── PlayerBar.tsx          # Music player controls
│   └── MusicCard.tsx          # Music card component
│
├── lib/
│   ├── auth/
│   │   ├── jwt.ts             # JWT token handling
│   │   ├── password.ts        # Password hashing
│   │   └── middleware.ts      # Auth middleware
│   ├── api/
│   │   ├── constants.ts       # API constants
│   │   └── response.ts        # Response helpers
│   ├── music/
│   │   └── service.ts         # Music search service
│   ├── prisma.ts              # Prisma client
│   └── utils.ts               # Utility functions
│
├── store/
│   ├── authStore.ts           # Auth state (Zustand)
│   ├── playerStore.ts         # Player state
│   └── musicStore.ts          # Music discovery state
│
├── hooks/
│   ├── useAuth.ts             # Auth hook
│   ├── useMusic.ts            # Music hook
│   └── usePlaylist.ts         # Playlist hook
│
├── prisma/
│   └── schema.prisma          # Database schema
│
└── public/                    # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/soundwave.git
   cd soundwave
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/soundwave"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"

   # API Keys
   DEEZER_API_KEY="your-deezer-api-key"
   YOUTUBE_API_KEY="your-youtube-api-key"

   # URLs
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"

   # Environment
   NODE_ENV="development"
   ```

4. **Initialize database**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "user": { "id", "email", "username", "avatar" },
    "tokens": { "accessToken", "refreshToken" }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

### Music

#### Search Music
```http
GET /api/music/search?q=taylor+swift
```

Returns: Array of songs matching the query

#### Get Trending Songs
```http
GET /api/music/trending
```

Returns: Array of trending songs

### Playlists

#### Get All Playlists
```http
GET /api/playlists
Authorization: Bearer <accessToken>
```

#### Create Playlist
```http
POST /api/playlists
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "My Playlist",
  "description": "My favorite songs",
  "isPublic": false
}
```

#### Add Song to Playlist
```http
POST /api/playlists/:playlistId/songs
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "songId": "song-id"
}
```

#### Remove Song from Playlist
```http
DELETE /api/playlists/:playlistId/songs/:songId
Authorization: Bearer <accessToken>
```

#### Delete Playlist
```http
DELETE /api/playlists/:playlistId
Authorization: Bearer <accessToken>
```

### Favorites

#### Get Favorite Songs
```http
GET /api/favorites
Authorization: Bearer <accessToken>
```

#### Add to Favorites
```http
POST /api/favorites
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "songId": "song-id"
}
```

#### Remove from Favorites
```http
DELETE /api/favorites/:songId
Authorization: Bearer <accessToken>
```

## Development

### Database Management
```bash
# View database in Prisma Studio
pnpm prisma studio

# Create migration
pnpm prisma migrate dev --name "migration-name"

# Reset database
pnpm prisma db push --force-reset
```

### Code Quality
```bash
# Run linter
pnpm lint

# Run type check
pnpm tsc --noEmit
```

### Build
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables

3. **Configure Environment**
   In Vercel dashboard, set:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `DEEZER_API_KEY`
   - `YOUTUBE_API_KEY`

4. **Deploy**
   ```bash
   pnpm deploy
   ```

### Other Platforms

#### Render
1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

#### Railway
1. Create new project
2. Add PostgreSQL database
3. Deploy from GitHub
4. Set environment variables

## Performance Optimization

### Frontend
- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Memoization with React.memo
- State management with Zustand (minimal re-renders)

### Backend
- Database query optimization with Prisma
- Caching of music data
- Lazy loading of playlists
- Efficient pagination

## Security

- JWT-based authentication with access/refresh tokens
- Password hashing with bcryptjs
- SQL injection prevention with Prisma parameterized queries
- CORS headers on API routes
- Secure HTTP-only cookies (can be added)

## Future Enhancements

- [ ] Spotify OAuth integration
- [ ] Apple Music integration
- [ ] Real audio streaming (integrate with real music services)
- [ ] Social features (follow users, share playlists)
- [ ] Advanced search filters
- [ ] Listening history analytics
- [ ] Recommendation engine
- [ ] Mobile app (React Native)
- [ ] Progressive Web App (PWA)
- [ ] Dark/Light mode toggle
- [ ] User profiles
- [ ] Collaborative playlists

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the maintainers.

## Acknowledgments

- Inspired by [Spotify](https://spotify.com)
- Built with [Next.js](https://nextjs.org)
- UI components from [Radix UI](https://radix-ui.com)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Database with [Prisma](https://prisma.io)
