import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const MODEL_PATH = "/best.onnx";
const INPUT_SIZE = 640;
const INFERENCE_INTERVAL = 200;
const CONFIDENCE_THRESHOLD = 0.45;
const ALERT_THRESHOLD = 0.8;
const NMS_THRESHOLD = 0.5;
const MAX_LOG_ITEMS = 50;
const ALERT_COOLDOWN = 3000;
const LOG_ENTRY_COOLDOWN = 1500;

const AIDetectionContext = createContext(null);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeScore(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value >= 0 && value <= 1) {
    return value;
  }

  return 1 / (1 + Math.exp(-value));
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatSourceBadge(source) {
  if (source === "IP Camera") return "IP";
  if (source === "Screen Share") return "Screen";
  if (source === "Webcam") return "Webcam";
  return "None";
}

export function formatConfidence(confidence) {
  return Math.round(confidence * 100);
}

export function getDetectionLabel(type) {
  return type === "fire" ? "Fire 🔥" : "Smoke";
}

export function getSeverity(confidence) {
  if (confidence > ALERT_THRESHOLD) return "CRITICAL";
  return "WARNING";
}

export function formatElapsed(timestamp, now) {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  return `${seconds} seconds ago`;
}

function getIoU(first, second) {
  const x1 = Math.max(first.x1, second.x1);
  const y1 = Math.max(first.y1, second.y1);
  const x2 = Math.min(first.x2, second.x2);
  const y2 = Math.min(first.y2, second.y2);
  const intersectionWidth = Math.max(0, x2 - x1);
  const intersectionHeight = Math.max(0, y2 - y1);
  const intersection = intersectionWidth * intersectionHeight;
  const firstArea = Math.max(0, first.x2 - first.x1) * Math.max(0, first.y2 - first.y1);
  const secondArea = Math.max(0, second.x2 - second.x1) * Math.max(0, second.y2 - second.y1);
  const union = firstArea + secondArea - intersection;

  if (union <= 0) {
    return 0;
  }

  return intersection / union;
}

function applyNms(boxes, threshold) {
  const remaining = [...boxes].sort((first, second) => second.confidence - first.confidence);
  const kept = [];

  while (remaining.length > 0) {
    const current = remaining.shift();
    kept.push(current);

    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      if (getIoU(current, remaining[index]) > threshold) {
        remaining.splice(index, 1);
      }
    }
  }

  return kept;
}

function getTensorAccessor(tensor) {
  const dims = tensor?.dims || [];
  const data = tensor?.data;

  if (!data || dims.length === 0) {
    return null;
  }

  if (dims.length === 3) {
    const [, second, third] = dims;

    if (second <= 128 && third > second) {
      return {
        featureCount: second,
        candidateCount: third,
        getValue(candidateIndex, featureIndex) {
          return data[featureIndex * third + candidateIndex];
        },
      };
    }

    return {
      featureCount: third,
      candidateCount: second,
      getValue(candidateIndex, featureIndex) {
        return data[candidateIndex * third + featureIndex];
      },
    };
  }

  if (dims.length === 2) {
    const [first, second] = dims;

    if (first > second) {
      return {
        featureCount: second,
        candidateCount: first,
        getValue(candidateIndex, featureIndex) {
          return data[candidateIndex * second + featureIndex];
        },
      };
    }

    return {
      featureCount: first,
      candidateCount: second,
      getValue(candidateIndex, featureIndex) {
        return data[featureIndex * second + candidateIndex];
      },
    };
  }

  return null;
}

function getCoverMetrics(videoWidth, videoHeight, frameWidth, frameHeight) {
  const scale = Math.max(frameWidth / videoWidth, frameHeight / videoHeight);
  const width = videoWidth * scale;
  const height = videoHeight * scale;

  return {
    scale,
    offsetX: (frameWidth - width) / 2,
    offsetY: (frameHeight - height) / 2,
  };
}

