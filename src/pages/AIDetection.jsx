import { useEffect, useRef, useState } from "react";
import * as ort from "onnxruntime-web";
import {
  BarChart3,
  BellRing,
  Camera,
  CloudFog,
  Flame,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  MapPinned,
  MonitorUp,
  Plane,
  ShieldCheck,
  Sparkles,
  TowerControl,
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
const MAX_LOG_ITEMS = 50;

const SOURCE_TABS = ["Webcam", "IP Camera", "Screen Share"];

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tower-network", label: "Tower Network", icon: TowerControl },
  { id: "alerts", label: "Alerts", icon: BellRing },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "forest-map", label: "Forest Map", icon: MapPinned },
  { id: "uav-response", label: "UAV Response", icon: Plane },
  { id: "ai-detection", label: "AI Detection", icon: Video },
  { id: "student-built-system", label: "Student-Built System", icon: Sparkles },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatSourceBadge(source) {
  if (source === "IP Camera") return "IP";
  if (source === "Screen Share") return "Screen";
  if (source === "Webcam") return "Webcam";
  return "None";
}

function normalizeScore(value) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  if (value >= 0 && value <= 1) return value;
  return 1 / (1 + Math.exp(-value));
}

function formatConfidence(confidence) {
  return Math.round(confidence * 100);
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
  if (union <= 0) return 0;
  return intersection / union;
}

function applyNms(boxes, threshold) {
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
  const kept = [];

  while (sorted.length > 0) {
    const current = sorted.shift();
    kept.push(current);

    for (let index = sorted.length - 1; index >= 0; index -= 1) {
      if (getIoU(current, sorted[index]) > threshold) {
        sorted.splice(index, 1);
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
    const second = dims[1];
    const third = dims[2];

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
    const first = dims[0];
    const second = dims[1];

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

    if (!Number.isFinite(centerXRaw) || !Number.isFinite(centerYRaw)) {
      continue;
    }

    const fireScore = accessor.featureCount > 4 ? normalizeScore(accessor.getValue(candidateIndex, 4)) : 0;
    const smokeScore = accessor.featureCount > 5 ? normalizeScore(accessor.getValue(candidateIndex, 5)) : 0;
    const confidence = Math.max(fireScore, smokeScore);

    if (confidence < CONFIDENCE_THRESHOLD) {
      continue;
    }

    const type = smokeScore > fireScore ? "smoke" : "fire";
    const scale = Math.max(Math.abs(centerXRaw), Math.abs(centerYRaw), Math.abs(widthRaw), Math.abs(heightRaw)) <= 2
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
      type,
      confidence,
      x1,
      y1,
      x2,
      y2,
    });
  }

  return applyNms(rawBoxes, 0.5).map((box, index) => {
    const scaledX = (box.x1 / INPUT_SIZE) * videoWidth;
    const scaledY = (box.y1 / INPUT_SIZE) * videoHeight;
    const scaledWidth = ((box.x2 - box.x1) / INPUT_SIZE) * videoWidth;
    const scaledHeight = ((box.y2 - box.y1) / INPUT_SIZE) * videoHeight;
    const now = Date.now();

    return {
      id: `${now}-${index}-${box.type}`,
      type: box.type,
      confidence: box.confidence,
      timestamp: now,
      source: sourceLabel,
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: scaledHeight,
    };
  });
}

