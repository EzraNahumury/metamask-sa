"use client";

import dynamic from "next/dynamic";

// Defer R3F bundle to client only so the static export stays light.
export const WebGLBackground = dynamic(
  () => import("./WebGLBackground").then((m) => m.WebGLBackground),
  { ssr: false },
);
