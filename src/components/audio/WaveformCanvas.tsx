'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { calculateTimeFromPosition, formatTime } from '@/lib/audioMath';

interface WaveformCanvasProps {
  peaks: number[];
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  height?: number;
  barWidth?: number;
  barGap?: number;
  playedColor?: string;
  unplayedColor?: string;
  cursorColor?: string;
  className?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  peaks,
  currentTime,
  duration,
  onSeek,
  height = 72,
  barWidth = 3,
  barGap = 2,
  playedColor = '#f97316',
  unplayedColor = '#475569',
  cursorColor = '#ffffff',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; time: number } | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasWidth === 0 || height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasWidth, height);

    if (peaks.length === 0) return;

    const step = barWidth + barGap;
    const totalBars = Math.floor(canvasWidth / step);
    const progressRatio = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;
    const currentProgressX = progressRatio * canvasWidth;

    const halfHeight = height / 2;

    for (let i = 0; i < totalBars; i++) {
      const peakIndex = Math.floor((i / totalBars) * peaks.length);
      const peak = peaks[peakIndex] || 0.05;

      const barHeight = Math.max(3, peak * (height - 8));
      const x = i * step;
      const y = halfHeight - barHeight / 2;

      ctx.fillStyle = x < currentProgressX ? playedColor : unplayedColor;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }

    ctx.fillStyle = cursorColor;
    ctx.fillRect(Math.max(0, currentProgressX - 1), 0, 2, height);
  }, [canvasWidth, height, peaks, currentTime, duration, barWidth, barGap, playedColor, unplayedColor, cursorColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      draw();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onSeek || !containerRef.current || duration <= 0) return;

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = calculateTimeFromPosition(clickX, rect.width, duration);

    onSeek(seekTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || duration <= 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const moveX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetTime = calculateTimeFromPosition(moveX, rect.width, duration);

    setHoverPosition({ x: moveX, time: targetTime });

    if (isDragging && onSeek) {
      onSeek(targetTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none cursor-pointer group ${className}`}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${canvasWidth}px`, height: `${height}px` }}
        className="block w-full h-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />

      {hoverPosition && (
        <div
          className="absolute pointer-events-none -top-8 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 shadow-lg"
          style={{ left: `${hoverPosition.x}px` }}
        >
          {formatTime(hoverPosition.time)}
        </div>
      )}
    </div>
  );
};