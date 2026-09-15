"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  poster: string;
};

export function HeroVideo({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      if (reduce.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };

    apply();
    reduce.addEventListener("change", apply);
    return () => reduce.removeEventListener("change", apply);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1c1914]" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        className="absolute inset-0 hidden h-full w-full object-cover motion-reduce:block"
      />
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden md:object-contain"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        tabIndex={-1}
        disablePictureInPicture
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
