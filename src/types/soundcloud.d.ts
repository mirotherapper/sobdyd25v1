// SoundCloud Widget API TypeScript definitions

declare global {
  interface Window {
    SC: typeof SC;
  }
}

declare namespace SC {
  interface Widget {
    (iframe: HTMLIFrameElement): WidgetInstance;
    Events: {
      READY: string;
      PLAY: string;
      PAUSE: string;
      FINISH: string;
      SEEK: string;
      PLAY_PROGRESS: string;
      LOAD_PROGRESS: string;
      ERROR: string;
    };
  }

  interface WidgetInstance {
    bind(event: string, callback: Function): void;
    unbind(event: string): void;
    load(url: string, options?: any): void;
    play(): void;
    pause(): void;
    toggle(): void;
    seekTo(milliseconds: number): void;
    setVolume(volume: number): void;
    next(): void;
    prev(): void;
    skip(soundIndex: number): void;
    getVolume(callback: (volume: number) => void): void;
    getDuration(callback: (duration: number) => void): void;
    getPosition(callback: (position: number) => void): void;
    getSounds(callback: (sounds: any[]) => void): void;
    getCurrentSound(callback: (sound: any) => void): void;
    getCurrentSoundIndex(callback: (index: number) => void): void;
    isPaused(callback: (paused: boolean) => void): void;
  }
}

export {};
