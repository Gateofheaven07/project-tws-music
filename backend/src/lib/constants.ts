export const API_ROUTES = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',

  // Music
  MUSIC_SEARCH: '/api/music/search',
  MUSIC_GET: '/api/music/:id',
  MUSIC_TRENDING: '/api/music/trending',
  MUSIC_RECOMMENDATIONS: '/api/music/recommendations',

  // Playlists
  PLAYLIST_CREATE: '/api/playlists',
  PLAYLIST_LIST: '/api/playlists',
  PLAYLIST_GET: '/api/playlists/:id',
  PLAYLIST_UPDATE: '/api/playlists/:id',
  PLAYLIST_DELETE: '/api/playlists/:id',
  PLAYLIST_ADD_SONG: '/api/playlists/:id/songs',
  PLAYLIST_REMOVE_SONG: '/api/playlists/:id/songs/:songId',

  // Favorites
  FAVORITE_ADD: '/api/favorites',
  FAVORITE_REMOVE: '/api/favorites/:songId',
  FAVORITE_LIST: '/api/favorites',

  // History
  HISTORY_ADD: '/api/history',
  HISTORY_LIST: '/api/history',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  SONG_NOT_FOUND: 'Song not found',
  PLAYLIST_NOT_FOUND: 'Playlist not found',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'Internal server error',
};
