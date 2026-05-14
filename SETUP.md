# SoundWave - Setup Guide

## Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL database (local or Neon/Railway/etc)

## Installation

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Create `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/soundwave"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# API Keys
DEEZER_API_KEY="your-deezer-api-key"
YOUTUBE_API_KEY="your-youtube-api-key"

# Application URLs
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 3. Setup Database
Initialize Prisma and create database schema:

```bash
# Generate Prisma client
pnpm prisma generate

# Create database tables
pnpm prisma db push

# (Optional) Seed database with sample data
pnpm prisma db seed
```

### 4. Run Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
soundwave/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── discover/          # Music discovery pages
│   ├── playlist/          # Playlist pages
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── auth/              # Auth helpers (JWT, password)
│   ├── api/               # API helpers
│   └── prisma.ts          # Prisma client
├── store/                 # Zustand stores
│   ├── authStore.ts       # Auth state
│   ├── playerStore.ts     # Player state
│   └── musicStore.ts      # Music discovery state
├── hooks/                 # Custom React hooks
├── server/                # Server utilities
└── prisma/                # Prisma schema

```

## API Documentation

### Authentication

**Register User**
```
POST /api/auth/register
Body: { email, username, password }
```

**Login**
```
POST /api/auth/login
Body: { email, password }
Returns: { accessToken, refreshToken, user }
```

**Get Current User**
```
GET /api/auth/me
Headers: { Authorization: Bearer <accessToken> }
```

### Music

**Search Music**
```
GET /api/music/search?q=<query>
```

**Get Trending Songs**
```
GET /api/music/trending
```

### Playlists

**Create Playlist**
```
POST /api/playlists
Headers: { Authorization: Bearer <accessToken> }
Body: { name, description }
```

**Get User Playlists**
```
GET /api/playlists
Headers: { Authorization: Bearer <accessToken> }
```

**Add Song to Playlist**
```
POST /api/playlists/:id/songs
Headers: { Authorization: Bearer <accessToken> }
Body: { songId }
```

## Development Tips

1. **Hot Reload**: Changes to files are automatically reflected in the dev server
2. **Database Logs**: Check the console for database queries in development mode
3. **Prisma Studio**: Visualize and manage database
   ```bash
   pnpm prisma studio
   ```
4. **Type Safety**: TypeScript is configured for full type checking

## Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Deploy to Vercel, Railway, or your preferred platform

3. Set environment variables on your hosting platform

4. Run migrations:
   ```bash
   pnpm prisma db push
   ```

## Troubleshooting

- **Database connection fails**: Check DATABASE_URL in .env.local
- **Prisma client errors**: Run `pnpm prisma generate`
- **Port 3000 in use**: Change port with `pnpm dev -- -p 3001`
