import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes (to be created)
import authRoutes from './routes/auth.routes';

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
