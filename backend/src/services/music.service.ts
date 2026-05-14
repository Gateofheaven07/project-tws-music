import axios from 'axios';
import { prisma } from '../lib/prisma';

const DEEZER_API_URL = 'https://api.deezer.com';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Service buat urusan musik-musikan.
 * Di sini kita nanganin komunikasi ke Deezer API (metadata) dan YouTube API (playback).
 * Kita gabungin datanya jadi satu JSON (JSON Transformation/Data Aggregation).
 */
export const searchSongs = async (query: string) => {
  try {
    // Cari lagu di Deezer
    const response = await axios.get(`${DEEZER_API_URL}/search?q=${encodeURIComponent(query)}`);
    const tracks = response.data.data;

    // Mapping hasilnya dan tambahin field videoId (Aggregation)
    const results = await Promise.all(
      tracks.slice(0, 10).map(async (track: any) => {
        // Cek cache dulu
        const cache = await prisma.song.findUnique({
          where: { id: String(track.id) }
        });

        const videoId = cache?.youtubeUrl || null;

        return {
          musicId: `music_dz_${track.id}`,
          title: track.title,
          artist: {
            id: `artist_dz_${track.artist.id}`,
            name: track.artist.name
          },
          album: {
            id: `album_dz_${track.album.id}`,
            name: track.album.title,
            cover: {
              small: track.album.cover_small,
              medium: track.album.cover_medium,
              big: track.album.cover_big,
              xl: track.album.cover_xl
            }
          },
          duration: track.duration,
          genres: [], // Deezer search doesn't give genres directly, would need extra call
          releaseDate: "", // Would need extra call
          playback: {
            provider: "youtube",
            type: "iframe",
            videoId: videoId,
            embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
            youtubeUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
          },
          statistics: {
            popularity: track.rank || 0
          }
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Deezer Search Error:', error);
    throw new Error('Gagal nyari lagu di Deezer.');
  }
};

/**
 * Ngambil daftar lagu yang lagi ngetren sekarang.
 */
export const getTrendingSongs = async () => {
  try {
    const response = await axios.get(`${DEEZER_API_URL}/chart`);
    const tracks = response.data.tracks.data;

    const results = await Promise.all(
      tracks.slice(0, 10).map(async (track: any) => {
        const cache = await prisma.song.findUnique({
          where: { id: String(track.id) }
        });

        const videoId = cache?.youtubeUrl || null;

        return {
          musicId: `music_dz_${track.id}`,
          title: track.title,
          artist: {
            id: `artist_dz_${track.artist.id}`,
            name: track.artist.name
          },
          album: {
            id: `album_dz_${track.album.id}`,
            name: track.album.title,
            cover: {
              small: track.album.cover_small,
              medium: track.album.cover_medium,
              big: track.album.cover_big,
              xl: track.album.cover_xl
            }
          },
          duration: track.duration,
          genres: [],
          releaseDate: "",
          playback: {
            provider: "youtube",
            type: "iframe",
            videoId: videoId,
            embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
            youtubeUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
          },
          statistics: {
            popularity: track.rank || 0
          }
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Deezer Chart Error:', error);
    throw new Error('Gagal ngambil daftar lagu trending.');
  }
};

/**
 * Cari video ID YouTube buat diputer audionya.
 * Kita cari berdasarkan "Artist - Title".
 */
export const getYouTubeId = async (artist: string, title: string) => {
  try {
    // Cek dulu di cache database biar nggak boros kuota API YouTube
    const cache = await prisma.song.findFirst({
      where: {
        artist: artist,
        title: title,
      },
    });

    if (cache?.youtubeUrl) {
      return cache.youtubeUrl;
    }

    if (!YOUTUBE_API_KEY) {
      console.warn('YOUTUBE_API_KEY nggak ada, playback mungkin bermasalah.');
      return null;
    }

    const query = `${artist} - ${title}`;
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Category Music
        maxResults: 1,
        key: YOUTUBE_API_KEY,
      },
    });

    const videoId = response.data.items[0]?.id?.videoId;

    if (videoId) {
      // Simpen ke cache (Upsert)
      await prisma.song.upsert({
        where: { id: `deezer_${artist}_${title}` }, // Dummy ID or use Deezer ID if available
        update: { youtubeUrl: videoId },
        create: {
          id: `deezer_${artist}_${title}`,
          title,
          artist,
          youtubeUrl: videoId,
          duration: 0, // Placeholder
        },
      });
    }

    return videoId;
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return null;
  }
};

/**
 * Ngambil detail artis.
 */
export const getArtistDetails = async (id: string) => {
  try {
    const [artistRes, topTracksRes] = await Promise.all([
      axios.get(`${DEEZER_API_URL}/artist/${id}`),
      axios.get(`${DEEZER_API_URL}/artist/${id}/top?limit=10`)
    ]);

    return {
      artist: artistRes.data,
      topTracks: topTracksRes.data.data.map((track: any) => ({
        id: String(track.id),
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        cover: track.album.cover_medium,
        duration: track.duration,
      }))
    };
  } catch (error) {
    console.error('Deezer Artist Error:', error);
    throw new Error('Gagal ngambil detail artis.');
  }
};

/**
 * Ngambil detail album.
 */
export const getAlbumDetails = async (id: string) => {
  try {
    const response = await axios.get(`${DEEZER_API_URL}/album/${id}`);
    const album = response.data;

    return {
      id: String(album.id),
      title: album.title,
      artist: album.artist.name,
      cover: album.cover_xl,
      releaseDate: album.release_date,
      tracks: album.tracks.data.map((track: any) => ({
        id: String(track.id),
        title: track.title,
        artist: track.artist.name,
        duration: track.duration,
      }))
    };
  } catch (error) {
    console.error('Deezer Album Error:', error);
    throw new Error('Gagal ngambil detail album.');
  }
};
