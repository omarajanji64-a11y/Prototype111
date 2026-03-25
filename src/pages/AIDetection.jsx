import { useEffect } from "react";
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
} from "lucide-react";
import { motion } from "motion/react";

import {
  DetectionViewport,
  formatConfidence,
  formatElapsed,
  formatSourceBadge,
  getDetectionLabel,
  getSeverity,
  useAIDetection,
} from "../app/providers/AIDetectionProvider.jsx";

const SOURCE_TABS = ["Webcam", "IP Camera", "Screen Share"];

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-4">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

export default function AIDetection() {
  const {
    activeSource,
    setActiveSource,
    ipCameraUrl,
    setIpCameraUrl,
    isRunning,
    setIsRunning,
    isMuted,
    setIsMuted,
    sourceError,
    loadIpCamera,
    primeEngine,
    detections,
    stats,
    isModelLoaded,
    modelError,
    clock,
    mediaSource,
  } = useAIDetection();

  useEffect(() => {
    primeEngine();
  }, [primeEngine]);

  const isIpSourceEmpty = activeSource === "IP Camera" && !ipCameraUrl.trim();
  const showVideoMessage = Boolean(modelError || sourceError || !isModelLoaded || isIpSourceEmpty);

  return (
    <div className="space-y-5 pb-4 sm:space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="rounded-2xl border border-white/5 bg-[#161b22] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-gray-400">AI Detection</p>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                Live Fire & Smoke Analysis
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Detection now stays active across dashboard tabs, with a shared live monitor, throttled logging, and
                lighter model loading to keep the app faster.
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04, ease: "easeOut" }}
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
            <DetectionViewport
              className="relative aspect-video w-full"
              videoClassName="h-full w-full object-cover"
              canvasClassName="pointer-events-none absolute inset-0 h-full w-full"
            />

            <button
              type="button"
              onClick={() => setIsMuted((current) => !current)}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition hover:bg-black/75"
              aria-label={isMuted ? "Unmute alert sound" : "Mute alert sound"}
            >
              {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>

            {showVideoMessage ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/72 px-6 text-center backdrop-blur-sm">
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
                          ? "The ONNX model is loading on demand so the rest of the dashboard stays lighter."
                          : "Paste a stream URL above and load it to begin.")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-[#0d1117] px-4 py-2 text-sm text-gray-400">
              <Video className="h-4 w-4 text-[#c2410c]" />
              Inference cadence: <span className="text-white">every 200ms</span>
            </div>

            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              disabled={!isModelLoaded || Boolean(modelError) || Boolean(sourceError) || isIpSourceEmpty || mediaSource.kind === "none"}
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
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
          className="rounded-2xl border border-white/5 bg-[#161b22] p-4 sm:p-6"
        >
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-gray-400">DETECTION LOG</p>

          <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1 xl:max-h-[430px]">
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
    </div>
  );
}
