"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSongById = exports.cacheMusicToDB = exports.getTrendingSongs = exports.searchMusicViaDeezer = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("@/lib/prisma");
// Search music menggunakan Deezer API (free, no auth needed untuk basic search)
const searchMusicViaDeezer = async (query) => {
    try {
        const response = await axios_1.default.get('https://api.deezer.com/search', {
            params: {
                q: query,
                limit: 20,
            },
        });
        if (!response.data.data || response.data.data.length === 0) {
            return [];
        }
        return response.data.data.map((track) => ({
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
    }
    catch (error) {
        console.error('[v0] Deezer search error:', error);
        return [];
    }
};
exports.searchMusicViaDeezer = searchMusicViaDeezer;
// Get trending songs dari Deezer
const getTrendingSongs = async () => {
    try {
        const response = await axios_1.default.get('https://api.deezer.com/chart/0/tracks', {
            params: {
                limit: 20,
            },
        });
        if (!response.data.data || response.data.data.length === 0) {
            return [];
        }
        return response.data.data.map((track) => ({
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
    }
    catch (error) {
        console.error('[v0] Trending songs error:', error);
        return [];
    }
};
exports.getTrendingSongs = getTrendingSongs;
// Cache music ke database dan return
const cacheMusicToDB = async (musicData) => {
    try {
        // Check if song already exists
        const existingSong = await prisma_1.prisma.song.findFirst({
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
        const song = await prisma_1.prisma.song.create({
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
    }
    catch (error) {
        console.error('[v0] Cache music error:', error);
        throw error;
    }
};
exports.cacheMusicToDB = cacheMusicToDB;
// Get song by ID
const getSongById = async (id) => {
    try {
        const song = await prisma_1.prisma.song.findUnique({
            where: { id },
        });
        return song;
    }
    catch (error) {
        console.error('[v0] Get song error:', error);
        return null;
    }
};
exports.getSongById = getSongById;
