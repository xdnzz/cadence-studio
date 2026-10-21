'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Loader2, X } from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';
import { decodeAudioFile } from '@/lib/audioDecoder';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-slate-100">Upload Meeting Recording</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
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
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-xs font-medium text-slate-300">
                Decoding amplitude peaks with the Web Audio API...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-3 rounded-full bg-slate-800 text-orange-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                Drag an audio file here or click to select
              </p>
              <p className="text-[11px] text-slate-500">
                Supports MP3, WAV, M4A, or AAC (processed entirely in the browser)
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-400">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};