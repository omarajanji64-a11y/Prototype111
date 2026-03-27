import { Camera, Link2, MonitorUp, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { CameraSourceId } from "../../lib/systemSetup";

interface LinkedCameraPreviewProps {
  cameraConfigured: boolean;
  cameraSource: CameraSourceId;
  ipCameraUrl?: string;
  stream?: MediaStream | null;
  snapshot?: string | null;
  fallbackImageUrl: string;
  alt: string;
  className?: string;
  placeholderTitle: string;
  placeholderDescription: string;
  errorMessage?: string;
}

export function LinkedCameraPreview({
  cameraConfigured,
  cameraSource,
  ipCameraUrl = "",
  stream = null,
  snapshot = null,
  fallbackImageUrl,
  alt,
  className = "",
  placeholderTitle,
  placeholderDescription,
  errorMessage,
}: LinkedCameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ipError, setIpError] = useState(false);

  useEffect(() => {
    setIpError(false);
  }, [cameraSource, ipCameraUrl]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || cameraSource === "ip") {
      return;
    }

    video.srcObject = stream ?? null;

    if (stream) {
      video.play().catch(() => undefined);
    }

    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [cameraSource, stream]);

  if (!cameraConfigured) {
    return (
      <div className={`flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(30,216,255,0.16),transparent_46%)] px-6 text-center ${className}`}>
        <div className="max-w-lg space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-[var(--border)] bg-[rgba(8,18,40,0.82)] text-[var(--accent-primary)]">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{placeholderTitle}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{placeholderDescription}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cameraSource === "ip" && ipCameraUrl.trim() && !ipError) {
    return (
      <div className={`relative bg-black ${className}`}>
        <video
          ref={videoRef}
          src={ipCameraUrl}
          autoPlay
          muted
          playsInline
          onError={() => setIpError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (stream) {
    return (
      <div className={`relative bg-black ${className}`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const imageSrc = snapshot || fallbackImageUrl;
  const showError = Boolean(errorMessage);

  return (
    <div className={`relative bg-black ${className}`}>
      <img src={imageSrc} alt={alt} className="h-full w-full object-cover" />
      {showError ? (
        <div className="absolute inset-x-4 bottom-4 rounded-[1rem] border border-[rgba(239,68,68,0.22)] bg-[rgba(40,10,14,0.88)] p-4 text-left text-sm text-[var(--text-primary)] backdrop-blur">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--critical)]" />
            <div>
              <p className="font-semibold">Camera feed needs attention</p>
              <p className="mt-1 text-[var(--text-secondary)]">{errorMessage}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(8,18,40,0.82)] px-3 py-1.5 font-sci-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-primary)]">
          {cameraSource === "screen" ? <MonitorUp className="h-3.5 w-3.5" /> : cameraSource === "ip" ? <Link2 className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
          Linked
        </div>
      )}
    </div>
  );
}
