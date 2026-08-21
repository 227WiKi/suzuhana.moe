"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaLoadingIndicator,
  MediaMuteButton,
  MediaPipButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import {
  AlertCircle,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

interface InstagramVideoPlayerProps {
  src: string;
  poster?: string;
  onLoadedMetadata: (width: number, height: number) => void;
  onError: () => void;
}

const playerStyle = {
  "--media-primary-color": "#fff",
  "--media-secondary-color": "transparent",
  "--media-control-background": "transparent",
  "--media-control-hover-background": "rgb(255 255 255 / 0.12)",
  "--media-control-padding": "7px",
  "--media-button-padding": "7px",
  "--media-control-height": "18px",
  "--media-button-icon-width": "18px",
  "--media-button-icon-height": "18px",
  "--media-font-family": "var(--font-sans)",
  "--media-font-size": "11px",
  "--media-font-weight": "700",
  "--media-range-track-height": "3px",
  "--media-range-track-border-radius": "999px",
  "--media-range-track-background": "rgb(255 255 255 / 0.22)",
  "--media-range-bar-color": "#fff",
  "--media-range-thumb-background": "#fff",
  "--media-range-thumb-width": "9px",
  "--media-range-thumb-height": "9px",
  "--media-range-thumb-box-shadow": "0 1px 5px rgb(0 0 0 / 0.35)",
  "--media-loading-indicator-icon-width": "32px",
  "--media-loading-indicator-icon-height": "32px",
  "--media-focus-box-shadow": "inset 0 0 0 2px rgb(255 255 255 / 0.9)",
} as CSSProperties;

const outlineIconStyle = { fill: "none" } as CSSProperties;

export default function InstagramVideoPlayer({
  src,
  poster,
  onLoadedMetadata,
  onError,
}: InstagramVideoPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportMetadata = useEffectEvent((video: HTMLVideoElement) => {
    onLoadedMetadata(video.videoWidth, video.videoHeight);
  });
  const reportError = useEffectEvent(() => {
    setHasError(true);
    onError();
  });

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => reportMetadata(video);

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("error", reportError);
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) handleMetadata();
    if (video.error) reportError();

    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("error", reportError);
      video.pause();
    };
  }, [src]);

  if (hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-950 text-sm text-zinc-400">
        <AlertCircle size={28} className="opacity-70" />
        <span>视频无法加载</span>
      </div>
    );
  }

  return (
    <MediaController
      className="group relative block h-full w-full overflow-hidden bg-zinc-950 font-sans"
      style={playerStyle}
    >
      <video
        ref={videoRef}
        slot="media"
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        className="h-full w-full object-contain"
      />

      <button
        type="button"
        tabIndex={-1}
        aria-label="播放或暂停视频"
        onClick={togglePlayback}
        className="absolute inset-0 z-10 cursor-pointer bg-transparent outline-none"
      />
      <MediaLoadingIndicator className="instagram-video-loading pointer-events-none absolute inset-0 m-auto h-12 w-12 rounded-full border border-white/10 bg-black/35 p-2 shadow-lg backdrop-blur-md" />

      <div className="instagram-video-scrim pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 via-black/20 to-transparent transition-opacity duration-200" />

      <MediaPlayButton
        aria-label="播放或暂停"
        className="instagram-video-center-play absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 p-4 text-zinc-950 shadow-[0_10px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[opacity,transform,background-color] duration-200 hover:bg-white"
        style={{ "--media-primary-color": "#18181b" } as CSSProperties}
      >
        <Play slot="play" size={24} strokeWidth={2.2} style={{ fill: "currentColor" }} />
        <Pause slot="pause" size={24} strokeWidth={2.2} style={{ fill: "currentColor" }} />
      </MediaPlayButton>

      <MediaControlBar className="instagram-video-controls absolute inset-x-3 bottom-3 z-30 flex min-h-11 items-center gap-0.5 rounded-xl border border-white/15 bg-zinc-950/75 px-1.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[opacity,transform] duration-200 sm:inset-x-4 sm:bottom-4 sm:px-2">
        <MediaPlayButton aria-label="播放或暂停" className="rounded-lg">
          <Play slot="play" size={18} strokeWidth={2.2} style={{ fill: "currentColor" }} />
          <Pause slot="pause" size={18} strokeWidth={2.2} style={{ fill: "currentColor" }} />
        </MediaPlayButton>
        <MediaTimeDisplay
          showDuration
          noToggle
          className="hidden whitespace-nowrap font-mono text-[11px] font-bold tabular-nums text-white/75 sm:inline-flex"
        />
        <MediaTimeRange className="min-w-16 flex-1" />
        <div className="instagram-video-volume flex shrink-0 items-center">
          <MediaMuteButton aria-label="静音或取消静音" className="rounded-lg">
            <VolumeX slot="off" size={18} strokeWidth={2} style={outlineIconStyle} />
            <Volume1 slot="low" size={18} strokeWidth={2} style={outlineIconStyle} />
            <Volume2 slot="medium" size={18} strokeWidth={2} style={outlineIconStyle} />
            <Volume2 slot="high" size={18} strokeWidth={2} style={outlineIconStyle} />
          </MediaMuteButton>
          <MediaVolumeRange className="instagram-video-volume-range" />
        </div>
        <MediaPipButton aria-label="画中画" className="hidden rounded-lg sm:inline-flex">
          <PictureInPicture2 slot="enter" size={18} strokeWidth={2} style={outlineIconStyle} />
          <PictureInPicture2 slot="exit" size={18} strokeWidth={2} style={outlineIconStyle} />
        </MediaPipButton>
        <MediaFullscreenButton aria-label="全屏" className="rounded-lg">
          <Maximize slot="enter" size={18} strokeWidth={2} style={outlineIconStyle} />
          <Minimize slot="exit" size={18} strokeWidth={2} style={outlineIconStyle} />
        </MediaFullscreenButton>
      </MediaControlBar>

      <style jsx global>{`
        .instagram-video-loading {
          opacity: 0;
          transition: opacity 150ms ease;
        }

        .instagram-video-loading[medialoading]:not([mediapaused]) {
          opacity: 1;
          transition-delay: 500ms;
        }

        .instagram-video-volume-range {
          display: none;
          width: 0;
          min-width: 0;
          overflow: hidden;
          pointer-events: none;
          opacity: 0;
          transition: width 180ms ease, opacity 120ms ease;
        }

        @media (min-width: 1024px) {
          .instagram-video-volume-range {
            display: inline-flex;
          }

          .instagram-video-volume:hover > .instagram-video-volume-range,
          .instagram-video-volume:focus-within > .instagram-video-volume-range {
            width: 64px;
            pointer-events: auto;
            opacity: 1;
          }
        }

        media-controller:not([mediapaused]) > .instagram-video-center-play {
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.88);
        }

        media-controller[userinactive]:not([mediapaused]) > .instagram-video-controls {
          pointer-events: none;
          opacity: 0;
          transform: translateY(8px);
        }

        media-controller[userinactive]:not([mediapaused]) > .instagram-video-scrim {
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .instagram-video-center-play,
          .instagram-video-controls,
          .instagram-video-scrim,
          .instagram-video-loading,
          .instagram-video-volume-range {
            transition: none !important;
          }
        }
      `}</style>
    </MediaController>
  );
}
