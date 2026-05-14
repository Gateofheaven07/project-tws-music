"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const music_routes_1 = __importDefault(require("./routes/music.routes"));
const playlist_routes_1 = __importDefault(require("./routes/playlist.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const history_routes_1 = __importDefault(require("./routes/history.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'SoundWave API is running' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/music', music_routes_1.default);
app.use('/api/playlists', playlist_routes_1.default);
app.use('/api/favorites', favorite_routes_1.default);
app.use('/api/history', history_routes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.default = app;
