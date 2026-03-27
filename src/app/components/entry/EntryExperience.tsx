import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import type { AppBootstrapState } from "../../hooks/useAppBootstrap";
import { DEFAULT_OKAB_MODEL_ID, OKAB_MODEL_OPTIONS } from "../../lib/okabModels";
import { AiParticleField } from "./AiParticleField";

interface EntryExperienceProps {
  onComplete: (modelId: string) => void;
  bootstrap: AppBootstrapState;
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
  recommended?: boolean;
  stats: Array<{ label: string; value: string }>;
}

const SPLASH_EXIT_DELAY_MS = 360;
const ENTRY_FINALIZE_MS = 1050;

const MODEL_PROFILE_DECOR: Record<
  string,
  Omit<ModelProfile, "description" | "id" | "name">
> = {
  "okab-smoke": {
    label: "Early Smoke Sentinel",
    prompt: "Prioritizes smoke signatures for earlier preventative alerts across towers and field feeds.",
    accent: "#d8b46a",
    glow: "rgba(216, 180, 106, 0.36)",
    stats: [
      { label: "Focus", value: "Smoke" },
      { label: "Latency", value: "0.8 sec" },
      { label: "Coverage", value: "Early" },
    ],
  },
  "okab-fire": {
    label: "Flame Response Core",
    prompt: "Locks onto visible flame activity for rapid escalation and damage-reduction alerts.",
    accent: "#ff7b47",
    glow: "rgba(255, 123, 71, 0.4)",
    stats: [
      { label: "Focus", value: "Flames" },
      { label: "Latency", value: "0.7 sec" },
      { label: "Priority", value: "Rapid" },
    ],
  },
  "okab-hybrid": {
    label: "Dual Hazard Fusion",
    prompt: "Combines smoke and fire intelligence for broader coverage and stronger alert confidence.",
    accent: "#5ef5ff",
    glow: "rgba(94, 245, 255, 0.38)",
    stats: [
      { label: "Coverage", value: "Dual" },
      { label: "Fusion", value: "99.1%" },
      { label: "Mode", value: "Unified" },
    ],
  },
};

const MODEL_PROFILES: ModelProfile[] = OKAB_MODEL_OPTIONS.map((option) => ({
  id: option.id,
  name: option.label,
  description: option.description,
  recommended: option.recommended,
  ...MODEL_PROFILE_DECOR[option.id],
}));

export function EntryExperience({ onComplete, bootstrap }: EntryExperienceProps) {
  const [phase, setPhase] = useState<EntryPhase>(bootstrap.isReady ? "select" : "splash");
  const [hoveredModelId, setHoveredModelId] = useState(DEFAULT_OKAB_MODEL_ID);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "splash" || !bootstrap.isReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("select");
    }, SPLASH_EXIT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bootstrap.isReady, phase]);

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
    MODEL_PROFILES.find((profile) => profile.id === selectedModelId) ??
    MODEL_PROFILES.find((profile) => profile.id === DEFAULT_OKAB_MODEL_ID) ??
    MODEL_PROFILES[0];

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
                Initializing
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-sci-display text-[clamp(3.4rem,9vw,6.4rem)] uppercase tracking-[0.24em] text-white"
              >
                OKAB
              </motion.h1>

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
                  <span>{bootstrap.statusLabel}</span>
                  <span>{bootstrap.progress}%</span>
                </div>
                <div className="sci-progress-shell">
                  <motion.div
                    className="sci-progress-fill"
                    animate={{ width: `${bootstrap.progress}%` }}
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
                <p className="font-sci-mono sci-entry-kicker">OKAB Models</p>
                <h1 className="font-sci-display sci-entry-title">Choose A Detection Profile</h1>
                <p className="sci-entry-copy">
                  Select the monitoring profile you want active by default before entering the live hazard dashboard.
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
                      data-recommended={profile.recommended ? "true" : "false"}
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
                            <p className="font-sci-mono sci-card-label">Model ID</p>
                            <h2 className="font-sci-display sci-card-title">{profile.name}</h2>
                            <p className="sci-card-subtitle">{profile.label}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {profile.recommended ? <div className="sci-card-recommended">Recommended</div> : null}
                            <div className="sci-card-status">
                              <span className="sci-card-status-dot" />
                              Ready
                            </div>
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
                  Hover to inspect telemetry. Select a model to enter the system.
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
                Launching {selectedModel.name}
              </h2>
              <p className="sci-entry-overlay-copy">
                Finalizing the OKAB command environment and moving into live hazard monitoring.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
