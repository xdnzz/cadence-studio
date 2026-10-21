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
    <div className="flex flex-col h-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <WorkflowIcon className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-slate-100">Post-Meeting Agentic Studio</h2>
        </div>

        <button
          type="button"
          onClick={() => executeWorkflow()}
          disabled={isExecuting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white shadow-md transition-all active:scale-95"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Automated Workflow</span>
            </>
          )}
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto bg-slate-950 select-none">
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
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fdba74" stopOpacity="0.4" />
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
                className={`p-3.5 rounded-xl border bg-slate-900 cursor-pointer transition-all shadow-lg ${
                  isSelected
                    ? 'border-orange-500 ring-1 ring-orange-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-slate-800 text-orange-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {node.data.label}
                    </span>
                  </div>

                  {isRunning && <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />}
                  {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  {node.data.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};