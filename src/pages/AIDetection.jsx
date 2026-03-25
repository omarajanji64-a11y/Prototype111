import { useEffect, useRef, useState } from "react";
import * as ort from "onnxruntime-web";
import {
  Camera,
  CloudFog,
  Flame,
  Link2,
  LoaderCircle,
  MonitorUp,
  TriangleAlert,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const MODEL_PATH = "/best.onnx";
const INPUT_SIZE = 640;
const INFERENCE_INTERVAL = 200;
const CONFIDENCE_THRESHOLD = 0.45;
const ALERT_THRESHOLD = 0.8;
const NMS_THRESHOLD = 0.5;
const MAX_LOG_ITEMS = 50;
const ALERT_COOLDOWN = 3000;
const SOURCE_TABS = ["Webcam", "IP Camera", "Screen Share"];

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

function formatSourceBadge(source) {
  if (source === "IP Camera") return "IP";
  if (source === "Screen Share") return "Screen";
  if (source === "Webcam") return "Webcam";
  return "None";
}

function formatConfidence(confidence) {
  return Math.round(confidence * 100);
}

function getDetectionLabel(type) {
  return type === "fire" ? "Fire 🔥" : "Smoke";
}

function getSeverity(confidence) {
  if (confidence > ALERT_THRESHOLD) return "CRITICAL";
  return "WARNING";
}

function formatElapsed(timestamp, now) {
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
    const snapshotWidth = 480;
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

    return snapshotCanvas.toDataURL("image/jpeg", 0.76);
  } catch {
    return null;
  }
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

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();

  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
  } else {
    context.rect(x, y, width, height);
  }
}

