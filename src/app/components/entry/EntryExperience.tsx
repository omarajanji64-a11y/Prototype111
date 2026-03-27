import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { AiParticleField } from "./AiParticleField";

interface EntryExperienceProps {
  onComplete: (modelId: string) => void;
}

type EntryPhase = "splash" | "select" | "entering";

interface ModelProfile {
  id: string;
  name: string;
  label: string;
  description: string;
  prompt: string;
  accent: string;
  glow: string;
  stats: Array<{ label: string; value: string }>;
}

const SPLASH_DURATION_MS = 3600;
const SPLASH_EXIT_DELAY_MS = 360;
const ENTRY_FINALIZE_MS = 1050;

const MODEL_PROFILES: ModelProfile[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    label: "Adaptive Mission Core",
    description: "Balanced multimodal reasoning for stable analysis, response planning, and field-ready UI flows.",
    prompt: "Low-latency orchestration with dependable visual inference and tactical summaries.",
    accent: "#5ef5ff",
    glow: "rgba(94, 245, 255, 0.38)",
    stats: [
      { label: "Precision", value: "98.2%" },
      { label: "Latency", value: "34 ms" },
      { label: "Vision Sync", value: "Active" },
    ],
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    label: "Cinematic Intelligence Core",
    description: "High-agency reasoning with deeper synthesis, richer multimodal context, and sharper mission adaptation.",
    prompt: "Enhanced situational awareness for complex decisions, predictive monitoring, and immersive command UX.",
    accent: "#d46cff",
    glow: "rgba(212, 108, 255, 0.42)",
    stats: [
      { label: "Reasoning", value: "Maxed" },
      { label: "Context", value: "256k" },
      { label: "Signal Depth", value: "Ultra" },
    ],
  },
  {
    id: "custom-ai",
    name: "Custom AI",
    label: "Forge Your Own Stack",
    description: "Bring a tuned specialist model into the system with custom behavior, persona shaping, and private logic layers.",
    prompt: "Configurable pipelines for domain-specific inference, experimental tooling, and bespoke operator workflows.",
    accent: "#74a8ff",
    glow: "rgba(116, 168, 255, 0.38)",
    stats: [
      { label: "Extensibility", value: "Open" },
      { label: "Profiles", value: "12 Slots" },
      { label: "Sandbox", value: "Ready" },
    ],
  },
];

