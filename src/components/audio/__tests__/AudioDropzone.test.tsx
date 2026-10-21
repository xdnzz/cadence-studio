import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioDropzone } from '../AudioDropzone';

describe('AudioDropzone', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
  });

  it('should trigger onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<AudioDropzone isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});