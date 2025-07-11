// Type definitions for YouTube IFrame API
declare namespace YT {
  interface PlayerOptions {
    width?: number | string;
    height?: number | string;
    videoId?: string;
    playerVars?: PlayerVars;
    events?: Events;
    host?: string;
  }

  interface PlayerVars {
    autoplay?: 0 | 1;
    cc_load_policy?: 1;
    cc_lang_pref?: string;
    color?: 'red' | 'white';
    controls?: 0 | 1 | 2;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: 'playlist' | 'search' | 'user_uploads';
    loop?: 0 | 1;
    modestbranding?: 1;
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    start?: number;
    mute?: 0 | 1;
  }

  interface Events {
    onReady?: (event: PlayerEvent) => void;
    onStateChange?: (event: OnStateChangeEvent) => void;
    onPlaybackQualityChange?: (event: OnPlaybackQualityChangeEvent) => void;
    onPlaybackRateChange?: (event: OnPlaybackRateChangeEvent) => void;
    onError?: (event: OnErrorEvent) => void;
    onApiChange?: (event: PlayerEvent) => void;
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    target: Player;
    data: PlayerState;
  }

  interface OnPlaybackQualityChangeEvent {
    target: Player;
    data: string;
  }

  interface OnPlaybackRateChangeEvent {
    target: Player;
    data: number;
  }

  interface OnErrorEvent {
    target: Player;
    data: number;
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    loadVideoById(
      videoId: string,
      startSeconds?: number,
      suggestedQuality?: string
    ): void;
    loadVideoByUrl(
      mediaContentUrl: string,
      startSeconds?: number,
      suggestedQuality?: string
    ): void;
    cueVideoById(
      videoId: string,
      startSeconds?: number,
      suggestedQuality?: string
    ): void;
    cueVideoByUrl(
      mediaContentUrl: string,
      startSeconds?: number,
      suggestedQuality?: string
    ): void;
    loadPlaylist(
      playlist: string | string[],
      index?: number,
      startSeconds?: number,
      suggestedQuality?: string
    ): void;
    cuePlaylist(
      playlist: string | string[],
      index?: number,
      startSeconds?: number,
      suggestedQuality?: string
    ): void;
    nextVideo(): void;
    previousVideo(): void;
    playVideoAt(index: number): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    getVolume(): number;
    setSize(width: number, height: number): void;
    getPlaybackRate(): number;
    setPlaybackRate(suggestedRate: number): void;
    getAvailablePlaybackRates(): number[];
    setLoop(loopPlaylists: boolean): void;
    setShuffle(shufflePlaylist: boolean): void;
    getVideoLoadedFraction(): number;
    getPlayerState(): PlayerState;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getPlaylist(): string[];
    getPlaylistIndex(): number;
    addEventListener(event: string, listener: string): void;
    removeEventListener(event: string, listener: string): void;
    getIframe(): HTMLIFrameElement;
    destroy(): void;
  }

  function getIframeByElement(element: HTMLElement): HTMLIFrameElement;
}

interface Window {
  YT?: typeof YT;
  onYouTubeIframeAPIReady?: () => void;
}
