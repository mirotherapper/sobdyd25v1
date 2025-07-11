'use client';

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';

interface LocalPlayerProps {
  fileUrl: string;
  volume: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
}

interface LocalPlayerAPI {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

const LocalPlayer = forwardRef<LocalPlayerAPI, LocalPlayerProps>(
  (
    {
      fileUrl,
      volume,
      isPlaying,
      onTimeUpdate,
      onDurationChange,
      onEnded,
      onError,
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleTimeUpdate = () => {
        onTimeUpdate(audio.currentTime);
      };

      const handleDurationChange = () => {
        onDurationChange(audio.duration);
      };

      const handleEnded = () => {
        onEnded();
      };

      const handleError = () => {
        onError('Error playing audio');
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }, [onTimeUpdate, onDurationChange, onEnded, onError]);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.play().catch(err => onError(err.message));
      } else {
        audio.pause();
      }
    }, [isPlaying, onError]);

    // Apply volume changes
    useEffect(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = volume;
      }
    }, [volume]);

    useImperativeHandle(ref, () => ({
      play: async () => {
        const audio = audioRef.current;
        if (audio) {
          await audio.play();
        }
      },
      pause: () => {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
        }
      },
      seek: (time: number) => {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = time;
        }
      },
      setVolume: (volume: number) => {
        const audio = audioRef.current;
        if (audio) {
          audio.volume = volume;
        }
      },
    }));

    return <audio ref={audioRef} src={fileUrl} hidden />;
  }
);

LocalPlayer.displayName = 'LocalPlayer';

export default LocalPlayer;
