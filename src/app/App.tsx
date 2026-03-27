import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { DashboardExperience } from "./components/dashboard/DashboardExperience";
import { EntryExperience } from "./components/entry/EntryExperience";
import { useAppBootstrap } from "./hooks/useAppBootstrap";
import { DEFAULT_OKAB_MODEL_ID, isOkabModelId } from "./lib/okabModels";

const ENTRY_COMPLETE_KEY = "prototype111.entry.complete";
const ENTRY_MODEL_KEY = "prototype111.entry.model";

function getStoredEntryState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(ENTRY_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
}

function getStoredModelId() {
  if (typeof window === "undefined") {
    return DEFAULT_OKAB_MODEL_ID;
  }

  try {
    const storedModelId = window.localStorage.getItem(ENTRY_MODEL_KEY);
    return isOkabModelId(storedModelId) ? storedModelId : DEFAULT_OKAB_MODEL_ID;
  } catch {
    return DEFAULT_OKAB_MODEL_ID;
  }
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(getStoredEntryState);
  const [selectedModelId, setSelectedModelId] = useState(getStoredModelId);
  const bootstrap = useAppBootstrap();

  const handleEntryComplete = (modelId: string) => {
    const nextModelId = isOkabModelId(modelId) ? modelId : DEFAULT_OKAB_MODEL_ID;

    try {
      window.localStorage.setItem(ENTRY_COMPLETE_KEY, "true");
      window.localStorage.setItem(ENTRY_MODEL_KEY, nextModelId);
    } catch {
      // Storage access can fail in private contexts; the intro still works without persistence.
    }

    setSelectedModelId(nextModelId);
    setHasEntered(true);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {hasEntered ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, filter: "blur(18px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <DashboardExperience bootstrap={bootstrap} selectedModelId={selectedModelId} />
        </motion.div>
      ) : (
        <motion.div
          key="entry"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <EntryExperience onComplete={handleEntryComplete} bootstrap={bootstrap} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
