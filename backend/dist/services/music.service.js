"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumDetails = exports.getArtistDetails = exports.getYouTubeId = exports.getTrendingSongs = exports.searchSongs = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../lib/prisma");
const DEEZER_API_URL = 'https://api.deezer.com';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
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
        // Mapping hasilnya dan tambahin field videoId (Aggregation)
        // Kita bakal coba ambil videoId buat beberapa lagu pertama biar cepet
        const results = await Promise.all(tracks.slice(0, 10).map(async (track) => {
            // Cek cache dulu biar nggak boros kuota YouTube
            const cache = await prisma_1.prisma.song.findUnique({
                where: { id: String(track.id) }
            });
            return {
                id: String(track.id),
                title: track.title,
                artist: track.artist.name,
                album: track.album.title,
                cover: track.album.cover_medium,
                duration: track.duration,
                videoId: cache?.youtubeUrl || null, // Nanti diisi pas mau diputer kalo masih null
            };
        }));
        return results;
    }
    catch (error) {
        console.error('Deezer Search Error:', error);
        throw new Error('Gagal nyari lagu di Deezer.');
    }
};
exports.searchSongs = searchSongs;
/**
 * Ngambil daftar lagu yang lagi ngetren sekarang.
 */
const getTrendingSongs = async () => {
    try {
        const response = await axios_1.default.get(`${DEEZER_API_URL}/chart`);
        const tracks = response.data.tracks.data;
        const results = await Promise.all(tracks.slice(0, 10).map(async (track) => {
            const cache = await prisma_1.prisma.song.findUnique({
                where: { id: String(track.id) }
            });
            return {
                id: String(track.id),
                title: track.title,
                artist: track.artist.name,
                album: track.album.title,
                cover: track.album.cover_medium,
                duration: track.duration,
                videoId: cache?.youtubeUrl || null,
            };
        }));
        return results;
    }
    catch (error) {
        console.error('Deezer Chart Error:', error);
        throw new Error('Gagal ngambil daftar lagu trending.');
    }
};
exports.getTrendingSongs = getTrendingSongs;
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
            return cache.youtubeUrl;
        }
        if (!YOUTUBE_API_KEY) {
            console.warn('YOUTUBE_API_KEY nggak ada, playback mungkin bermasalah.');
            return null;
        }
        const query = `${artist} - ${title}`;
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
            // Simpen ke cache (Upsert)
            await prisma_1.prisma.song.upsert({
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
    }
    catch (error) {
        console.error('YouTube Search Error:', error);
        return null;
    }
};
exports.getYouTubeId = getYouTubeId;
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
