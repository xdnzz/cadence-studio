'use client';

import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/lib/audioMath';
import { Badge } from '@/components/ui/badge';
import { Card, Panel, PanelHeader, PanelTitle, SectionLabel } from '@/components/ui/panel';
import { ActionItemCard } from '@/components/intelligence/ActionItemCard';

export const MeetingIntelligencePanel: React.FC = () => {
  const intelligence = useIntelligenceStore((state) => state.intelligence);
  const isGenerating = useIntelligenceStore((state) => state.isGenerating);
  const streamedSummary = useIntelligenceStore((state) => state.streamedSummary);
  const toggleActionItemStatus = useIntelligenceStore((state) => state.toggleActionItemStatus);

  const { seek, play } = useAudioEngine();

  const handleTimestampJump = (timestamp?: number) => {
    if (typeof timestamp !== 'number') return;
    seek(timestamp);
    play();
  };

  const displaySummary = isGenerating ? streamedSummary : intelligence?.overview;

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle icon={<Sparkles className="h-4 w-4 text-brand-soft" />}>
          Meeting Intelligence
        </PanelTitle>

        {intelligence?.sentiment && (
          <Badge tone="success">Sentiment: {intelligence.sentiment.overall}</Badge>
        )}
      </PanelHeader>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <section className="space-y-2">
          <SectionLabel>Executive Summary</SectionLabel>
          <Card className="border-line/80 bg-canvas/60 p-4 text-sm leading-relaxed text-soft">
            {displaySummary ? (
              <p>
                {displaySummary}
                {isGenerating && (
                  <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-brand-soft align-middle" />
                )}
              </p>
            ) : (
              <p className="text-faint">No summary generated yet.</p>
            )}
          </Card>
        </section>

        {intelligence?.takeaways && intelligence.takeaways.length > 0 && (
          <section className="space-y-2">
            <SectionLabel>Key Takeaways</SectionLabel>
            <div className="space-y-2">
              {intelligence.takeaways.map((item) => (
                <Card
                  key={item.id}
                  className="group flex cursor-pointer items-start justify-between gap-3 p-3 transition-colors hover:border-line-strong"
                >
                  <button
                    type="button"
                    onClick={() => handleTimestampJump(item.timestamp)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <span>
                      <span className="block text-xs font-medium text-soft transition-colors group-hover:text-brand-soft">
                        {item.topic}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{item.summary}</span>
                    </span>

                    <span className="flex items-center gap-1 rounded bg-raised/60 px-2 py-0.5 font-mono text-[11px] text-faint">
                      <Clock className="h-3 w-3" />
                      {formatTime(item.timestamp)}
                    </span>
                  </button>
                </Card>
              ))}
            </div>
          </section>
        )}

        {intelligence?.actionItems && intelligence.actionItems.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionLabel>Action Items</SectionLabel>
              <span className="font-mono text-[11px] text-faint">
                {intelligence.actionItems.filter((item) => item.status === 'completed').length} /{' '}
                {intelligence.actionItems.length}
              </span>
            </div>

            <div className="space-y-2">
              {intelligence.actionItems.map((action) => (
                <ActionItemCard
                  key={action.id}
                  action={action}
                  onToggle={() => toggleActionItemStatus(action.id)}
                  onJump={
                    typeof action.originTimestamp === 'number'
                      ? () => handleTimestampJump(action.originTimestamp)
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Panel>
  );
};