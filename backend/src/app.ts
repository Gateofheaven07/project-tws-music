// SoundWave Backend Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.routes';
import musicRoutes from './routes/music.routes';
import playlistRoutes from './routes/playlist.routes';
import favoriteRoutes from './routes/favorite.routes';
import historyRoutes from './routes/history.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
