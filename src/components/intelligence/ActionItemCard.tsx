'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Circle, Clock, Pencil, X } from 'lucide-react';
import { ActionItem, ActionItemPriority } from '@/types/intelligence';
import { useIntelligenceStore } from '@/stores/useIntelligenceStore';
import { formatTime } from '@/lib/audioMath';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Card, SectionLabel } from '@/components/ui/panel';

const PRIORITIES: ActionItemPriority[] = ['low', 'medium', 'high', 'urgent'];

const priorityOptionClass: Record<ActionItemPriority, string> = {
  low: 'border-line-strong/40 bg-raised/50 text-muted data-[selected=true]:border-line-strong data-[selected=true]:bg-raised-hover data-[selected=true]:text-ink',
  medium:
    'border-warning-line/40 bg-warning-deep/40 text-warning data-[selected=true]:border-warning data-[selected=true]:bg-warning data-[selected=true]:text-warning-deep data-[selected=true]:shadow-[0_0_18px_-6px_var(--color-warning)]',
  high: 'border-brand-line/40 bg-brand-deep/50 text-brand-soft data-[selected=true]:border-brand data-[selected=true]:bg-brand data-[selected=true]:text-on-brand data-[selected=true]:shadow-[0_0_18px_-6px_var(--color-brand)]',
  urgent:
    'border-danger-line/40 bg-danger-deep/50 text-danger data-[selected=true]:border-danger data-[selected=true]:bg-danger data-[selected=true]:text-white data-[selected=true]:shadow-[0_0_18px_-6px_var(--color-danger)]',
};

interface ActionItemCardProps {
  action: ActionItem;
  onToggle: () => void;
  onJump?: () => void;
}

export function ActionItemCard({ action, onToggle, onJump }: ActionItemCardProps) {
  const updateActionItem = useIntelligenceStore((state) => state.updateActionItem);
  const isCompleted = action.status === 'completed';
  const titleId = useId();
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(action.title);
  const [priorityDraft, setPriorityDraft] = useState<ActionItemPriority>(action.priority);
  const [assigneeDraft, setAssigneeDraft] = useState(action.assignee ?? '');

  const close = () => {
    setOpen(false);
    editButtonRef.current?.focus();
  };

  const openEditor = () => {
    setTitleDraft(action.title);
    setPriorityDraft(action.priority);
    setAssigneeDraft(action.assignee ?? '');
    setOpen(true);
  };

  const save = () => {
    const title = titleDraft.trim();
    if (!title) {
      descriptionRef.current?.focus();
      return;
    }

    updateActionItem(action.id, {
      title,
      priority: priorityDraft,
      assignee: assigneeDraft,
    });
    close();
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    descriptionRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <Card className="flex items-start gap-3 p-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="mt-0.5 h-auto p-0 hover:bg-transparent"
        title={isCompleted ? 'Mark as pending' : 'Mark as done'}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </Button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`min-w-0 flex-1 text-xs ${
              isCompleted ? 'text-faint line-through' : 'text-soft'
            }`}
          >
            {action.title}
          </p>
          <Button
            ref={editButtonRef}
            variant="ghost"
            onClick={openEditor}
            className="h-auto shrink-0 px-2 py-1 text-[11px]"
          >
            <Pencil className="h-3 w-3" />
            Edit task
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Badge tone={action.priority}>{action.priority}</Badge>
          {action.assignee && <span className="text-[11px] text-muted">{action.assignee}</span>}

          {typeof action.originTimestamp === 'number' && onJump && (
            <Button
              variant="ghost"
              onClick={onJump}
              className="ml-auto h-auto p-0 font-mono text-[10px] text-faint hover:bg-transparent hover:text-brand-soft"
            >
              <Clock className="h-2.5 w-2.5" />
              {formatTime(action.originTimestamp)}
            </Button>
          )}
        </div>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="w-full max-w-md rounded-panel border border-line bg-surface p-4 shadow-panel"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id={titleId} className="text-sm font-semibold text-ink">
                  Edit task
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={close}
                  aria-label="Close"
                  className="h-auto p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  save();
                }}
              >
                <Card className="space-y-3 p-3">
                  <label className="block space-y-2">
                    <SectionLabel>Description</SectionLabel>
                    <Field
                      ref={descriptionRef}
                      aria-label="Task description"
                      value={titleDraft}
                      onChange={(event) => setTitleDraft(event.target.value)}
                      className="text-xs"
                    />
                  </label>

                  <div className="space-y-2">
                    <SectionLabel>Priority</SectionLabel>
                    <div role="radiogroup" aria-label="Priority" className="flex flex-wrap gap-2">
                      {PRIORITIES.map((priority) => {
                        const selected = priorityDraft === priority;

                        return (
                          <button
                            key={priority}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            data-selected={selected}
                            onClick={() => setPriorityDraft(priority)}
                            className={cn(
                              'rounded-control border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                              priorityOptionClass[priority],
                            )}
                          >
                            {priority}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="block space-y-2">
                    <SectionLabel>Owner</SectionLabel>
                    <Field
                      aria-label="Task owner"
                      value={assigneeDraft}
                      placeholder="Add owner"
                      onChange={(event) => setAssigneeDraft(event.target.value)}
                      className="text-xs"
                    />
                  </label>
                </Card>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="secondary" onClick={close}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </Card>
  );
}
