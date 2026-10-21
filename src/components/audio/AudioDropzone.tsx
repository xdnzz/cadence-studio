'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Loader2, X } from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';
import { decodeAudioFile } from '@/lib/audioDecoder';
import { Button } from '@/components/ui/button';
import { Panel, PanelTitle } from '@/components/ui/panel';

interface AudioDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioDecoded?: (peaks: number[]) => void;
}

export const AudioDropzone: React.FC<AudioDropzoneProps> = ({
  isOpen,
  onClose,
  onAudioDecoded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setActiveTrack = useAudioStore((state) => state.setActiveTrack);
  const setDuration = useAudioStore((state) => state.setDuration);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please select a valid audio file (.mp3, .wav, .m4a).');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const { duration, waveform, audioUrl } = await decodeAudioFile(file, 80);

      setActiveTrack({
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        duration,
        sampleRate: 44100,
        channels: 2,
        audioUrl,
      });

      setDuration(duration);
      onAudioDecoded?.(waveform.peaks as number[]);
      onClose();
    } catch {
      setErrorMessage('Failed to decode the audio file in the browser.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm">
      <Panel className="h-auto w-full max-w-lg space-y-4 p-6">
        <div className="flex items-center justify-between">
          <PanelTitle icon={<FileAudio className="h-5 w-5 text-brand-soft" />}>
            Upload Meeting Recording
          </PanelTitle>

          <Button variant="ghost" size="icon" onClick={onClose} className="h-auto p-1">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed p-8 transition-all ${
            isDragging
              ? 'border-brand bg-brand/10'
              : 'border-line bg-canvas/50 hover:border-line-strong'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-brand-soft" />
              <p className="text-xs font-medium text-soft">
                Decoding amplitude peaks with the Web Audio API...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-raised p-3 text-brand-soft">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-soft">
                Drag an audio file here or click to select
              </p>
              <p className="text-[11px] text-faint">
                Supports MP3, WAV, M4A, or AAC (processed entirely in the browser)
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="rounded-control border border-danger-line/60 bg-danger-deep/40 p-3 text-xs text-danger">
            {errorMessage}
          </div>
        )}
      </Panel>
    </div>
  );
};