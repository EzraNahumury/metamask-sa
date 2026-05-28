"use client";

/**
 * Soft animated aurora glow behind the hero. Pure CSS — see `.aurora-bg`
 * in globals.css for the keyframes. Kept as a component so we can drop it
 * in any container without remembering the wrapper structure.
 */
export function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="aurora-bg" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
