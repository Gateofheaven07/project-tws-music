import axios from 'axios';
import { prisma } from '../lib/prisma';

const DEEZER_API_URL = 'https://api.deezer.com';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

type DeezerGenre = {
  id: number;
  name: string;
  picture_medium: string;
};

type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  rank?: number;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
  };
};

type YouTubeLookupResult = {
  videoId: string | null;
  errorReason: string | null;
};

const mapTrackToSong = async (track: DeezerTrack, genreName?: string) => {
  const playbackLookup = await getYouTubeId(track.artist.name, track.title);
  const { videoId } = playbackLookup;

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
    genres: genreName ? [genreName] : [],
    releaseDate: "",
    playback: {
      provider: "youtube",
      type: "iframe",
      status: videoId ? "ready" : "unavailable",
      videoId,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
      youtubeUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
      errorReason: videoId ? null : playbackLookup.errorReason
    },
    statistics: {
      popularity: track.rank || 0
    }
  };
};

const GENRE_SEARCH_TERMS: Record<string, string> = {
  'rap/hip hop': 'rap',
  'pop': 'pop',
  'rock': 'rock',
  'dance': 'dance',
  'r&b': 'rnb',
  'alternative': 'alternative',
  'soul & funk': 'soul',
  'film/games': 'soundtrack',
  'asian music': 'asian music',
  'kids': 'kids music',
  'electro': 'electronic',
};

const normalizeGenreSearchTerm = (genreName: string) => {
  const normalizedName = genreName.trim().toLowerCase();
  const mappedTerm = GENRE_SEARCH_TERMS[normalizedName];

  if (mappedTerm) return mappedTerm;

  const firstGenreName = normalizedName
    .split(/[\/,&]/)
    .map((part) => part.trim())
    .find(Boolean);

  return (firstGenreName || normalizedName)
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const resolveGenreName = async (genreId: string, genreName?: string) => {
  if (genreName?.trim()) return genreName.trim();

  const genres: Array<{ id: number; name: string }> = await getGenres();
  const selectedGenre = genres.find((genre) => String(genre.id) === String(genreId));

  return selectedGenre?.name || genreId;
};

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

    const rawResults = await Promise.all(
      tracks.slice(0, 20).map((track: DeezerTrack) => mapTrackToSong(track))
    );

    const results = rawResults.filter(Boolean);

    return results;
  } catch (error) {
    console.error('Deezer Search Error:', error);
    throw new Error('Gagal nyari lagu di Deezer.');
  }
};

/**
 * Ngambil kategori musik dari Deezer.
 * Genre "All" kita skip karena terlalu umum untuk ditampilkan sebagai kartu.
 */
export const getGenres = async () => {
  try {
    const response = await axios.get(`${DEEZER_API_URL}/genre`);
    const genres = response.data.data || [];

    return genres
      .filter((genre: DeezerGenre) => genre.id !== 0 && genre.name?.toLowerCase() !== 'all')
      .map((genre: DeezerGenre) => ({
        id: genre.id,
        name: genre.name,
        picture: genre.picture_medium,
        pictureSmall: genre.picture_medium,
        pictureMedium: genre.picture_medium,
        pictureBig: genre.picture_medium,
        pictureXl: genre.picture_medium,
      }));
  } catch (error) {
    console.error('Deezer Genre Error:', error);
    throw new Error('Gagal ngambil kategori musik dari Deezer.');
  }
};

/**
 * Ngambil lagu berdasarkan genre Deezer.
 * Genre dipakai sebagai kata kunci Deezer Search, lalu hasilnya tetap dimatch ke YouTube.
 */
export const getSongsByGenre = async (genreId: string, genreName?: string) => {
  try {
    const resolvedGenreName = await resolveGenreName(genreId, genreName);
    const searchTerm = normalizeGenreSearchTerm(resolvedGenreName);
    const response = await axios.get(`${DEEZER_API_URL}/search?q=${encodeURIComponent(searchTerm)}`);
    const tracks = (response.data.data || []) as DeezerTrack[];

    const rawResults = await Promise.all(
      tracks.slice(0, 24).map((track: DeezerTrack) => mapTrackToSong(track, resolvedGenreName))
    );
    const results = rawResults.slice(0, 20);
    const hasUnavailablePlayback = results.some((song) => song.playback.status === "unavailable");

    return {
      query: searchTerm,
      playbackStatus: hasUnavailablePlayback ? "partial" : "ready",
      results
    };
  } catch (error) {
    console.error('Deezer Genre Songs Error:', error);

    if (genreName) {
      const query = normalizeGenreSearchTerm(genreName);
      const results = await searchSongs(query);
      const hasUnavailablePlayback = results.some((song) => song.playback.status === "unavailable");

      return {
        query,
        playbackStatus: hasUnavailablePlayback ? "partial" : "ready",
        results
      };
    }

    throw new Error('Gagal ngambil lagu berdasarkan genre.');
  }
};

/**
 * Ngambil daftar lagu yang lagi ngetren sekarang.
 */
export const getTrendingSongs = async () => {
  try {
    const response = await axios.get(`${DEEZER_API_URL}/chart`);
    const tracks = response.data.tracks.data;

    const rawResults = await Promise.all(
      tracks.slice(0, 20).map((track: DeezerTrack) => mapTrackToSong(track))
    );

    const results = rawResults.filter(Boolean);

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
export const getYouTubeId = async (artist: string, title: string): Promise<YouTubeLookupResult> => {
  try {
    // Cek dulu di cache database biar nggak boros kuota API YouTube
    const cache = await prisma.song.findFirst({
      where: {
        artist: artist,
        title: title,
      },
    });

    if (cache?.youtubeUrl) {
      return {
        videoId: cache.youtubeUrl,
        errorReason: null
      };
    }

    if (!YOUTUBE_API_KEY) {
      console.warn('YOUTUBE_API_KEY nggak ada, playback mungkin bermasalah.');
      return {
        videoId: null,
        errorReason: 'youtube_api_key_missing'
      };
    }

    const query = `${title} ${artist} official audio`;
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
      try {
        // Cache boleh gagal, tapi video yang sudah ketemu tetap bisa dipakai.
        await prisma.song.upsert({
          where: { id: `deezer_${artist}_${title}` },
          update: { youtubeUrl: videoId },
          create: {
            id: `deezer_${artist}_${title}`,
            title,
            artist,
            youtubeUrl: videoId,
            duration: 0,
          },
        });
      } catch (cacheError) {
        console.warn('Gagal menyimpan cache YouTube:', cacheError);
      }
    }

    return {
      videoId: videoId || null,
      errorReason: videoId ? null : 'youtube_video_not_found'
    };
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return {
      videoId: null,
      errorReason: getYouTubeErrorReason(error)
    };
  }
};

const getYouTubeErrorReason = (error: unknown) => {
  if (!axios.isAxiosError(error)) return 'youtube_lookup_failed';

  const responseData = error.response?.data as any;
  const firstError = responseData?.error?.errors?.[0];
  const reason = firstError?.reason || responseData?.error?.status || responseData?.error?.message;

  if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded' || reason === 'RATE_LIMIT_EXCEEDED') {
    return 'youtube_quota_exceeded';
  }

  return 'youtube_lookup_failed';
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