function clearCanvas(canvas) {
  const context = canvas?.getContext("2d");
  if (canvas && context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
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

  const videoWidth = video.videoWidth || renderWidth;
  const videoHeight = video.videoHeight || renderHeight;
  const scaleX = canvas.width / videoWidth;
  const scaleY = canvas.height / videoHeight;

  detections.forEach((detection) => {
    const x = detection.x * scaleX;
    const y = detection.y * scaleY;
    const width = detection.width * scaleX;
    const height = detection.height * scaleY;
    const strokeStyle = detection.type === "fire" ? "#ef4444" : "#9ca3af";
    const label = `${detection.type === "fire" ? "Fire 🔥" : "Smoke"} ${formatConfidence(detection.confidence)}%`;

    context.save();
    context.strokeStyle = strokeStyle;
    context.fillStyle = detection.type === "fire" ? "rgba(239,68,68,0.12)" : "rgba(156,163,175,0.12)";
    context.lineWidth = 2;
    context.beginPath();
    context.rect(x, y, width, height);
    context.fill();
    context.stroke();
    context.closePath();

    context.font = "600 12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    const labelWidth = context.measureText(label).width + 18;
    const labelX = clamp(x, 0, canvas.width - labelWidth);
    const labelY = Math.max(8, y - 28);
    context.fillStyle = "rgba(13,17,23,0.92)";
    context.beginPath();
    context.roundRect(labelX, labelY, labelWidth, 22, 999);
    context.fill();
    context.closePath();
    context.fillStyle = strokeStyle;
    context.fillText(label, labelX + 9, labelY + 15);
    context.restore();
  });
}

export function useDetectionEngine(videoRef, canvasRef, isRunning, source) {
  const sessionRef = useRef(null);
  const detectionsRef = useRef([]);
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState({
    detectionsToday: 0,
    activeSource: "None",
    avgConfidence: 0,
    modelError: "",
  });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [modelError, setModelError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadModel() {
      try {
        setModelError("");
        setIsModelLoaded(false);
        ort.env.wasm.numThreads = 1;
        const session = await ort.InferenceSession.create(MODEL_PATH);

        if (isCancelled) {
          return;
        }

        sessionRef.current = session;
        setIsModelLoaded(true);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load ONNX model.";
        setModelError(message);
        setIsModelLoaded(false);
      }
    }

    loadModel();

    return () => {
      isCancelled = true;
      sessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const recentDetections = detectionsRef.current.slice(0, 10);
    const avgConfidence = recentDetections.length
      ? Math.round(
          (recentDetections.reduce((total, item) => total + item.confidence, 0) / recentDetections.length) * 100,
        )
      : 0;

    setStats({
      detectionsToday: detectionsRef.current.length,
      activeSource: isRunning ? formatSourceBadge(source) : "None",
      avgConfidence,
      modelError,
    });
  }, [detections, isRunning, modelError, source]);

  useEffect(() => {
    if (!isRunning) {
      clearCanvas(canvasRef.current);
      return undefined;
    }

    if (!sessionRef.current || !isModelLoaded || modelError) {
      return undefined;
    }

    let isCancelled = false;
    let timeoutId;
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = INPUT_SIZE;
    frameCanvas.height = INPUT_SIZE;
    const frameContext = frameCanvas.getContext("2d", { willReadFrequently: true });

    async function runInference() {
      if (isCancelled) {
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
        const imageData = frameContext.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
        const pixels = imageData.data;
        const planeSize = INPUT_SIZE * INPUT_SIZE;
        const input = new Float32Array(planeSize * 3);

        for (let pixelIndex = 0; pixelIndex < planeSize; pixelIndex += 1) {
          const sourceIndex = pixelIndex * 4;
          input[pixelIndex] = pixels[sourceIndex] / 255;
          input[planeSize + pixelIndex] = pixels[sourceIndex + 1] / 255;
          input[planeSize * 2 + pixelIndex] = pixels[sourceIndex + 2] / 255;
        }

        const tensor = new ort.Tensor("float32", input, [1, 3, INPUT_SIZE, INPUT_SIZE]);
        const inputName = session.inputNames?.[0] || "images";
        const outputs = await session.run({ [inputName]: tensor });
        const outputName = session.outputNames?.[0] || Object.keys(outputs)[0];
        const outputTensor = outputs[outputName];
        const parsedDetections = parseOutputTensor(
          outputTensor,
          video.videoWidth,
          video.videoHeight,
          formatSourceBadge(source),
        );

        drawDetections(overlay, video, parsedDetections);

        if (parsedDetections.length > 0) {
          const nextDetections = [...parsedDetections, ...detectionsRef.current].slice(0, MAX_LOG_ITEMS);
          detectionsRef.current = nextDetections;
          setDetections(nextDetections);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Inference failed.";
        setModelError(message);
        setIsModelLoaded(false);
        clearCanvas(overlay);
        return;
      }

      timeoutId = window.setTimeout(runInference, INFERENCE_INTERVAL);
    }

    runInference();

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [canvasRef, isModelLoaded, isRunning, modelError, source, videoRef]);

  return { detections, stats, isModelLoaded };
}

export default function AIDetection() {
  const [activeSource, setActiveSource] = useState("Webcam");
  const [ipCameraUrl, setIpCameraUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [flashToken, setFlashToken] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [isOverlayDismissed, setIsOverlayDismissed] = useState(false);
  const [clock, setClock] = useState(Date.now());

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const latestAlertRef = useRef("");

  const { detections, stats, isModelLoaded } = useDetectionEngine(
    videoRef,
    canvasRef,
    isRunning,
    activeSource,
  );
  const modelError = stats.modelError || "";

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

    if (!latestDetection) {
      return;
    }

    if (latestDetection.id === latestAlertRef.current) {
      return;
    }

    latestAlertRef.current = latestDetection.id;

    if (latestDetection.type !== "fire" || latestDetection.confidence <= ALERT_THRESHOLD) {
      return;
    }

    setShowFlash(false);
    window.requestAnimationFrame(() => {
      setFlashToken((value) => value + 1);
      setShowFlash(true);
    });

    const toastId = `${latestDetection.id}-toast`;
    setToasts((current) => [
      {
        id: toastId,
        message: `🔥 Fire detected — ${formatConfidence(latestDetection.confidence)}% confidence`,
      },
      ...current,
    ]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== toastId));
    }, 4000);

    window.setTimeout(() => {
      setShowFlash(false);
    }, 1000);

    if (!isMuted) {
      try {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextCtor) {
          return;
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextCtor();
        }

        const ctx = audioContextRef.current;

        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.frequency.value = 880;
        oscillator.type = "sine";
        gain.gain.value = 0.08;
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
      } catch {
        // Ignore audio failures to keep the dashboard usable.
      }
    }
  }, [detections, isMuted]);

  async function stopCurrentSource() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // Ignore pause failures when the element is being reset.
      }

      videoRef.current.srcObject = null;
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }

  async function startWebcam() {
    setSourceError("");

    try {
      await stopCurrentSource();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setSourceError(message || "Camera access was denied or is unavailable.");
    }
  }

  async function startScreenShare() {
    setSourceError("");
    setIsOverlayDismissed(false);

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
      const message = error instanceof Error ? error.message : "";
      setSourceError(message || "Screen share permission was denied or cancelled.");
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
      const message = error instanceof Error ? error.message : "";
      setSourceError(message || "Unable to load the IP camera stream.");
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

  const latestThreeDetections = detections.slice(0, 3);
  const showScreenOverlay = activeSource === "Screen Share" && isRunning && !isOverlayDismissed;
  const isIpSourceEmpty = activeSource === "IP Camera" && !ipCameraUrl.trim();
  const showVideoMessage = Boolean(sourceError || modelError || !isModelLoaded || isIpSourceEmpty);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
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

      <aside className="fixed inset-y-4 left-4 z-30 hidden w-[292px] rounded-[28px] border border-white/5 bg-[#161b22] lg:flex">
        <div className="flex h-full w-full flex-col p-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c2410c] text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">OKAB Core</p>
                <p className="text-xs text-gray-400">AI Fire Detection</p>
              </div>
            </div>
          </div>

          <nav className="mt-5 flex-1 space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "ai-detection";

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-left transition ${
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isActive ? (
                    <motion.div
                      layoutId="okab-ai-active-sidebar-item"
                      className="absolute inset-0 rounded-2xl border border-[#c2410c]/40 bg-[#c2410c]/15"
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    />
                  ) : null}

                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl border ${
                      isActive
                        ? "border-[#c2410c]/40 bg-[#c2410c]/15 text-white"
                        : "border-white/5 bg-white/[0.03]"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="relative text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="px-4 pb-8 pt-6 lg:ml-[324px] lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-[1720px] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-gray-400">AI Detection</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Live Fire & Smoke Analysis</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/5 bg-[#161b22] px-4 py-2 text-sm text-gray-300">
                Source: {formatSourceBadge(activeSource)}
              </div>
              <div className="rounded-full border border-white/5 bg-[#161b22] px-4 py-2 text-sm text-gray-300">
                {isModelLoaded ? "Model Ready" : "Loading Model"}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
            <section className="rounded-2xl border border-white/5 bg-[#161b22] p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {SOURCE_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveSource(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeSource === tab
                        ? "bg-[#c2410c] text-white"
                        : "bg-[#0d1117] text-gray-400 hover:text-white"
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
                      className="w-full rounded-2xl border border-white/5 bg-[#0d1117] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#c2410c]/60"
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
                <div className="aspect-video w-full">
                  <video
                    ref={videoRef}
                    muted
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

                  <button
                    type="button"
                    onClick={() => setIsMuted((current) => !current)}
                    className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white backdrop-blur transition hover:bg-black/70"
                  >
                    {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                  </button>

                  <AnimatePresence>
                    {showVideoMessage ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 px-6 text-center backdrop-blur-sm"
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
                                    : isIpSourceEmpty
                                      ? "IP source not connected"
                                      : "Waiting for source"}
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                              {modelError ||
                                sourceError ||
                                (!isModelLoaded
                                  ? "The ONNX model is loading from /best.onnx."
                                  : isIpSourceEmpty
                                    ? "Paste a stream URL above and load it to begin."
                                    : "Start a source to begin inference.")}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
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
            </section>

            <section className="rounded-2xl border border-white/5 bg-[#161b22] p-4 sm:p-6">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-gray-400">DETECTION LOG</p>
              </div>

              <div className="mt-4 max-h-[430px] space-y-3 overflow-y-auto pr-1">
                {detections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1117] p-6 text-sm text-gray-400">
                    No detections yet. Start a source to begin.
                  </div>
                ) : (
                  detections.map((detection) => {
                    const severity = getSeverity(detection.confidence);
                    const badgeClasses =
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
                                {detection.type === "fire" ? "🔥 Fire" : "💨 Smoke"} -{" "}
                                {formatConfidence(detection.confidence)}%
                              </p>
                              <p className="mt-1 text-xs text-gray-400">{formatElapsed(detection.timestamp, clock)}</p>
                              <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-gray-300">
                                {detection.source}
                              </div>
                            </div>
                          </div>

                          <div className={`rounded-full border px-2.5 py-1 text-[0.66rem] font-semibold tracking-[0.14em] ${badgeClasses}`}>
                            {severity}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div className="mt-6">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-gray-400">LIVE STATS</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Detections Today</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.detectionsToday}</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Active Source</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.activeSource}</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Avg Confidence</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stats.avgConfidence}%</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showScreenOverlay ? (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
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
                    {detection.type === "fire" ? "🔥 Fire" : "💨 Smoke"} - {formatConfidence(detection.confidence)}%
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
              className="rounded-2xl border border-red-500/20 bg-[#161b22] px-4 py-3 text-sm text-red-100 shadow-[0_18px_50px_rgba(239,68,68,0.2)]"
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
