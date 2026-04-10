import React, { useEffect, useRef, useLayoutEffect } from 'react';

interface TubesAnimationProps {
  colors?: string[];
}

// Global state to persist across re-mounts
let globalApp: { dispose?: () => void } | null = null;
let globalAnimationId: number | null = null;
let globalCanvas: HTMLCanvasElement | null = null;

// Memoized to prevent re-renders when parent state changes
export const TubesAnimation = React.memo(function TubesAnimation({ colors = ['#25ced1', '#ea526f', '#ff8a5b'] }: TubesAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;

    // If already initialized with same canvas, skip
    if (globalCanvas === canvas && globalApp) {
      return;
    }

    // Cleanup previous instance if canvas changed
    if (globalAnimationId) {
      cancelAnimationFrame(globalAnimationId);
      globalAnimationId = null;
    }
    if (globalApp && globalApp.dispose) {
      globalApp.dispose();
      globalApp = null;
    }

    globalCanvas = canvas;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const width = rect.width || 1280;
    const height = rect.height || 720;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Dynamic import of TubesCursor
    import('threejs-components/build/cursors/tubes1.min.js').then((module) => {
      // Double check canvas is still the same
      if (globalCanvas !== canvas) return;

      const TubesCursor = module.default;

      globalApp = TubesCursor(canvas, {
        tubes: {
          count: 20,
          radius: 0.08,
          length: 10,
          colors: colors,
          lights: {
            intensity: 250,
            colors: [...colors, '#ffffff']
          }
        }
      });

      // Auto-animate figure-8 pattern (no mouse interaction)
      let time = 0;
      const animate = () => {
        if (globalCanvas !== canvas) return; // Stop if canvas changed

        time += 0.015;
        const scale = Math.min(width, height) * 0.08;
        const t = time;
        // Two small circles stacked vertically
        const radius = scale;
        const centerOffset = scale * 1.8;
        const cycle = (t % (4 * Math.PI));

        let x, y;
        if (cycle < 2 * Math.PI) {
          // Top circle
          x = radius * Math.sin(cycle);
          y = -centerOffset + radius * Math.cos(cycle);
        } else {
          // Bottom circle
          const angle = cycle - 2 * Math.PI;
          x = -radius * Math.sin(angle);
          y = centerOffset - radius * Math.cos(angle);
        }
        const screenX = width / 2 + x;
        const screenY = height / 2 + y;

        // Dispatch directly to canvas
        const event = new MouseEvent('mousemove', {
          clientX: screenX,
          clientY: screenY,
          bubbles: false,
        });
        canvas.dispatchEvent(event);
        globalAnimationId = requestAnimationFrame(animate);
      };

      setTimeout(animate, 500);
    }).catch((err) => {
      console.error('Failed to load TubesCursor:', err);
    });

    // No cleanup on unmount - keep animation running
  }, []); // Empty deps - only run once

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none', // Disable mouse interaction
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none', // Disable mouse interaction
        }}
      />
    </div>
  );
});

export default TubesAnimation;
