import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ExportButton from './export-button.svelte';

describe('ExportButton', () => {
	let mockOpen: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockOpen = vi.fn();
		vi.stubGlobal('open', mockOpen);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders Export button', () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		expect(screen.getByText('Export')).toBeTruthy();
	});

	it('does not show dropdown initially', () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		expect(screen.queryByText('JSON')).toBeNull();
		expect(screen.queryByText('CSV')).toBeNull();
	});

	it('shows dropdown with JSON and CSV options on click', async () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		await fireEvent.click(screen.getByText('Export'));
		expect(screen.getByText('JSON')).toBeTruthy();
		expect(screen.getByText('CSV')).toBeTruthy();
	});

	it('calls window.open with correct URL for JSON export (policy)', async () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		await fireEvent.click(screen.getByText('Export'));
		await fireEvent.click(screen.getByText('JSON'));
		expect(mockOpen).toHaveBeenCalledWith(
			'/api/governance/simulations/policy/sim-1/export?format=json',
			'_blank'
		);
	});

	it('calls window.open with correct URL for CSV export (policy)', async () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		await fireEvent.click(screen.getByText('Export'));
		await fireEvent.click(screen.getByText('CSV'));
		expect(mockOpen).toHaveBeenCalledWith(
			'/api/governance/simulations/policy/sim-1/export?format=csv',
			'_blank'
		);
	});

	it('calls window.open with correct URL for batch simulation type', async () => {
		render(ExportButton, { props: { simulationId: 'batch-42', simulationType: 'batch' } });
		await fireEvent.click(screen.getByText('Export'));
		await fireEvent.click(screen.getByText('JSON'));
		expect(mockOpen).toHaveBeenCalledWith(
			'/api/governance/simulations/batch/batch-42/export?format=json',
			'_blank'
		);
	});

	it('calls window.open with correct URL for comparison simulation type', async () => {
		render(ExportButton, { props: { simulationId: 'cmp-7', simulationType: 'comparison' } });
		await fireEvent.click(screen.getByText('Export'));
		await fireEvent.click(screen.getByText('CSV'));
		expect(mockOpen).toHaveBeenCalledWith(
			'/api/governance/simulations/comparisons/cmp-7/export?format=csv',
			'_blank'
		);
	});

	it('hides dropdown after selecting JSON option', async () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		await fireEvent.click(screen.getByText('Export'));
		expect(screen.getByText('JSON')).toBeTruthy();
		await fireEvent.click(screen.getByText('JSON'));
		expect(screen.queryByText('CSV')).toBeNull();
	});

	it('hides dropdown after selecting CSV option', async () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		await fireEvent.click(screen.getByText('Export'));
		expect(screen.getByText('CSV')).toBeTruthy();
		await fireEvent.click(screen.getByText('CSV'));
		expect(screen.queryByText('JSON')).toBeNull();
	});

	it('toggles dropdown open and closed on repeated clicks', async () => {
		render(ExportButton, { props: { simulationId: 'sim-1', simulationType: 'policy' } });
		// Open
		await fireEvent.click(screen.getByText('Export'));
		expect(screen.getByText('JSON')).toBeTruthy();
		// Close
		await fireEvent.click(screen.getByText('Export'));
		expect(screen.queryByText('JSON')).toBeNull();
	});
});
