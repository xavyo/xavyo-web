import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import DryRunPanel from './dry-run-panel.svelte';
import type { ScriptDryRunResult } from '$lib/api/types';

describe('DryRunPanel', () => {
	afterEach(cleanup);

	it('renders the textarea with label', () => {
		render(DryRunPanel, { props: { onDryRun: vi.fn() } });
		expect(screen.getByLabelText('Input Context (JSON)')).toBeTruthy();
	});

	it('renders the "Run Dry Run" button', () => {
		render(DryRunPanel, { props: { onDryRun: vi.fn() } });
		expect(screen.getByText('Run Dry Run')).toBeTruthy();
	});

	it('renders "Running..." text when loading is true', () => {
		render(DryRunPanel, { props: { onDryRun: vi.fn(), loading: true } });
		expect(screen.getByText('Running...')).toBeTruthy();
	});

	it('disables button when loading is true', () => {
		render(DryRunPanel, { props: { onDryRun: vi.fn(), loading: true } });
		const button = screen.getByText('Running...').closest('button');
		expect(button?.disabled).toBe(true);
	});

	it('calls onDryRun with context input when button is clicked', async () => {
		const onDryRun = vi.fn();
		render(DryRunPanel, { props: { onDryRun } });

		const button = screen.getByText('Run Dry Run');
		await fireEvent.click(button);

		expect(onDryRun).toHaveBeenCalledWith('{}');
	});

	it('does not show result section when result is null', () => {
		render(DryRunPanel, { props: { onDryRun: vi.fn(), result: null } });
		expect(screen.queryByText(/Success/)).toBeFalsy();
		expect(screen.queryByText(/Failed/)).toBeFalsy();
	});

	it('shows success message with duration when result is successful', () => {
		const result: ScriptDryRunResult = {
			success: true,
			output: { key: 'value' },
			error: null,
			duration_ms: 42
		};
		render(DryRunPanel, { props: { onDryRun: vi.fn(), result } });
		expect(screen.getByText('Success (42ms)')).toBeTruthy();
	});

	it('shows failure message with duration when result has failed', () => {
		const result: ScriptDryRunResult = {
			success: false,
			output: null,
			error: 'Script timeout',
			duration_ms: 5000
		};
		render(DryRunPanel, { props: { onDryRun: vi.fn(), result } });
		expect(screen.getByText('Failed (5000ms)')).toBeTruthy();
	});

	it('shows error message when result has error', () => {
		const result: ScriptDryRunResult = {
			success: false,
			output: null,
			error: 'Script timeout exceeded',
			duration_ms: 5000
		};
		render(DryRunPanel, { props: { onDryRun: vi.fn(), result } });
		expect(screen.getByText('Script timeout exceeded')).toBeTruthy();
	});

	it('shows output section when result has string output', () => {
		const result: ScriptDryRunResult = {
			success: true,
			output: 'hello world',
			error: null,
			duration_ms: 10
		};
		render(DryRunPanel, { props: { onDryRun: vi.fn(), result } });
		expect(screen.getByText('Output:')).toBeTruthy();
		expect(screen.getByText('hello world')).toBeTruthy();
	});

	it('shows JSON-formatted output when result output is an object', () => {
		const result: ScriptDryRunResult = {
			success: true,
			output: { mapped: 'value' },
			error: null,
			duration_ms: 15
		};
		render(DryRunPanel, { props: { onDryRun: vi.fn(), result } });
		expect(screen.getByText('Output:')).toBeTruthy();
		expect(screen.getByText(/\"mapped\": \"value\"/)).toBeTruthy();
	});

	it('does not show output section when output is null', () => {
		const result: ScriptDryRunResult = {
			success: false,
			output: null,
			error: 'Error occurred',
			duration_ms: 100
		};
		render(DryRunPanel, { props: { onDryRun: vi.fn(), result } });
		expect(screen.queryByText('Output:')).toBeFalsy();
	});
});
