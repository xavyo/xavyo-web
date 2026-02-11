import { describe, it, expect } from 'vitest';
import {
	loginHistoryFilterSchema,
	adminAuditFilterSchema,
	alertFilterSchema
} from './audit';

describe('loginHistoryFilterSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = loginHistoryFilterSchema.safeParse({
			start_date: '2024-01-01',
			end_date: '2024-01-31',
			success: 'true'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object and applies defaults', () => {
		const result = loginHistoryFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.start_date).toBe('');
			expect(result.data.end_date).toBe('');
			expect(result.data.success).toBe('all');
		}
	});

	it('defaults start_date to empty string', () => {
		const result = loginHistoryFilterSchema.safeParse({ end_date: '2024-01-31' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.start_date).toBe('');
		}
	});

	it('defaults end_date to empty string', () => {
		const result = loginHistoryFilterSchema.safeParse({ start_date: '2024-01-01' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.end_date).toBe('');
		}
	});

	it('defaults success to "all"', () => {
		const result = loginHistoryFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe('all');
		}
	});

	it('accepts success "true"', () => {
		const result = loginHistoryFilterSchema.safeParse({ success: 'true' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe('true');
		}
	});

	it('accepts success "false"', () => {
		const result = loginHistoryFilterSchema.safeParse({ success: 'false' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe('false');
		}
	});

	it('accepts success "all"', () => {
		const result = loginHistoryFilterSchema.safeParse({ success: 'all' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe('all');
		}
	});

	it('rejects invalid success value', () => {
		const result = loginHistoryFilterSchema.safeParse({ success: 'maybe' });
		expect(result.success).toBe(false);
	});

	it('rejects non-string start_date', () => {
		const result = loginHistoryFilterSchema.safeParse({ start_date: 123 });
		expect(result.success).toBe(false);
	});

	it('rejects non-string end_date', () => {
		const result = loginHistoryFilterSchema.safeParse({ end_date: true });
		expect(result.success).toBe(false);
	});
});

describe('adminAuditFilterSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = adminAuditFilterSchema.safeParse({
			user_id: 'user-123',
			email: 'admin@example.com',
			auth_method: 'password',
			start_date: '2024-01-01',
			end_date: '2024-12-31',
			success: 'true'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object and applies all defaults', () => {
		const result = adminAuditFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.user_id).toBe('');
			expect(result.data.email).toBe('');
			expect(result.data.auth_method).toBe('all');
			expect(result.data.start_date).toBe('');
			expect(result.data.end_date).toBe('');
			expect(result.data.success).toBe('all');
		}
	});

	it('defaults user_id to empty string', () => {
		const result = adminAuditFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.user_id).toBe('');
		}
	});

	it('defaults email to empty string', () => {
		const result = adminAuditFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.email).toBe('');
		}
	});

	it('defaults auth_method to "all"', () => {
		const result = adminAuditFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auth_method).toBe('all');
		}
	});

	it('accepts auth_method "password"', () => {
		const result = adminAuditFilterSchema.safeParse({ auth_method: 'password' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auth_method).toBe('password');
		}
	});

	it('accepts auth_method "social"', () => {
		const result = adminAuditFilterSchema.safeParse({ auth_method: 'social' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auth_method).toBe('social');
		}
	});

	it('accepts auth_method "sso"', () => {
		const result = adminAuditFilterSchema.safeParse({ auth_method: 'sso' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auth_method).toBe('sso');
		}
	});

	it('accepts auth_method "mfa"', () => {
		const result = adminAuditFilterSchema.safeParse({ auth_method: 'mfa' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auth_method).toBe('mfa');
		}
	});

	it('accepts auth_method "refresh"', () => {
		const result = adminAuditFilterSchema.safeParse({ auth_method: 'refresh' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auth_method).toBe('refresh');
		}
	});

	it('rejects invalid auth_method', () => {
		const result = adminAuditFilterSchema.safeParse({ auth_method: 'magic_link' });
		expect(result.success).toBe(false);
	});

	it('accepts success "true"', () => {
		const result = adminAuditFilterSchema.safeParse({ success: 'true' });
		expect(result.success).toBe(true);
	});

	it('accepts success "false"', () => {
		const result = adminAuditFilterSchema.safeParse({ success: 'false' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid success value', () => {
		const result = adminAuditFilterSchema.safeParse({ success: 'unknown' });
		expect(result.success).toBe(false);
	});

	it('rejects non-string user_id', () => {
		const result = adminAuditFilterSchema.safeParse({ user_id: 42 });
		expect(result.success).toBe(false);
	});

	it('rejects non-string email', () => {
		const result = adminAuditFilterSchema.safeParse({ email: true });
		expect(result.success).toBe(false);
	});
});

