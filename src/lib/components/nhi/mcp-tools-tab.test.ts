import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import McpToolsTab from './mcp-tools-tab.svelte';

vi.mock('$lib/api/mcp-client', () => ({
	fetchMcpTools: vi.fn(),
	invokeMcpTool: vi.fn()
}));

import { fetchMcpTools } from '$lib/api/mcp-client';

const mockFetchMcpTools = vi.mocked(fetchMcpTools);

describe('McpToolsTab', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it('shows loading skeleton initially', () => {
		// Never resolve so it stays in loading state
		mockFetchMcpTools.mockReturnValue(new Promise(() => {}));

		render(McpToolsTab, { props: { nhiId: 'nhi-1' } });

		const skeletons = document.querySelectorAll('.animate-pulse');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('renders tools list after fetch', async () => {
		mockFetchMcpTools.mockResolvedValue({
			tools: [
				{
					name: 'search',
					description: 'Search tool',
					input_schema: {},
					status: 'active',
					deprecated: false
				},
				{
					name: 'analyze',
					description: 'Analyze tool',
					input_schema: {},
					status: 'active',
					deprecated: false
				}
			]
		});

		render(McpToolsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText('search')).toBeTruthy();
			expect(screen.getByText('analyze')).toBeTruthy();
		});
	});

	it('shows empty state when no tools', async () => {
		mockFetchMcpTools.mockResolvedValue({ tools: [] });

		render(McpToolsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText('No MCP tools registered')).toBeTruthy();
		});
	});

	it('shows error state with retry button on fetch failure', async () => {
		mockFetchMcpTools.mockRejectedValue(new Error('Network error'));

		render(McpToolsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText('Network error')).toBeTruthy();
			expect(screen.getByText('Retry')).toBeTruthy();
		});
	});

	it('retry button triggers re-fetch', async () => {
		mockFetchMcpTools.mockRejectedValueOnce(new Error('Network error'));

		render(McpToolsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText('Retry')).toBeTruthy();
		});

		// Now set up a successful response for the retry
		mockFetchMcpTools.mockResolvedValue({
			tools: [
				{
					name: 'search',
					description: 'Search tool',
					input_schema: {},
					status: 'active',
					deprecated: false
				}
			]
		});

		const retryButton = screen.getByText('Retry');
		await fireEvent.click(retryButton);

		await waitFor(() => {
			expect(screen.getByText('search')).toBeTruthy();
		});

		// fetchMcpTools should have been called twice: once initial, once retry
		expect(mockFetchMcpTools).toHaveBeenCalledTimes(2);
	});

	it('passes nhiId to fetchMcpTools', async () => {
		mockFetchMcpTools.mockResolvedValue({ tools: [] });

		render(McpToolsTab, { props: { nhiId: 'nhi-xyz' } });

		await waitFor(() => {
			expect(mockFetchMcpTools).toHaveBeenCalledWith('nhi-xyz');
		});
	});
});
