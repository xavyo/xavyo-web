import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ActionEditor from './action-editor.svelte';

vi.mock('$lib/api/lifecycle-client', () => ({
	saveStateActions: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

describe('ActionEditor', () => {
	const baseProps = {
		configId: 'cfg-1',
		stateId: 'state-1'
	};

	it('renders with no actions', () => {
		render(ActionEditor, { props: baseProps });
		expect(screen.getByText('No entry actions configured.')).toBeDefined();
		expect(screen.getByText('No exit actions configured.')).toBeDefined();
	});

	it('renders Entry Actions section', () => {
		render(ActionEditor, { props: baseProps });
		expect(screen.getByText('Entry Actions')).toBeDefined();
	});

	it('renders Exit Actions section', () => {
		render(ActionEditor, { props: baseProps });
		expect(screen.getByText('Exit Actions')).toBeDefined();
	});

	it('renders Save Actions button', () => {
		render(ActionEditor, { props: baseProps });
		expect(screen.getByText('Save Actions')).toBeDefined();
	});

	it('renders with initial entry actions', () => {
		render(ActionEditor, {
			props: {
				...baseProps,
				initialEntryActions: [{ action_type: 'send_notification', parameters: { template: 'welcome' } }]
			}
		});
		expect(screen.queryByText('No entry actions configured.')).toBeNull();
	});

	it('renders with initial exit actions', () => {
		render(ActionEditor, {
			props: {
				...baseProps,
				initialExitActions: [{ action_type: 'trigger_provisioning', parameters: {} }]
			}
		});
		expect(screen.queryByText('No exit actions configured.')).toBeNull();
	});
});
