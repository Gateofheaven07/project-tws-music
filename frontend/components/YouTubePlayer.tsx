'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: any;
  }
}

/**
 * Komponen pemutar YouTube yang hidup di balik layar.
 * Komponen ini yang benar-benar menghasilkan suara — UI kontrol hanya mengubah state-nya.
 *
 * Alur kerja:
 * 1. Komponen ini di-mount sekali di level layout global (LayoutContent), tidak pernah hilang.
 * 2. Script YouTube Iframe API di-inject satu kali, lalu player dibuat satu kali.
 * 3. Ketika lagu dipilih dan videoId tersedia, player langsung load dan play video tersebut.
 * 4. Jika player belum siap saat videoId berubah, kita simpan "pending videoId" dan
 *    eksekusi saat onReady terpanggil.
 */
export const YouTubePlayer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetIdRef = useRef(`yt-hidden-player-${Math.random().toString(36).slice(2)}`);

  // Referensi ke instance YouTube Player — disimpan di ref agar tidak trigger re-render.
  const playerRef = useRef<any>(null);

  // Apakah player sudah melewati onReady dan siap dikomandoi?
  const isReadyRef = useRef(false);

  // videoId yang "menunggu" untuk diputar — dipakai saat player belum siap.
  const pendingVideoIdRef = useRef<string | null>(null);

  const {
    currentSong,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
  } = usePlayerStore();

  // ─── Inisialisasi YouTube Iframe API ─────────────────────────────────────────
  useEffect(() => {
    /**
     * Buat instance player YouTube ke dalam div target.
     * Dipanggil setelah API siap (baik langsung maupun via callback).
     */
    const createPlayer = (initialVideoId?: string) => {
      // Hindari membuat player ganda.
      if (playerRef.current) return;
      if (!containerRef.current) return;

      const target = document.createElement('div');
      target.id = targetIdRef.current;
      containerRef.current.replaceChildren(target);

      playerRef.current = new window.YT.Player(target, {
        height: '1',
        width: '1',
        // Kalau ada videoId yang sudah siap, langsung isi dari awal.
        videoId: initialVideoId || '',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            isReadyRef.current = true;

            // Set volume sesuai store.
            const { volume: vol } = usePlayerStore.getState();
            event.target.setVolume(vol * 100);

            // Kalau ada videoId yang menunggu sejak sebelum player siap, eksekusi sekarang.
            const { currentSong: song, isPlaying: playing } = usePlayerStore.getState();
            const videoId = pendingVideoIdRef.current || song?.playback?.videoId;

            if (videoId) {
              pendingVideoIdRef.current = null;
              if (playing) {
                event.target.loadVideoById(videoId);
              } else {
                event.target.cueVideoById(videoId);
              }
            }
          },

          onStateChange: (event: any) => {
            // Lagu selesai → pindah ke lagu berikutnya di queue.
            if (event.data === window.YT?.PlayerState?.ENDED) {
              usePlayerStore.getState().next();
            }
          },

          onError: (event: any) => {
            // Kode error YouTube: 2 = videoId tidak valid, 5 = tidak didukung HTML5,
            // 100 = video tidak ditemukan/privat, 101/150 = embedding dilarang.
            console.warn(`YouTube player error (kode ${event.data}). Coba lanjut ke lagu berikut.`);
            usePlayerStore.getState().pause();
          },
        },
      });
    };

    const initApi = () => {
      // Ambil videoId awal untuk diinisialisasi langsung ke player.
      const initialVideoId = usePlayerStore.getState().currentSong?.playback?.videoId || undefined;

      if (window.YT && window.YT.Player) {
        // API sudah tersedia di halaman ini — langsung buat player.
        createPlayer(initialVideoId);
      } else {
        // API belum ada — inject script dan pasang callback.
        const prevCallback = window.onYouTubeIframeAPIReady;
        const handleYouTubeIframeAPIReady = () => {
          prevCallback?.();
          createPlayer(initialVideoId);
        };
        window.onYouTubeIframeAPIReady = handleYouTubeIframeAPIReady;

        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
        }

        return () => {
          if (window.onYouTubeIframeAPIReady === handleYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = prevCallback;
          }
        };
      }
    };

    const cleanupApiCallback = initApi();

    return () => {
      cleanupApiCallback?.();

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (_) {
          // Abaikan error saat destroy — terkadang player sudah tidak ada.
        }
        playerRef.current = null;
        isReadyRef.current = false;
      }

      containerRef.current?.replaceChildren();
    };
  }, []);

  // ─── Reaksi terhadap perubahan isPlaying ─────────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      // Player mungkin sedang dalam proses load, abaikan saja.
    }
  }, [isPlaying]);

  // ─── Reaksi terhadap perubahan volume ────────────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    try {
      playerRef.current.setVolume(volume * 100);
    } catch (_) {}
  }, [volume]);

  // ─── Reaksi terhadap perubahan lagu / videoId ────────────────────────────────
  useEffect(() => {
    const videoId = currentSong?.playback?.videoId;
    if (!videoId) return;

    if (!isReadyRef.current || !playerRef.current) {
      // Player belum siap — simpan videoId ini, akan dieksekusi di onReady nanti.
      pendingVideoIdRef.current = videoId;
      return;
    }

    // Player sudah siap, langsung eksekusi.
    const { isPlaying: shouldPlay } = usePlayerStore.getState();
    try {
      if (shouldPlay) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.cueVideoById(videoId);
      }
    } catch (e) {
      console.warn('Gagal load video:', e);
    }
  }, [currentSong?.playback?.videoId]);

  // ─── Update progress bar setiap detik ────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      if (!isReadyRef.current || !playerRef.current) return;

      try {
        const time = playerRef.current.getCurrentTime?.() || 0;
        const dur = playerRef.current.getDuration?.() || 0;

        setCurrentTime(time);
        if (dur > 0) setDuration(dur);
      } catch (_) {}
    }, 1000);

    return () => clearInterval(tick);
  }, [setCurrentTime, setDuration]);

  // Div target untuk player YouTube — ukuran 1x1 px, tidak terlihat tapi harus ada di DOM.
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: '-2px',
        left: '-2px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
};
