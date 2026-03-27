import { useEffect, useState } from "react";

import { cameraFeeds } from "../data/dashboard";
import {
  getAllOkabModelPaths,
  getOkabModelSession,
  preloadOkabModelAsset,
} from "../lib/okabModels";
import {
  warmDashboardSnapshot,
  warmEnvironmentalMetrics,
  warmForestCoverage,
  warmResourceEstimate,
  warmTowerTopology,
} from "../lib/dashboardWarmup";

export interface AppBootstrapState {
  isReady: boolean;
  progress: number;
  statusLabel: string;
}

const BOOTSTRAP_STEPS = [
  "Initializing Autonomous Modules…",
  "Calibrating Environmental Sensors…",
  "Syncing LoRa Networks…",
  "Deploying Modular Towers…",
  "Analyzing Temperature & Humidity…",
  "Scanning for Smoke & Fire…",
  "Processing Real-Time Data…",
  "Optimizing Energy Efficiency…",
  "Connecting Remote Nodes…",
  "Activating Fire Risk Algorithms…",
  "Compiling Forest Coverage Maps…",
  "Estimating Resource Savings…",
  "Preparing Scalable Network…",
  "Standby for Hazard Detection…",
] as const;

const INITIAL_STATE: AppBootstrapState = {
  isReady: false,
  progress: 0,
  statusLabel: BOOTSTRAP_STEPS[0],
};

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function preloadCameraImage(url: string) {
  await new Promise<void>((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";
    image.loading = "eager";
    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().catch(() => undefined).finally(resolve);
        return;
      }

      resolve();
    };
    image.onerror = () => reject(new Error(`Unable to preload image: ${url}`));
    image.src = url;

    if (image.complete) {
      resolve();
    }
  });
}

async function preloadDashboardImages() {
  await Promise.all(cameraFeeds.map((camera) => preloadCameraImage(camera.imageUrl).catch(() => undefined)));
}

async function preloadAIDetectionRoute() {
  await import("../../pages/AIDetection.jsx");
}

async function calibrateSensors() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return;
  }

  try {
    await navigator.mediaDevices.enumerateDevices();
  } catch {
    // Access varies by browser and permissions; detection can still initialize without this.
  }
}

async function waitForFonts() {
  if (!document.fonts?.ready) {
    return;
  }

  try {
    await document.fonts.ready;
  } catch {
    // Font readiness is progressive; do not block boot if the API rejects.
  }
}

async function verifyCriticalResources() {
  const modelPaths = getAllOkabModelPaths();
  await Promise.all(modelPaths.map((path) => getOkabModelSession(path)));
  warmDashboardSnapshot();
}

const BOOTSTRAP_TASKS: Array<() => Promise<unknown>> = [
  preloadAIDetectionRoute,
  calibrateSensors,
  async () => warmTowerTopology(),
  preloadDashboardImages,
  async () => warmEnvironmentalMetrics(),
  async () => preloadOkabModelAsset("/best.onnx"),
  async () => preloadOkabModelAsset("/forest.onnx"),
  waitForFonts,
  async () => getOkabModelSession("/best.onnx"),
  async () => getOkabModelSession("/forest.onnx"),
  async () => warmForestCoverage(),
  async () => warmResourceEstimate(),
  verifyCriticalResources,
  async () => warmDashboardSnapshot(),
];

export function useAppBootstrap() {
  const [bootstrapState, setBootstrapState] = useState<AppBootstrapState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function runBootstrap() {
      for (let index = 0; index < BOOTSTRAP_TASKS.length; index += 1) {
        if (cancelled) {
          return;
        }

        setBootstrapState((currentState) => ({
          ...currentState,
          statusLabel: BOOTSTRAP_STEPS[index],
          progress: Math.round((index / BOOTSTRAP_TASKS.length) * 100),
        }));

        await waitForNextFrame();

        try {
          await BOOTSTRAP_TASKS[index]();
        } catch (error) {
          console.warn("Bootstrap step failed", BOOTSTRAP_STEPS[index], error);
        }

        if (cancelled) {
          return;
        }

        setBootstrapState((currentState) => ({
          ...currentState,
          progress: Math.round(((index + 1) / BOOTSTRAP_TASKS.length) * 100),
        }));
      }

      if (cancelled) {
        return;
      }

      setBootstrapState({
        isReady: true,
        progress: 100,
        statusLabel: BOOTSTRAP_STEPS[BOOTSTRAP_STEPS.length - 1],
      });
    }

    runBootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return bootstrapState;
}
