import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import McpToolCard from './mcp-tool-card.svelte';
import type { McpTool, McpCallResponse } from '$lib/api/types';

vi.mock('$lib/api/mcp-client', () => ({
	invokeMcpTool: vi.fn()
}));

import { invokeMcpTool } from '$lib/api/mcp-client';

const mockInvokeMcpTool = vi.mocked(invokeMcpTool);

function makeTool(overrides: Partial<McpTool> = {}): McpTool {
	return {
		name: 'search',
		description: 'Search for documents',
		input_schema: { type: 'object', properties: { query: { type: 'string' } } },
		status: 'active',
		deprecated: false,
		...overrides
	};
}

describe('McpToolCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it('renders tool name and description in collapsed state', () => {
		render(McpToolCard, { props: { tool: makeTool(), nhiId: 'nhi-1' } });
		expect(screen.getByText('search')).toBeTruthy();
		expect(screen.getByText('Search for documents')).toBeTruthy();
	});

	it('shows status badge with correct styling for active tool', () => {
		render(McpToolCard, { props: { tool: makeTool({ status: 'active' }), nhiId: 'nhi-1' } });
		const badge = screen.getByText('active');
		expect(badge).toBeTruthy();
		expect(badge.className).toContain('bg-green-600');
	});

	it('shows deprecated badge when deprecated flag is set', () => {
		render(McpToolCard, {
			props: { tool: makeTool({ deprecated: true }), nhiId: 'nhi-1' }
		});
		expect(screen.getByText('deprecated')).toBeTruthy();
	});

	it('expands to show textarea when clicked', async () => {
		render(McpToolCard, { props: { tool: makeTool(), nhiId: 'nhi-1' } });

		// Textarea should not be visible initially
		expect(document.querySelector('textarea')).toBeNull();

		// Click the header button to expand
		const expandButton = screen.getByText('search').closest('button');
		expect(expandButton).toBeTruthy();
		await fireEvent.click(expandButton!);

		// Textarea should now be visible
		await waitFor(() => {
			expect(document.querySelector('textarea')).toBeTruthy();
		});
	});

	it('has invoke form with textarea and button when expanded', async () => {
		render(McpToolCard, { props: { tool: makeTool(), nhiId: 'nhi-1' } });

		const expandButton = screen.getByText('search').closest('button');
		await fireEvent.click(expandButton!);

		await waitFor(() => {
			expect(document.querySelector('textarea')).toBeTruthy();
			expect(screen.getByText('Test Invoke')).toBeTruthy();
		});
	});

	it('shows loading state during invocation', async () => {
		// Make the invoke hang so we can observe the loading state
		let resolveInvoke: (value: McpCallResponse) => void = () => {};
		mockInvokeMcpTool.mockImplementation(
			() =>
				new Promise<McpCallResponse>((resolve) => {
					resolveInvoke = resolve;
				})
		);

		render(McpToolCard, { props: { tool: makeTool(), nhiId: 'nhi-1' } });

		// Expand
		const expandButton = screen.getByText('search').closest('button');
		await fireEvent.click(expandButton!);

		await waitFor(() => {
			expect(screen.getByText('Test Invoke')).toBeTruthy();
		});

		// Click invoke
		const invokeBtn = screen.getByText('Test Invoke');
		await fireEvent.click(invokeBtn);

		await waitFor(() => {
			expect(screen.getByText('Invoking...')).toBeTruthy();
		});

		// Resolve to clean up
		resolveInvoke!({ call_id: 'c-1', result: {}, latency_ms: 10 });
	});

	it('displays result after successful invocation', async () => {
		mockInvokeMcpTool.mockResolvedValue({
			call_id: 'call-42',
			result: { answer: 'hello' },
			latency_ms: 55
		});

		render(McpToolCard, { props: { tool: makeTool(), nhiId: 'nhi-1' } });

		// Expand
		const expandButton = screen.getByText('search').closest('button');
		await fireEvent.click(expandButton!);

		await waitFor(() => {
			expect(screen.getByText('Test Invoke')).toBeTruthy();
		});

		const invokeBtn = screen.getByText('Test Invoke');
		await fireEvent.click(invokeBtn);

		await waitFor(() => {
			expect(screen.getByText(/call-42/)).toBeTruthy();
			expect(screen.getByText(/55ms/)).toBeTruthy();
		});
	});

	it('displays error after failed invocation', async () => {
		mockInvokeMcpTool.mockRejectedValue({
			error_code: 'RateLimitExceeded',
			message: 'Too many requests'
		});

		render(McpToolCard, { props: { tool: makeTool(), nhiId: 'nhi-1' } });

		// Expand
		const expandButton = screen.getByText('search').closest('button');
		await fireEvent.click(expandButton!);

		await waitFor(() => {
			expect(screen.getByText('Test Invoke')).toBeTruthy();
		});

		const invokeBtn = screen.getByText('Test Invoke');
		await fireEvent.click(invokeBtn);

		await waitFor(() => {
			expect(screen.getByText('RateLimitExceeded: Too many requests')).toBeTruthy();
		});
	});

	it('displays invalid JSON error for malformed parameters', async () => {
		render(McpToolCard, { props: { tool: makeTool(), nhiId: 'nhi-1' } });

		// Expand
		const expandButton = screen.getByText('search').closest('button');
		await fireEvent.click(expandButton!);

		await waitFor(() => {
			expect(document.querySelector('textarea')).toBeTruthy();
		});

		// Type invalid JSON into the textarea
		const textarea = document.querySelector('textarea')!;
		await fireEvent.input(textarea, { target: { value: '{invalid' } });

		const invokeBtn = screen.getByText('Test Invoke');
		await fireEvent.click(invokeBtn);

		await waitFor(() => {
			expect(screen.getByText('Invalid JSON parameters')).toBeTruthy();
		});
	});
});
