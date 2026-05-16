// SoundWave Backend Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth.routes';
import musicRoutes from './routes/music.routes';
import playlistRoutes from './routes/playlist.routes';
import favoriteRoutes from './routes/favorite.routes';
import historyRoutes from './routes/history.routes';
import profileRoutes from './routes/profile.routes';
import reviewRoutes from './routes/review.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Pastikan folder uploads/avatar sudah ada sebelum server jalan
const uploadDir = path.join(process.cwd(), 'uploads', 'avatar');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Serve file statis dari folder uploads/ agar URL avatar bisa diakses langsung
// Contoh: http://localhost:5000/uploads/avatar/user123-1234567890.png
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'SoundWave API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/liked-songs', favoriteRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
