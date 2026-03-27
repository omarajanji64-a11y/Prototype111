import { Bot, Camera, Link2, Plane, Settings2, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import { getOkabModelLabel } from "../../lib/okabModels";
import {
  getCameraSourceLabel,
  type CameraSourceId,
  type SensorSetupItem,
  type SystemSetupState,
  type TowerSetupConfig,
  type UavResponseMode,
  type UavSetupConfig,
} from "../../lib/systemSetup";
import { cn } from "../ui/utils";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";

interface SetupConsoleProps {
  setup: SystemSetupState;
  onTowerChange: (nextTower: TowerSetupConfig) => void;
  onLinkCamera: (source: CameraSourceId, ipCameraUrl: string) => Promise<void>;
  onUnlinkCamera: () => void;
  onSensorChange: (sensorId: string, nextEnabled: boolean) => void;
  onUavChange: (nextUav: UavSetupConfig) => void;
  onOpenModelSwitcher: () => void;
}

const cameraSources: CameraSourceId[] = ["webcam", "ip", "screen"];
const responseModes: UavResponseMode[] = ["assessment", "suppression", "escort"];

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-[1rem] border px-4 font-sci-mono text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-150",
        active
          ? "border-[rgba(141,240,255,0.22)] bg-[rgba(30,216,255,0.14)] text-[var(--text-primary)]"
          : "border-[var(--border)] bg-[rgba(8,18,40,0.82)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]",
      )}
    >
      {label}
    </button>
  );
}

function SetupInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="command-section-label text-[var(--text-muted)]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-[var(--text-secondary)] focus:border-[var(--border-hover)]"
      />
    </label>
  );
}

