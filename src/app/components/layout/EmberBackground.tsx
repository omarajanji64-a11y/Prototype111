import { lazy, Suspense } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

const EMBER_SCENE_URL = "https://prod.spline.design/3Isx5AaM5wrJ1V27/scene.splinecode";

export function EmberBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Spline scene={EMBER_SCENE_URL} />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,8,22,0.2)_0%,rgba(5,8,22,0.58)_44%,rgba(5,8,22,0.92)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,18,0.62),rgba(4,8,18,0.84))]" />
    </div>
  );
}

