import { ArrowLeft, Cpu, ScanSearch } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import { getOkabModelLabel, OKAB_MODEL_OPTIONS } from "../../lib/okabModels";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";

interface ModelSwitcherPanelProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onBack: () => void;
}

export function ModelSwitcherPanel({
  selectedModelId,
  onSelectModel,
  onBack,
}: ModelSwitcherPanelProps) {
  return (
    <motion.section
      variants={createStagger(0.08)}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <GlassPanel variants={cardVariants} className="p-5">
        <div className="space-y-5">
          <SectionTitle
            eyebrow="Models"
            title="Model switcher"
            description="The existing ONNX-backed hazard runtime is mapped to OKAB - Hybrid. Choose the default profile you want the tower to use."
            action={
              <ActionButton icon={ArrowLeft} variant="secondary" onClick={onBack}>
                Back
              </ActionButton>
            }
          />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="command-metric-tile p-5" data-tone="safe">
              <p className="command-section-label text-[var(--text-muted)]">Current Model</p>
              <p className="command-holo-title mt-2 text-[24px] font-bold leading-tight text-[var(--text-primary)]">
                {getOkabModelLabel(selectedModelId)}
              </p>
            </div>
            <div className="command-metric-tile p-5" data-tone="warning">
              <p className="command-section-label text-[var(--text-muted)]">Runtime</p>
              <p className="command-holo-title mt-2 text-[24px] font-bold leading-tight text-[var(--text-primary)]">
                ONNX
              </p>
            </div>
            <div className="command-metric-tile p-5" data-tone="critical">
              <p className="command-section-label text-[var(--text-muted)]">Recommended</p>
              <p className="command-holo-title mt-2 text-[24px] font-bold leading-tight text-[var(--text-primary)]">
                OKAB - Hybrid
              </p>
            </div>
          </div>
        </div>
      </GlassPanel>

      <motion.div
        variants={createStagger(0.08)}
        className="grid gap-3 xl:grid-cols-3"
      >
        {OKAB_MODEL_OPTIONS.map((model) => {
          const isActive = model.id === selectedModelId;

          return (
            <GlassPanel
              key={model.id}
              variants={listItemVariants}
              interactive
              className={`p-5 ${isActive ? "border-[rgba(141,240,255,0.24)]" : ""}`}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="command-section-label text-[var(--text-muted)]">OKAB Profile</p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{model.label}</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--accent-primary)]">
                    <Cpu className="h-5 w-5" />
                  </div>
                </div>

                <p className="text-sm leading-6 text-[var(--text-secondary)]">{model.description}</p>

                <div className="rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] p-4 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <ScanSearch className="h-4 w-4 text-[var(--accent-primary)]" />
                    Runtime: {model.id === "okab-hybrid" ? "ONNX linked" : "OKAB tuned"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <ActionButton
                    variant={isActive ? "primary" : "secondary"}
                    onClick={() => onSelectModel(model.id)}
                  >
                    {isActive ? "Active Model" : "Use This Model"}
                  </ActionButton>
                  {model.recommended ? (
                    <div className="command-recommended-chip inline-flex">Recommended</div>
                  ) : null}
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
