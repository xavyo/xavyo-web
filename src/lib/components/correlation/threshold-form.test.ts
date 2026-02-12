import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ThresholdForm from './threshold-form.svelte';
import type { CorrelationThreshold } from '$lib/api/types';

vi.mock('$lib/api/correlation-client', () => ({
	upsertCorrelationThresholdsClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

function makeThreshold(overrides: Partial<CorrelationThreshold> = {}): CorrelationThreshold {
	return {
		id: 'thresh-1',
		connector_id: 'conn-1',
		auto_confirm_threshold: 0.9,
		manual_review_threshold: 0.7,
		tuning_mode: false,
		include_deactivated: false,
		batch_size: 100,
		created_at: '2025-06-01T10:00:00Z',
		updated_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('ThresholdForm', () => {
	afterEach(cleanup);

	it('renders the auto-confirm threshold input with label', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Auto-Confirm Threshold (%)')).toBeTruthy();
		expect(screen.getByLabelText('Auto-Confirm Threshold (%)')).toBeTruthy();
	});

	it('renders the manual review threshold input with label', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Manual Review Threshold (%)')).toBeTruthy();
		expect(screen.getByLabelText('Manual Review Threshold (%)')).toBeTruthy();
	});

	it('renders default values when no threshold provided', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		const autoInput = screen.getByLabelText('Auto-Confirm Threshold (%)') as HTMLInputElement;
		const manualInput = screen.getByLabelText('Manual Review Threshold (%)') as HTMLInputElement;
		// Defaults: 90% auto, 70% manual
		expect(autoInput.value).toBe('90');
		expect(manualInput.value).toBe('70');
	});

	it('renders existing threshold values when threshold is provided', () => {
		const threshold = makeThreshold({
			auto_confirm_threshold: 0.85,
			manual_review_threshold: 0.6
		});
		render(ThresholdForm, { props: { connectorId: 'conn-1', threshold } });
		const autoInput = screen.getByLabelText('Auto-Confirm Threshold (%)') as HTMLInputElement;
		const manualInput = screen.getByLabelText('Manual Review Threshold (%)') as HTMLInputElement;
		expect(autoInput.value).toBe('85');
		expect(manualInput.value).toBe('60');
	});

	it('renders the tuning mode toggle', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Tuning Mode')).toBeTruthy();
		const toggle = screen.getByRole('switch');
		expect(toggle.getAttribute('aria-checked')).toBe('false');
	});

	it('renders tuning mode as enabled when threshold has tuning_mode true', () => {
		const threshold = makeThreshold({ tuning_mode: true });
		render(ThresholdForm, { props: { connectorId: 'conn-1', threshold } });
		const toggle = screen.getByRole('switch');
		expect(toggle.getAttribute('aria-checked')).toBe('true');
	});

	it('renders include deactivated checkbox', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Include Deactivated Identities')).toBeTruthy();
	});

	it('renders the batch size input', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Batch Size')).toBeTruthy();
		const batchInput = screen.getByLabelText('Batch Size') as HTMLInputElement;
		expect(batchInput.value).toBe('100');
	});

	it('renders batch size from existing threshold', () => {
		const threshold = makeThreshold({ batch_size: 500 });
		render(ThresholdForm, { props: { connectorId: 'conn-1', threshold } });
		const batchInput = screen.getByLabelText('Batch Size') as HTMLInputElement;
		expect(batchInput.value).toBe('500');
	});

	it('renders the save button', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Save Thresholds')).toBeTruthy();
	});

	it('renders threshold ranges visual bar', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Threshold Ranges')).toBeTruthy();
		expect(screen.getByText('0%')).toBeTruthy();
		expect(screen.getByText('100%')).toBeTruthy();
	});

	it('renders API value helper text for auto-confirm', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		// Default auto=90, so API value is 0.90
		expect(
			screen.getByText((content) =>
				content.includes('API value: 0.90')
			)
		).toBeTruthy();
	});

	it('renders API value helper text for manual review', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		// Default manual=70, so API value is 0.70
		expect(
			screen.getByText((content) =>
				content.includes('API value: 0.70')
			)
		).toBeTruthy();
	});

	it('renders tuning mode description text', () => {
		render(ThresholdForm, { props: { connectorId: 'conn-1' } });
		expect(
			screen.getByText((content) =>
				content.includes('all matches are queued for review regardless of score')
			)
		).toBeTruthy();
	});
});