function clearCanvas(canvas) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawDetectionsOnCanvas(canvas, video, detections) {
  if (!canvas || !video) {
    return;
  }

  const renderWidth = canvas.parentElement?.clientWidth || video.clientWidth || video.videoWidth || 0;
  const renderHeight = canvas.parentElement?.clientHeight || video.clientHeight || video.videoHeight || 0;

  if (!renderWidth || !renderHeight) {
    return;
  }

  if (canvas.width !== renderWidth) canvas.width = renderWidth;
  if (canvas.height !== renderHeight) canvas.height = renderHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  drawDetectionAnnotations(
    context,
    detections,
    canvas.width,
    canvas.height,
    video.videoWidth || renderWidth,
    video.videoHeight || renderHeight,
  );
}

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();

  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
  } else {
    context.rect(x, y, width, height);
  }
}

function drawDetectionAnnotations(context, detections, frameWidth, frameHeight, videoWidth, videoHeight) {
  const { scale, offsetX, offsetY } = getCoverMetrics(videoWidth, videoHeight, frameWidth, frameHeight);

  detections.forEach((detection) => {
    const x = detection.x * scale + offsetX;
    const y = detection.y * scale + offsetY;
    const width = detection.width * scale;
    const height = detection.height * scale;
    const strokeStyle = detection.type === "fire" ? "#ef4444" : "#9ca3af";
    const fillStyle = detection.type === "fire" ? "rgba(239,68,68,0.12)" : "rgba(156,163,175,0.12)";
    const label = `${getDetectionLabel(detection.type)} ${formatConfidence(detection.confidence)}%`;

    context.save();
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.lineWidth = 2;
    drawRoundedRect(context, x, y, width, height, 18);
    context.fill();
    context.stroke();
    context.closePath();

    context.font = "600 12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    const labelWidth = context.measureText(label).width + 18;
    const labelX = clamp(x, 0, frameWidth - labelWidth);
    const labelY = Math.max(10, y - 30);
    context.fillStyle = "rgba(13,17,23,0.92)";
    drawRoundedRect(context, labelX, labelY, labelWidth, 22, 999);
    context.fill();
    context.closePath();
    context.fillStyle = strokeStyle;
    context.fillText(label, labelX + 9, labelY + 15);
    context.restore();
  });
}

