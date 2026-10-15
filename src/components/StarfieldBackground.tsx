import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  speed: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    const starCount = Math.floor((width * height) / 7000); // Responsive density
    const starColors = ['#ffffff', '#e0f2fe', '#bae6fd', '#c7d2fe', '#e9d5ff', '#38bdf8'];
    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const size = Math.random() < 0.85 ? Math.random() * 1.5 + 0.5 : Math.random() * 2.2 + 1.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          baseAlpha: Math.random() * 0.5 + 0.3,
          alpha: Math.random() * 0.5 + 0.3,
          speed: Math.random() * 0.15 + 0.05,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          phase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)]
        });
      }
    };

    initStars();

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Gentle floating movement upwards-leftwards
        star.y -= star.speed;
        star.x -= star.speed * 0.3;

        // Wrap around borders
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
        if (star.x < 0) {
          star.x = width;
        }

        // Twinkling luminosity
        star.phase += star.twinkleSpeed;
        const currentAlpha = Math.max(0.1, star.baseAlpha + Math.sin(star.phase) * 0.35);

        ctx.save();
        ctx.globalAlpha = Math.min(1, currentAlpha);
        ctx.fillStyle = star.color;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle soft outer glow for slightly larger stars
        if (star.size > 1.8) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha * 0.25;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Deep Galaxy Base Gradients */}
      <div className="absolute inset-0 bg-[#060919]" />
      
      {/* Nebula radial glows */}
      <div className="absolute -top-[15%] left-[10%] w-[600px] h-[600px] rounded-full bg-radial from-indigo-600/20 via-sky-600/10 to-transparent blur-3xl" />
      <div className="absolute top-[40%] -right-[10%] w-[650px] h-[650px] rounded-full bg-radial from-blue-700/20 via-cyan-500/10 to-transparent blur-3xl" />
      <div className="absolute -bottom-[20%] left-[25%] w-[800px] h-[800px] rounded-full bg-radial from-violet-700/15 via-indigo-900/10 to-transparent blur-3xl" />

      {/* Floating Canvas Stars */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block opacity-90" />
    </div>
  );
};
