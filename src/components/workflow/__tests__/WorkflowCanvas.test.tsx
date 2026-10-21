import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowCanvas } from '../WorkflowCanvas';
import { useWorkflowStore } from '@/stores/useWorkflowStore';

describe('WorkflowCanvas', () => {
  beforeEach(() => {
    useWorkflowStore.getState().reset();
  });

  it('should render default workflow nodes and run button', () => {
    render(<WorkflowCanvas />);

    expect(screen.getByText('Meeting Concluded')).toBeInTheDocument();
    expect(screen.getByText('AI Action Extraction')).toBeInTheDocument();
    expect(screen.getByText('Create Linear Issues')).toBeInTheDocument();
    expect(screen.getByText('Broadcast to Slack')).toBeInTheDocument();
    expect(screen.getByText('Run Automated Workflow')).toBeInTheDocument();

    const firstEdge = document.querySelector('path[d^="M 270"]');
    expect(firstEdge?.getAttribute('d')).toContain('M 270 190');
    expect(firstEdge?.getAttribute('d')).toContain('300 190');
  });

  it('should trigger node selection upon click', () => {
    render(<WorkflowCanvas />);

    const linearNode = screen.getByText('Create Linear Issues');
    fireEvent.click(linearNode);

    expect(useWorkflowStore.getState().selectedNodeId).toBe('node-3');
  });

  it('should trigger executeWorkflow when execution button is pressed', async () => {
    vi.useFakeTimers();

    render(<WorkflowCanvas />);

    const runButton = screen.getByRole('button', { name: /Run Automated Workflow/i });
    fireEvent.click(runButton);

    expect(screen.getByText('Executing Pipeline...')).toBeInTheDocument();

    await vi.runAllTimersAsync();

    expect(screen.getByText('Run Automated Workflow')).toBeInTheDocument();

    vi.useRealTimers();
  });
});