function captureDetectionSnapshot(video, detections) {
  if (!video || !video.videoWidth || !video.videoHeight || detections.length === 0) {
    return null;
  }

  try {
    const snapshotCanvas = document.createElement("canvas");
    const snapshotWidth = 320;
    const snapshotHeight = Math.round((snapshotWidth * 9) / 16);
    snapshotCanvas.width = snapshotWidth;
    snapshotCanvas.height = snapshotHeight;
    const context = snapshotCanvas.getContext("2d");

    if (!context) {
      return null;
    }

    const { scale, offsetX, offsetY } = getCoverMetrics(
      video.videoWidth,
      video.videoHeight,
      snapshotWidth,
      snapshotHeight,
    );

    context.fillStyle = "#000000";
    context.fillRect(0, 0, snapshotWidth, snapshotHeight);
    context.drawImage(
      video,
      offsetX,
      offsetY,
      video.videoWidth * scale,
      video.videoHeight * scale,
    );
    context.fillStyle = "rgba(0, 0, 0, 0.05)";
    context.fillRect(0, 0, snapshotWidth, snapshotHeight);
    drawDetectionAnnotations(
      context,
      detections,
      snapshotWidth,
      snapshotHeight,
      video.videoWidth,
      video.videoHeight,
    );

    return snapshotCanvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}

function getDetectionSignature(detection) {
  return [
    detection.type,
    Math.round(detection.x / 48),
    Math.round(detection.y / 48),
    Math.round(detection.width / 48),
    Math.round(detection.height / 48),
  ].join(":");
}

function parseOutputTensor(tensor, videoWidth, videoHeight, sourceLabel) {
  const accessor = getTensorAccessor(tensor);

  if (!accessor) {
    return [];
  }

  const rawBoxes = [];

  for (let candidateIndex = 0; candidateIndex < accessor.candidateCount; candidateIndex += 1) {
    const centerXRaw = accessor.getValue(candidateIndex, 0);
    const centerYRaw = accessor.getValue(candidateIndex, 1);
    const widthRaw = accessor.getValue(candidateIndex, 2);
    const heightRaw = accessor.getValue(candidateIndex, 3);

    if (
      !Number.isFinite(centerXRaw) ||
      !Number.isFinite(centerYRaw) ||
      !Number.isFinite(widthRaw) ||
      !Number.isFinite(heightRaw)
    ) {
      continue;
    }

    let classIndex = 0;
    let confidence = 0;

    if (accessor.featureCount === 7) {
      const objectness = normalizeScore(accessor.getValue(candidateIndex, 4));
      const fireScore = normalizeScore(accessor.getValue(candidateIndex, 5));
      const smokeScore = normalizeScore(accessor.getValue(candidateIndex, 6));
      classIndex = smokeScore > fireScore ? 1 : 0;
      confidence = objectness * Math.max(fireScore, smokeScore);
    } else if (accessor.featureCount >= 6) {
      const fireScore = normalizeScore(accessor.getValue(candidateIndex, 4));
      const smokeScore = normalizeScore(accessor.getValue(candidateIndex, 5));
      classIndex = smokeScore > fireScore ? 1 : 0;
      confidence = Math.max(fireScore, smokeScore);
    } else if (accessor.featureCount === 5) {
      classIndex = 0;
      confidence = normalizeScore(accessor.getValue(candidateIndex, 4));
    } else {
      continue;
    }

    if (confidence < CONFIDENCE_THRESHOLD) {
      continue;
    }

    const scale =
      Math.max(Math.abs(centerXRaw), Math.abs(centerYRaw), Math.abs(widthRaw), Math.abs(heightRaw)) <= 2
        ? INPUT_SIZE
        : 1;

    const centerX = centerXRaw * scale;
    const centerY = centerYRaw * scale;
    const width = Math.abs(widthRaw * scale);
    const height = Math.abs(heightRaw * scale);
    const x1 = clamp(centerX - width / 2, 0, INPUT_SIZE);
    const y1 = clamp(centerY - height / 2, 0, INPUT_SIZE);
    const x2 = clamp(centerX + width / 2, 0, INPUT_SIZE);
    const y2 = clamp(centerY + height / 2, 0, INPUT_SIZE);

    if (x2 <= x1 || y2 <= y1) {
      continue;
    }

    rawBoxes.push({
      type: classIndex === 1 ? "smoke" : "fire",
      confidence,
      x1,
      y1,
      x2,
      y2,
    });
  }

  return applyNms(rawBoxes, NMS_THRESHOLD).map((box, index) => {
    const timestamp = Date.now();

    return {
      id: `${timestamp}-${index}-${box.type}`,
      type: box.type,
      confidence: box.confidence,
      timestamp,
      source: sourceLabel,
      x: (box.x1 / INPUT_SIZE) * videoWidth,
      y: (box.y1 / INPUT_SIZE) * videoHeight,
      width: ((box.x2 - box.x1) / INPUT_SIZE) * videoWidth,
      height: ((box.y2 - box.y1) / INPUT_SIZE) * videoHeight,
    };
  });
}

function bindMediaToVideo(video, mediaSource) {
  if (!video) {
    return;
  }

  try {
    video.pause();
  } catch {
    // Ignore pause failures while rebinding the element.
  }

  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  video.srcObject = null;
  video.removeAttribute("src");

  if (mediaSource.kind === "stream" && mediaSource.stream) {
    video.srcObject = mediaSource.stream;
  } else if (mediaSource.kind === "url" && mediaSource.url) {
    video.src = mediaSource.url;
  } else {
    video.load();
    return;
  }

  Promise.resolve(video.play()).catch(() => {
    // Ignore autoplay failures until the user interacts again.
  });
}

function useDetectionEngine(videoRef, isRunning, source, shouldLoadModel, hasActiveSource) {
  const sessionRef = useRef(null);
  const ortRef = useRef(null);
  const logEntriesRef = useRef([]);
  const liveDetectionsRef = useRef([]);
  const lastLoggedRef = useRef(new Map());
  const todayRef = useRef({
    key: getTodayKey(),
    count: 0,
  });
  const [liveDetections, setLiveDetections] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [stats, setStats] = useState({
    detectionsToday: 0,
    activeSource: "None",
    avgConfidence: 0,
  });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [engineError, setEngineError] = useState("");

  useEffect(() => {
    if (!shouldLoadModel || sessionRef.current || engineError) {
      return undefined;
    }

    let cancelled = false;

    async function loadModel() {
      try {
        setEngineError("");
        setIsModelLoaded(false);
        const ort = await import("onnxruntime-web");

        if (cancelled) {
          return;
        }

        ortRef.current = ort;
        ort.env.wasm.numThreads = 1;
        const session = await ort.InferenceSession.create(MODEL_PATH);

        if (cancelled) {
          return;
        }

        sessionRef.current = session;
        setIsModelLoaded(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setEngineError(error instanceof Error ? error.message : "Unable to load ONNX model.");
        setIsModelLoaded(false);
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [engineError, shouldLoadModel]);

  useEffect(() => {
    const todayKey = getTodayKey();

    if (todayRef.current.key !== todayKey) {
      todayRef.current = {
        key: todayKey,
        count: 0,
      };
    }

    const recentDetections = logEntriesRef.current.slice(0, 10);
    const avgConfidence = recentDetections.length
      ? Math.round(
          (recentDetections.reduce((total, detection) => total + detection.confidence, 0) / recentDetections.length) *
            100,
        )
      : 0;

    setStats({
      detectionsToday: todayRef.current.count,
      activeSource: hasActiveSource ? formatSourceBadge(source) : "None",
      avgConfidence,
    });
  }, [hasActiveSource, logEntries, source]);

  useEffect(() => {
    if (!isRunning) {
      liveDetectionsRef.current = [];
      startTransition(() => {
        setLiveDetections([]);
      });
      return undefined;
    }

    if (!sessionRef.current || !ortRef.current || !isModelLoaded || engineError) {
      return undefined;
    }

    let cancelled = false;
    let timeoutId = 0;
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = INPUT_SIZE;
    frameCanvas.height = INPUT_SIZE;
    const frameContext = frameCanvas.getContext("2d", { willReadFrequently: true });

    async function runInference() {
      if (cancelled) {
        return;
      }

      const session = sessionRef.current;
      const ort = ortRef.current;
      const video = videoRef.current;

      if (!session || !ort || !video || !frameContext) {
        timeoutId = window.setTimeout(runInference, INFERENCE_INTERVAL);
        return;
      }

      if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
        timeoutId = window.setTimeout(runInference, INFERENCE_INTERVAL);
        return;
      }

      try {
        frameContext.clearRect(0, 0, INPUT_SIZE, INPUT_SIZE);
        frameContext.drawImage(video, 0, 0, INPUT_SIZE, INPUT_SIZE);
        const pixels = frameContext.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;
        const planeSize = INPUT_SIZE * INPUT_SIZE;
        const input = new Float32Array(planeSize * 3);

        for (let pixelIndex = 0; pixelIndex < planeSize; pixelIndex += 1) {
          const pixelOffset = pixelIndex * 4;
          input[pixelIndex] = pixels[pixelOffset] / 255;
          input[planeSize + pixelIndex] = pixels[pixelOffset + 1] / 255;
          input[planeSize * 2 + pixelIndex] = pixels[pixelOffset + 2] / 255;
        }

        const inputName = session.inputNames?.[0] || "images";
        const outputs = await session.run({
          [inputName]: new ort.Tensor("float32", input, [1, 3, INPUT_SIZE, INPUT_SIZE]),
        });

        if (cancelled) {
          return;
        }

        const outputName = session.outputNames?.[0] || Object.keys(outputs)[0];
        const parsedDetections = parseOutputTensor(
          outputs[outputName],
          video.videoWidth,
          video.videoHeight,
          formatSourceBadge(source),
        );

        liveDetectionsRef.current = parsedDetections;

        const now = Date.now();
        const nextLogEntries = [];

        parsedDetections.forEach((detection) => {
          const signature = getDetectionSignature(detection);
          const lastLoggedAt = lastLoggedRef.current.get(signature) ?? 0;

          if (now - lastLoggedAt >= LOG_ENTRY_COOLDOWN) {
            lastLoggedRef.current.set(signature, now);
            nextLogEntries.push(detection);
          }
        });

        if (nextLogEntries.length > 0) {
          const todayKey = getTodayKey();

          if (todayRef.current.key !== todayKey) {
            todayRef.current = {
              key: todayKey,
              count: 0,
            };
          }

          const snapshot = captureDetectionSnapshot(video, parsedDetections);
          todayRef.current.count += nextLogEntries.length;
          logEntriesRef.current = [
            ...nextLogEntries.map((detection) => ({
              ...detection,
              snapshot,
            })),
            ...logEntriesRef.current,
          ].slice(0, MAX_LOG_ITEMS);
        }

        startTransition(() => {
          setLiveDetections(parsedDetections);

          if (nextLogEntries.length > 0) {
            setLogEntries(logEntriesRef.current);
          }
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setEngineError(error instanceof Error ? error.message : "Inference failed.");
        return;
      }

      if (cancelled) {
        return;
      }

      timeoutId = window.setTimeout(runInference, INFERENCE_INTERVAL);
    }

    runInference();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [engineError, isModelLoaded, isRunning, source, videoRef]);

  return {
    liveDetections,
    logEntries,
    stats,
    isModelLoaded,
    engineError,
  };
}

export function AIDetectionProvider({ children }) {
  const [isPrepared, setIsPrepared] = useState(false);
  const [activeSource, setActiveSource] = useState("Webcam");
  const [ipCameraUrl, setIpCameraUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [showFlash, setShowFlash] = useState(false);
  const [flashToken, setFlashToken] = useState(0);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const [mediaSource, setMediaSource] = useState({
    kind: "none",
    key: 0,
    url: "",
    stream: null,
  });

  const workerVideoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const timeoutIdsRef = useRef([]);
  const lastAlertAtRef = useRef(0);

  const hasActiveSource = mediaSource.kind !== "none";
  const {
    liveDetections,
    logEntries,
    stats,
    isModelLoaded,
    engineError,
  } = useDetectionEngine(workerVideoRef, isRunning, activeSource, isPrepared, hasActiveSource);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    bindMediaToVideo(workerVideoRef.current, mediaSource);
  }, [mediaSource]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const latestDetection = logEntries[0];

    if (!latestDetection || latestDetection.type !== "fire" || latestDetection.confidence <= ALERT_THRESHOLD) {
      return;
    }

    const now = Date.now();

    if (now - lastAlertAtRef.current < ALERT_COOLDOWN) {
      return;
    }

    lastAlertAtRef.current = now;
    setIsOverlayDismissed(false);
    setShowFlash(false);

    window.requestAnimationFrame(() => {
      setFlashToken((current) => current + 1);
      setShowFlash(true);
    });

    const toastId = `${latestDetection.id}-toast`;
    setToasts((current) =>
      [
        {
          id: toastId,
          message: `🔥 Fire detected — ${formatConfidence(latestDetection.confidence)}% confidence`,
        },
        ...current,
      ].slice(0, 3),
    );

    const flashTimeout = window.setTimeout(() => {
      setShowFlash(false);
    }, 1000);
    const toastTimeout = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== toastId));
    }, 4000);

    timeoutIdsRef.current.push(flashTimeout, toastTimeout);

    if (!isMuted) {
      try {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

        if (AudioContextConstructor) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextConstructor();
          }

          const ctx = audioContextRef.current;

          if (ctx.state === "suspended") {
            ctx.resume();
          }

          const osc = ctx.createOscillator();
          osc.frequency.value = 880;
          osc.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch {
        // Keep the dashboard usable even if audio APIs are unavailable.
      }
    }
  }, [isMuted, logEntries]);

  async function stopCurrentSource() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setMediaSource({
      kind: "none",
      key: Date.now(),
      url: "",
      stream: null,
    });
  }

  async function startWebcam() {
    setSourceError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setSourceError("Webcam capture is not supported in this browser.");
      return;
    }

    try {
      await stopCurrentSource();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setMediaSource({
        kind: "stream",
        key: Date.now(),
        url: "",
        stream,
      });
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : "Camera access was denied or is unavailable.");
    }
  }

  async function startScreenShare() {
    setSourceError("");
    setIsOverlayDismissed(false);

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setSourceError("Screen sharing is not supported in this browser.");
      return;
    }

    try {
      await stopCurrentSource();
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 10, max: 15 },
        },
      });
      streamRef.current = stream;
      setMediaSource({
        kind: "stream",
        key: Date.now(),
        url: "",
        stream,
      });

      const [track] = stream.getVideoTracks();

      if (track) {
        track.onended = () => {
          setIsRunning(false);
          setSourceError("Screen share ended.");
          setMediaSource({
            kind: "none",
            key: Date.now(),
            url: "",
            stream: null,
          });
        };
      }
    } catch (error) {
      setSourceError(
        error instanceof Error ? error.message : "Screen share permission was denied or cancelled.",
      );
    }
  }

  async function loadIpCamera() {
    setSourceError("");

    if (!ipCameraUrl.trim()) {
      setSourceError("Enter an IP camera stream URL to continue.");
      return;
    }

    try {
      await stopCurrentSource();
      setMediaSource({
        kind: "url",
        key: Date.now(),
        url: ipCameraUrl.trim(),
        stream: null,
      });
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : "Unable to load the IP camera stream.");
    }
  }

  function primeEngine() {
    setIsPrepared(true);
  }

  function dismissOverlay() {
    setIsOverlayDismissed(true);
  }

  useEffect(() => {
    if (!isPrepared) {
      return;
    }

    setIsRunning(false);
    setSourceError("");
    setIsOverlayDismissed(false);

    if (activeSource === "Webcam") {
      startWebcam();
      return;
    }

    if (activeSource === "Screen Share") {
      startScreenShare();
      return;
    }

    stopCurrentSource();
  }, [activeSource, isPrepared]);

  const contextValue = {
    activeSource,
    setActiveSource,
    ipCameraUrl,
    setIpCameraUrl,
    isRunning,
    setIsRunning,
    isMuted,
    setIsMuted,
    sourceError,
    setSourceError,
    loadIpCamera,
    primeEngine,
    isPrepared,
    detections: logEntries,
    liveDetections,
    stats,
    isModelLoaded,
    modelError: engineError,
    isOverlayDismissed,
    dismissOverlay,
    clock,
    mediaSource,
    flashToken,
    showFlash,
    toasts,
  };

  return (
    <AIDetectionContext.Provider value={contextValue}>
      {children}
      <video ref={workerVideoRef} muted autoPlay playsInline className="hidden" />
    </AIDetectionContext.Provider>
  );
}

