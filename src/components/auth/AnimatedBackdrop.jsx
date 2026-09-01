import { useEffect, useRef } from "react";

const ICONS = [
  // lucide-style simple shapes as inline SVG paths scaled small
  "🍽️", // utensils (fallback emoji for canvas render speed)
  "🛵",
  "💳",
  "🛍️",
  "🍔",
  "☕",
  "🥗",
  "🍕",
];

function makeParticle(width, height, reduceMotion) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * (reduceMotion ? 0.1 : 0.35),
    vy: (Math.random() - 0.5) * (reduceMotion ? 0.1 : 0.25),
    size: 18 + Math.random() * 14,
    icon: ICONS[Math.floor(Math.random() * ICONS.length)],
    alpha: 0.18 + Math.random() * 0.32,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * (reduceMotion ? 0 : 0.01),
  };
}

/**
 * Fondo animado con partículas tipo iconos del rubro.
 * Sin dependencias externas. Respeta prefers-reduced-motion.
 * Se posiciona absolutamente (parent debe ser relative/absolute).
 */
export default function AnimatedBackdrop({
  density = 24,
  className = "",
  "aria-hidden": ariaHidden = true,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      // Repoblar si quedó vacío
      if (particlesRef.current.length === 0) {
        particlesRef.current = Array.from({ length: density }, () =>
          makeParticle(rect.width, rect.height, reduceMotion)
        );
      }
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const step = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        // Wrap
        if (p.x < -p.size) p.x = rect.width + p.size;
        if (p.x > rect.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = rect.height + p.size;
        if (p.y > rect.height + p.size) p.y = -p.size;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px ui-sans-serif, system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.icon, 0, 0);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(step);
    };

    if (!reduceMotion) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      // Render estático una sola vez para reduced-motion
      step();
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden={ariaHidden}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
