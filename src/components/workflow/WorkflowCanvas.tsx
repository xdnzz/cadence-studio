'use client';

import React from 'react';
import {
  Play,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  Mail,
  Send,
  MessageSquare,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { useWorkflowStore } from '@/stores/useWorkflowStore';
import { Button } from '@/components/ui/button';
import { Panel, PanelHeader, PanelTitle } from '@/components/ui/panel';
import { WorkflowNode, WorkflowNodeType } from '@/types/workflow';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

const nodeIcons: Record<WorkflowNodeType, React.FC<{ className?: string }>> = {
  trigger_meeting_end: Clock,
  ai_extract: Sparkles,
  send_email: Mail,
  create_linear_task: Send,
  slack_notification: MessageSquare,
};

export const WorkflowCanvas: React.FC = () => {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const isExecuting = useWorkflowStore((state) => state.isExecuting);

  const selectNode = useWorkflowStore((state) => state.selectNode);
  const executeWorkflow = useWorkflowStore((state) => state.executeWorkflow);

  const calculateEdgePath = (sourceNode: WorkflowNode, targetNode: WorkflowNode) => {
    const sourceX = sourceNode.position.x + NODE_WIDTH;
    const sourceY = sourceNode.position.y + NODE_HEIGHT / 2;
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + NODE_HEIGHT / 2;

    const deltaX = Math.abs(targetX - sourceX) * 0.5;

    return `M ${sourceX} ${sourceY} C ${sourceX + deltaX} ${sourceY}, ${targetX - deltaX} ${targetY}, ${targetX} ${targetY}`;
  };

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle icon={<WorkflowIcon className="h-4 w-4 text-brand-soft" />}>
          Post-Meeting Agentic Studio
        </PanelTitle>

        <Button onClick={() => executeWorkflow()} disabled={isExecuting}>
          {isExecuting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Executing Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Automated Workflow</span>
            </>
          )}
        </Button>
      </PanelHeader>

      <div className="relative min-h-0 flex-1 select-none overflow-auto bg-canvas">
        <div
          className="relative m-8"
          style={{
            width: Math.max(0, ...nodes.map((node) => node.position.x + NODE_WIDTH)),
            height: Math.max(360, ...nodes.map((node) => node.position.y + NODE_HEIGHT)),
          }}
        >
        <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
          <defs>
            <linearGradient id="workflow-edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-brand-glow)" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;

            return (
              <path
                key={edge.id}
                d={calculateEdgePath(sourceNode, targetNode)}
                fill="none"
                stroke="url(#workflow-edge-gradient)"
                strokeWidth="2"
                strokeDasharray={isExecuting ? '4 4' : 'none'}
                className={isExecuting ? 'animate-pulse' : ''}
              />
            );
          })}
        </svg>

          {nodes.map((node) => {
            const Icon = nodeIcons[node.type] || Sparkles;
            const isSelected = node.id === selectedNodeId;
            const isRunning = node.data.status === 'running';
            const isSuccess = node.data.status === 'success';

            return (
              <div
                key={node.id}
                onClick={() => selectNode(node.id)}
                style={{
                  position: 'absolute',
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  width: '220px',
                }}
                className={`cursor-pointer rounded-card border bg-surface p-3.5 shadow-lg transition-all ${
                  isSelected
                    ? 'border-brand ring-1 ring-brand/50'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-raised p-1 text-brand-soft">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-soft">{node.data.label}</span>
                  </div>

                  {isRunning && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-soft" />}
                  {isSuccess && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                </div>

                <p className="text-[11px] leading-tight text-muted">
                  {node.data.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
};