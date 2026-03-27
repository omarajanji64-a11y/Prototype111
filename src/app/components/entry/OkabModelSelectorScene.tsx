import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { DEFAULT_OKAB_MODEL_ID, OKAB_MODEL_OPTIONS } from "../../lib/okabModels";
import { AiParticleField } from "./AiParticleField";

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

interface OkabModelSelectorSceneProps {
  activeModelId?: string | null;
  enteringModelId?: string | null;
  onSelect: (modelId: string) => void;
  title?: string;
  description?: string;
  footerCopy?: string;
  footerAction?: ReactNode;
  overlay?: ReactNode;
}

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

export function getOkabModelProfile(modelId?: string | null) {
  return (
    MODEL_PROFILES.find((profile) => profile.id === modelId) ??
    MODEL_PROFILES.find((profile) => profile.id === DEFAULT_OKAB_MODEL_ID) ??
    MODEL_PROFILES[0]
  );
}

export function OkabModelSelectorScene({
  activeModelId,
  enteringModelId,
  onSelect,
  title = "Choose A Detection Profile",
  description = "Select the monitoring profile you want active by default before entering the live hazard dashboard.",
  footerCopy = "Hover to inspect telemetry. Select a model to enter the system.",
  footerAction,
  overlay,
}: OkabModelSelectorSceneProps) {
  const [hoveredModelId, setHoveredModelId] = useState(activeModelId ?? DEFAULT_OKAB_MODEL_ID);

  useEffect(() => {
    setHoveredModelId(activeModelId ?? DEFAULT_OKAB_MODEL_ID);
  }, [activeModelId]);

  return (
    <div className="sci-entry-stage">
      <AiParticleField variant="drift" />
      <div className="sci-entry-grid" />
      <div className="sci-entry-scanlines" />
      <div className="sci-entry-vignette" />
      <div className="sci-entry-aurora sci-entry-aurora-left" />
      <div className="sci-entry-aurora sci-entry-aurora-right" />

      <motion.section
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
            <h1 className="font-sci-display sci-entry-title">{title}</h1>
            <p className="sci-entry-copy">{description}</p>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-7">
            {MODEL_PROFILES.map((profile, index) => {
              const isHighlighted = hoveredModelId === profile.id;
              const isSelected = activeModelId === profile.id;
              const isEnteringAnother = Boolean(enteringModelId) && enteringModelId !== profile.id;
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
                  onClick={() => onSelect(profile.id)}
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
                          <strong className="font-sci-display sci-card-stat-value">{stat.value}</strong>
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
            <div className="flex flex-col items-center gap-4">
              <p className="font-sci-mono sci-entry-footer-copy">{footerCopy}</p>
              {footerAction}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {overlay}
    </div>
  );
}
