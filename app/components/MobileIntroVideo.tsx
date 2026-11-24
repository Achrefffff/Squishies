import { useCallback, useEffect, useRef, useState } from "react";

type IntroPhase = "active" | "fading" | "done";

const INTRO_VIDEO_SRC = "/videos/intro-mobile.mp4";
const PLAY_DURATION_SECONDS = 3;
const PLAY_DURATION_MS = PLAY_DURATION_SECONDS * 1000;
const FADE_DURATION_MS = 450;
const LOAD_TIMEOUT_MS = 4000;
const MAX_DURATION_MS = 7000;

export function MobileIntroVideo() {
  const [phase, setPhase] = useState<IntroPhase>("active");
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase("fading");
    window.setTimeout(() => {
      setPhase("done");
    }, FADE_DURATION_MS);
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isMobile || prefersReducedMotion) {
      finishedRef.current = true;
      setPhase("done");
      return;
    }

    setShouldLoadVideo(true);

    const maxTimer = window.setTimeout(finishIntro, MAX_DURATION_MS);
    return () => {
      window.clearTimeout(maxTimer);
    };
  }, [finishIntro]);

  useEffect(() => {
    if (!shouldLoadVideo || videoReady || phase !== "active") return;
    const loadTimer = window.setTimeout(finishIntro, LOAD_TIMEOUT_MS);
    return () => {
      window.clearTimeout(loadTimer);
    };
  }, [shouldLoadVideo, videoReady, phase, finishIntro]);

  useEffect(() => {
    if (!videoReady || phase !== "active") return;
    const playTimer = window.setTimeout(finishIntro, PLAY_DURATION_MS);
    return () => {
      window.clearTimeout(playTimer);
    };
  }, [videoReady, phase, finishIntro]);

  useEffect(() => {
    if (!shouldLoadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    // Enforce muted inline playback for iOS Safari and Android Chrome autoplay policies
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        finishIntro();
      });
    }
  }, [shouldLoadVideo, finishIntro]);

  if (phase === "done") return null;

  const isFading = phase === "fading";

  return (
    <div
      data-mobile-intro={phase}
      role="dialog"
      aria-modal="true"
      aria-label="Vidéo d'introduction Squishies"
      className={`bg-surface fixed inset-0 z-50 h-dvh w-full overflow-hidden md:hidden motion-safe:transition-opacity motion-safe:duration-500 motion-safe:ease-out ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {!videoReady ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/images/logo-squishy.webp"
            alt="Squishies"
            width={160}
            height={58}
            className="h-14 w-auto animate-pulse object-contain"
          />
        </div>
      ) : null}

      {shouldLoadVideo ? (
        <video
          ref={videoRef}
          src={INTRO_VIDEO_SRC}
          autoPlay
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          onPlaying={() => setVideoReady(true)}
          onTimeUpdate={(event) => {
            if (event.currentTarget.currentTime >= PLAY_DURATION_SECONDS) {
              finishIntro();
            }
          }}
          onEnded={finishIntro}
          onError={finishIntro}
          className={`h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-300 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      <div className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 flex justify-end px-4 pt-3">
        <button
          type="button"
          onClick={finishIntro}
          aria-label="Passer la vidéo d'introduction"
          className="bg-on-surface/55 text-surface hover:bg-on-surface/75 focus-visible:outline-surface pointer-events-auto mb-2 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Passer
        </button>
      </div>
    </div>
  );
}
