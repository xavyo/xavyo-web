import { describe, it, expect } from 'vitest';
import {
	nhiTypeClass,
	nhiTypeLabel,
	riskLevelClass,
	campaignStatusClass,
	enforcementClass,
	formatNhiDate,
	nhiEntityPath
} from './nhi-utils';

describe('nhiTypeClass', () => {
	it('returns blue for tool', () => {
		expect(nhiTypeClass('tool')).toContain('bg-blue-600');
	});

	it('returns purple for agent', () => {
		expect(nhiTypeClass('agent')).toContain('bg-purple-600');
	});

	it('returns teal for service_account', () => {
		expect(nhiTypeClass('service_account')).toContain('bg-teal-600');
	});

	it('returns empty for unknown type', () => {
		expect(nhiTypeClass('unknown')).toBe('');
	});
});

describe('nhiTypeLabel', () => {
	it('returns Tools for tool', () => {
		expect(nhiTypeLabel('tool')).toBe('Tools');
	});

	it('returns Agents for agent', () => {
		expect(nhiTypeLabel('agent')).toBe('Agents');
	});

	it('returns Service Accounts for service_account', () => {
		expect(nhiTypeLabel('service_account')).toBe('Service Accounts');
	});

	it('returns raw value for unknown type', () => {
		expect(nhiTypeLabel('widget')).toBe('widget');
	});
});

describe('riskLevelClass', () => {
	it('returns red for critical', () => {
		expect(riskLevelClass('critical')).toContain('bg-red-600');
	});

	it('returns orange for high', () => {
		expect(riskLevelClass('high')).toContain('bg-orange-500');
	});

	it('returns yellow for medium', () => {
		expect(riskLevelClass('medium')).toContain('bg-yellow-500');
	});

	it('returns green for low', () => {
		expect(riskLevelClass('low')).toContain('bg-green-600');
	});

	it('returns empty for unknown level', () => {
		expect(riskLevelClass('unknown')).toBe('');
	});
});

describe('campaignStatusClass', () => {
	it('returns green for active', () => {
		expect(campaignStatusClass('active')).toContain('bg-green-600');
	});

	it('returns blue for completed', () => {
		expect(campaignStatusClass('completed')).toContain('bg-blue-600');
	});

	it('returns red for cancelled', () => {
		expect(campaignStatusClass('cancelled')).toContain('bg-red-500');
	});

	it('returns empty for unknown status', () => {
		expect(campaignStatusClass('draft')).toBe('');
	});
});

describe('enforcementClass', () => {
	it('returns red for prevent', () => {
		expect(enforcementClass('prevent')).toContain('bg-red-600');
	});

	it('returns yellow for warn', () => {
		expect(enforcementClass('warn')).toContain('bg-yellow-500');
	});
});

describe('formatNhiDate', () => {
	it('formats a valid date string', () => {
		const result = formatNhiDate('2026-01-15T00:00:00Z');
		expect(result).toBeTruthy();
		expect(result).not.toBe('—');
	});

	it('returns em-dash for null', () => {
		expect(formatNhiDate(null)).toBe('—');
	});

	it('returns em-dash for empty string', () => {
		// Empty string is falsy, treated as null
		expect(formatNhiDate('')).toBe('—');
	});
});

describe('nhiEntityPath', () => {
	it('generates correct path for tool', () => {
		expect(nhiEntityPath('tool', 'abc-123')).toBe('/nhi/tools/abc-123');
	});

	it('generates correct path for agent', () => {
		expect(nhiEntityPath('agent', 'abc-123')).toBe('/nhi/agents/abc-123');
	});

	it('generates correct path for service_account', () => {
		expect(nhiEntityPath('service_account', 'abc-123')).toBe('/nhi/service-accounts/abc-123');
	});
});
