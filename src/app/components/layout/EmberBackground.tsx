import type { CSSProperties } from "react";

const BACKGROUND_PARTICLES = [
  { left: "8%", top: "20%", size: "0.42rem", color: "var(--theme-particle-1)", delay: "0s", duration: "8s" },
  { left: "16%", top: "74%", size: "0.3rem", color: "var(--theme-particle-2)", delay: "1.4s", duration: "7.2s" },
  { left: "31%", top: "32%", size: "0.36rem", color: "var(--theme-particle-3)", delay: "0.8s", duration: "9.6s" },
  { left: "42%", top: "64%", size: "0.48rem", color: "var(--theme-particle-1)", delay: "1.8s", duration: "10.4s" },
  { left: "58%", top: "18%", size: "0.34rem", color: "var(--theme-particle-2)", delay: "2.6s", duration: "8.8s" },
  { left: "66%", top: "54%", size: "0.42rem", color: "var(--theme-particle-4)", delay: "0.4s", duration: "11.2s" },
  { left: "78%", top: "26%", size: "0.38rem", color: "var(--theme-particle-1)", delay: "2.1s", duration: "9.2s" },
  { left: "87%", top: "68%", size: "0.28rem", color: "var(--theme-particle-3)", delay: "1.1s", duration: "7.8s" },
];

export function EmberBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="command-app-bg absolute inset-0" />
      <div className="command-grid-overlay pointer-events-none absolute inset-0" />
      <div className="command-energy-beam command-energy-beam-a pointer-events-none" />
      <div className="command-energy-beam command-energy-beam-b pointer-events-none" />

      <div className="pointer-events-none absolute inset-0">
        {BACKGROUND_PARTICLES.map((particle, index) => (
          <span
            key={`${particle.left}-${particle.top}-${index}`}
            className="command-energy-particle"
            style={
              {
                "--particle-left": particle.left,
                "--particle-top": particle.top,
                "--particle-size": particle.size,
                "--particle-color": particle.color,
                "--particle-delay": particle.delay,
                "--particle-duration": particle.duration,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="command-background-vignette pointer-events-none absolute inset-0" />
      <div className="command-background-wash pointer-events-none absolute inset-0" />
    </div>
  );
}
