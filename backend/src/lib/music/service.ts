import axios from 'axios';
import { prisma } from '@/lib/prisma';

export interface MusicData {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnail?: string;
  youtubeUrl?: string;
  deezerUrl?: string;
  genre?: string;
  releaseDate?: string;
}

// Search music menggunakan Deezer API (free, no auth needed untuk basic search)
export const searchMusicViaDeezer = async (query: string): Promise<MusicData[]> => {
  try {
    const response = await axios.get('https://api.deezer.com/search', {
      params: {
        q: query,
        limit: 20,
      },
    });

    if (!response.data.data || response.data.data.length === 0) {
      return [];
    }

    return response.data.data.map((track: any) => ({
      id: `deezer-${track.id}`,
      title: track.title,
      artist: track.artist?.name || 'Unknown Artist',
      album: track.album?.title,
      duration: track.duration,
      thumbnail: track.album?.cover_big || track.album?.cover,
      deezerUrl: track.link,
      youtubeUrl: undefined, // Would need YouTube API for this
      genre: undefined,
      releaseDate: track.release_date,
    }));
  } catch (error) {
    console.error('[v0] Deezer search error:', error);
    return [];
  }
};

// Get trending songs dari Deezer
export const getTrendingSongs = async (): Promise<MusicData[]> => {
  try {
    const response = await axios.get('https://api.deezer.com/chart/0/tracks', {
      params: {
        limit: 20,
      },
    });

    if (!response.data.data || response.data.data.length === 0) {
      return [];
    }

    return response.data.data.map((track: any) => ({
      id: `deezer-${track.id}`,
      title: track.title,
      artist: track.artist?.name || 'Unknown Artist',
      album: track.album?.title,
      duration: track.duration,
      thumbnail: track.album?.cover_big || track.album?.cover,
      deezerUrl: track.link,
      youtubeUrl: undefined,
      genre: undefined,
      releaseDate: track.release_date,
    }));
  } catch (error) {
    console.error('[v0] Trending songs error:', error);
    return [];
  }
};

// Cache music ke database dan return
export const cacheMusicToDB = async (musicData: MusicData) => {
  try {
    // Check if song already exists
    const existingSong = await prisma.song.findFirst({
      where: {
        OR: [
          { deezerUrl: musicData.deezerUrl },
          { youtubeUrl: musicData.youtubeUrl },
        ],
      },
    });

    if (existingSong) {
      return existingSong;
    }

    // Create new song
    const song = await prisma.song.create({
      data: {
        title: musicData.title,
        artist: musicData.artist,
        album: musicData.album,
        duration: musicData.duration,
        thumbnail: musicData.thumbnail,
        deezerUrl: musicData.deezerUrl,
        youtubeUrl: musicData.youtubeUrl,
        genre: musicData.genre,
        releaseDate: musicData.releaseDate ? new Date(musicData.releaseDate) : null,
      },
    });

    return song;
  } catch (error) {
    console.error('[v0] Cache music error:', error);
    throw error;
  }
};

// Get song by ID
export const getSongById = async (id: string) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id },
    });
    return song;
  } catch (error) {
    console.error('[v0] Get song error:', error);
    return null;
  }
};
