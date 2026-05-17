"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumDetails = exports.getArtistDetails = exports.getYouTubeId = exports.getRecommendationsForUser = exports.getTrendingSongs = exports.getSongsByGenre = exports.getGenres = exports.searchSongs = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const DEEZER_API_URL = 'https://api.deezer.com';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const mapTrackToSong = async (track, genreName) => {
    const playbackLookup = await (0, exports.getYouTubeId)(track.artist.name, track.title);
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
const GENRE_SEARCH_TERMS = {
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
const normalizeGenreSearchTerm = (genreName) => {
    const normalizedName = genreName.trim().toLowerCase();
    const mappedTerm = GENRE_SEARCH_TERMS[normalizedName];
    if (mappedTerm)
        return mappedTerm;
    const firstGenreName = normalizedName
        .split(/[\/,&]/)
        .map((part) => part.trim())
        .find(Boolean);
    return (firstGenreName || normalizedName)
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};
const resolveGenreName = async (genreId, genreName) => {
    if (genreName?.trim())
        return genreName.trim();
    const genres = await (0, exports.getGenres)();
    const selectedGenre = genres.find((genre) => String(genre.id) === String(genreId));
    return selectedGenre?.name || genreId;
};
/**
 * Service buat urusan musik-musikan.
 * Di sini kita nanganin komunikasi ke Deezer API (metadata) dan YouTube API (playback).
 * Kita gabungin datanya jadi satu JSON (JSON Transformation/Data Aggregation).
 */
const searchSongs = async (query) => {
    try {
        // Cari lagu di Deezer
        const response = await axios_1.default.get(`${DEEZER_API_URL}/search?q=${encodeURIComponent(query)}`);
        const tracks = response.data.data;
        const rawResults = await Promise.all(tracks.slice(0, 20).map((track) => mapTrackToSong(track)));
        const results = rawResults.filter(Boolean);
        return results;
    }
    catch (error) {
        console.error('Deezer Search Error:', error);
        throw new Error('Gagal nyari lagu di Deezer.');
    }
};
exports.searchSongs = searchSongs;
/**
 * Ngambil kategori musik dari Deezer.
 * Genre "All" kita skip karena terlalu umum untuk ditampilkan sebagai kartu.
 */
const getGenres = async () => {
    try {
        const response = await axios_1.default.get(`${DEEZER_API_URL}/genre`);
        const genres = response.data.data || [];
        return genres
            .filter((genre) => genre.id !== 0 && genre.name?.toLowerCase() !== 'all')
            .map((genre) => ({
            id: genre.id,
            name: genre.name,
            picture: genre.picture_medium,
            pictureSmall: genre.picture_medium,
            pictureMedium: genre.picture_medium,
            pictureBig: genre.picture_medium,
            pictureXl: genre.picture_medium,
        }));
    }
    catch (error) {
        console.error('Deezer Genre Error:', error);
        throw new Error('Gagal ngambil kategori musik dari Deezer.');
    }
};
exports.getGenres = getGenres;
/**
 * Ngambil lagu berdasarkan genre Deezer.
 * Genre dipakai sebagai kata kunci Deezer Search, lalu hasilnya tetap dimatch ke YouTube.
 */
const getSongsByGenre = async (genreId, genreName) => {
    try {
        const resolvedGenreName = await resolveGenreName(genreId, genreName);
        const searchTerm = normalizeGenreSearchTerm(resolvedGenreName);
        const response = await axios_1.default.get(`${DEEZER_API_URL}/search?q=${encodeURIComponent(searchTerm)}`);
        const tracks = (response.data.data || []);
        const rawResults = await Promise.all(tracks.slice(0, 24).map((track) => mapTrackToSong(track, resolvedGenreName)));
        const results = rawResults.slice(0, 20);
        const hasUnavailablePlayback = results.some((song) => song.playback.status === "unavailable");
        return {
            query: searchTerm,
            playbackStatus: hasUnavailablePlayback ? "partial" : "ready",
            results
        };
    }
    catch (error) {
        console.error('Deezer Genre Songs Error:', error);
        if (genreName) {
            const query = normalizeGenreSearchTerm(genreName);
            const results = await (0, exports.searchSongs)(query);
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
exports.getSongsByGenre = getSongsByGenre;
/**
 * Ngambil daftar lagu yang lagi ngetren sekarang.
 */
const getTrendingSongs = async () => {
    try {
        const response = await axios_1.default.get(`${DEEZER_API_URL}/chart`);
        const tracks = response.data.tracks.data;
        const rawResults = await Promise.all(tracks.slice(0, 20).map((track) => mapTrackToSong(track)));
        const results = rawResults.filter(Boolean);
        return results;
    }
    catch (error) {
        console.error('Deezer Chart Error:', error);
        throw new Error('Gagal ngambil daftar lagu trending.');
    }
};
exports.getTrendingSongs = getTrendingSongs;
/**
 * Rekomendasi diambil dari genre yang paling sering muncul di lagu favorit user.
 * Kalau user belum punya data genre, kita tetap kasih hasil dari query default.
 */
const getRecommendationsForUser = async (userId) => {
    try {
        const likedSongs = await prisma_1.prisma.likedSong.findMany({
            where: {
                userId,
                genre: {
                    not: null,
                },
            },
            select: {
                genre: true,
            },
        });
        const genreCount = likedSongs.reduce((count, song) => {
            const genre = song.genre?.trim();
            if (!genre)
                return count;
            count[genre] = (count[genre] || 0) + 1;
            return count;
        }, {});
        const genreEntries = Object.entries(genreCount);
        const favoriteGenre = genreEntries.sort(([, countA], [, countB]) => countB - countA)[0]?.[0] || 'pop';
        const source = likedSongs.length > 0 ? 'liked_songs' : 'fallback';
        const query = normalizeGenreSearchTerm(favoriteGenre);
        const response = await axios_1.default.get(`${DEEZER_API_URL}/search?q=${encodeURIComponent(query)}`);
        const tracks = (response.data.data || []);
        const results = await Promise.all(tracks.slice(0, 20).map((track) => mapTrackToSong(track, favoriteGenre)));
        const hasUnavailablePlayback = results.some((song) => song.playback.status === 'unavailable');
        return {
            query,
            favoriteGenre,
            source,
            playbackStatus: hasUnavailablePlayback ? 'partial' : 'ready',
            results,
        };
    }
    catch (error) {
        console.error('Deezer Recommendation Error:', error);
        throw new Error('Gagal ngambil rekomendasi musik.');
    }
};
exports.getRecommendationsForUser = getRecommendationsForUser;
/**
 * Cari video ID YouTube buat diputer audionya.
 * Kita cari berdasarkan "Artist - Title".
 */
const getYouTubeId = async (artist, title) => {
    try {
        // Cek dulu di cache database biar nggak boros kuota API YouTube
        const cache = await prisma_1.prisma.song.findFirst({
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
        const response = await axios_1.default.get(`${YOUTUBE_API_URL}/search`, {
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
                await prisma_1.prisma.song.upsert({
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
            }
            catch (cacheError) {
                console.warn('Gagal menyimpan cache YouTube:', cacheError);
            }
        }
        return {
            videoId: videoId || null,
            errorReason: videoId ? null : 'youtube_video_not_found'
        };
    }
    catch (error) {
        console.error('YouTube Search Error:', error);
        return {
            videoId: null,
            errorReason: getYouTubeErrorReason(error)
        };
    }
};
exports.getYouTubeId = getYouTubeId;
const getYouTubeErrorReason = (error) => {
    if (!axios_1.default.isAxiosError(error))
        return 'youtube_lookup_failed';
    const responseData = error.response?.data;
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
const getArtistDetails = async (id) => {
    try {
        const [artistRes, topTracksRes] = await Promise.all([
            axios_1.default.get(`${DEEZER_API_URL}/artist/${id}`),
            axios_1.default.get(`${DEEZER_API_URL}/artist/${id}/top?limit=10`)
        ]);
        return {
            artist: artistRes.data,
            topTracks: topTracksRes.data.data.map((track) => ({
                id: String(track.id),
                title: track.title,
                artist: track.artist.name,
                album: track.album.title,
                cover: track.album.cover_medium,
                duration: track.duration,
            }))
        };
    }
    catch (error) {
        console.error('Deezer Artist Error:', error);
        throw new Error('Gagal ngambil detail artis.');
    }
};
exports.getArtistDetails = getArtistDetails;
/**
 * Ngambil detail album.
 */
const getAlbumDetails = async (id) => {
    try {
        const response = await axios_1.default.get(`${DEEZER_API_URL}/album/${id}`);
        const album = response.data;
        return {
            id: String(album.id),
            title: album.title,
            artist: album.artist.name,
            cover: album.cover_xl,
            releaseDate: album.release_date,
            tracks: album.tracks.data.map((track) => ({
                id: String(track.id),
                title: track.title,
                artist: track.artist.name,
                duration: track.duration,
            }))
        };
    }
    catch (error) {
        console.error('Deezer Album Error:', error);
        throw new Error('Gagal ngambil detail album.');
    }
};
exports.getAlbumDetails = getAlbumDetails;