export function useAIDetection() {
  const context = useContext(AIDetectionContext);

  if (!context) {
    throw new Error("useAIDetection must be used within AIDetectionProvider.");
  }

  return context;
}

export function DetectionViewport({ className, videoClassName, canvasClassName, emptyClassName }) {
  const { liveDetections, mediaSource, setSourceError } = useAIDetection();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    bindMediaToVideo(videoRef.current, mediaSource);
  }, [mediaSource]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (mediaSource.kind === "none") {
      clearCanvas(canvas);
      return;
    }

    drawDetectionsOnCanvas(canvas, video, liveDetections);
  }, [liveDetections, mediaSource]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const redraw = () => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      if (mediaSource.kind === "none") {
        clearCanvas(canvas);
        return;
      }

      drawDetectionsOnCanvas(canvas, video, liveDetections);
    };

    video.addEventListener("loadedmetadata", redraw);
    window.addEventListener("resize", redraw);

    return () => {
      video.removeEventListener("loadedmetadata", redraw);
      window.removeEventListener("resize", redraw);
    };
  }, [liveDetections, mediaSource]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        crossOrigin="anonymous"
        onError={() => {
          if (mediaSource.kind === "url") {
            setSourceError("Unable to load the current IP camera stream.");
          }
        }}
        className={videoClassName}
      />
      <canvas ref={canvasRef} className={canvasClassName} />
      {mediaSource.kind === "none" && emptyClassName ? <div className={emptyClassName} /> : null}
    </div>
  );
}

