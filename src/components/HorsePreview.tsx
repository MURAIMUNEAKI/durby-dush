import React, { useEffect, useRef } from 'react';
import { HorseProfile } from '../types/game';
import { drawVerticalHorse } from '../utils/horseRenderer';

interface HorsePreviewProps {
  horse: HorseProfile;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const HorsePreview: React.FC<HorsePreviewProps> = ({
  horse,
  width = 90,
  height = 110,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle turf circle background
      const grad = ctx.createRadialGradient(width / 2, height * 0.65, 5, width / 2, height * 0.65, width * 0.45);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 0.68, width * 0.42, height * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render vertical horse galloping
      drawVerticalHorse(
        ctx,
        width / 2,
        height * 0.72,
        0.75,
        {
          coatColor: horse.coatColor,
          maneColor: horse.maneColor,
          jockeyColor: horse.jockeyColor,
          jockeyCapColor: horse.jockeyCapColor,
          speed: horse.baseMaxSpeed,
          isSpinAuraActive: horse.id === 'valkyrie',
          horseId: horse.id,
        }
      );

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [horse, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="pointer-events-none drop-shadow-md"
    />
  );
};
