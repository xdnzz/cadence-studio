import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioDropzone } from '../AudioDropzone';

describe('AudioDropzone', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ remaining: 5, limit: 5 }),
      }),
    );
  });

  it('should not render modal when isOpen is false', () => {
    render(<AudioDropzone isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText('Upload Meeting Recording')).toBeNull();
  });

  it('should render dropzone modal when isOpen is true', () => {
    render(<AudioDropzone isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Upload Meeting Recording')).toBeInTheDocument();
    expect(
      screen.getByText('Drag an audio file here or click to select')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'No audio file? Send the video instead.' })).toBeNull();
    expect(
      screen.getByText('Beta: up to 15 minutes, 100 MB, and 5 transcriptions a day.')
    ).toBeInTheDocument();
    expect(document.querySelector('input[type="file"][accept="video/*,.mkv,.m4v,.avi"]')).toBeNull();
  });

  it('should trigger onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<AudioDropzone isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('rejects a file larger than 100 MB before transcription', () => {
    render(<AudioDropzone isOpen={true} onClose={vi.fn()} />);

    const oversized = new File(['recording'], 'meeting.mp3', { type: 'audio/mpeg' });
    Object.defineProperty(oversized, 'size', { value: 100 * 1024 * 1024 + 1 });

    const input = document.querySelector('input[type="file"][accept="audio/*"]');
    if (!(input instanceof HTMLInputElement)) throw new Error('Missing audio input');

    fireEvent.change(input, { target: { files: [oversized] } });

    expect(
      screen.getByText('This file is larger than 100 MB. The beta accepts recordings up to 100 MB.')
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalledWith('/api/transcribe', expect.anything());
  });
});