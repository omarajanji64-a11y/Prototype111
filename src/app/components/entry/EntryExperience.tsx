import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import type { AppBootstrapState } from "../../hooks/useAppBootstrap";
import { AiParticleField } from "./AiParticleField";
import { getOkabModelProfile, OkabModelSelectorScene } from "./OkabModelSelectorScene";

interface EntryExperienceProps {
  onComplete: (modelId: string) => void;
  bootstrap: AppBootstrapState;
}

type EntryPhase = "splash" | "select" | "entering";

const SPLASH_EXIT_DELAY_MS = 360;
const ENTRY_FINALIZE_MS = 1050;

export function EntryExperience({ onComplete, bootstrap }: EntryExperienceProps) {
  const [phase, setPhase] = useState<EntryPhase>(bootstrap.isReady ? "select" : "splash");
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

  const selectedModel = getOkabModelProfile(selectedModelId);

  const handleSelect = (modelId: string) => {
    if (phase === "entering") {
      return;
    }

    setSelectedModelId(modelId);
    setPhase("entering");
  };

  return (
    <AnimatePresence mode="wait">
      {phase === "splash" ? (
        <div className="sci-entry-stage">
          <AiParticleField variant="network" />
          <div className="sci-entry-grid" />
          <div className="sci-entry-scanlines" />
          <div className="sci-entry-vignette" />
          <div className="sci-entry-aurora sci-entry-aurora-left" />
          <div className="sci-entry-aurora sci-entry-aurora-right" />

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
        </div>
      ) : (
        <OkabModelSelectorScene
          activeModelId={selectedModelId}
          enteringModelId={phase === "entering" ? selectedModelId : null}
          onSelect={handleSelect}
          overlay={
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
          }
        />
      )}
    </AnimatePresence>
  );
}
