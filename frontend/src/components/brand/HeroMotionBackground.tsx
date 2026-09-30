import React, { useState, useEffect, useRef } from 'react';

export const HeroMotionBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setTilt({
        x: x * 10, // max 10deg tilt
        y: -y * 10,
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ perspective: '1000px' }}
      aria-hidden="true"
    >
      {/* 3D Parallax Canvas Plane */}
      <div
        className="w-full h-full relative transition-transform duration-500 ease-out"
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dynamic Dual Ambient Radial Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-nitro-amber/25 via-nitro-orange/15 to-transparent blur-3xl rounded-full opacity-70 dark:opacity-90 pointer-events-none" />
        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-br from-nitro-amber/20 via-nitro-orange/15 to-transparent blur-2xl rounded-full opacity-60 dark:opacity-85 pointer-events-none" />

        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full object-cover opacity-40 dark:opacity-85"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="heroAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC837" />
              <stop offset="50%" stopColor="#FF9900" />
              <stop offset="100%" stopColor="#ED6A00" />
            </linearGradient>

            <pattern id="telemetryGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-fastener-border/60 dark:text-fastener-gunmetal/75"
              />
              <circle cx="60" cy="0" r="1.5" className="fill-nitro-amber/60 dark:fill-nitro-amber/90" />
            </pattern>
          </defs>

          {/* LAYER 1: Dynamic Blueprint Grid */}
          <rect width="100%" height="100%" fill="url(#telemetryGrid)" />

          {/* LAYER 2: Concentric Radar Arcs */}
          <g className="origin-center" transform="translate(600, 300)">
            {/* Center Pulsing Telemetry Pip */}
            <circle r="8" fill="#FFC837" className="animate-ping opacity-60 dark:opacity-80" />
            <circle r="4" fill="#FFC837" className="opacity-90" />

            {/* Outer Slow-Rotating Ring */}
            <circle
              r="220"
              fill="none"
              stroke="#FFC837"
              strokeWidth="1.5"
              strokeDasharray="8, 12, 2, 12"
              className="animate-[spin_60s_linear_infinite] opacity-60 dark:opacity-85"
            />
            {/* Middle Reverse Ring */}
            <circle
              r="160"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6, 10"
              className="text-machined-silver/70 dark:text-machined-silver animate-[spin_40s_linear_infinite_reverse]"
            />
            {/* Inner Precision Ring */}
            <circle
              r="90"
              fill="none"
              stroke="url(#heroAmberGrad)"
              strokeWidth="2"
              strokeDasharray="40, 20"
              className="opacity-80 dark:opacity-100 animate-[spin_25s_linear_infinite]"
            />

            {/* Target Crosshairs */}
            <line x1="-320" y1="0" x2="320" y2="0" stroke="currentColor" strokeWidth="1" strokeDasharray="6, 6" className="text-nitro-amber/50 dark:text-nitro-amber/70" />
            <line x1="0" y1="-260" x2="0" y2="260" stroke="currentColor" strokeWidth="1" strokeDasharray="6, 6" className="text-nitro-amber/50 dark:text-nitro-amber/70" />

            {/* 45-Degree Calibration Bevels */}
            <line x1="-120" y1="-120" x2="-80" y2="-80" stroke="url(#heroAmberGrad)" strokeWidth="1.75" />
            <line x1="120" y1="120" x2="80" y2="80" stroke="url(#heroAmberGrad)" strokeWidth="1.75" />
            <line x1="120" y1="-120" x2="80" y2="-80" stroke="url(#heroAmberGrad)" strokeWidth="1.75" />
            <line x1="-120" y1="120" x2="-80" y2="80" stroke="url(#heroAmberGrad)" strokeWidth="1.75" />

            {/* Kinetic Outer Hex Blueprint Ghost */}
            <path
              d="M -60,-104 L 60,-104 L 120,0 L 60,104 L -60,104 L -120,0 Z"
              fill="none"
              stroke="url(#heroAmberGrad)"
              strokeWidth="2"
              strokeDasharray="20, 10"
              className="opacity-70 dark:opacity-90 animate-[pulse_4s_ease-in-out_infinite]"
            />
          </g>

          {/* LAYER 3: Kinetic Datum Guide Lines */}
          <line x1="80" y1="180" x2="1120" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4, 10" className="text-machined-dim/40 dark:text-fastener-gunmetal/80" />
          <line x1="80" y1="420" x2="1120" y2="420" stroke="currentColor" strokeWidth="1" strokeDasharray="4, 10" className="text-machined-dim/40 dark:text-fastener-gunmetal/80" />

          {/* Corner Framing Brackets */}
          <path d="M 80,60 L 40,60 L 40,100" fill="none" stroke="#FFC837" strokeWidth="2.5" className="opacity-70 dark:opacity-90" />
          <path d="M 1120,60 L 1160,60 L 1160,100" fill="none" stroke="#FFC837" strokeWidth="2.5" className="opacity-70 dark:opacity-90" />
          <path d="M 80,540 L 40,540 L 40,500" fill="none" stroke="#FFC837" strokeWidth="2.5" className="opacity-70 dark:opacity-90" />
          <path d="M 1120,540 L 1160,540 L 1160,500" fill="none" stroke="#FFC837" strokeWidth="2.5" className="opacity-70 dark:opacity-90" />
        </svg>
      </div>
    </div>
  );
};
