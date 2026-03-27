import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { DashboardExperience } from "./components/dashboard/DashboardExperience";
import { EntryExperience } from "./components/entry/EntryExperience";
import { useAppBootstrap } from "./hooks/useAppBootstrap";
import {
  DEFAULT_DASHBOARD_THEME_ID,
  isDashboardThemeId,
} from "./lib/dashboardThemes";
import { DEFAULT_OKAB_MODEL_ID, isOkabModelId } from "./lib/okabModels";

const ENTRY_COMPLETE_KEY = "prototype111.entry.complete";
const ENTRY_MODEL_KEY = "prototype111.entry.model";
const DASHBOARD_THEME_KEY = "prototype111.dashboard.theme";

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

function getStoredDashboardThemeId() {
  if (typeof window === "undefined") {
    return DEFAULT_DASHBOARD_THEME_ID;
  }

  try {
    const storedThemeId = window.localStorage.getItem(DASHBOARD_THEME_KEY);
    return isDashboardThemeId(storedThemeId) ? storedThemeId : DEFAULT_DASHBOARD_THEME_ID;
  } catch {
    return DEFAULT_DASHBOARD_THEME_ID;
  }
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(getStoredEntryState);
  const [selectedModelId, setSelectedModelId] = useState(getStoredModelId);
  const [selectedThemeId, setSelectedThemeId] = useState(getStoredDashboardThemeId);
  const bootstrap = useAppBootstrap();

  const persistSelectedModel = (modelId: string) => {
    const nextModelId = isOkabModelId(modelId) ? modelId : DEFAULT_OKAB_MODEL_ID;

    try {
      window.localStorage.setItem(ENTRY_MODEL_KEY, nextModelId);
    } catch {
      // Storage access can fail in private contexts; the selected model still works in memory.
    }

    setSelectedModelId(nextModelId);
    return nextModelId;
  };

  const handleEntryComplete = (modelId: string) => {
    persistSelectedModel(modelId);

    try {
      window.localStorage.setItem(ENTRY_COMPLETE_KEY, "true");
    } catch {
      // Storage access can fail in private contexts; the intro still works without persistence.
    }

    setHasEntered(true);
  };

  const persistSelectedTheme = (themeId: string) => {
    const nextThemeId = isDashboardThemeId(themeId) ? themeId : DEFAULT_DASHBOARD_THEME_ID;

    try {
      window.localStorage.setItem(DASHBOARD_THEME_KEY, nextThemeId);
    } catch {
      // Storage access can fail in private contexts; the selected theme still works in memory.
    }

    setSelectedThemeId(nextThemeId);
    return nextThemeId;
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!hasEntered) {
      document.body.removeAttribute("data-dashboard-theme");
      return;
    }

    document.body.setAttribute("data-dashboard-theme", selectedThemeId);

    return () => {
      document.body.removeAttribute("data-dashboard-theme");
    };
  }, [hasEntered, selectedThemeId]);

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
          <DashboardExperience
            bootstrap={bootstrap}
            selectedModelId={selectedModelId}
            onSelectedModelChange={persistSelectedModel}
            selectedThemeId={selectedThemeId}
            onSelectedThemeChange={persistSelectedTheme}
          />
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
