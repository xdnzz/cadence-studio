'use client';

import React, { useRef, useEffect } from 'react';
import { Search, X, ArrowDown } from 'lucide-react';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { useTranscriptSync } from '@/hooks/useTranscriptSync';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/lib/audioMath';
import { WordTimestamp } from '@/types/transcript';

export const TranscriptViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  const { filteredSegments, activeSegmentId, activeWordId } = useTranscriptSync();
  const { seek, play } = useAudioEngine();

  const searchQuery = useTranscriptStore((state) => state.searchQuery);
  const setSearchQuery = useTranscriptStore((state) => state.setSearchQuery);
  const isAutoScrollEnabled = useTranscriptStore((state) => state.isAutoScrollEnabled);
  const setAutoScrollEnabled = useTranscriptStore((state) => state.setAutoScrollEnabled);

  useEffect(() => {
    if (!isAutoScrollEnabled || !activeWordRef.current || !containerRef.current) return;

    activeWordRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeWordId, isAutoScrollEnabled]);

  const handleWordClick = (word: WordTimestamp) => {
    seek(word.start);
    play();
  };

  const handleWheel = () => {
    if (isAutoScrollEnabled) {
      setAutoScrollEnabled(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por termo ou participante..."
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAutoScrollEnabled(!isAutoScrollEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isAutoScrollEnabled
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Auto-scroll"
        >
          <ArrowDown className={`w-3.5 h-3.5 ${isAutoScrollEnabled ? 'animate-bounce' : ''}`} />
          <span>Auto-scroll</span>
        </button>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {filteredSegments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm">
            Nenhum trecho encontrado para a busca.
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isSegmentActive = segment.id === activeSegmentId;

            return (
              <div
                key={segment.id}
                className={`p-4 rounded-xl transition-colors ${
                  isSegmentActive ? 'bg-slate-800/40 border border-slate-700/60' : 'bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200 uppercase">
                      {segment.speakerName.slice(0, 2)}
                    </div>
                    <span className="text-xs font-semibold text-slate-300">
                      {segment.speakerName}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {formatTime(segment.start)}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-300 flex flex-wrap gap-x-1 gap-y-1">
                  {segment.words.map((word) => {
                    const isWordActive = word.id === activeWordId;

                    return (
                      <span
                        key={word.id}
                        ref={isWordActive ? activeWordRef : null}
                        onClick={() => handleWordClick(word)}
                        className={`cursor-pointer px-1 py-0.5 rounded transition-all ${
                          isWordActive
                            ? 'bg-orange-500 text-white font-medium shadow-sm'
                            : 'hover:bg-slate-800 hover:text-slate-100 text-slate-300'
                        }`}
                      >
                        {word.word}
                      </span>
                    );
                  })}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};