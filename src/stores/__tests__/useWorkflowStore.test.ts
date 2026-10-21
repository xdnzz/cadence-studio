import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWorkflowStore } from '../useWorkflowStore';
import { WorkflowNode } from '@/types/workflow';

describe('useWorkflowStore', () => {
  beforeEach(() => {
    useWorkflowStore.getState().reset();
  });

  it('should initialize with predefined workflow nodes and edges', () => {
    const state = useWorkflowStore.getState();

    expect(state.nodes).toHaveLength(4);
    expect(state.edges).toHaveLength(3);
    expect(state.selectedNodeId).toBeNull();
    expect(state.isExecuting).toBe(false);
  });

  it('should update node position accurately', () => {
    useWorkflowStore.getState().updateNodePosition('node-1', { x: 120, y: 240 });

    const updatedNode = useWorkflowStore.getState().nodes.find((n) => n.id === 'node-1');
    expect(updatedNode?.position).toEqual({ x: 120, y: 240 });
  });

  it('should update node status', () => {
    useWorkflowStore.getState().updateNodeStatus('node-2', 'running');

    let node = useWorkflowStore.getState().nodes.find((n) => n.id === 'node-2');
    expect(node?.data.status).toBe('running');

    useWorkflowStore.getState().updateNodeStatus('node-2', 'success');
    node = useWorkflowStore.getState().nodes.find((n) => n.id === 'node-2');
    expect(node?.data.status).toBe('success');
  });

  it('should add a new node and edge', () => {
    const newNode: WorkflowNode = {
      id: 'node-5',
      type: 'send_email',
      position: { x: 800, y: 150 },
      data: {
        label: 'Send Executive Summary',
        description: 'Email recap to stakeholders',
        status: 'idle',
        config: {},
      },
    };

    useWorkflowStore.getState().addNode(newNode);
    expect(useWorkflowStore.getState().nodes).toHaveLength(5);

    useWorkflowStore.getState().addEdge({ id: 'edge-3-5', source: 'node-3', target: 'node-5' });
    expect(useWorkflowStore.getState().edges).toHaveLength(4);
  });

  it('should remove node and connected edges', () => {
    useWorkflowStore.getState().removeNode('node-2');

    const state = useWorkflowStore.getState();
    expect(state.nodes.find((n) => n.id === 'node-2')).toBeUndefined();
    expect(state.edges.filter((e) => e.source === 'node-2' || e.target === 'node-2')).toHaveLength(0);
  });

  it('should sequentially execute workflow nodes', async () => {
    vi.useFakeTimers();

    const executionPromise = useWorkflowStore.getState().executeWorkflow();

    expect(useWorkflowStore.getState().isExecuting).toBe(true);

    await vi.runAllTimersAsync();
    await executionPromise;

    const state = useWorkflowStore.getState();
    expect(state.isExecuting).toBe(false);
    expect(state.nodes.every((n) => n.data.status === 'success')).toBe(true);

    vi.useRealTimers();
  });
});