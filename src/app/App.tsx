import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { DashboardExperience } from "./components/dashboard/DashboardExperience";
import { EntryExperience } from "./components/entry/EntryExperience";

const ENTRY_COMPLETE_KEY = "prototype111.entry.complete";
const ENTRY_MODEL_KEY = "prototype111.entry.model";

function getStoredEntryState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(ENTRY_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(getStoredEntryState);

  const handleEntryComplete = (modelId: string) => {
    try {
      window.sessionStorage.setItem(ENTRY_COMPLETE_KEY, "true");
      window.sessionStorage.setItem(ENTRY_MODEL_KEY, modelId);
    } catch {
      // Storage access can fail in private contexts; the intro still works without persistence.
    }

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
          <DashboardExperience />
        </motion.div>
      ) : (
        <motion.div
          key="entry"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <EntryExperience onComplete={handleEntryComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