export function SetupConsole({
  setup,
  onTowerChange,
  onLinkCamera,
  onUnlinkCamera,
  onSensorChange,
  onUavChange,
  onOpenModelSwitcher,
}: SetupConsoleProps) {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [draftSource, setDraftSource] = useState<CameraSourceId>(setup.tower.cameraSource);
  const [draftIpUrl, setDraftIpUrl] = useState(setup.tower.ipCameraUrl);
  const [isLinkingCamera, setIsLinkingCamera] = useState(false);
  const [cameraLinkError, setCameraLinkError] = useState("");

  useEffect(() => {
    setDraftSource(setup.tower.cameraSource);
    setDraftIpUrl(setup.tower.ipCameraUrl);
  }, [setup.tower.cameraSource, setup.tower.ipCameraUrl]);

  const currentModelLabel = getOkabModelLabel(setup.tower.modelId);

  const handleSaveCameraLink = async () => {
    setIsLinkingCamera(true);
    setCameraLinkError("");

    try {
      await onLinkCamera(draftSource, draftSource === "ip" ? draftIpUrl.trim() : "");
      setIsCameraModalOpen(false);
    } catch (error) {
      setCameraLinkError(error instanceof Error ? error.message : "Camera linking failed. Try again.");
    } finally {
      setIsLinkingCamera(false);
    }
  };

  return (
    <>
      <motion.section
        variants={createStagger(0.08)}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <GlassPanel variants={cardVariants} className="p-5">
          <div className="space-y-5">
            <SectionTitle
              eyebrow="Setup"
              title="Deployment configuration"
              description="Link the Main Tower camera, decide whether OKAB AI should run, link sensors, and prepare the UAV response stack."
            />

            <div className="grid gap-3 md:grid-cols-3">
              <div className="command-metric-tile p-5" data-tone="safe">
                <p className="command-section-label text-[var(--text-muted)]">Camera Source</p>
                <p className="command-holo-title mt-2 text-[28px] font-bold leading-none text-[var(--text-primary)]">
                  {setup.tower.cameraConfigured ? getCameraSourceLabel(setup.tower.cameraSource) : "Unlinked"}
                </p>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">This source will appear in the preview and tower details</p>
              </div>
              <div className="command-metric-tile p-5" data-tone={setup.tower.aiEnabled ? "warning" : "safe"}>
                <p className="command-section-label text-[var(--text-muted)]">AI Detection</p>
                <p className="command-holo-title mt-2 text-[28px] font-bold leading-none text-[var(--text-primary)]">
                  {setup.tower.aiEnabled ? "Enabled" : "Disabled"}
                </p>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">Live analysis only runs when the camera is linked</p>
              </div>
              <div className="command-metric-tile p-5" data-tone={setup.uav.enabled ? "critical" : "safe"}>
                <p className="command-section-label text-[var(--text-muted)]">UAV</p>
                <p className="command-holo-title mt-2 text-[28px] font-bold leading-none text-[var(--text-primary)]">
                  {setup.uav.enabled ? "Armed" : "Unlinked"}
                </p>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">Response system readiness for escalation</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        <motion.div
          variants={createStagger(0.08)}
          className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]"
        >
          <GlassPanel variants={cardVariants} className="p-5">
            <div className="space-y-5">
              <SectionTitle
                eyebrow="Towers"
                title="Main Tower setup"
                description="Link the camera first, then decide whether OKAB should analyze the feed."
              />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="command-subpanel p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--accent-primary)]">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="command-section-label text-[var(--text-muted)]">Camera</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {setup.tower.cameraConfigured ? getCameraSourceLabel(setup.tower.cameraSource) : "No camera linked"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ToggleButton
                      label={setup.tower.cameraConfigured ? "Change Camera" : "Link Camera"}
                      active={setup.tower.cameraConfigured}
                      onClick={() => setIsCameraModalOpen(true)}
                    />
                    {setup.tower.cameraConfigured ? (
                      <ToggleButton
                        label="Unlink"
                        active={false}
                        onClick={() =>
                          onUnlinkCamera()
                        }
                      />
                    ) : null}
                  </div>
                </div>

                <div className="command-subpanel p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--warning)]">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="command-section-label text-[var(--text-muted)]">AI Detection</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {setup.tower.cameraConfigured ? "Use OKAB on the linked source" : "Link a camera first"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ToggleButton
                      label={setup.tower.aiEnabled ? "Enabled" : "Disabled"}
                      active={setup.tower.cameraConfigured && setup.tower.aiEnabled}
                      onClick={() =>
                        setup.tower.cameraConfigured
                          ? onTowerChange({
                              ...setup.tower,
                              aiEnabled: !setup.tower.aiEnabled,
                            })
                          : undefined
                      }
                    />
                  </div>
                </div>

                <div className="command-subpanel p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--accent-primary)]">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="command-section-label text-[var(--text-muted)]">Current Model</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{currentModelLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ToggleButton label="Change Model" active={false} onClick={onOpenModelSwitcher} />
                  </div>
                </div>
              </div>

              {setup.tower.cameraConfigured && setup.tower.cameraSource === "ip" && setup.tower.ipCameraUrl ? (
                <div className="rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] p-4 text-sm text-[var(--text-secondary)]">
                  Linked IP stream: {setup.tower.ipCameraUrl}
                </div>
              ) : null}
            </div>
          </GlassPanel>

          <div className="space-y-3">
            <GlassPanel variants={cardVariants} className="p-5">
              <div className="space-y-5">
                <SectionTitle
                  eyebrow="Sensors"
                  title="Linked tower modules"
                  description="Enable or disable the sensor modules that should appear in Main Tower."
                />

                <motion.div variants={createStagger(0.06)} className="space-y-3">
                  {setup.sensors.map((sensor: SensorSetupItem) => (
                    <motion.div
                      key={sensor.id}
                      variants={listItemVariants}
                      className="command-subpanel p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{sensor.name}</p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {sensor.type} · {sensor.location}
                          </p>
                        </div>
                        <ToggleButton
                          label={sensor.enabled ? "Linked" : "Unlinked"}
                          active={sensor.enabled}
                          onClick={() => onSensorChange(sensor.id, !sensor.enabled)}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </GlassPanel>

            <GlassPanel variants={cardVariants} className="p-5">
              <div className="space-y-5">
                <SectionTitle
                  eyebrow="UAV"
                  title="Response configuration"
                  description="Prepare the UAV stack for assessment or suppression once Main Tower escalates an alert."
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="command-subpanel p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--fire)]">
                          <Plane className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="command-section-label text-[var(--text-muted)]">UAV Readiness</p>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">Make the UAV stack available to the response queue.</p>
                        </div>
                      </div>
                      <ToggleButton
                        label={setup.uav.enabled ? "Linked" : "Unlinked"}
                        active={setup.uav.enabled}
                        onClick={() =>
                          onUavChange({
                            ...setup.uav,
                            enabled: !setup.uav.enabled,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="command-subpanel p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--accent-primary)]">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="command-section-label text-[var(--text-muted)]">Auto Dispatch</p>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">Allow Main Tower alerts to queue UAV review automatically.</p>
                        </div>
                      </div>
                      <ToggleButton
                        label={setup.uav.autoDispatch ? "Enabled" : "Manual"}
                        active={setup.uav.autoDispatch}
                        onClick={() =>
                          onUavChange({
                            ...setup.uav,
                            autoDispatch: !setup.uav.autoDispatch,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <SetupInput
                    label="Callsign"
                    value={setup.uav.callsign}
                    onChange={(callsign) =>
                      onUavChange({
                        ...setup.uav,
                        callsign,
                      })
                    }
                  />
                  <SetupInput
                    label="Launch Pad"
                    value={setup.uav.launchPad}
                    onChange={(launchPad) =>
                      onUavChange({
                        ...setup.uav,
                        launchPad,
                      })
                    }
                  />
                  <SetupInput
                    label="Patrol Altitude"
                    value={setup.uav.patrolAltitude}
                    onChange={(patrolAltitude) =>
                      onUavChange({
                        ...setup.uav,
                        patrolAltitude,
                      })
                    }
                  />

                  <label className="space-y-2">
                    <span className="command-section-label text-[var(--text-muted)]">Response Mode</span>
                    <select
                      value={setup.uav.responseMode}
                      onChange={(event) =>
                        onUavChange({
                          ...setup.uav,
                          responseMode: event.target.value as UavResponseMode,
                        })
                      }
                      className="w-full rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-4 py-3 text-sm capitalize text-[var(--text-primary)] outline-none transition-colors duration-150 focus:border-[var(--border-hover)]"
                    >
                      {responseModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </GlassPanel>
          </div>
        </motion.div>
      </motion.section>

      <AnimatePresence>
        {isCameraModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(4,8,16,0.74)] px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-xl rounded-[1.5rem] border border-[var(--border)] bg-[rgba(8,18,40,0.96)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="command-section-label text-[var(--text-muted)]">Link Camera</p>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Choose a camera source</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    The source you choose here will feed the Main Tower preview and its full details page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                  aria-label="Close camera setup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {cameraSources.map((source) => (
                  <ToggleButton
                    key={source}
                    label={getCameraSourceLabel(source)}
                    active={draftSource === source}
                    onClick={() => setDraftSource(source)}
                  />
                ))}
              </div>

              {draftSource === "ip" ? (
                <div className="mt-6">
                  <SetupInput
                    label="IP Camera Stream URL"
                    value={draftIpUrl}
                    onChange={setDraftIpUrl}
                    placeholder="https://example.com/stream.m3u8"
                  />
                </div>
              ) : (
                <div className="mt-6 flex items-start gap-3 rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] p-4 text-sm text-[var(--text-secondary)]">
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                  <p>
                    {draftSource === "screen"
                      ? "Screen Share will request a shared screen or window when the tower details open."
                      : "Webcam will request local camera access when the tower details open."}
                  </p>
                </div>
              )}

              {cameraLinkError ? (
                <div className="mt-4 rounded-[1rem] border border-[rgba(239,68,68,0.22)] bg-[rgba(40,10,14,0.78)] p-4 text-sm text-[var(--text-primary)]">
                  {cameraLinkError}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-4 font-sci-mono text-[12px] uppercase tracking-[0.16em] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSaveCameraLink();
                  }}
                  disabled={isLinkingCamera || (draftSource === "ip" && !draftIpUrl.trim())}
                  className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-[rgba(141,240,255,0.24)] bg-[linear-gradient(135deg,rgba(30,216,255,0.2),rgba(90,140,255,0.34))] px-4 font-sci-mono text-[12px] uppercase tracking-[0.16em] text-white transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLinkingCamera ? "Linking..." : "Link Camera"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
