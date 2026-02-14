import { describe, it, expect } from 'vitest';
import {
	createRiskFactorSchema,
	updateRiskFactorSchema,
	createRiskThresholdSchema,
	updateRiskThresholdSchema
} from './risk';

describe('createRiskFactorSchema', () => {
	it('accepts valid input with required fields only', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Login Location',
			category: 'dynamic',
			factor_type: 'geo_location',
			weight: 5
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Device Trust',
			category: 'static',
			factor_type: 'device_posture',
			weight: 7,
			description: 'Evaluates device trust level based on posture assessment',
			is_enabled: false
		});
		expect(result.success).toBe(true);
	});

	it('defaults is_enabled to true when omitted', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test Factor',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 3
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.is_enabled).toBe(true);
		}
	});

	it('rejects missing name', () => {
		const result = createRiskFactorSchema.safeParse({
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createRiskFactorSchema.safeParse({
			name: '',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 100 chars', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'x'.repeat(101),
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing category', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			factor_type: 'ip_reputation',
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid category', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'hybrid',
			factor_type: 'ip_reputation',
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid category values', () => {
		for (const cat of ['static', 'dynamic']) {
			const result = createRiskFactorSchema.safeParse({
				name: 'Test',
				category: cat,
				factor_type: 'ip_reputation',
				weight: 3
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects missing factor_type', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty factor_type', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: '',
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('rejects factor_type over 50 chars', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: 'x'.repeat(51),
			weight: 3
		});
		expect(result.success).toBe(false);
	});

	it('coerces weight from string to number', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: '5'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.weight).toBe(5);
		}
	});

	it('rejects weight below 0', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects weight above 10', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 11
		});
		expect(result.success).toBe(false);
	});

	it('accepts weight at boundary 0', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 0
		});
		expect(result.success).toBe(true);
	});

	it('accepts weight at boundary 10', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 10
		});
		expect(result.success).toBe(true);
	});

	it('rejects description over 1000 chars', () => {
		const result = createRiskFactorSchema.safeParse({
			name: 'Test',
			category: 'static',
			factor_type: 'ip_reputation',
			weight: 3,
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});

describe('updateRiskFactorSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateRiskFactorSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update', () => {
		const result = updateRiskFactorSchema.safeParse({
			name: 'Updated Factor',
			weight: 8
		});
		expect(result.success).toBe(true);
	});

	it('rejects name over 100 chars', () => {
		const result = updateRiskFactorSchema.safeParse({
			name: 'x'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid category', () => {
		const result = updateRiskFactorSchema.safeParse({
			category: 'hybrid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects weight above 10', () => {
		const result = updateRiskFactorSchema.safeParse({
			weight: 11
		});
		expect(result.success).toBe(false);
	});
});

describe('createRiskThresholdSchema', () => {
	it('accepts valid input with required fields only', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'High Risk Threshold',
			score_value: 75,
			severity: 'critical'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Medium Risk Threshold',
			score_value: 50,
			severity: 'warning',
			action: 'require_mfa',
			cooldown_hours: 24,
			is_enabled: false
		});
		expect(result.success).toBe(true);
	});

	it('defaults is_enabled to true when omitted', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test Threshold',
			score_value: 30,
			severity: 'info'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.is_enabled).toBe(true);
		}
	});

	it('rejects missing name', () => {
		const result = createRiskThresholdSchema.safeParse({
			score_value: 50,
			severity: 'warning'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: '',
			score_value: 50,
			severity: 'warning'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 100 chars', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'x'.repeat(101),
			score_value: 50,
			severity: 'warning'
		});
		expect(result.success).toBe(false);
	});

	it('coerces score_value from string to number', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: '60',
			severity: 'warning'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.score_value).toBe(60);
		}
	});

	it('rejects score_value below 1', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 0,
			severity: 'warning'
		});
		expect(result.success).toBe(false);
	});

	it('rejects score_value above 100', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 101,
			severity: 'warning'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing severity', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 50
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid severity', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 50,
			severity: 'extreme'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid severity values', () => {
		for (const sev of ['info', 'warning', 'critical']) {
			const result = createRiskThresholdSchema.safeParse({
				name: 'Test',
				score_value: 50,
				severity: sev
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid action values', () => {
		for (const act of ['alert', 'require_mfa', 'block']) {
			const result = createRiskThresholdSchema.safeParse({
				name: 'Test',
				score_value: 50,
				severity: 'warning',
				action: act
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid action', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 50,
			severity: 'warning',
			action: 'quarantine'
		});
		expect(result.success).toBe(false);
	});

	it('rejects cooldown_hours below 1', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 50,
			severity: 'warning',
			cooldown_hours: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects cooldown_hours above 720', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 50,
			severity: 'warning',
			cooldown_hours: 721
		});
		expect(result.success).toBe(false);
	});

	it('coerces cooldown_hours from string to number', () => {
		const result = createRiskThresholdSchema.safeParse({
			name: 'Test',
			score_value: 50,
			severity: 'warning',
			cooldown_hours: '48'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cooldown_hours).toBe(48);
		}
	});
});

describe('updateRiskThresholdSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateRiskThresholdSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update', () => {
		const result = updateRiskThresholdSchema.safeParse({
			name: 'Updated Threshold',
			score_value: 80,
			severity: 'critical'
		});
		expect(result.success).toBe(true);
	});

	it('rejects name over 100 chars', () => {
		const result = updateRiskThresholdSchema.safeParse({
			name: 'x'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid severity', () => {
		const result = updateRiskThresholdSchema.safeParse({
			severity: 'extreme'
		});
		expect(result.success).toBe(false);
	});

	it('rejects score_value above 100', () => {
		const result = updateRiskThresholdSchema.safeParse({
			score_value: 101
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid action', () => {
		const result = updateRiskThresholdSchema.safeParse({
			action: 'quarantine'
		});
		expect(result.success).toBe(false);
	});

	it('accepts full update with all fields', () => {
		const result = updateRiskThresholdSchema.safeParse({
			name: 'Updated Threshold',
			score_value: 90,
			severity: 'critical',
			action: 'block',
			cooldown_hours: 72,
			is_enabled: false
		});
		expect(result.success).toBe(true);
	});
});
