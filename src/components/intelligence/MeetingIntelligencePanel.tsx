'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/lib/audioMath';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, Panel, PanelHeader, PanelTitle, SectionLabel } from '@/components/ui/panel';

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
              {intelligence.actionItems.map((action) => {
                const isCompleted = action.status === 'completed';

                return (
                  <Card key={action.id} className="flex items-start gap-3 p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActionItemStatus(action.id)}
                      className="mt-0.5 h-auto p-0 hover:bg-transparent"
                      title={isCompleted ? 'Mark as pending' : 'Mark as done'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex-1">
                      <span
                        className={`block text-xs ${
                          isCompleted ? 'text-faint line-through' : 'text-soft'
                        }`}
                      >
                        {action.title}
                      </span>

                      <div className="mt-2 flex items-center gap-2">
                        <Badge tone={action.priority}>{action.priority}</Badge>

                        {action.assignee && (
                          <span className="text-[11px] text-muted">{action.assignee}</span>
                        )}

                        {typeof action.originTimestamp === 'number' && (
                          <Button
                            variant="ghost"
                            onClick={() => handleTimestampJump(action.originTimestamp)}
                            className="ml-auto h-auto p-0 font-mono text-[10px] text-faint hover:bg-transparent hover:text-brand-soft"
                          >
                            <Clock className="h-2.5 w-2.5" />
                            {formatTime(action.originTimestamp)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Panel>
  );
};