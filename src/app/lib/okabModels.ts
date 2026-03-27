import * as ort from "onnxruntime-web";

export type DetectionType = "smoke" | "fire";

export interface OkabModelOption {
  id: string;
  label: string;
  description: string;
  sessionPaths: string[];
  allowedTypes: DetectionType[];
  recommended?: boolean;
}

export const DEFAULT_OKAB_MODEL_ID = "okab-hybrid";

export const OKAB_MODEL_OPTIONS: OkabModelOption[] = [
  {
    id: "okab-smoke",
    label: "OKAB - Smoke",
    description: "Detects smoke in real-time, spotting early signs for fast preventative alerts.",
    sessionPaths: ["/best.onnx"],
    allowedTypes: ["smoke"],
  },
  {
    id: "okab-hybrid",
    label: "OKAB - Hybrid",
    description:
      "Combines smoke and fire detection with faster, more accurate alerts for complete hazard awareness.",
    sessionPaths: ["/best.onnx", "/forest.onnx"],
    allowedTypes: ["smoke", "fire"],
    recommended: true,
  },
  {
    id: "okab-fire",
    label: "OKAB - Fire",
    description: "Specialized in detecting flames, providing rapid alerts to reduce risk and damage.",
    sessionPaths: ["/best.onnx"],
    allowedTypes: ["fire"],
  },
];

const ALL_MODEL_PATHS = [...new Set(OKAB_MODEL_OPTIONS.flatMap((option) => option.sessionPaths))];

const modelAssetCache = new Map<string, Promise<Uint8Array>>();
const modelSessionCache = new Map<string, Promise<ort.InferenceSession>>();

export function isOkabModelId(value: string | null | undefined): value is string {
  return OKAB_MODEL_OPTIONS.some((option) => option.id === value);
}

export function getOkabModelOption(modelId?: string | null) {
  return OKAB_MODEL_OPTIONS.find((option) => option.id === modelId) ?? OKAB_MODEL_OPTIONS[2];
}

export function getOkabModelLabel(modelId?: string | null) {
  return getOkabModelOption(modelId).label;
}

export function getAllOkabModelPaths() {
  return [...ALL_MODEL_PATHS];
}

export async function preloadOkabModelAsset(modelPath: string) {
  const existingAssetPromise = modelAssetCache.get(modelPath);
  if (existingAssetPromise) {
    return existingAssetPromise;
  }

  const assetPromise = fetch(modelPath, { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Unable to preload ${modelPath}.`);
      }

      return new Uint8Array(await response.arrayBuffer());
    })
    .catch((error) => {
      modelAssetCache.delete(modelPath);
      throw error;
    });

  modelAssetCache.set(modelPath, assetPromise);
  return assetPromise;
}

export async function getOkabModelSession(modelPath: string) {
  const existingSessionPromise = modelSessionCache.get(modelPath);
  if (existingSessionPromise) {
    return existingSessionPromise;
  }

  const sessionPromise = preloadOkabModelAsset(modelPath)
    .then((modelBytes) => ort.InferenceSession.create(modelBytes.slice()))
    .catch((error) => {
      modelSessionCache.delete(modelPath);
      throw error;
    });

  modelSessionCache.set(modelPath, sessionPromise);
  return sessionPromise;
}

export async function getOkabModelSessions(modelId?: string | null) {
  const model = getOkabModelOption(modelId);
  return Promise.all(model.sessionPaths.map((path) => getOkabModelSession(path)));
}
