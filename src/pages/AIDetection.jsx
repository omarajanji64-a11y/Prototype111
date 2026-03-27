import { useEffect, useRef, useState } from "react";
import * as ort from "onnxruntime-web";
import { AnimatePresence, motion } from "motion/react";
import {
  Camera,
  ChevronDown,
  Link2,
  LoaderCircle,
  MonitorUp,
  TriangleAlert,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import {
  DEFAULT_OKAB_MODEL_ID,
  OKAB_MODEL_OPTIONS,
  getOkabModelLabel,
  getOkabModelOption,
  getOkabModelSessions,
} from "../app/lib/okabModels";

const SOURCE_TABS = [
  { id: "webcam", label: "Webcam", badge: "Webcam" },
  { id: "ip", label: "IP Camera", badge: "IP" },
  { id: "screen", label: "Screen Share", badge: "Screen" },
];

const INPUT_SIZE = 640;
const INFERENCE_INTERVAL = 200;
const DETECTION_THRESHOLD = 0.45;
const NMS_THRESHOLD = 0.5;
const ALERT_THRESHOLD = 0.8;
const LOG_LIMIT = 50;
const LOG_COOLDOWN_MS = 1200;

function getSourceBadge(source) {
  return SOURCE_TABS.find((tab) => tab.id === source)?.badge ?? "None";
}

function getModelLabel(modelId) {
  return getOkabModelLabel(modelId);
}

function getDetectionLabel(type) {
  return type === "fire" ? "Fire 🔥" : "Smoke 💨";
}

function getDetectionEmoji(type) {
  return type === "fire" ? "🔥" : "💨";
}

function formatConfidence(confidence) {
  return `${Math.round(confidence * 100)}%`;
}

function formatElapsed(timestamp, now) {
  const seconds = Math.max(1, Math.floor((now - timestamp) / 1000));

  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function getSeverity(confidence) {
  return confidence > ALERT_THRESHOLD ? "CRITICAL" : "WARNING";
}

function getSeverityClasses(confidence) {
  return confidence > ALERT_THRESHOLD
    ? "border-[rgba(239,68,68,0.2)] bg-[var(--critical-dim)] text-[var(--critical)]"
    : "border-[rgba(251,191,36,0.2)] bg-[var(--warning-dim)] text-[var(--warning)]";
}

function clearCanvas(canvas) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawRoundedRect(context, x, y, width, height, radius) {
  if (typeof context.roundRect === "function") {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.closePath();
    return;
  }

  context.beginPath();
  context.rect(x, y, width, height);
  context.closePath();
}

function getIoU(a, b) {
  const x1 = Math.max(a.left, b.left);
  const y1 = Math.max(a.top, b.top);
  const x2 = Math.min(a.left + a.width, b.left + b.width);
  const y2 = Math.min(a.top + a.height, b.top + b.height);

  const intersectionWidth = Math.max(0, x2 - x1);
  const intersectionHeight = Math.max(0, y2 - y1);
  const intersectionArea = intersectionWidth * intersectionHeight;
  const unionArea = a.width * a.height + b.width * b.height - intersectionArea;

  if (!unionArea) {
    return 0;
  }

  return intersectionArea / unionArea;
}

function applyNms(detections, threshold) {
  const sortedDetections = [...detections].sort((a, b) => b.confidence - a.confidence);
  const results = [];

  while (sortedDetections.length > 0) {
    const candidate = sortedDetections.shift();

    if (!candidate) {
      continue;
    }

    results.push(candidate);

    for (let index = sortedDetections.length - 1; index >= 0; index -= 1) {
      if (getIoU(candidate, sortedDetections[index]) > threshold) {
        sortedDetections.splice(index, 1);
      }
    }
  }

  return results;
}

function drawDetectionShapes(context, detections, scaleX, scaleY) {
  context.lineWidth = 2;
  context.font = '600 12px "Inter", sans-serif';
  context.textBaseline = "top";

  detections.forEach((detection) => {
    const color = detection.type === "fire" ? "#c9a227" : "#e6d28f";
    const label = `${getDetectionLabel(detection.type)} ${formatConfidence(detection.confidence)}`;
    const x = detection.left * scaleX;
    const y = detection.top * scaleY;
    const width = detection.width * scaleX;
    const height = detection.height * scaleY;

    context.strokeStyle = color;
    context.strokeRect(x, y, width, height);

    const textMetrics = context.measureText(label);
    const pillWidth = textMetrics.width + 18;
    const pillHeight = 24;
    const pillX = x;
    const pillY = Math.max(6, y - pillHeight - 6);

    context.fillStyle = "rgba(17, 24, 39, 0.92)";
    drawRoundedRect(context, pillX, pillY, pillWidth, pillHeight, 999);
    context.fill();

    context.fillStyle = color;
    context.fillText(label, pillX + 9, pillY + 6);
  });
}

function drawDetections(canvas, video, detections) {
  if (!canvas || !video) {
    return;
  }

  const context = canvas.getContext("2d");
  const bounds = canvas.getBoundingClientRect();

  if (!context || !bounds.width || !bounds.height || !video.videoWidth || !video.videoHeight) {
    clearCanvas(canvas);
    return;
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  const nextWidth = Math.round(bounds.width * devicePixelRatio);
  const nextHeight = Math.round(bounds.height * devicePixelRatio);

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  const scaleX = bounds.width / video.videoWidth;
  const scaleY = bounds.height / video.videoHeight;
  drawDetectionShapes(context, detections, scaleX, scaleY);
}

function captureDetectionSnapshot(video, detections) {
  if (!video?.videoWidth || !video?.videoHeight) {
    return null;
  }

  try {
    const snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.width = video.videoWidth;
    snapshotCanvas.height = video.videoHeight;

    const context = snapshotCanvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
    drawDetectionShapes(context, detections, 1, 1);
    return snapshotCanvas.toDataURL("image/jpeg", 0.76);
  } catch {
    return null;
  }
}

function buildInferenceInput(imageData, targetBuffer) {
  const { data } = imageData;
  const pixelCount = INPUT_SIZE * INPUT_SIZE;

  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * 4;
    targetBuffer[index] = data[offset] / 255;
    targetBuffer[pixelCount + index] = data[offset + 1] / 255;
    targetBuffer[pixelCount * 2 + index] = data[offset + 2] / 255;
  }

  return targetBuffer;
}

function parseDetections(outputTensor, videoWidth, videoHeight) {
  if (!outputTensor?.data || !outputTensor?.dims?.length) {
    return [];
  }

  const { data, dims } = outputTensor;
  let featureCount = 0;
  let candidateCount = 0;
  let readValue = () => 0;

  if (dims.length === 3) {
    const secondDimension = dims[1];
    const thirdDimension = dims[2];

    if (secondDimension <= 16 && thirdDimension > 16) {
      featureCount = secondDimension;
      candidateCount = thirdDimension;
      readValue = (candidateIndex, featureIndex) => data[featureIndex * candidateCount + candidateIndex];
    } else {
      candidateCount = secondDimension;
      featureCount = thirdDimension;
      readValue = (candidateIndex, featureIndex) => data[candidateIndex * featureCount + featureIndex];
    }
  } else if (dims.length === 2) {
    candidateCount = dims[0];
    featureCount = dims[1];
    readValue = (candidateIndex, featureIndex) => data[candidateIndex * featureCount + featureIndex];
  } else {
    return [];
  }

  if (featureCount < 5 || !candidateCount) {
    return [];
  }

  const scaleX = videoWidth / INPUT_SIZE;
  const scaleY = videoHeight / INPUT_SIZE;
  const rawDetections = [];

  for (let candidateIndex = 0; candidateIndex < candidateCount; candidateIndex += 1) {
    const xCenter = readValue(candidateIndex, 0);
    const yCenter = readValue(candidateIndex, 1);
    const width = readValue(candidateIndex, 2);
    const height = readValue(candidateIndex, 3);

    const classScores =
      featureCount === 5
        ? [readValue(candidateIndex, 4), 0]
        : [readValue(candidateIndex, 4), readValue(candidateIndex, 5)];

    const smokeScore = classScores[1] ?? 0;
    const fireScore = classScores[0] ?? 0;
    const type = fireScore >= smokeScore ? "fire" : "smoke";
    const confidence = Math.max(fireScore, smokeScore);

    if (confidence <= DETECTION_THRESHOLD || width <= 1 || height <= 1) {
      continue;
    }

    const left = Math.max(0, (xCenter - width / 2) * scaleX);
    const top = Math.max(0, (yCenter - height / 2) * scaleY);
    const scaledWidth = Math.min(videoWidth - left, width * scaleX);
    const scaledHeight = Math.min(videoHeight - top, height * scaleY);

    if (scaledWidth <= 1 || scaledHeight <= 1) {
      continue;
    }

    rawDetections.push({
      type,
      confidence,
      left,
      top,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  return applyNms(rawDetections, NMS_THRESHOLD);
}

async function runSessionInference(session, tensor) {
  const inputName = session.inputNames?.[0] ?? "images";
  const outputs = await session.run({ [inputName]: tensor });
  return Object.values(outputs)[0];
}

function useDetectionEngine(videoRef, canvasRef, isRunning, modelId) {
  const [detections, setDetections] = useState([]);
  const [detectionsToday, setDetectionsToday] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [modelError, setModelError] = useState("");
  const [runtimeError, setRuntimeError] = useState("");

  const sessionRef = useRef([]);
  const processingCanvasRef = useRef(null);
  const processingContextRef = useRef(null);
  const inputBufferRef = useRef(new Float32Array(3 * INPUT_SIZE * INPUT_SIZE));
  const loopTimeoutRef = useRef(null);
  const lastLoggedAtRef = useRef({});

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      setIsLoadingModel(true);
      setIsModelLoaded(false);
      setModelError("");
      setRuntimeError("");
      clearCanvas(canvasRef.current);

      try {
        const nextSessions = await getOkabModelSessions(modelId);

        if (cancelled) {
          return;
        }

        sessionRef.current = nextSessions;
        setIsModelLoaded(true);
        setIsLoadingModel(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setModelError(error instanceof Error ? error.message : "Unable to load the selected model.");
        setIsModelLoaded(false);
        setIsLoadingModel(false);
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [canvasRef, modelId]);

  useEffect(() => {
    return () => {
      window.clearTimeout(loopTimeoutRef.current);
      sessionRef.current = [];
      clearCanvas(canvasRef.current);
    };
  }, [canvasRef]);

  useEffect(() => {
    let cancelled = false;

    window.clearTimeout(loopTimeoutRef.current);

    if (!isRunning || !isModelLoaded || sessionRef.current.length === 0) {
      setRuntimeError("");
      clearCanvas(canvasRef.current);
      return () => {
        cancelled = true;
      };
    }

    if (!processingCanvasRef.current) {
      processingCanvasRef.current = document.createElement("canvas");
      processingCanvasRef.current.width = INPUT_SIZE;
      processingCanvasRef.current.height = INPUT_SIZE;
    }

    if (!processingContextRef.current) {
      processingContextRef.current = processingCanvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
    }

    const processingContext = processingContextRef.current;

    async function runInference() {
      if (cancelled) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const sessions = sessionRef.current;
      const activeModel = getOkabModelOption(modelId);
      const allowedTypes = new Set(activeModel.allowedTypes);

      if (
        !video ||
        !canvas ||
        sessions.length === 0 ||
        !processingContext ||
        video.readyState < 2 ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        loopTimeoutRef.current = window.setTimeout(runInference, INFERENCE_INTERVAL);
        return;
      }

      try {
        processingContext.drawImage(video, 0, 0, INPUT_SIZE, INPUT_SIZE);
        const imageData = processingContext.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
        const input = buildInferenceInput(imageData, inputBufferRef.current);
        const tensor = new ort.Tensor("float32", input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
        const outputs = await Promise.all(sessions.map((session) => runSessionInference(session, tensor)));

        if (cancelled) {
          return;
        }

        const nextDetections = applyNms(
          outputs
            .flatMap((outputTensor) => parseDetections(outputTensor, video.videoWidth, video.videoHeight))
            .filter((detection) => allowedTypes.has(detection.type)),
          NMS_THRESHOLD,
        );
        setRuntimeError("");
        drawDetections(canvas, video, nextDetections);

        if (nextDetections.length > 0) {
          const detectionTime = Date.now();
          const source = video.dataset.source || "webcam";
          const snapshot = captureDetectionSnapshot(video, nextDetections);
          const newLogEntries = [];

          nextDetections.forEach((detection) => {
            const xBucket = Math.round(detection.left / 96);
            const yBucket = Math.round(detection.top / 96);
            const dedupeKey = `${source}:${detection.type}:${xBucket}:${yBucket}`;
            const lastLoggedAt = lastLoggedAtRef.current[dedupeKey] ?? 0;

            if (detectionTime - lastLoggedAt < LOG_COOLDOWN_MS) {
              return;
            }

            lastLoggedAtRef.current[dedupeKey] = detectionTime;
            newLogEntries.push({
              id: `${detection.type}-${detectionTime}-${Math.random().toString(36).slice(2, 8)}`,
              type: detection.type,
              confidence: detection.confidence,
              timestamp: detectionTime,
              source,
              snapshot,
              box: {
                left: detection.left,
                top: detection.top,
                width: detection.width,
                height: detection.height,
              },
              label: getDetectionLabel(detection.type),
              modelId,
            });
          });

          if (newLogEntries.length > 0) {
            setDetections((currentDetections) => [...newLogEntries, ...currentDetections].slice(0, LOG_LIMIT));
            setDetectionsToday((currentCount) => currentCount + newLogEntries.length);
          }
        }
      } catch (error) {
        if (!cancelled) {
          const nextMessage =
            error instanceof Error &&
            (error.name === "SecurityError" || /cross-origin|taint/i.test(error.message))
              ? "This stream blocks browser frame access, so live detection cannot read pixels from it."
              : error instanceof Error && error.message
                ? error.message
                : "Live inference failed while reading the current source.";

          setRuntimeError(nextMessage);
        }
      } finally {
        if (!cancelled) {
          loopTimeoutRef.current = window.setTimeout(runInference, INFERENCE_INTERVAL);
        }
      }
    }

    runInference();

    return () => {
      cancelled = true;
      window.clearTimeout(loopTimeoutRef.current);
      clearCanvas(canvasRef.current);
    };
  }, [canvasRef, isModelLoaded, isRunning, modelId, videoRef]);

  const lastTenDetections = detections.slice(0, 10);
  const averageConfidence =
    lastTenDetections.length > 0
      ? lastTenDetections.reduce((sum, detection) => sum + detection.confidence, 0) / lastTenDetections.length
      : 0;

  return {
    detections,
    stats: {
      detectionsToday,
      avgConfidence: averageConfidence,
    },
    isModelLoaded,
    isLoadingModel,
    modelError,
    runtimeError,
  };
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] border-l-2 border-l-[var(--accent-primary)] bg-[var(--bg-card)] p-4">
      <p className="command-section-label text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-[28px] font-bold leading-none text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function AIDetection({ defaultModelId = DEFAULT_OKAB_MODEL_ID }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const flashTimeoutRef = useRef(null);
  const toastTimeoutsRef = useRef({});
  const handledAlertsRef = useRef(new Set());

  const [activeSource, setActiveSource] = useState("webcam");
  const [ipCameraUrl, setIpCameraUrl] = useState("");
  const [isSourceReady, setIsSourceReady] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [modelId, setModelId] = useState(getOkabModelOption(defaultModelId).id);
  const [toasts, setToasts] = useState([]);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [borderFlash, setBorderFlash] = useState({ visible: false, key: 0 });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setModelId(getOkabModelOption(defaultModelId).id);
  }, [defaultModelId]);

  const { detections, stats, isModelLoaded, isLoadingModel, modelError, runtimeError } = useDetectionEngine(
    videoRef,
    canvasRef,
    isRunning && isSourceReady,
    modelId,
  );

  const currentModel = getOkabModelOption(modelId);
  const canStartDetection = isSourceReady && isModelLoaded && !isLoadingModel && !modelError;
  const activeSourceStat = isSourceReady ? getSourceBadge(activeSource) : "None";
  const showOverlay = activeSource === "screen" && isRunning && !isOverlayDismissed;
  const latestOverlayDetections = detections.slice(0, 3);

  function stopCurrentSource() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.onloadedmetadata = null;
    video.onloadeddata = null;
    video.onerror = null;
    video.pause();
    video.srcObject = null;

    if (video.getAttribute("src")) {
      video.removeAttribute("src");
      video.load();
    }
  }

  function setVideoDatasetSource(source) {
    if (videoRef.current) {
      videoRef.current.dataset.source = source;
    }
  }

  function attachStream(stream, source) {
    const video = videoRef.current;

    if (!video) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    streamRef.current = stream;
    video.srcObject = stream;
    video.dataset.source = source;

    video
      .play()
      .then(() => {
        setIsSourceReady(true);
        setSourceError("");
      })
      .catch(() => {
        setIsSourceReady(true);
      });

    const [track] = stream.getVideoTracks();
    if (track) {
      track.onended = () => {
        setIsRunning(false);
        setIsSourceReady(false);
        setSourceError(source === "screen" ? "Screen sharing ended." : "Camera feed was disconnected.");
        clearCanvas(canvasRef.current);
      };
    }
  }

  useEffect(() => {
    let cancelled = false;

    setVideoDatasetSource(activeSource);
    setIsRunning(false);
    setIsSourceReady(false);
    setSourceError("");
    setIsOverlayDismissed(false);
    clearCanvas(canvasRef.current);
    stopCurrentSource();

    async function prepareSource() {
      if (activeSource === "ip") {
        return;
      }

      const mediaDevices = navigator.mediaDevices;
      if (!mediaDevices) {
        setSourceError("This browser does not support live media capture.");
        return;
      }

      try {
        const stream =
          activeSource === "webcam"
            ? await mediaDevices.getUserMedia({ video: true, audio: false })
            : await mediaDevices.getDisplayMedia({ video: true, audio: false });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        attachStream(stream, activeSource);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const fallbackMessage = activeSource === "screen" ? "Screen sharing could not start." : "Camera access failed.";
        const nextMessage =
          error instanceof Error && error.message
            ? error.message
            : activeSource === "webcam"
              ? "Camera permission denied. Allow access to use webcam detection."
              : "Screen sharing was canceled or blocked.";

        setSourceError(nextMessage || fallbackMessage);
      }
    }

    prepareSource();

    return () => {
      cancelled = true;
      stopCurrentSource();
    };
  }, [activeSource]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isRunning || activeSource !== "screen") {
      setIsOverlayDismissed(false);
    }
  }, [activeSource, isRunning]);

  useEffect(() => {
    detections.forEach((detection) => {
      if (detection.type !== "fire" || detection.confidence <= ALERT_THRESHOLD) {
        return;
      }

      if (handledAlertsRef.current.has(detection.id)) {
        return;
      }

      handledAlertsRef.current.add(detection.id);

      setBorderFlash((current) => ({ visible: true, key: current.key + 1 }));
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = window.setTimeout(() => {
        setBorderFlash((current) => ({ ...current, visible: false }));
      }, 1000);

      const toastId = `toast-${detection.id}`;
      setToasts((currentToasts) =>
        [
          {
            id: toastId,
            message: `🔥 Fire detected — ${formatConfidence(detection.confidence)} confidence`,
          },
          ...currentToasts,
        ].slice(0, 3),
      );

      toastTimeoutsRef.current[toastId] = window.setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
        delete toastTimeoutsRef.current[toastId];
      }, 4000);

      if (!isMuted) {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextCtor) {
          return;
        }

        const audioContext = audioContextRef.current ?? new AudioContextCtor();
        audioContextRef.current = audioContext;

        Promise.resolve(audioContext.state === "suspended" ? audioContext.resume() : undefined)
          .catch(() => undefined)
          .finally(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.08;
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
          });
      }
    });
  }, [detections, isMuted]);

  useEffect(() => {
    return () => {
      stopCurrentSource();
      window.clearTimeout(flashTimeoutRef.current);

      Object.values(toastTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      toastTimeoutsRef.current = {};

      if (audioContextRef.current && typeof audioContextRef.current.close === "function") {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  function loadIpCamera() {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const url = ipCameraUrl.trim();
    setIsRunning(false);
    setIsSourceReady(false);
    setSourceError("");
    clearCanvas(canvasRef.current);
    stopCurrentSource();
    setVideoDatasetSource("ip");

    if (!url) {
      setSourceError("Enter an IP camera stream URL to start this source.");
      return;
    }

    video.crossOrigin = "anonymous";
    video.src = url;
    video.dataset.source = "ip";
    video.onloadeddata = () => {
      setIsSourceReady(true);
      setSourceError("");
      video.play().catch(() => undefined);
    };
    video.onerror = () => {
      setIsSourceReady(false);
      setSourceError("Unable to load this IP camera stream. Check the URL and browser stream support.");
    };
    video.load();
  }

  function handleSourceChange(nextSource) {
    if (nextSource === activeSource) {
      return;
    }

    setActiveSource(nextSource);
  }

  const videoMessage = (() => {
    if (modelError) {
      return {
        title: "Model failed to load",
        description: modelError,
        icon: <TriangleAlert className="h-7 w-7 text-red-400" />,
      };
    }

    if (isLoadingModel) {
      return {
        title: "Loading model",
        description: `Preparing ${currentModel.label} for live inference.`,
        icon: (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          >
            <LoaderCircle className="h-7 w-7 text-[#c2410c]" />
          </motion.div>
        ),
      };
    }

    if (sourceError) {
      return {
        title: "Source unavailable",
        description: sourceError,
        icon:
          activeSource === "webcam" ? (
            <Camera className="h-7 w-7 text-amber-400" />
          ) : activeSource === "screen" ? (
            <MonitorUp className="h-7 w-7 text-amber-400" />
          ) : (
            <Link2 className="h-7 w-7 text-amber-400" />
          ),
      };
    }

    if (runtimeError) {
      return {
        title: "Detection unavailable",
        description: runtimeError,
        icon: <TriangleAlert className="h-7 w-7 text-amber-400" />,
      };
    }

    if (activeSource === "ip" && !isSourceReady) {
      return {
        title: "IP stream not connected",
        description: ipCameraUrl.trim()
          ? "Press Load Stream to connect the entered IP camera source."
          : "Enter a stream URL and load it to begin.",
        icon: <Link2 className="h-7 w-7 text-gray-300" />,
      };
    }

    if (!isSourceReady) {
      return {
        title: activeSource === "screen" ? "Waiting for screen share" : "Waiting for video source",
        description:
          activeSource === "screen"
            ? "Choose a screen or window to start detection."
            : "Allow webcam access to begin live detection.",
        icon: activeSource === "screen" ? (
          <MonitorUp className="h-7 w-7 text-gray-300" />
        ) : (
          <Video className="h-7 w-7 text-gray-300" />
        ),
      };
    }

    return null;
  })();

  return (
    <>
      <AnimatePresence>
        {borderFlash.visible ? (
          <motion.div
            key={borderFlash.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 0.45, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="pointer-events-none fixed inset-3 z-[70] rounded-xl border border-[var(--critical)]"
          />
        ) : null}
      </AnimatePresence>

      <div className="space-y-3 pb-6">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="command-section-label">AI Detection</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex h-2 w-2 items-center justify-center">
                  <motion.span
                    animate={
                      isRunning
                        ? { scale: [1, 1.7, 1], opacity: [0.4, 0.95, 0.4] }
                        : { scale: 1, opacity: 0.28 }
                    }
                    transition={{
                      duration: 1.4,
                      repeat: isRunning ? Number.POSITIVE_INFINITY : 0,
                      ease: "easeInOut",
                    }}
                    className="absolute h-2 w-2 rounded-full bg-[var(--critical)]"
                  />
                  <span className="relative h-2 w-2 rounded-full bg-[var(--critical)]" />
                </div>

                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">AI Detection</h1>

                <span className="rounded-md bg-[rgba(14,165,233,0.1)] px-2 py-0.5 text-xs font-medium text-[var(--accent-glow)]">
                  {currentModel.label}
                </span>
              </div>

              <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
                Run live OKAB detection with model switching, annotated snapshots in the log, and alerting tuned for
                rapid incident review.
              </p>
            </div>

            <div className="space-y-2">
              <p className="command-section-label">Model Selector</p>
              <div className="relative">
                <select
                  value={modelId}
                  onChange={(event) => setModelId(event.target.value)}
                  className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-2.5 pl-4 pr-16 text-sm font-medium text-[var(--text-primary)] outline-none transition-colors duration-150 focus:border-[var(--border-hover)]"
                >
                  {OKAB_MODEL_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {isLoadingModel ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                    className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]"
                  >
                    <LoaderCircle className="h-4.5 w-4.5" />
                  </motion.div>
                ) : null}

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              </div>
              <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--text-secondary)]">
                {currentModel.description}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.04, ease: "easeOut" }}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              {SOURCE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSourceChange(tab.id)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    activeSource === tab.id
                      ? "border-transparent bg-[var(--accent-primary)] text-white"
                      : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeSource === "ip" ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={ipCameraUrl}
                    onChange={(event) => setIpCameraUrl(event.target.value)}
                    placeholder="Enter IP camera stream URL"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--text-secondary)] focus:border-[var(--border-hover)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={loadIpCamera}
                  className="rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition duration-150 hover:brightness-110"
                >
                  Load Stream
                </button>
              </div>
            ) : null}

            <div className="relative mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-black">
              <div className="relative aspect-video min-h-[240px] w-full">
                <video
                  ref={videoRef}
                  muted
                  autoPlay
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                />
                <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

                <button
                  type="button"
                  onClick={() => setIsMuted((currentMuted) => !currentMuted)}
                  className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[rgba(17,24,39,0.82)] text-[var(--text-primary)] backdrop-blur transition-colors duration-150 hover:border-[var(--border-hover)] hover:bg-[rgba(28,36,51,0.92)]"
                  aria-label={isMuted ? "Unmute alert sound" : "Mute alert sound"}
                >
                  {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                </button>

                {videoMessage ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 px-6 text-center backdrop-blur-sm">
                    <div className="max-w-md space-y-3 rounded-xl border border-[var(--border)] bg-[rgba(28,36,51,0.92)] p-6">
                      <div className="mx-auto flex justify-center">{videoMessage.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{videoMessage.title}</p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">{videoMessage.description}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                <Video className="h-4 w-4 text-[var(--accent-primary)]" />
                Inference cadence:
                <span className="text-[var(--text-primary)]">every 200ms</span>
              </div>

              <button
                type="button"
                onClick={() => setIsRunning((currentState) => !currentState)}
                disabled={!isRunning && !canStartDetection}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white transition duration-150 ${
                  isRunning
                    ? "bg-[var(--critical)] text-white hover:brightness-110"
                    : "bg-[var(--accent-primary)] text-white hover:brightness-110"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isRunning ? "Stop Detection" : "Start Detection"}
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
          >
            <p className="command-section-label">Detection Log</p>

            <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1 xl:max-h-[520px]">
              {detections.length === 0 ? (
                <div className="command-empty-state min-h-[180px] rounded-xl p-6 text-sm">
                  No detections yet. Start a source to begin.
                </div>
              ) : (
                detections.map((detection) => (
                  <motion.article
                    key={detection.id}
                    initial={{ opacity: 0, y: 12, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
                  >
                    {detection.snapshot ? (
                      <div className="border-b border-[var(--border)] bg-black">
                        <img
                          src={detection.snapshot}
                          alt={`${detection.label} snapshot`}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center border-b border-dashed border-[var(--border)] bg-black/40 px-4 text-center text-xs text-[var(--text-secondary)]">
                        Snapshot unavailable for this source.
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{getDetectionEmoji(detection.type)}</span>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {detection.type === "fire" ? "Fire" : "Smoke"} {formatConfidence(detection.confidence)}
                            </p>
                          </div>

                          <p className="text-xs text-[var(--text-secondary)]">{formatElapsed(detection.timestamp, now)}</p>
                        </div>

                        <div
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${getSeverityClasses(
                            detection.confidence,
                          )}`}
                        >
                          {getSeverity(detection.confidence)}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[var(--text-secondary)]">
                          {getSourceBadge(detection.source)}
                        </span>
                        <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[var(--text-secondary)]">
                          {getDetectionLabel(detection.type)}
                        </span>
                        <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[var(--text-secondary)]">
                          {getModelLabel(detection.modelId)}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))
              )}
            </div>

            <div className="my-6 h-px bg-[var(--border)]" />

            <p className="command-section-label">Live Stats</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatCard label="Detections Today" value={String(stats.detectionsToday)} />
              <StatCard label="Active Source" value={activeSourceStat} />
              <StatCard label="Avg Confidence" value={formatConfidence(stats.avgConfidence)} />
            </div>
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border border-[var(--border)] bg-[rgba(17,24,39,0.92)] p-4 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2 items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.7, 1], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="absolute h-2 w-2 rounded-full bg-[var(--critical)]"
                  />
                  <span className="relative h-2 w-2 rounded-full bg-[var(--critical)]" />
                </div>

                <p className="text-sm font-semibold text-[var(--text-primary)]">LIVE DETECTING</p>
              </div>

              <button
                type="button"
                onClick={() => setIsOverlayDismissed(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                aria-label="Dismiss overlay"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {latestOverlayDetections.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 text-sm text-[var(--text-secondary)]">
                  Watching for activity on the shared screen.
                </div>
              ) : (
                latestOverlayDetections.map((detection) => (
                  <div
                    key={detection.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        {getDetectionEmoji(detection.type)} {detection.type === "fire" ? "Fire" : "Smoke"}
                      </span>
                      <span className="text-[var(--text-primary)]">{formatConfidence(detection.confidence)}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{formatElapsed(detection.timestamp, now)}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-auto rounded-xl border border-[rgba(239,68,68,0.2)] bg-[var(--bg-card)] p-4"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