export function EntryExperience({ onComplete }: EntryExperienceProps) {
  const [phase, setPhase] = useState<EntryPhase>("splash");
  const [progress, setProgress] = useState(0);
  const [hoveredModelId, setHoveredModelId] = useState(MODEL_PROFILES[1].id);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "splash") {
      return;
    }

    let frameId = 0;
    let timeoutId = 0;
    const startTime = performance.now();

    const tick = (timestamp: number) => {
      const progressRatio = Math.min((timestamp - startTime) / SPLASH_DURATION_MS, 1);
      const easedRatio = 1 - Math.pow(1 - progressRatio, 3);
      setProgress(Math.round(easedRatio * 100));

      if (progressRatio < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      timeoutId = window.setTimeout(() => {
        setPhase("select");
      }, SPLASH_EXIT_DELAY_MS);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "entering" || !selectedModelId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onComplete(selectedModelId);
    }, ENTRY_FINALIZE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [onComplete, phase, selectedModelId]);

  const selectedModel =
    MODEL_PROFILES.find((profile) => profile.id === selectedModelId) ?? MODEL_PROFILES[1];

  const handleSelect = (modelId: string) => {
    if (phase === "entering") {
      return;
    }

    setSelectedModelId(modelId);
    setPhase("entering");
  };

  return (
    <div className="sci-entry-stage">
      <AiParticleField variant={phase === "splash" ? "network" : "drift"} />
      <div className="sci-entry-grid" />
      <div className="sci-entry-scanlines" />
      <div className="sci-entry-vignette" />
      <div className="sci-entry-aurora sci-entry-aurora-left" />
      <div className="sci-entry-aurora sci-entry-aurora-right" />

      <AnimatePresence mode="wait">
        {phase === "splash" ? (
          <motion.section
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(18px)" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
              <motion.p
                className="font-sci-mono sci-entry-kicker"
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                Initializing AI...
              </motion.p>

              <div className="sci-holo-core">
                <div className="sci-holo-ring sci-holo-ring-outer" />
                <div className="sci-holo-ring sci-holo-ring-mid" />
                <div className="sci-holo-hex sci-holo-hex-outer" />
                <div className="sci-holo-hex sci-holo-hex-inner" />
                <div className="sci-holo-pulse" />
                <div className="sci-holo-orbit sci-holo-orbit-forward">
                  <span className="sci-holo-node sci-holo-node-cyan" />
                </div>
                <div className="sci-holo-orbit sci-holo-orbit-reverse">
                  <span className="sci-holo-node sci-holo-node-magenta" />
                </div>
                <div className="sci-holo-centerline" />
              </div>

              <div className="mt-10 w-full max-w-md">
                <div className="font-sci-mono sci-progress-caption">
                  <span>Neural lattice sync</span>
                  <span>{progress}%</span>
                </div>
                <div className="sci-progress-shell">
                  <motion.div
                    className="sci-progress-fill"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="selection"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.7 }}
                className="mx-auto max-w-3xl text-center"
              >
                <p className="font-sci-mono sci-entry-kicker">Model Selection</p>
                <h1 className="font-sci-display sci-entry-title">
                  Choose An Intelligence Core
                </h1>
                <p className="sci-entry-copy">
                  Step through the command gateway, lock in a cognitive profile, and
                  enter the system with a cinematic sci-fi prelaunch feel.
                </p>
              </motion.div>

              <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-7">
                {MODEL_PROFILES.map((profile, index) => {
                  const isHighlighted = hoveredModelId === profile.id;
                  const isSelected = selectedModelId === profile.id;
                  const isEnteringAnother = phase === "entering" && selectedModelId !== profile.id;
                  const style = {
                    "--entry-accent": profile.accent,
                    "--entry-glow": profile.glow,
                  } as CSSProperties;

                  return (
                    <motion.button
                      key={profile.id}
                      type="button"
                      style={style}
                      data-active={isHighlighted || isSelected}
                      data-entering={isEnteringAnother}
                      className="sci-model-card"
                      onMouseEnter={() => setHoveredModelId(profile.id)}
                      onFocus={() => setHoveredModelId(profile.id)}
                      onClick={() => handleSelect(profile.id)}
                      whileHover={{ y: -10, scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      animate={{
                        y: [0, -8 - index * 2, 0],
                        opacity: isEnteringAnother ? 0.42 : 1,
                      }}
                      transition={{
                        y: {
                          duration: 5.4 + index * 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "mirror",
                          ease: "easeInOut",
                        },
                        opacity: { duration: 0.35, ease: "easeInOut" },
                      }}
                    >
                      <span className="sci-model-card-border" />
                      <span className="sci-model-card-scan" />
                      <span className="sci-model-card-spark sci-model-card-spark-a" />
                      <span className="sci-model-card-spark sci-model-card-spark-b" />
                      <span className="sci-model-card-spark sci-model-card-spark-c" />

                      <div className="relative z-10 flex h-full flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-left">
                            <p className="font-sci-mono sci-card-label">Core ID</p>
                            <h2 className="font-sci-display sci-card-title">{profile.name}</h2>
                            <p className="sci-card-subtitle">{profile.label}</p>
                          </div>
                          <div className="sci-card-status">
                            <span className="sci-card-status-dot" />
                            Live
                          </div>
                        </div>

                        <p className="mt-6 text-left sci-card-copy">{profile.description}</p>

                        <div className="mt-8 grid grid-cols-3 gap-3">
                          {profile.stats.map((stat) => (
                            <div key={stat.label} className="sci-card-stat">
                              <span className="font-sci-mono sci-card-stat-label">{stat.label}</span>
                              <strong className="font-sci-display sci-card-stat-value">
                                {stat.value}
                              </strong>
                            </div>
                          ))}
                        </div>

                        <div className="sci-card-popup">
                          <p className="font-sci-mono sci-card-popup-label">Hover Telemetry</p>
                          <p className="sci-card-popup-copy">{profile.prompt}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.65 }}
                className="sci-entry-footer"
              >
                <div className="sci-entry-footer-line" />
                <p className="font-sci-mono sci-entry-footer-copy">
                  Hover to inspect telemetry. Select a core to enter the system.
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "entering" ? (
          <motion.div
            key="entry-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="sci-entry-overlay"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="sci-entry-overlay-card"
            >
              <p className="font-sci-mono sci-entry-kicker">Access Granted</p>
              <h2 className="font-sci-display sci-entry-overlay-title">
                Syncing {selectedModel.name}
              </h2>
              <p className="sci-entry-overlay-copy">
                Holographic shell aligned. Routing you from the cinematic prelaunch deck
                into the live application.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