function drawDetections(canvas, video, detections) {
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

export function useDetectionEngine(videoRef, canvasRef, isRunning, source) {
  const sessionRef = useRef(null);
  const detectionsRef = useRef([]);
  const todayRef = useRef({
    key: getTodayKey(),
    count: 0,
  });
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({
    detectionsToday: 0,
    activeSource: "None",
    avgConfidence: 0,
    error: "",
  });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [engineError, setEngineError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        setEngineError("");
        setIsModelLoaded(false);
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
      sessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const todayKey = getTodayKey();

    if (todayRef.current.key !== todayKey) {
      todayRef.current = {
        key: todayKey,
        count: 0,
      };
    }

    const recentDetections = detectionsRef.current.slice(0, 10);
    const avgConfidence = recentDetections.length
      ? Math.round(
          (recentDetections.reduce((total, detection) => total + detection.confidence, 0) / recentDetections.length) *
            100,
        )
      : 0;

    setStats({
      detectionsToday: todayRef.current.count,
      activeSource: isRunning ? formatSourceBadge(source) : "None",
      avgConfidence,
      error: engineError,
    });
  }, [detections, engineError, isRunning, source]);

  useEffect(() => {
    if (!isRunning) {
      clearCanvas(canvasRef.current);
      return undefined;
    }

    if (!sessionRef.current || !isModelLoaded || engineError) {
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
      const video = videoRef.current;
      const overlay = canvasRef.current;

      if (!session || !video || !overlay || !frameContext) {
        timeoutId = window.setTimeout(runInference, INFERENCE_INTERVAL);
        return;
      }

      if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
        clearCanvas(overlay);
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

        drawDetections(overlay, video, parsedDetections);

        if (parsedDetections.length > 0) {
          const snapshot = captureDetectionSnapshot(video, parsedDetections);
          const todayKey = getTodayKey();

          if (todayRef.current.key !== todayKey) {
            todayRef.current = {
              key: todayKey,
              count: 0,
            };
          }

          todayRef.current.count += parsedDetections.length;
          const nextDetections = [
            ...parsedDetections.map((detection) => ({
              ...detection,
              snapshot,
            })),
            ...detectionsRef.current,
          ].slice(0, MAX_LOG_ITEMS);
          detectionsRef.current = nextDetections;
          setDetections(nextDetections);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setEngineError(error instanceof Error ? error.message : "Inference failed.");
        clearCanvas(overlay);
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
  }, [canvasRef, engineError, isModelLoaded, isRunning, source, videoRef]);

  return { detections, stats, isModelLoaded };
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-4">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

export default function AIDetection() {
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const timeoutIdsRef = useRef([]);
  const lastAlertAtRef = useRef(0);

  const { detections, stats, isModelLoaded } = useDetectionEngine(videoRef, canvasRef, isRunning, activeSource);
  const modelError = stats.error;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
    const latestDetection = detections[0];

    if (!latestDetection || latestDetection.type !== "fire" || latestDetection.confidence <= ALERT_THRESHOLD) {
      return;
    }

    const now = Date.now();

    if (now - lastAlertAtRef.current < ALERT_COOLDOWN) {
      return;
    }

    lastAlertAtRef.current = now;
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
  }, [detections, isMuted]);

  async function stopCurrentSource() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!videoRef.current) {
      return;
    }

    try {
      videoRef.current.pause();
    } catch {
      // Ignore pause failures while the element is resetting.
    }

    videoRef.current.srcObject = null;
    videoRef.current.removeAttribute("src");
    videoRef.current.load();
  }

  async function startWebcam() {
    setSourceError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setSourceError("Webcam capture is not supported in this browser.");
      return;
    }

    try {
      await stopCurrentSource();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
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
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const [track] = stream.getVideoTracks();

      if (track) {
        track.onended = () => {
          setIsRunning(false);
          setSourceError("Screen share ended.");
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

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = ipCameraUrl.trim();
        await videoRef.current.play();
      }
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : "Unable to load the IP camera stream.");
    }
  }

  useEffect(() => {
    setIsRunning(false);
    setSourceError("");

    if (activeSource === "Webcam") {
      startWebcam();
      return;
    }

    if (activeSource === "Screen Share") {
      startScreenShare();
      return;
    }

    stopCurrentSource();
  }, [activeSource]);

  const isIpSourceEmpty = activeSource === "IP Camera" && !ipCameraUrl.trim();
  const showScreenOverlay = activeSource === "Screen Share" && isRunning && !isOverlayDismissed;
  const latestThreeDetections = detections.slice(0, 3);
  const showVideoMessage = Boolean(modelError || sourceError || !isModelLoaded || isIpSourceEmpty);

  return (
    <div className="space-y-6 pb-4">
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

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="rounded-2xl border border-white/5 bg-[#161b22] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-gray-400">AI Detection</p>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                Live Fire & Smoke Analysis
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Run ONNX inference against live webcam, IP camera, or screen-share footage with real-time boxes,
                alerts, and a rolling detection log.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/5 bg-[#0d1117] px-4 py-2 text-sm text-gray-300">
              Source: <span className="text-white">{formatSourceBadge(activeSource)}</span>
            </div>
            <div className="rounded-full border border-white/5 bg-[#0d1117] px-4 py-2 text-sm text-gray-300">
              <span className={isModelLoaded ? "text-white" : "text-gray-300"}>
                {isModelLoaded ? "Model Ready" : "Loading Model"}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.04, ease: "easeOut" }}
          className="rounded-2xl border border-white/5 bg-[#161b22] p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            {SOURCE_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSource(tab)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeSource === tab ? "bg-[#c2410c] text-white" : "bg-[#0d1117] text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeSource === "IP Camera" ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={ipCameraUrl}
                  onChange={(event) => setIpCameraUrl(event.target.value)}
                  placeholder="Enter IP camera stream URL"
                  className="w-full rounded-2xl border border-white/5 bg-[#0d1117] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#c2410c]/70"
                />
              </div>
              <button
                type="button"
                onClick={loadIpCamera}
                className="rounded-2xl bg-[#c2410c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#9a3412]"
              >
                Load Stream
              </button>
            </div>
          ) : null}

          <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/5 bg-black">
            <div className="relative aspect-video w-full">
              <video
                ref={videoRef}
                muted
                autoPlay
                playsInline
                crossOrigin="anonymous"
                onError={() => {
                  if (activeSource === "IP Camera") {
                    setSourceError("Unable to load the current IP camera stream.");
                  }
                }}
                className="h-full w-full object-cover"
              />
              <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

              <button
                type="button"
                onClick={() => setIsMuted((current) => !current)}
                className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition hover:bg-black/75"
                aria-label={isMuted ? "Unmute alert sound" : "Mute alert sound"}
              >
                {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
              </button>

              <AnimatePresence>
                {showVideoMessage ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/72 px-6 text-center backdrop-blur-sm"
                  >
                    <div className="max-w-md space-y-3 rounded-2xl border border-white/10 bg-[#161b22]/90 p-6">
                      {modelError ? (
                        <TriangleAlert className="mx-auto h-7 w-7 text-red-400" />
                      ) : !isModelLoaded ? (
                        <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#c2410c]" />
                      ) : sourceError ? (
                        <Camera className="mx-auto h-7 w-7 text-amber-400" />
                      ) : isIpSourceEmpty ? (
                        <Link2 className="mx-auto h-7 w-7 text-gray-300" />
                      ) : (
                        <MonitorUp className="mx-auto h-7 w-7 text-gray-300" />
                      )}

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {modelError
                            ? "Model failed to load"
                            : !isModelLoaded
                              ? "Loading detection model"
                              : sourceError
                                ? "Source unavailable"
                                : "IP source not connected"}
                        </p>
                        <p className="mt-2 text-sm text-gray-400">
                          {modelError ||
                            sourceError ||
                            (!isModelLoaded
                              ? "The ONNX model is loading from /best.onnx."
                              : "Paste a stream URL above and load it to begin.")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-[#0d1117] px-4 py-2 text-sm text-gray-400">
              <Video className="h-4 w-4 text-[#c2410c]" />
              Inference cadence: <span className="text-white">every 200ms</span>
            </div>

            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              disabled={!isModelLoaded || Boolean(modelError) || Boolean(sourceError) || isIpSourceEmpty}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                isRunning
                  ? "bg-[#c2410c] text-white hover:bg-[#9a3412]"
                  : "border border-white/10 bg-[#0d1117] text-gray-200 hover:bg-white/[0.03]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isRunning ? "Stop Detection" : "Start Detection"}
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.08, ease: "easeOut" }}
          className="rounded-2xl border border-white/5 bg-[#161b22] p-4 sm:p-6"
        >
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-gray-400">DETECTION LOG</p>

          <div className="mt-4 max-h-[430px] space-y-3 overflow-y-auto pr-1">
            {detections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1117] p-6 text-sm text-gray-400">
                No detections yet. Start a source to begin.
              </div>
            ) : (
              detections.map((detection) => {
                const severity = getSeverity(detection.confidence);
                const severityClasses =
                  severity === "CRITICAL"
                    ? "border-red-500/25 bg-red-500/10 text-red-200"
                    : "border-[#d97706]/25 bg-[#d97706]/10 text-amber-200";

                return (
                  <motion.div
                    key={detection.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="rounded-2xl border border-white/5 bg-[#0d1117] p-4"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              detection.type === "fire"
                                ? "bg-red-500/12 text-red-300"
                                : "bg-gray-500/12 text-gray-300"
                            }`}
                          >
                            {detection.type === "fire" ? (
                              <Flame className="h-4.5 w-4.5" />
                            ) : (
                              <CloudFog className="h-4.5 w-4.5" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">
                              {getDetectionLabel(detection.type)} {formatConfidence(detection.confidence)}%
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{formatElapsed(detection.timestamp, clock)}</p>
                          </div>
                        </div>

                        <div
                          className={`rounded-full border px-2.5 py-1 text-[0.66rem] font-semibold tracking-[0.14em] ${severityClasses}`}
                        >
                          {severity}
                        </div>
                      </div>

                      {detection.snapshot ? (
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-black">
                          <img
                            src={detection.snapshot}
                            alt={`${getDetectionLabel(detection.type)} screenshot`}
                            className="aspect-video w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 px-4 text-center text-xs text-gray-500">
                          Snapshot unavailable for this source. The detection metadata is still logged.
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-gray-300">
                          {detection.source}
                        </span>
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-gray-300">
                          {getDetectionLabel(detection.type)}
                        </span>
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-gray-300">
                          {formatConfidence(detection.confidence)}% confidence
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="mt-6">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-gray-400">LIVE STATS</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Detections Today" value={stats.detectionsToday} />
            <StatCard label="Active Source" value={stats.activeSource} />
            <StatCard label="Avg Confidence" value={`${stats.avgConfidence}%`} />
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {showScreenOverlay ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border border-white/10 bg-black/80 p-4 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-red-200">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.1, 0.95] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="h-2.5 w-2.5 rounded-full bg-red-400"
                />
                🔴 LIVE DETECTING
              </div>

              <button
                type="button"
                onClick={() => setIsOverlayDismissed(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
                aria-label="Dismiss overlay"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {latestThreeDetections.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-gray-400">
                  Waiting for detections...
                </div>
              ) : (
                latestThreeDetections.map((detection) => (
                  <div
                    key={`overlay-${detection.id}`}
                    className="rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-white"
                  >
                    {detection.type === "fire" ? "🔥 Fire" : "💨 Smoke"} {formatConfidence(detection.confidence)}%
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
    </div>
  );
}
