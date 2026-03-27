import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { ActionButton } from "../shared/ActionButton";
import { getOkabModelProfile, OkabModelSelectorScene } from "../entry/OkabModelSelectorScene";

interface ModelSwitcherPanelProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onBack: () => void;
}

const MODEL_SWITCH_DELAY_MS = 1050;

export function ModelSwitcherPanel({
  selectedModelId,
  onSelectModel,
  onBack,
}: ModelSwitcherPanelProps) {
  const [switchingModelId, setSwitchingModelId] = useState<string | null>(null);
  const switchingModel = getOkabModelProfile(switchingModelId);

  useEffect(() => {
    if (!switchingModelId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSelectModel(switchingModelId);
      setSwitchingModelId(null);
    }, MODEL_SWITCH_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [onSelectModel, switchingModelId]);

  const handleSelect = (modelId: string) => {
    if (switchingModelId) {
      return;
    }

    setSwitchingModelId(modelId);
  };

  return (
    <OkabModelSelectorScene
      activeModelId={switchingModelId ?? selectedModelId}
      enteringModelId={switchingModelId}
      onSelect={handleSelect}
      description="Select the monitoring profile you want active by default across the live hazard dashboard."
      footerCopy="Hover to inspect telemetry. Select a model to switch the live OKAB profile."
      footerAction={
        <ActionButton icon={ArrowLeft} variant="secondary" onClick={onBack}>
          Back
        </ActionButton>
      }
      overlay={
        <AnimatePresence>
          {switchingModelId ? (
            <motion.div
              key="model-switch-overlay"
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
                <p className="font-sci-mono sci-entry-kicker">Model Switching</p>
                <h2 className="font-sci-display sci-entry-overlay-title">
                  Activating {switchingModel.name}
                </h2>
                <p className="sci-entry-overlay-copy">
                  Reconfiguring the OKAB runtime and updating the Main Tower detection profile.
                </p>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      }
    />
  );
}
