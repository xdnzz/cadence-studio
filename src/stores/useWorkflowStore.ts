import { create } from 'zustand';
import { WorkflowNode, WorkflowEdge, WorkflowNodeType } from '@/types/workflow';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  isExecuting: boolean;
}

interface WorkflowActions {
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  removeNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateNodeStatus: (
    nodeId: string,
    status: 'idle' | 'running' | 'success' | 'failed'
  ) => void;
  addEdge: (edge: WorkflowEdge) => void;
  removeEdge: (source: string, target: string) => void;
  selectNode: (nodeId: string | null) => void;
  executeWorkflow: () => Promise<void>;
  reset: () => void;
}

export type WorkflowStore = WorkflowState & WorkflowActions;

const initialNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'trigger_meeting_end',
    position: { x: 50, y: 150 },
    data: {
      label: 'Meeting Concluded',
      description: 'Triggered when audio finishes or meeting ends',
      status: 'idle',
      config: {},
    },
  },
  {
    id: 'node-2',
    type: 'ai_extract',
    position: { x: 300, y: 150 },
    data: {
      label: 'AI Action Extraction',
      description: 'Extract action items and assignees from transcript',
      status: 'idle',
      config: { model: 'gpt-4o' },
    },
  },
  {
    id: 'node-3',
    type: 'create_linear_task',
    position: { x: 580, y: 80 },
    data: {
      label: 'Create Linear Issues',
      description: 'Sync high-priority tasks into team backlog',
      status: 'idle',
      config: { project: 'Frontend Engineering' },
    },
  },
  {
    id: 'node-4',
    type: 'slack_notification',
    position: { x: 580, y: 220 },
    data: {
      label: 'Broadcast to Slack',
      description: 'Send meeting recap to #proj-cadence',
      status: 'idle',
      config: { channel: '#proj-cadence' },
    },
  },
];

const initialEdges: WorkflowEdge[] = [
  { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
  { id: 'edge-2-3', source: 'node-2', target: 'node-3' },
  { id: 'edge-2-4', source: 'node-2', target: 'node-4' },
];

const initialState: WorkflowState = {
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  isExecuting: false,
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    })),

  updateNodePosition: (nodeId, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      ),
    })),

  updateNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, status } }
          : node
      ),
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  removeEdge: (source, target) =>
    set((state) => ({
      edges: state.edges.filter(
        (e) => !(e.source === source && e.target === target)
      ),
    })),

  selectNode: (selectedNodeId) => set({ selectedNodeId }),

  executeWorkflow: async () => {
    const { nodes } = get();
    set({ isExecuting: true });

    for (const node of nodes) {
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n
        ),
      }));

      await new Promise((resolve) => setTimeout(resolve, 300));

      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'success' } } : n
        ),
      }));
    }

    set({ isExecuting: false });
  },

  reset: () => set(initialState),
}));