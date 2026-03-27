import { useEffect, useRef } from "react";

interface AiParticleFieldProps {
  variant?: "network" | "drift";
}

interface Particle {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

const CYAN = "104, 245, 255";
const MAGENTA = "234, 92, 255";

export function AiParticleField({ variant = "network" }: AiParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let frameId = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const getParticleCount = () => {
      const area = width * height;
      return Math.max(32, Math.min(92, Math.floor(area / 24000)));
    };

    const createParticle = (): Particle => {
      const velocityScale = variant === "network" ? 0.26 : 0.18;
      const x = Math.random() * width;
      const y = Math.random() * height;

      return {
        x,
        y,
        previousX: x,
        previousY: y,
        vx: (Math.random() - 0.5) * velocityScale,
        vy: (Math.random() - 0.5) * velocityScale,
        radius: 1 + Math.random() * 2.3,
        alpha: 0.35 + Math.random() * 0.5,
        color: Math.random() > 0.52 ? CYAN : MAGENTA,
      };
    };

    const resize = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      particles = Array.from({ length: getParticleCount() }, createParticle);
    };

    const drawConnections = () => {
      const connectionDistance = variant === "network" ? 180 : 128;

      for (let outerIndex = 0; outerIndex < particles.length; outerIndex += 1) {
        const source = particles[outerIndex];

        for (let innerIndex = outerIndex + 1; innerIndex < particles.length; innerIndex += 1) {
          const target = particles[innerIndex];
          const dx = source.x - target.x;
          const dy = source.y - target.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > connectionDistance) {
            continue;
          }

          const alpha = (1 - distance / connectionDistance) * (variant === "network" ? 0.3 : 0.14);
          const midpointColor = outerIndex % 2 === 0 ? CYAN : MAGENTA;

          context.beginPath();
          context.moveTo(source.x, source.y);
          context.lineTo(target.x, target.y);
          context.strokeStyle = `rgba(${midpointColor}, ${alpha})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    };

    const drawParticles = () => {
      particles.forEach((particle) => {
        particle.previousX = particle.x;
        particle.previousY = particle.y;

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -24) {
          particle.x = width + 24;
        } else if (particle.x > width + 24) {
          particle.x = -24;
        }

        if (particle.y < -24) {
          particle.y = height + 24;
        } else if (particle.y > height + 24) {
          particle.y = -24;
        }

        context.beginPath();
        context.moveTo(particle.previousX, particle.previousY);
        context.lineTo(particle.x, particle.y);
        context.strokeStyle = `rgba(${particle.color}, ${particle.alpha * 0.38})`;
        context.lineWidth = 1;
        context.stroke();

        const glow = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 6,
        );
        glow.addColorStop(0, `rgba(${particle.color}, ${particle.alpha})`);
        glow.addColorStop(1, `rgba(${particle.color}, 0)`);

        context.beginPath();
        context.fillStyle = glow;
        context.arc(particle.x, particle.y, particle.radius * 6, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const renderFrame = () => {
      context.fillStyle =
        variant === "network" ? "rgba(2, 7, 20, 0.2)" : "rgba(2, 7, 20, 0.28)";
      context.fillRect(0, 0, width, height);

      drawConnections();
      drawParticles();

      frameId = window.requestAnimationFrame(renderFrame);
    };

    resize();
    renderFrame();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" aria-hidden="true" />;
}