export function AIDetectionGlobalChrome({ activeNav }) {
  const {
    activeSource,
    detections,
    isRunning,
    mediaSource,
    isOverlayDismissed,
    dismissOverlay,
  } = useAIDetection();

  const showFloatingMonitor =
    activeNav !== "aiDetection" &&
    mediaSource.kind !== "none" &&
    isRunning &&
    !isOverlayDismissed;
  const latestThreeDetections = detections.slice(0, 3);

  return (
    <>
      <GlobalFlash />
      <GlobalToasts />

      <AnimatePresence>
        {showFloatingMonitor ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-white/10 bg-black/80 p-4 backdrop-blur sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0 sm:w-80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-red-200">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.1, 0.95] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-2.5 w-2.5 rounded-full bg-red-400"
                  />
                  LIVE DETECTING
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  {formatSourceBadge(activeSource)} feed
                </p>
              </div>

              <button
                type="button"
                onClick={dismissOverlay}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                aria-label="Dismiss overlay"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <DetectionViewport
                className="relative aspect-video w-full"
                videoClassName="h-full w-full object-cover"
                canvasClassName="pointer-events-none absolute inset-0 h-full w-full"
              />
            </div>

            <div className="mt-4 space-y-2">
              {latestThreeDetections.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-gray-400">
                  Monitoring for fire and smoke...
                </div>
              ) : (
                latestThreeDetections.map((detection) => (
                  <div
                    key={`floating-${detection.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-white"
                  >
                    <span>{getDetectionLabel(detection.type)}</span>
                    <span className="text-gray-300">{formatConfidence(detection.confidence)}%</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function GlobalFlash() {
  const { showFlash, flashToken } = useFlashState();

  return (
    <AnimatePresence>
      {showFlash ? (
        <motion.div
          key={flashToken}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="pointer-events-none fixed inset-0 z-[70] border-4 border-red-500"
        />
      ) : null}
    </AnimatePresence>
  );
}

function GlobalToasts() {
  const { toasts } = useToastState();

  return (
    <div className="fixed right-4 top-4 z-[80] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 24, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-2xl border border-red-500/20 bg-[#161b22] px-4 py-3 text-sm text-red-100 shadow-[0_18px_50px_rgba(239,68,68,0.22)]"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useFlashState() {
  const context = useContext(AIDetectionContext);

  return {
    flashToken: context.flashToken,
    showFlash: context.showFlash,
  };
}

function useToastState() {
  const context = useContext(AIDetectionContext);

  return {
    toasts: context.toasts,
  };
}
