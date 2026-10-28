'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { UploadCloud, FileAudio, Loader2, X } from 'lucide-react';
import { useAudioStore } from '@/stores/useAudioStore';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { decodeAudioFile } from '@/lib/audioDecoder';
import {
  extractAudioFromVideo,
  isAudioFile,
  isVideoFile,
  RecordingProcessError,
  videoNeedsServerExtract,
} from '@/lib/extractAudioFromVideo';
import {
  AUDIO_TOO_LONG_MESSAGE,
  DAILY_LIMIT_MESSAGE,
  UPLOAD_TOO_LARGE_MESSAGE,
  audioTooLong,
  uploadTooLarge,
} from '@/lib/usagePolicy';

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const setActiveTrack = useAudioStore((state) => state.setActiveTrack);
  const setDuration = useAudioStore((state) => state.setDuration);
  const setSegments = useTranscriptStore((state) => state.setSegments);
  const setIntelligence = useIntelligenceStore((state) => state.setIntelligence);

  const refreshRemaining = useCallback(() => {
    void fetch('/api/usage')
      .then((response) => response.json())
      .then((payload: unknown) => {
        if (typeof payload !== 'object' || payload === null || !('remaining' in payload)) return;
        if (typeof payload.remaining !== 'number' || !Number.isFinite(payload.remaining)) return;
        setRemaining(payload.remaining);
        if (payload.remaining === 0) {
          setErrorMessage((current) => current ?? DAILY_LIMIT_MESSAGE);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refreshRemaining();
  }, [isOpen, refreshRemaining]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    const video = isVideoFile(file);
    if (!video && !isAudioFile(file)) {
      setErrorMessage('Please select an audio file or a video.');
      return;
    }

    if (uploadTooLarge(file.size)) {
      setErrorMessage(UPLOAD_TOO_LARGE_MESSAGE);
      return;
    }

    if (remaining === 0) {
      setErrorMessage(DAILY_LIMIT_MESSAGE);
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      let audioFile = file;
      if (video) {
        setStatusMessage(
          videoNeedsServerExtract(file.size)
            ? 'Uploading the video and extracting the audio...'
            : 'Extracting the audio from the video...',
        );
        audioFile = await extractAudioFromVideo(file);
      }

      setStatusMessage('Decoding audio peaks in the browser...');

      const { duration, waveform, audioUrl } = await decodeAudioFile(audioFile, 80);

      if (audioTooLong(duration)) {
        URL.revokeObjectURL(audioUrl);
        setErrorMessage(AUDIO_TOO_LONG_MESSAGE);
        return;
      }

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

      setStatusMessage('Analyzing the meeting with Google Gemini...');

      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        if (result.segments && result.segments.length > 0) {
          setSegments(result.segments);
        }

        if (result.intelligence) {
          setIntelligence(result.intelligence);
        }

        onClose();
      } else {
        const errData = await response.json();
        setErrorMessage(errData.error || 'Could not process the audio with Gemini.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof RecordingProcessError
          ? error.message
          : 'Failed to process the recording.',
      );
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
      refreshRemaining();
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
            aria-label="Close"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*,.mkv,.m4v,.avi"
          onClick={(event) => event.stopPropagation()}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-xs font-medium text-slate-200">
                {statusMessage}
              </p>
              <p className="text-[11px] text-slate-500">
                Multimodal processing with Gemini...
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
                Supports MP3, WAV, M4A, or AAC
              </p>
              <p className="text-[11px] text-slate-500">
                Beta: up to 15 minutes, 100 MB, and 5 transcriptions a day.
              </p>
              {remaining !== null && (
                <p className="text-[11px] text-slate-400">
                  {remaining} transcriptions left today.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (!isProcessing) videoInputRef.current?.click();
          }}
          disabled={isProcessing}
          className="w-full text-center text-xs font-medium text-orange-300 transition-colors hover:text-orange-200 disabled:opacity-50"
        >
          No audio file? Send the video instead.
        </button>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-400">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};