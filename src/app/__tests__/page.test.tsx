import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CadenceStudioPage from '../page';
import { useAudioStore } from '@/stores/useAudioStore';

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

describe('CadenceStudioPage integration', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
    vi.restoreAllMocks();

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

    Element.prototype.scrollIntoView = vi.fn();
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn();
    window.HTMLMediaElement.prototype.load = vi.fn();
  });

  it('should render header branding and default meeting tab', () => {
    render(<CadenceStudioPage />);

    expect(screen.getByText('Cadence Studio')).toBeInTheDocument();
    expect(screen.getByText('Meeting & Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Agentic Canvas')).toBeInTheDocument();
  });

  it('should toggle between meeting tab and agentic canvas tab', () => {
    render(<CadenceStudioPage />);

    const canvasTabBtn = screen.getByRole('button', { name: /Agentic Canvas/i });
    fireEvent.click(canvasTabBtn);

    expect(screen.getByText('Post-Meeting Agentic Studio')).toBeInTheDocument();

    const meetingTabBtn = screen.getByRole('button', { name: /Meeting & Intelligence/i });
    fireEvent.click(meetingTabBtn);

    expect(screen.getByText('Meeting Intelligence')).toBeInTheDocument();
  });

  it('should open audio dropzone modal when upload button is clicked', () => {
    render(<CadenceStudioPage />);

    const uploadButton = screen.getByTitle('Upload a local audio file');
    fireEvent.click(uploadButton);

    expect(screen.getByText('Upload Meeting Recording')).toBeInTheDocument();
  });
});