import {
  Bot,
  Camera,
  Link2,
  Plane,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger, listItemVariants } from "../../animations/variants";
import {
  getOkabModelOption,
  OKAB_MODEL_OPTIONS,
} from "../../lib/okabModels";
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
  onSensorChange: (sensorId: string, nextEnabled: boolean) => void;
  onUavChange: (nextUav: UavSetupConfig) => void;
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
  onSensorChange,
  onUavChange,
}: SetupConsoleProps) {
  const currentModel = getOkabModelOption(setup.tower.modelId);

  return (
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
            description="Configure the Main Tower camera, decide whether OKAB AI should run, link sensors, and prepare the UAV response stack."
          />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="command-metric-tile p-5" data-tone="safe">
              <p className="command-section-label text-[var(--text-muted)]">Camera Source</p>
              <p className="command-holo-title mt-2 text-[28px] font-bold leading-none text-[var(--text-primary)]">
                {setup.tower.cameraConfigured ? getCameraSourceLabel(setup.tower.cameraSource) : "Not Linked"}
              </p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Shown in the preview and tower details</p>
            </div>
            <div className="command-metric-tile p-5" data-tone={setup.tower.aiEnabled ? "warning" : "safe"}>
              <p className="command-section-label text-[var(--text-muted)]">AI Detection</p>
              <p className="command-holo-title mt-2 text-[28px] font-bold leading-none text-[var(--text-primary)]">
                {setup.tower.aiEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Controls whether OKAB analyzes the live camera feed</p>
            </div>
            <div className="command-metric-tile p-5" data-tone={setup.uav.enabled ? "critical" : "safe"}>
              <p className="command-section-label text-[var(--text-muted)]">UAV</p>
              <p className="command-holo-title mt-2 text-[28px] font-bold leading-none text-[var(--text-primary)]">
                {setup.uav.enabled ? "Armed" : "Standby"}
              </p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Response system readiness for automated escalation</p>
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
              title="Main Tower camera and AI"
              description="Choose how the tower camera is linked and whether live OKAB detection runs inside the tower details view."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="command-subpanel p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--accent-primary)]">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="command-section-label text-[var(--text-muted)]">Camera Link</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">Enable the tower camera preview and details feed.</p>
                    </div>
                  </div>
                  <ToggleButton
                    label={setup.tower.cameraConfigured ? "Linked" : "Disabled"}
                    active={setup.tower.cameraConfigured}
                    onClick={() =>
                      onTowerChange({
                        ...setup.tower,
                        cameraConfigured: !setup.tower.cameraConfigured,
                        aiEnabled: !setup.tower.cameraConfigured ? setup.tower.aiEnabled : false,
                      })
                    }
                  />
                </div>
              </div>

              <div className="command-subpanel p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] text-[var(--warning)]">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="command-section-label text-[var(--text-muted)]">AI Detection</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">Turn live OKAB analysis on or off for the linked camera.</p>
                    </div>
                  </div>
                  <ToggleButton
                    label={!setup.tower.cameraConfigured ? "Camera First" : setup.tower.aiEnabled ? "Enabled" : "Disabled"}
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
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <SetupInput
                label="Camera Name"
                value={setup.tower.cameraName}
                onChange={(cameraName) =>
                  onTowerChange({
                    ...setup.tower,
                    cameraName,
                  })
                }
                placeholder="Main Tower POV"
              />
              <SetupInput
                label="Coverage Label"
                value={setup.tower.coverage}
                onChange={(coverage) =>
                  onTowerChange({
                    ...setup.tower,
                    coverage,
                  })
                }
                placeholder="180 degree optical sweep"
              />
              <SetupInput
                label="Resolution"
                value={setup.tower.resolution}
                onChange={(resolution) =>
                  onTowerChange({
                    ...setup.tower,
                    resolution,
                  })
                }
                placeholder="1920 x 1080"
              />

              <label className="space-y-2">
                <span className="command-section-label text-[var(--text-muted)]">OKAB Model</span>
                <select
                  value={setup.tower.modelId}
                  onChange={(event) =>
                    onTowerChange({
                      ...setup.tower,
                      modelId: event.target.value,
                    })
                  }
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 focus:border-[var(--border-hover)]"
                >
                  {OKAB_MODEL_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.recommended ? `${option.label} (Recommended)` : option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--text-secondary)]">{currentModel.description}</p>
              </label>
            </div>

            <div className="command-subpanel p-4">
              <p className="command-section-label text-[var(--text-muted)]">Camera Source</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cameraSources.map((source) => (
                  <ToggleButton
                    key={source}
                    label={getCameraSourceLabel(source)}
                    active={setup.tower.cameraSource === source}
                    onClick={() =>
                      onTowerChange({
                        ...setup.tower,
                        cameraSource: source,
                      })
                    }
                  />
                ))}
              </div>

              {setup.tower.cameraSource === "ip" ? (
                <div className="mt-4">
                  <SetupInput
                    label="IP Camera Stream URL"
                    value={setup.tower.ipCameraUrl}
                    onChange={(ipCameraUrl) =>
                      onTowerChange({
                        ...setup.tower,
                        ipCameraUrl,
                      })
                    }
                    placeholder="https://example.com/stream.m3u8"
                  />
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-3 rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] p-4 text-sm text-[var(--text-secondary)]">
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                  <p>
                    {setup.tower.cameraSource === "screen"
                      ? "The tower will request screen-sharing permission when you open tower details."
                      : "The tower will request webcam permission when you open tower details."}
                  </p>
                </div>
              )}
            </div>
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
                        label={sensor.enabled ? "Linked" : "Disabled"}
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
                      label={setup.uav.enabled ? "Armed" : "Standby"}
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

              <div className="flex items-start gap-3 rounded-[1rem] border border-[var(--border)] bg-[rgba(8,18,40,0.72)] p-4 text-sm text-[var(--text-secondary)]">
                <Settings2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                <p>
                  Setup changes apply immediately to the Main Tower preview and its full details panel.
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </motion.div>
    </motion.section>
  );
}
