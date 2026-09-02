import { describe, it, expect } from 'vitest';
import { mapReconciliationSchedule, mapReconciliationScheduleList } from './reconciliation';
import type { ReconciliationSchedule } from './types';

function makeSchedule(
	overrides: Partial<ReconciliationSchedule> = {}
): ReconciliationSchedule {
	return {
		id: 'sch-1',
		connector_id: 'c1',
		connector_name: null,
		mode: 'full',
		frequency: 'daily',
		day_of_week: null,
		day_of_month: null,
		hour_of_day: 2,
		cron_expression: null,
		enabled: true,
		last_run_at: null,
		next_run_at: null,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		...overrides
	};
}

describe('mapReconciliationSchedule', () => {
	it('splits a stored cron frequency into frequency=cron plus cron_expression', () => {
		const mapped = mapReconciliationSchedule(
			makeSchedule({ frequency: '0 2 * * *' as ReconciliationSchedule['frequency'] })
		);
		expect(mapped.frequency).toBe('cron');
		expect(mapped.cron_expression).toBe('0 2 * * *');
	});

	it('keeps API-provided cron_expression when frequency is already cron', () => {
		const mapped = mapReconciliationSchedule(
			makeSchedule({ frequency: 'cron', cron_expression: '0 2 * * 0' })
		);
		expect(mapped.frequency).toBe('cron');
		expect(mapped.cron_expression).toBe('0 2 * * 0');
	});

	it('maps named frequencies without inventing a cron_expression', () => {
		const mapped = mapReconciliationSchedule(makeSchedule({ frequency: 'weekly' }));
		expect(mapped.frequency).toBe('weekly');
		expect(mapped.cron_expression).toBeNull();
	});

	it('maps list payloads', () => {
		const mapped = mapReconciliationScheduleList({
			schedules: [makeSchedule({ frequency: '30 4 * * 1' as ReconciliationSchedule['frequency'] })]
		});
		expect(mapped.schedules[0].frequency).toBe('cron');
		expect(mapped.schedules[0].cron_expression).toBe('30 4 * * 1');
	});
});
