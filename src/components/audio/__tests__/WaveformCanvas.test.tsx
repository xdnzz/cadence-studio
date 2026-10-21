import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { WaveformCanvas } from '../WaveformCanvas';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe('WaveformCanvas', () => {
  beforeEach(() => {
    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      scale: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
    });
  });

  it('renders the canvas element', () => {
    const { container } = render(
      <WaveformCanvas
        peaks={[0.2, 0.5, 0.8, 0.4]}
        currentTime={10}
        duration={60}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('calls onSeek when the pointer interacts with the canvas', () => {
    const onSeek = vi.fn();
    const { container } = render(
      <WaveformCanvas
        peaks={[0.2, 0.5, 0.8, 0.4]}
        currentTime={10}
        duration={60}
        onSeek={onSeek}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    if (canvas) {
      canvas.setPointerCapture = vi.fn();
      canvas.releasePointerCapture = vi.fn();

      fireEvent.pointerDown(canvas, { clientX: 50, pointerId: 1 });
      expect(onSeek).toHaveBeenCalled();
    }
  });
});