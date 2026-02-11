import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ReportSchedulesTab from './report-schedules-tab.svelte';
import type { ReportSchedule } from '$lib/api/types';

vi.mock('$lib/api/governance-reporting-client', () => ({
	pauseScheduleClient: vi.fn(),
	resumeScheduleClient: vi.fn(),
	deleteScheduleClient: vi.fn()
}));
vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

function makeSchedule(overrides: Partial<ReportSchedule> = {}): ReportSchedule {
	return {
		id: 'sch-1',
		tenant_id: 'tid',
		template_id: 'tpl-1',
		name: 'Weekly Access Report',
		frequency: 'weekly',
		schedule_hour: 8,
		schedule_day_of_week: 1,
		schedule_day_of_month: null,
		parameters: {},
		recipients: ['admin@example.com'],
		output_format: 'json',
		status: 'active',
		last_run_at: '2026-01-07T08:00:00Z',
		next_run_at: '2026-01-14T08:00:00Z',
		consecutive_failures: 0,
		last_error: null,
		created_by: 'user-1',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-07T08:00:00Z',
		...overrides
	};
}

describe('ReportSchedulesTab', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Loading state ---

	it('renders loading skeletons when loading=true', () => {
		const { container } = render(ReportSchedulesTab, {
			props: { schedules: [], loading: true }
		});
		const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('does not render table when loading', () => {
		render(ReportSchedulesTab, { props: { schedules: [], loading: true } });
		expect(screen.queryByRole('table')).toBeNull();
	});

	// --- Empty state ---

	it('renders empty state when schedules is empty', () => {
		render(ReportSchedulesTab, { props: { schedules: [], loading: false } });
		expect(screen.getByText('No report schedules configured.')).toBeTruthy();
	});

	it('shows "0 schedules" count when empty', () => {
		render(ReportSchedulesTab, { props: { schedules: [], loading: false } });
		expect(screen.getByText('0 schedules')).toBeTruthy();
	});

	// --- Schedule list rendering ---

	it('renders schedule names as links', () => {
		const schedules = [makeSchedule()];
		render(ReportSchedulesTab, { props: { schedules } });
		const link = screen.getByRole('link', { name: 'Weekly Access Report' });
		expect(link).toBeTruthy();
		expect(link.getAttribute('href')).toBe('/governance/reports/schedules/sch-1');
	});

	it('renders multiple schedules', () => {
		const schedules = [
			makeSchedule({ id: 'sch-1', name: 'Schedule A' }),
			makeSchedule({ id: 'sch-2', name: 'Schedule B' })
		];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Schedule A')).toBeTruthy();
		expect(screen.getByText('Schedule B')).toBeTruthy();
	});

	it('shows correct schedule count', () => {
		const schedules = [
			makeSchedule({ id: 'sch-1', name: 'A' }),
			makeSchedule({ id: 'sch-2', name: 'B' })
		];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('2 schedules')).toBeTruthy();
	});

	it('shows singular "schedule" for single schedule', () => {
		const schedules = [makeSchedule()];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('1 schedule')).toBeTruthy();
	});

	// --- Status badges ---

	it('renders active status badge', () => {
		const schedules = [makeSchedule({ status: 'active' })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('active')).toBeTruthy();
	});

	it('renders paused status badge', () => {
		const schedules = [makeSchedule({ status: 'paused' })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('paused')).toBeTruthy();
	});

	it('renders disabled status badge', () => {
		const schedules = [makeSchedule({ status: 'disabled' })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('disabled')).toBeTruthy();
	});

	// --- Frequency display ---

	it('shows daily frequency label', () => {
		const schedules = [makeSchedule({ frequency: 'daily', schedule_hour: 14 })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Daily at 14:00')).toBeTruthy();
	});

	it('shows weekly frequency label with day name', () => {
		const schedules = [makeSchedule({ frequency: 'weekly', schedule_day_of_week: 1, schedule_hour: 8 })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Weekly on Monday at 08:00')).toBeTruthy();
	});

	it('shows weekly Sunday label', () => {
		const schedules = [makeSchedule({ frequency: 'weekly', schedule_day_of_week: 0, schedule_hour: 9 })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Weekly on Sunday at 09:00')).toBeTruthy();
	});

	it('shows monthly frequency label with day of month', () => {
		const schedules = [
			makeSchedule({
				frequency: 'monthly',
				schedule_day_of_week: null,
				schedule_day_of_month: 15,
				schedule_hour: 6
			})
		];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Monthly on day 15 at 06:00')).toBeTruthy();
	});

	it('pads single-digit hours with leading zero', () => {
		const schedules = [makeSchedule({ frequency: 'daily', schedule_hour: 3 })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Daily at 03:00')).toBeTruthy();
	});

	// --- Failure count ---

	it('shows 0 failures in muted styling', () => {
		const schedules = [makeSchedule({ consecutive_failures: 0 })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('0')).toBeTruthy();
	});

	it('shows failure count in destructive color', () => {
		const schedules = [makeSchedule({ consecutive_failures: 3 })];
		render(ReportSchedulesTab, { props: { schedules } });
		const el = screen.getByText('3');
		expect(el.className).toContain('text-destructive');
	});

	it('shows error indicator when last_error is present', () => {
		const schedules = [makeSchedule({ consecutive_failures: 2, last_error: 'DB timeout' })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('!')).toBeTruthy();
	});

	it('does not show error indicator when last_error is null', () => {
		const schedules = [makeSchedule({ consecutive_failures: 1, last_error: null })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.queryByText('!')).toBeNull();
	});

	// --- Pause/Resume actions ---

	it('shows Pause button for active schedules', () => {
		const schedules = [makeSchedule({ status: 'active' })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Pause')).toBeTruthy();
		expect(screen.queryByText('Resume')).toBeNull();
	});

	it('shows Resume button for paused schedules', () => {
		const schedules = [makeSchedule({ status: 'paused' })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Resume')).toBeTruthy();
		expect(screen.queryByText('Pause')).toBeNull();
	});

	it('shows Resume button for disabled schedules', () => {
		const schedules = [makeSchedule({ status: 'disabled' })];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Resume')).toBeTruthy();
	});

	// --- Delete action ---

	it('shows Delete button for each schedule', () => {
		const schedules = [makeSchedule()];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Delete')).toBeTruthy();
	});

	it('shows Delete for multiple schedules', () => {
		const schedules = [
			makeSchedule({ id: 'sch-1', name: 'A' }),
			makeSchedule({ id: 'sch-2', name: 'B' })
		];
		render(ReportSchedulesTab, { props: { schedules } });
		const deleteButtons = screen.getAllByText('Delete');
		expect(deleteButtons).toHaveLength(2);
	});

	// --- Create Schedule link ---

	it('renders Create Schedule link', () => {
		render(ReportSchedulesTab, { props: { schedules: [], loading: false } });
		const link = screen.getByRole('link', { name: 'Create Schedule' });
		expect(link.getAttribute('href')).toBe('/governance/reports/schedules/create');
	});

	// --- Table headers ---

	it('renders table headers', () => {
		const schedules = [makeSchedule()];
		render(ReportSchedulesTab, { props: { schedules } });
		expect(screen.getByText('Name')).toBeTruthy();
		expect(screen.getByText('Frequency')).toBeTruthy();
		expect(screen.getByText('Status')).toBeTruthy();
		expect(screen.getByText('Next Run')).toBeTruthy();
		expect(screen.getByText('Last Run')).toBeTruthy();
		expect(screen.getByText('Failures')).toBeTruthy();
		expect(screen.getByText('Actions')).toBeTruthy();
	});

	// --- Date formatting ---

	it('renders dash for null last_run_at', () => {
		const schedules = [makeSchedule({ last_run_at: null })];
		render(ReportSchedulesTab, { props: { schedules } });
		const dashes = screen.getAllByText('\u2014');
		expect(dashes.length).toBeGreaterThan(0);
	});
});
