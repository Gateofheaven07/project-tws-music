'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

/**
 * Komponen tersembunyi buat nanganin playback dari YouTube.
 * Kita pake YouTube Iframe API biar bisa kontrol lagu (play, pause, seek, volume).
 */
export const YouTubePlayer = () => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    setCurrentTime, 
    setDuration, 
    next, 
    pause 
  } = usePlayerStore();

  useEffect(() => {
    // Load script YouTube API kalo belum ada
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player('youtube-player-element', {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume * 100);
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            next();
          }
        },
      },
    });
  };

  // Sinkronisasi status Play/Pause
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.getPlayerState) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // Sinkronisasi Volume
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Ganti lagu pas currentSong berubah
  useEffect(() => {
    const videoId = currentSong?.playback?.videoId;
    if (!playerRef.current || !videoId) return;

    playerRef.current.loadVideoById(videoId);
    if (!isPlaying) {
      playerRef.current.pauseVideo();
    }
  }, [currentSong?.playback?.videoId]);

  // Update Progress Bar
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        
        setCurrentTime(time);
        if (duration > 0) {
          setDuration(duration);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [setCurrentTime, setDuration]);

  return <div id="youtube-player-element" style={{ display: 'none' }} />;
};
