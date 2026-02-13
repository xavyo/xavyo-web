import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import AnalyticsDashboard from './analytics-dashboard.svelte';
import type { ScriptAnalyticsDashboard } from '$lib/api/types';

function makeDashboard(overrides: Partial<ScriptAnalyticsDashboard> = {}): ScriptAnalyticsDashboard {
	return {
		total_scripts: 12,
		active_scripts: 8,
		total_executions: 500,
		success_rate: 95.5,
		avg_duration_ms: 123.456,
		scripts: [],
		...overrides
	};
}

describe('AnalyticsDashboard', () => {
	afterEach(cleanup);

	it('renders placeholder when dashboard is null', () => {
		render(AnalyticsDashboard, { props: { dashboard: null } });
		expect(screen.getByText('No analytics data available.')).toBeTruthy();
	});

	it('renders total scripts card', () => {
		render(AnalyticsDashboard, { props: { dashboard: makeDashboard() } });
		expect(screen.getByText('Total Scripts')).toBeTruthy();
		expect(screen.getByText('12')).toBeTruthy();
	});

	it('renders active scripts card', () => {
		render(AnalyticsDashboard, { props: { dashboard: makeDashboard() } });
		expect(screen.getByText('Active Scripts')).toBeTruthy();
		expect(screen.getByText('8')).toBeTruthy();
	});

	it('renders total executions card', () => {
		render(AnalyticsDashboard, { props: { dashboard: makeDashboard() } });
		expect(screen.getByText('Total Executions')).toBeTruthy();
		expect(screen.getByText('500')).toBeTruthy();
	});

	it('renders success rate with one decimal place', () => {
		render(AnalyticsDashboard, { props: { dashboard: makeDashboard({ success_rate: 95.5 }) } });
		expect(screen.getByText('Success Rate')).toBeTruthy();
		expect(screen.getByText('95.5%')).toBeTruthy();
	});

	it('renders avg duration rounded to integer', () => {
		render(AnalyticsDashboard, { props: { dashboard: makeDashboard({ avg_duration_ms: 123.456 }) } });
		expect(screen.getByText('Avg Duration')).toBeTruthy();
		expect(screen.getByText('123ms')).toBeTruthy();
	});

	it('handles string numeric values from backend', () => {
		const dashboard = makeDashboard({
			success_rate: '87.3' as unknown as number,
			avg_duration_ms: '250.7' as unknown as number
		});
		render(AnalyticsDashboard, { props: { dashboard } });
		expect(screen.getByText('87.3%')).toBeTruthy();
		expect(screen.getByText('251ms')).toBeTruthy();
	});

	it('does not render per-script table when scripts array is empty', () => {
		render(AnalyticsDashboard, { props: { dashboard: makeDashboard({ scripts: [] }) } });
		expect(screen.queryByText('Per-Script Summary')).toBeFalsy();
	});

	it('renders per-script table when scripts exist', () => {
		const dashboard = makeDashboard({
			scripts: [
				{
					script_id: 's-1',
					name: 'Email Mapper',
					total_executions: 100,
					success_count: 95,
					failure_count: 5,
					avg_duration_ms: 45.2
				}
			]
		});
		render(AnalyticsDashboard, { props: { dashboard } });
		expect(screen.getByText('Per-Script Summary')).toBeTruthy();
		expect(screen.getByText('Email Mapper')).toBeTruthy();
		expect(screen.getByText('100')).toBeTruthy();
		expect(screen.getByText('95')).toBeTruthy();
		expect(screen.getByText('5')).toBeTruthy();
		expect(screen.getByText('45ms')).toBeTruthy();
	});

	it('renders script name as link to detail page', () => {
		const dashboard = makeDashboard({
			scripts: [
				{
					script_id: 'script-abc',
					name: 'DN Builder',
					total_executions: 50,
					success_count: 48,
					failure_count: 2,
					avg_duration_ms: 30
				}
			]
		});
		render(AnalyticsDashboard, { props: { dashboard } });
		const link = screen.getByText('DN Builder').closest('a');
		expect(link?.getAttribute('href')).toBe('/governance/provisioning-scripts/script-abc');
	});

	it('renders table headers', () => {
		const dashboard = makeDashboard({
			scripts: [
				{
					script_id: 's-1',
					name: 'Test Script',
					total_executions: 10,
					success_count: 9,
					failure_count: 1,
					avg_duration_ms: 20
				}
			]
		});
		render(AnalyticsDashboard, { props: { dashboard } });
		expect(screen.getByText('Script')).toBeTruthy();
		expect(screen.getByText('Executions')).toBeTruthy();
		expect(screen.getByText('Success')).toBeTruthy();
		expect(screen.getByText('Failure')).toBeTruthy();
		// "Avg Duration" appears both in the summary card and the table header
		expect(screen.getAllByText('Avg Duration').length).toBeGreaterThanOrEqual(2);
	});

	it('renders multiple scripts in the table', () => {
		const dashboard = makeDashboard({
			scripts: [
				{
					script_id: 's-1',
					name: 'Script A',
					total_executions: 100,
					success_count: 90,
					failure_count: 10,
					avg_duration_ms: 50
				},
				{
					script_id: 's-2',
					name: 'Script B',
					total_executions: 200,
					success_count: 180,
					failure_count: 20,
					avg_duration_ms: 75
				}
			]
		});
		render(AnalyticsDashboard, { props: { dashboard } });
		expect(screen.getByText('Script A')).toBeTruthy();
		expect(screen.getByText('Script B')).toBeTruthy();
		expect(screen.getByText('200')).toBeTruthy();
		expect(screen.getByText('180')).toBeTruthy();
	});
});
