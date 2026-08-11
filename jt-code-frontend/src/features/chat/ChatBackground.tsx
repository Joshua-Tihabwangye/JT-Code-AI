import { useEffect, useRef } from 'react';

export function ChatBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxEl = canvasEl.getContext('2d');
    if (!ctxEl) return;
    const canvas = canvasEl;
    const ctx = ctxEl;

    let animationId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function getPalette(): { bg: string; colors: [string, string, string, string, string] } {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark
        ? {
            bg: '#050b14',
            // purple -> violet -> cyan blend, subtle in dark mode
            colors: [
              'rgba(168, 85, 247, 0.24)',
              'rgba(139, 92, 246, 0.21)',
              'rgba(99, 102, 241, 0.18)',
              'rgba(59, 130, 246, 0.15)',
              'rgba(14, 165, 233, 0.12)',
            ],
          }
        : {
            bg: '#f6f7f9',
            // clearer but still refined purple/blue blend in light mode
            colors: [
              'rgba(124, 58, 237, 0.30)',
              'rgba(99, 102, 241, 0.27)',
              'rgba(59, 130, 246, 0.24)',
              'rgba(14, 165, 233, 0.20)',
              'rgba(168, 85, 247, 0.17)',
            ],
          };
    }

    function drawWave(
      yBase: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      lineWidth: number,
      phase: number
    ) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      for (let x = 0; x <= width; x += 2) {
        const y =
          yBase +
          Math.sin(x * frequency + time * speed + phase) * amplitude +
          Math.sin(x * frequency * 0.5 + time * speed * 1.2 + phase * 0.5) * amplitude * 0.35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function drawRibbon(
      yBase: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      lineWidth: number,
      phase: number,
      layers: number
    ) {
      for (let i = 0; i < layers; i++) {
        const offset = (i - layers / 2) * (amplitude * 0.18);
        const alphaFactor = 1 - Math.abs(i - layers / 2) / (layers / 2 + 1);
        const alpha = parseFloat(color.slice(color.lastIndexOf(',') + 1, -1)) * alphaFactor;
        const layerColor = color.replace(/[\d.]+\)$/, `${alpha.toFixed(3)})`);
        drawWave(yBase + offset, amplitude, frequency, speed, layerColor, lineWidth, phase + i * 0.7);
      }
    }

    function draw() {
      const palette = getPalette();
      ctx.clearRect(0, 0, width, height);

      // Vertical fade mask: visible near the middle/bottom, transparent at top.
      // We draw waves into an offscreen-ish region first by using a clip with gradient alpha.
      const fadeGradient = ctx.createLinearGradient(0, 0, 0, height);
      fadeGradient.addColorStop(0, palette.bg + '00');
      fadeGradient.addColorStop(0.2, palette.bg + '00');
      fadeGradient.addColorStop(0.35, palette.bg + '40');
      fadeGradient.addColorStop(0.55, palette.bg + '90');
      fadeGradient.addColorStop(0.75, palette.bg + 'c0');
      fadeGradient.addColorStop(0.92, palette.bg + 'e0');
      fadeGradient.addColorStop(1, palette.bg + 'f5');

      // Composite: draw waves first, then cover with fade gradient.
      drawRibbon(height * 0.32, height * 0.13, 0.004, 0.35, palette.colors[0], 1, 0, 8);
      drawRibbon(height * 0.44, height * 0.11, 0.005, 0.45, palette.colors[1], 1, 2.1, 8);
      drawRibbon(height * 0.56, height * 0.09, 0.006, 0.55, palette.colors[2], 1, 4.2, 8);
      drawRibbon(height * 0.66, height * 0.07, 0.0075, 0.4, palette.colors[3], 1, 1.3, 8);
      drawRibbon(height * 0.74, height * 0.05, 0.009, 0.3, palette.colors[4], 1, 3.4, 6);

      // Soft top glow (very subtle)
      const glow = ctx.createRadialGradient(width * 0.5, height * 0.25, 0, width * 0.5, height * 0.25, width * 0.7);
      glow.addColorStop(0, palette.colors[1].replace(/[\d.]+\)$/, '0.06)'));
      glow.addColorStop(0.7, palette.colors[1].replace(/[\d.]+\)$/, '0.02)'));
      glow.addColorStop(1, palette.bg + '00');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Apply the vertical fade overlay.
      ctx.fillStyle = fadeGradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.008;
      animationId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener('resize', resize);
    const observer = new MutationObserver(() => {
      // Theme changes are picked up in the draw loop.
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="chat-background">
      <canvas ref={canvasRef} />
    </div>
  );
}
