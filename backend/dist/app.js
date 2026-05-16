"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SoundWave Backend Entry Point
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const music_routes_1 = __importDefault(require("./routes/music.routes"));
const playlist_routes_1 = __importDefault(require("./routes/playlist.routes"));
const favorite_routes_1 = __importDefault(require("./routes/favorite.routes"));
const history_routes_1 = __importDefault(require("./routes/history.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Pastikan folder uploads/avatar sudah ada sebelum server jalan
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'avatar');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve file statis dari folder uploads/ agar URL avatar bisa diakses langsung
// Contoh: http://localhost:5000/uploads/avatar/user123-1234567890.png
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'SoundWave API is running' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/music', music_routes_1.default);
app.use('/api/playlists', playlist_routes_1.default);
app.use('/api/liked-songs', favorite_routes_1.default);
app.use('/api/history', history_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.default = app;
