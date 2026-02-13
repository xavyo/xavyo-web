import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import AgentCardTab from './agent-card-tab.svelte';
import type { AgentCard } from '$lib/api/types';

vi.mock('$lib/api/a2a-client', () => ({
	fetchAgentCard: vi.fn()
}));

import { fetchAgentCard } from '$lib/api/a2a-client';

const mockFetchAgentCard = vi.mocked(fetchAgentCard);

function makeAgentCard(overrides: Partial<AgentCard> = {}): AgentCard {
	return {
		name: 'Test Agent',
		description: 'A test agent for unit tests',
		url: 'https://agent.example.com',
		version: '1.2.0',
		protocol_version: '2024-11-15',
		capabilities: {
			streaming: true,
			push_notifications: false
		},
		authentication: {
			schemes: ['bearer', 'api_key']
		},
		skills: [
			{ id: 'skill-1', name: 'Code Review', description: 'Reviews code changes' },
			{ id: 'skill-2', name: 'Translation', description: null }
		],
		...overrides
	};
}

describe('AgentCardTab', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it('shows loading skeleton initially', () => {
		mockFetchAgentCard.mockReturnValue(new Promise(() => {}));

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		const skeletons = document.querySelectorAll('.animate-pulse');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('renders card data after fetch', async () => {
		mockFetchAgentCard.mockResolvedValue(makeAgentCard());

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('Test Agent')).toBeTruthy();
			expect(screen.getByText('A test agent for unit tests')).toBeTruthy();
			expect(screen.getByText('https://agent.example.com')).toBeTruthy();
			expect(screen.getByText('1.2.0')).toBeTruthy();
			expect(screen.getByText('2024-11-15')).toBeTruthy();
		});
	});

	it('shows capability badges', async () => {
		mockFetchAgentCard.mockResolvedValue(makeAgentCard());

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('Streaming: Yes')).toBeTruthy();
			expect(screen.getByText('Push Notifications: No')).toBeTruthy();
		});
	});

	it('shows authentication schemes', async () => {
		mockFetchAgentCard.mockResolvedValue(makeAgentCard());

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('bearer')).toBeTruthy();
			expect(screen.getByText('api_key')).toBeTruthy();
		});
	});

	it('shows skills table', async () => {
		mockFetchAgentCard.mockResolvedValue(makeAgentCard());

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('Code Review')).toBeTruthy();
			expect(screen.getByText('Reviews code changes')).toBeTruthy();
			expect(screen.getByText('Translation')).toBeTruthy();
			// skill-2 has null description, should show em-dash
			expect(screen.getByText('\u2014')).toBeTruthy();
		});
	});

	it('shows "No skills registered" when skills array is empty', async () => {
		mockFetchAgentCard.mockResolvedValue(makeAgentCard({ skills: [] }));

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('No skills registered')).toBeTruthy();
		});
	});

	it('shows "None configured" when authentication schemes is empty', async () => {
		mockFetchAgentCard.mockResolvedValue(
			makeAgentCard({ authentication: { schemes: [] } })
		);

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('None configured')).toBeTruthy();
		});
	});

	it('shows error message on fetch failure', async () => {
		mockFetchAgentCard.mockRejectedValue(new Error('Agent not found'));

		render(AgentCardTab, { props: { agentId: 'agent-bad' } });

		await waitFor(() => {
			expect(screen.getByText('Agent card unavailable')).toBeTruthy();
			expect(screen.getByText('Agent not found')).toBeTruthy();
		});
	});

	it('has retry button on error', async () => {
		mockFetchAgentCard.mockRejectedValue(new Error('Network error'));

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('Retry')).toBeTruthy();
		});
	});

	it('retry button triggers re-fetch', async () => {
		mockFetchAgentCard.mockRejectedValueOnce(new Error('Network error'));

		render(AgentCardTab, { props: { agentId: 'agent-1' } });

		await waitFor(() => {
			expect(screen.getByText('Retry')).toBeTruthy();
		});

		// Set up a successful response for retry
		mockFetchAgentCard.mockResolvedValue(makeAgentCard());

		const retryButton = screen.getByText('Retry');
		await fireEvent.click(retryButton);

		await waitFor(() => {
			expect(screen.getByText('Test Agent')).toBeTruthy();
		});

		expect(mockFetchAgentCard).toHaveBeenCalledTimes(2);
	});
});
