'use client';

import React, { useRef, useEffect } from 'react';
import { Search, X, ArrowDown } from 'lucide-react';
import { useTranscriptStore } from '@/stores/useTranscriptStore';
import { useTranscriptSync } from '@/hooks/useTranscriptSync';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/lib/audioMath';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';
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
    <Panel>
      <PanelHeader>
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <Field
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by term or participant..."
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-soft"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          variant="toggle"
          data-active={isAutoScrollEnabled}
          onClick={() => setAutoScrollEnabled(!isAutoScrollEnabled)}
          title="Auto-scroll"
        >
          <ArrowDown className={`h-3.5 w-3.5 ${isAutoScrollEnabled ? 'animate-bounce' : ''}`} />
          <span>Auto-scroll</span>
        </Button>
      </PanelHeader>

      <div ref={containerRef} onWheel={handleWheel} className="flex-1 space-y-6 overflow-y-auto p-6">
        {filteredSegments.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-sm text-faint">
            No transcript segments match this search.
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isSegmentActive = segment.id === activeSegmentId;

            return (
              <div
                key={segment.id}
                className={`rounded-card p-4 transition-colors ${
                  isSegmentActive ? 'border border-line-strong/60 bg-raised/40' : 'bg-transparent'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-line-strong text-[10px] font-bold uppercase text-soft">
                      {segment.speakerName.slice(0, 2)}
                    </div>
                    <span className="text-xs font-semibold text-soft">{segment.speakerName}</span>
                  </div>

                  <span className="font-mono text-[11px] text-faint">{formatTime(segment.start)}</span>
                </div>

                <p className="flex flex-wrap gap-x-1 gap-y-1 text-sm leading-relaxed text-soft">
                  {segment.words.map((word) => {
                    const isWordActive = word.id === activeWordId;

                    return (
                      <span
                        key={word.id}
                        ref={isWordActive ? activeWordRef : null}
                        onClick={() => handleWordClick(word)}
                        className={`cursor-pointer rounded px-1 py-0.5 transition-all ${
                          isWordActive
                            ? 'bg-brand font-medium text-on-brand shadow-sm'
                            : 'text-soft hover:bg-raised hover:text-ink'
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
    </Panel>
  );
};