describe('alertFilterSchema', () => {
	it('accepts valid input with all fields', () => {
		const result = alertFilterSchema.safeParse({
			type: 'new_device',
			severity: 'warning',
			acknowledged: 'true'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object and applies all defaults', () => {
		const result = alertFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.type).toBe('all');
			expect(result.data.severity).toBe('all');
			expect(result.data.acknowledged).toBe('all');
		}
	});

	it('defaults type to "all"', () => {
		const result = alertFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.type).toBe('all');
		}
	});

	it('defaults severity to "all"', () => {
		const result = alertFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.severity).toBe('all');
		}
	});

	it('defaults acknowledged to "all"', () => {
		const result = alertFilterSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.acknowledged).toBe('all');
		}
	});

	it('accepts type "new_device"', () => {
		const result = alertFilterSchema.safeParse({ type: 'new_device' });
		expect(result.success).toBe(true);
	});

	it('accepts type "new_location"', () => {
		const result = alertFilterSchema.safeParse({ type: 'new_location' });
		expect(result.success).toBe(true);
	});

	it('accepts type "failed_attempts"', () => {
		const result = alertFilterSchema.safeParse({ type: 'failed_attempts' });
		expect(result.success).toBe(true);
	});

	it('accepts type "password_change"', () => {
		const result = alertFilterSchema.safeParse({ type: 'password_change' });
		expect(result.success).toBe(true);
	});

	it('accepts type "mfa_disabled"', () => {
		const result = alertFilterSchema.safeParse({ type: 'mfa_disabled' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid type', () => {
		const result = alertFilterSchema.safeParse({ type: 'unknown_type' });
		expect(result.success).toBe(false);
	});

	it('accepts severity "info"', () => {
		const result = alertFilterSchema.safeParse({ severity: 'info' });
		expect(result.success).toBe(true);
	});

	it('accepts severity "warning"', () => {
		const result = alertFilterSchema.safeParse({ severity: 'warning' });
		expect(result.success).toBe(true);
	});

	it('accepts severity "critical"', () => {
		const result = alertFilterSchema.safeParse({ severity: 'critical' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid severity', () => {
		const result = alertFilterSchema.safeParse({ severity: 'high' });
		expect(result.success).toBe(false);
	});

	it('accepts acknowledged "true"', () => {
		const result = alertFilterSchema.safeParse({ acknowledged: 'true' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.acknowledged).toBe('true');
		}
	});

	it('accepts acknowledged "false"', () => {
		const result = alertFilterSchema.safeParse({ acknowledged: 'false' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.acknowledged).toBe('false');
		}
	});

	it('rejects invalid acknowledged value', () => {
		const result = alertFilterSchema.safeParse({ acknowledged: 'yes' });
		expect(result.success).toBe(false);
	});

	it('rejects non-string type', () => {
		const result = alertFilterSchema.safeParse({ type: 123 });
		expect(result.success).toBe(false);
	});

	it('rejects non-string severity', () => {
		const result = alertFilterSchema.safeParse({ severity: true });
		expect(result.success).toBe(false);
	});
});
