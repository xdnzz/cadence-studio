'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Circle, Clock, CheckSquare } from 'lucide-react';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/lib/audioMath';
import { ActionItemPriority } from '@/types/intelligence';

const priorityColors: Record<ActionItemPriority, string> = {
  urgent: 'text-red-400 bg-red-950/50 border-red-800/50',
  high: 'text-orange-400 bg-orange-950/50 border-orange-800/50',
  medium: 'text-yellow-400 bg-yellow-950/50 border-yellow-800/50',
  low: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
};

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
    <div className="flex flex-col h-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-slate-100">Meeting Intelligence</h2>
        </div>

        {intelligence?.sentiment && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
            Sentiment: {intelligence.sentiment.overall}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Executive Summary
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm leading-relaxed text-slate-300">
            {displaySummary ? (
              <p>
                {displaySummary}
                {isGenerating && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-orange-400 animate-pulse align-middle" />
                )}
              </p>
            ) : (
              <p className="text-slate-500">No summary generated yet.</p>
            )}
          </div>
        </section>

        {intelligence?.takeaways && intelligence.takeaways.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Key Takeaways
            </h3>
            <div className="space-y-2">
              {intelligence.takeaways.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTimestampJump(item.timestamp)}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 cursor-pointer transition-colors group flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-medium text-slate-200 group-hover:text-orange-400 transition-colors">
                      {item.topic}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.summary}</p>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {intelligence?.actionItems && intelligence.actionItems.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Action Items
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {intelligence.actionItems.filter((i) => i.status === 'completed').length} /{' '}
                {intelligence.actionItems.length}
              </span>
            </div>

            <div className="space-y-2">
              {intelligence.actionItems.map((action) => {
                const isCompleted = action.status === 'completed';

                return (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-start gap-3 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleActionItemStatus(action.id)}
                      className="mt-0.5 text-slate-400 hover:text-orange-400 transition-colors"
                      title={isCompleted ? 'Mark as pending' : 'Mark as done'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1">
                      <span
                        className={`text-xs block ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {action.title}
                      </span>

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                            priorityColors[action.priority]
                          }`}
                        >
                          {action.priority}
                        </span>

                        {action.assignee && (
                          <span className="text-[11px] text-slate-400">
                            {action.assignee}
                          </span>
                        )}

                        {typeof action.originTimestamp === 'number' && (
                          <button
                            type="button"
                            onClick={() => handleTimestampJump(action.originTimestamp)}
                            className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-orange-400 transition-colors ml-auto"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            {formatTime(action.originTimestamp)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};