import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import EventTriggerDialog from './event-trigger-dialog.svelte';

vi.mock('$lib/api/birthright-client', () => ({
	triggerLifecycleEventClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { triggerLifecycleEventClient } from '$lib/api/birthright-client';
import { addToast } from '$lib/stores/toast.svelte';

const mockTrigger = triggerLifecycleEventClient as ReturnType<typeof vi.fn>;
const mockAddToast = addToast as ReturnType<typeof vi.fn>;

function renderOpen(propsOverrides: Record<string, unknown> = {}) {
	return render(EventTriggerDialog, {
		props: {
			open: true,
			onclose: vi.fn(),
			onsuccess: vi.fn(),
			...propsOverrides
		}
	});
}

describe('EventTriggerDialog', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('renders the dialog title when open', () => {
		renderOpen();
		expect(screen.getByText('Trigger Lifecycle Event')).toBeTruthy();
	});

	it('renders User ID input', () => {
		renderOpen();
		expect(screen.getByLabelText('User ID')).toBeTruthy();
	});

	it('renders Event Type select with three options', () => {
		renderOpen();
		const select = screen.getByLabelText('Event Type') as HTMLSelectElement;
		expect(select).toBeTruthy();
		const options = Array.from(select.querySelectorAll('option'));
		expect(options).toHaveLength(3);
		expect(options.map((o) => o.value)).toEqual(['joiner', 'mover', 'leaver']);
	});

	it('renders Source input with default value "api"', () => {
		renderOpen();
		const sourceInput = screen.getByLabelText('Source') as HTMLInputElement;
		expect(sourceInput.value).toBe('api');
	});

	it('renders Cancel and Trigger Event buttons', () => {
		renderOpen();
		expect(screen.getByText('Cancel')).toBeTruthy();
		expect(screen.getByText('Trigger Event')).toBeTruthy();
	});

	it('shows Attributes After field for joiner event type (default)', () => {
		renderOpen();
		expect(screen.getByLabelText('Attributes After (JSON)')).toBeTruthy();
	});

	it('does not show Attributes Before field for joiner event type', () => {
		renderOpen();
		expect(screen.queryByLabelText('Attributes Before (JSON)')).toBeNull();
	});

	it('shows both Attributes Before and After for mover event type', async () => {
		renderOpen();
		const select = screen.getByLabelText('Event Type');
		await fireEvent.change(select, { target: { value: 'mover' } });
		expect(screen.getByLabelText('Attributes Before (JSON)')).toBeTruthy();
		expect(screen.getByLabelText('Attributes After (JSON)')).toBeTruthy();
	});

	it('hides both attribute fields for leaver event type', async () => {
		renderOpen();
		const select = screen.getByLabelText('Event Type');
		await fireEvent.change(select, { target: { value: 'leaver' } });
		expect(screen.queryByLabelText('Attributes Before (JSON)')).toBeNull();
		expect(screen.queryByLabelText('Attributes After (JSON)')).toBeNull();
	});

	it('shows error when User ID is empty on submit', async () => {
		renderOpen();
		await fireEvent.click(screen.getByText('Trigger Event'));
		expect(screen.getByText('User ID is required')).toBeTruthy();
	});

	it('shows error for invalid attributes_before JSON', async () => {
		renderOpen();
		const userInput = screen.getByLabelText('User ID');
		await fireEvent.input(userInput, { target: { value: 'user-123' } });

		// Switch to mover to show attributes_before
		const select = screen.getByLabelText('Event Type');
		await fireEvent.change(select, { target: { value: 'mover' } });

		const beforeTextarea = screen.getByLabelText('Attributes Before (JSON)');
		await fireEvent.input(beforeTextarea, { target: { value: 'bad json' } });

		await fireEvent.click(screen.getByText('Trigger Event'));
		expect(screen.getByText('attributes_before must be a valid JSON object')).toBeTruthy();
	});

	it('shows error for invalid attributes_after JSON', async () => {
		renderOpen();
		const userInput = screen.getByLabelText('User ID');
		await fireEvent.input(userInput, { target: { value: 'user-123' } });

		const afterTextarea = screen.getByLabelText('Attributes After (JSON)');
		await fireEvent.input(afterTextarea, { target: { value: '[1,2]' } });

		await fireEvent.click(screen.getByText('Trigger Event'));
		expect(screen.getByText('attributes_after must be a valid JSON object')).toBeTruthy();
	});

	it('calls triggerLifecycleEventClient with correct data on valid submit', async () => {
		mockTrigger.mockResolvedValue({
			event: { id: 'evt-1' },
			actions: [],
			snapshot: null,
			summary: { provisioned: 0, revoked: 0, skipped: 0, scheduled: 0 }
		});

		const onsuccess = vi.fn();
		renderOpen({ onsuccess });

		const userInput = screen.getByLabelText('User ID');
		await fireEvent.input(userInput, { target: { value: 'user-abc' } });

		const afterTextarea = screen.getByLabelText('Attributes After (JSON)');
		await fireEvent.input(afterTextarea, { target: { value: '{"department": "Engineering"}' } });

		await fireEvent.click(screen.getByText('Trigger Event'));

		await waitFor(() => {
			expect(mockTrigger).toHaveBeenCalledWith({
				user_id: 'user-abc',
				event_type: 'joiner',
				attributes_before: undefined,
				attributes_after: { department: 'Engineering' },
				source: 'api'
			});
		});
	});

	it('calls onsuccess and shows toast after successful trigger', async () => {
		mockTrigger.mockResolvedValue({
			event: { id: 'evt-1' },
			actions: [],
			snapshot: null,
			summary: { provisioned: 0, revoked: 0, skipped: 0, scheduled: 0 }
		});

		const onsuccess = vi.fn();
		renderOpen({ onsuccess });

		const userInput = screen.getByLabelText('User ID');
		await fireEvent.input(userInput, { target: { value: 'user-abc' } });

		await fireEvent.click(screen.getByText('Trigger Event'));

		await waitFor(() => {
			expect(mockAddToast).toHaveBeenCalledWith('success', 'Lifecycle event triggered for joiner');
			expect(onsuccess).toHaveBeenCalled();
		});
	});

	it('shows error toast on API failure', async () => {
		mockTrigger.mockRejectedValue(new Error('Network error'));

		renderOpen();

		const userInput = screen.getByLabelText('User ID');
		await fireEvent.input(userInput, { target: { value: 'user-abc' } });

		await fireEvent.click(screen.getByText('Trigger Event'));

		await waitFor(() => {
			expect(mockAddToast).toHaveBeenCalledWith('error', 'Network error');
		});
	});

	it('submits leaver event without any attribute fields', async () => {
		mockTrigger.mockResolvedValue({
			event: { id: 'evt-1' },
			actions: [],
			snapshot: null,
			summary: { provisioned: 0, revoked: 0, skipped: 0, scheduled: 0 }
		});

		renderOpen();

		const userInput = screen.getByLabelText('User ID');
		await fireEvent.input(userInput, { target: { value: 'user-leaving' } });

		const select = screen.getByLabelText('Event Type');
		await fireEvent.change(select, { target: { value: 'leaver' } });

		await fireEvent.click(screen.getByText('Trigger Event'));

		await waitFor(() => {
			expect(mockTrigger).toHaveBeenCalledWith({
				user_id: 'user-leaving',
				event_type: 'leaver',
				attributes_before: undefined,
				attributes_after: undefined,
				source: 'api'
			});
		});
	});
});
