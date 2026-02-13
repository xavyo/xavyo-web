import { describe, it, expect } from 'vitest';
import {
	createProvisioningScriptSchema,
	updateProvisioningScriptSchema,
	createScriptVersionSchema,
	rollbackScriptSchema,
	createHookBindingSchema,
	updateHookBindingSchema,
	createScriptTemplateSchema,
	updateScriptTemplateSchema,
	instantiateTemplateSchema,
	validateScriptSchema,
	dryRunScriptSchema
} from './provisioning-scripts';

describe('createProvisioningScriptSchema', () => {
	it('accepts valid input', () => {
		const result = createProvisioningScriptSchema.safeParse({ name: 'My Script' });
		expect(result.success).toBe(true);
	});

	it('accepts name with description', () => {
		const result = createProvisioningScriptSchema.safeParse({
			name: 'My Script',
			description: 'Does something useful'
		});
		expect(result.success).toBe(true);
	});

	it('defaults description to empty string', () => {
		const result = createProvisioningScriptSchema.safeParse({ name: 'My Script' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('');
		}
	});

	it('rejects empty name', () => {
		const result = createProvisioningScriptSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createProvisioningScriptSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects name exceeding 200 characters', () => {
		const result = createProvisioningScriptSchema.safeParse({ name: 'a'.repeat(201) });
		expect(result.success).toBe(false);
	});

	it('accepts name at exactly 200 characters', () => {
		const result = createProvisioningScriptSchema.safeParse({ name: 'a'.repeat(200) });
		expect(result.success).toBe(true);
	});

	it('rejects description exceeding 2000 characters', () => {
		const result = createProvisioningScriptSchema.safeParse({
			name: 'Script',
			description: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});
});

describe('updateProvisioningScriptSchema', () => {
	it('accepts valid input', () => {
		const result = updateProvisioningScriptSchema.safeParse({ name: 'Updated Script' });
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = updateProvisioningScriptSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name exceeding 200 characters', () => {
		const result = updateProvisioningScriptSchema.safeParse({ name: 'a'.repeat(201) });
		expect(result.success).toBe(false);
	});
});

describe('createScriptVersionSchema', () => {
	it('accepts valid script body', () => {
		const result = createScriptVersionSchema.safeParse({ script_body: 'return user.email;' });
		expect(result.success).toBe(true);
	});

	it('accepts script body with change description', () => {
		const result = createScriptVersionSchema.safeParse({
			script_body: 'return user.email;',
			change_description: 'Added email transformation'
		});
		expect(result.success).toBe(true);
	});

	it('defaults change_description to empty string', () => {
		const result = createScriptVersionSchema.safeParse({ script_body: 'code' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.change_description).toBe('');
		}
	});

	it('rejects empty script body', () => {
		const result = createScriptVersionSchema.safeParse({ script_body: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing script body', () => {
		const result = createScriptVersionSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects change_description exceeding 500 characters', () => {
		const result = createScriptVersionSchema.safeParse({
			script_body: 'code',
			change_description: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});
});

describe('rollbackScriptSchema', () => {
	it('accepts valid target version', () => {
		const result = rollbackScriptSchema.safeParse({ target_version: 3 });
		expect(result.success).toBe(true);
	});

	it('accepts target version with reason', () => {
		const result = rollbackScriptSchema.safeParse({
			target_version: 2,
			reason: 'Bug in latest version'
		});
		expect(result.success).toBe(true);
	});

	it('coerces string target version', () => {
		const result = rollbackScriptSchema.safeParse({ target_version: '5' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target_version).toBe(5);
		}
	});

	it('rejects target_version < 1', () => {
		const result = rollbackScriptSchema.safeParse({ target_version: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects non-integer target_version', () => {
		const result = rollbackScriptSchema.safeParse({ target_version: 2.5 });
		expect(result.success).toBe(false);
	});

	it('rejects missing target_version', () => {
		const result = rollbackScriptSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects reason exceeding 500 characters', () => {
		const result = rollbackScriptSchema.safeParse({
			target_version: 1,
			reason: 'r'.repeat(501)
		});
		expect(result.success).toBe(false);
	});

	it('defaults reason to empty string', () => {
		const result = rollbackScriptSchema.safeParse({ target_version: 1 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reason).toBe('');
		}
	});
});

describe('createHookBindingSchema', () => {
	const validInput = {
		script_id: '550e8400-e29b-41d4-a716-446655440000',
		connector_id: '660e8400-e29b-41d4-a716-446655440000',
		hook_phase: 'before' as const,
		operation_type: 'create' as const,
		execution_order: 0,
		failure_policy: 'abort' as const
	};

	it('accepts valid input', () => {
		const result = createHookBindingSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts all hook_phase values', () => {
		for (const phase of ['before', 'after']) {
			const result = createHookBindingSchema.safeParse({ ...validInput, hook_phase: phase });
			expect(result.success).toBe(true);
		}
	});

	it('accepts all operation_type values', () => {
		for (const op of ['create', 'update', 'delete', 'enable', 'disable']) {
			const result = createHookBindingSchema.safeParse({ ...validInput, operation_type: op });
			expect(result.success).toBe(true);
		}
	});

	it('accepts all failure_policy values', () => {
		for (const policy of ['abort', 'continue', 'retry']) {
			const result = createHookBindingSchema.safeParse({ ...validInput, failure_policy: policy });
			expect(result.success).toBe(true);
		}
	});

	it('defaults failure_policy to abort', () => {
		const { failure_policy, ...rest } = validInput;
		const result = createHookBindingSchema.safeParse(rest);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.failure_policy).toBe('abort');
		}
	});

	it('defaults execution_order to 0', () => {
		const { execution_order, ...rest } = validInput;
		const result = createHookBindingSchema.safeParse(rest);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.execution_order).toBe(0);
		}
	});

	it('rejects invalid script_id UUID', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, script_id: 'not-a-uuid' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid connector_id UUID', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, connector_id: 'bad' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid hook_phase', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, hook_phase: 'during' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid operation_type', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, operation_type: 'read' });
		expect(result.success).toBe(false);
	});

	it('rejects negative execution_order', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, execution_order: -1 });
		expect(result.success).toBe(false);
	});

	it('accepts max_retries within range', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, max_retries: 5 });
		expect(result.success).toBe(true);
	});

	it('rejects max_retries > 10', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, max_retries: 11 });
		expect(result.success).toBe(false);
	});

	it('accepts timeout_seconds within range', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, timeout_seconds: 30 });
		expect(result.success).toBe(true);
	});

	it('rejects timeout_seconds < 1', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, timeout_seconds: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects timeout_seconds > 3600', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, timeout_seconds: 3601 });
		expect(result.success).toBe(false);
	});

	it('coerces string numbers for execution_order', () => {
		const result = createHookBindingSchema.safeParse({ ...validInput, execution_order: '3' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.execution_order).toBe(3);
		}
	});
});

describe('updateHookBindingSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateHookBindingSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with execution_order', () => {
		const result = updateHookBindingSchema.safeParse({ execution_order: 5 });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with enabled', () => {
		const result = updateHookBindingSchema.safeParse({ enabled: false });
		expect(result.success).toBe(true);
	});

	it('accepts partial update with failure_policy', () => {
		const result = updateHookBindingSchema.safeParse({ failure_policy: 'retry' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid failure_policy', () => {
		const result = updateHookBindingSchema.safeParse({ failure_policy: 'skip' });
		expect(result.success).toBe(false);
	});

	it('rejects max_retries > 10', () => {
		const result = updateHookBindingSchema.safeParse({ max_retries: 15 });
		expect(result.success).toBe(false);
	});
});

describe('createScriptTemplateSchema', () => {
	const validInput = {
		name: 'Email Mapper',
		category: 'attribute_mapping' as const,
		template_body: 'return context.user.email;'
	};

	it('accepts valid input', () => {
		const result = createScriptTemplateSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts all category values', () => {
		for (const cat of [
			'attribute_mapping',
			'value_generation',
			'conditional_logic',
			'data_formatting',
			'custom'
		]) {
			const result = createScriptTemplateSchema.safeParse({ ...validInput, category: cat });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid category', () => {
		const result = createScriptTemplateSchema.safeParse({ ...validInput, category: 'unknown' });
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createScriptTemplateSchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects empty template_body', () => {
		const result = createScriptTemplateSchema.safeParse({ ...validInput, template_body: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing template_body', () => {
		const { template_body, ...rest } = validInput;
		const result = createScriptTemplateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('defaults description to empty string', () => {
		const result = createScriptTemplateSchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('');
		}
	});

	it('defaults placeholder_annotations to empty string', () => {
		const result = createScriptTemplateSchema.safeParse(validInput);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.placeholder_annotations).toBe('');
		}
	});

	it('rejects name exceeding 200 characters', () => {
		const result = createScriptTemplateSchema.safeParse({ ...validInput, name: 'a'.repeat(201) });
		expect(result.success).toBe(false);
	});

	it('rejects description exceeding 2000 characters', () => {
		const result = createScriptTemplateSchema.safeParse({
			...validInput,
			description: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});
});

describe('updateScriptTemplateSchema', () => {
	const validInput = {
		name: 'Updated Template',
		category: 'custom' as const,
		template_body: 'return true;'
	};

	it('accepts valid input', () => {
		const result = updateScriptTemplateSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = updateScriptTemplateSchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects empty template_body', () => {
		const result = updateScriptTemplateSchema.safeParse({ ...validInput, template_body: '' });
		expect(result.success).toBe(false);
	});
});

describe('instantiateTemplateSchema', () => {
	it('accepts valid name', () => {
		const result = instantiateTemplateSchema.safeParse({ name: 'New Script from Template' });
		expect(result.success).toBe(true);
	});

	it('accepts name with description', () => {
		const result = instantiateTemplateSchema.safeParse({
			name: 'New Script',
			description: 'Created from template'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = instantiateTemplateSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = instantiateTemplateSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects name exceeding 200 characters', () => {
		const result = instantiateTemplateSchema.safeParse({ name: 'a'.repeat(201) });
		expect(result.success).toBe(false);
	});

	it('defaults description to empty string', () => {
		const result = instantiateTemplateSchema.safeParse({ name: 'Test' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('');
		}
	});
});

describe('validateScriptSchema', () => {
	it('accepts valid script body', () => {
		const result = validateScriptSchema.safeParse({ script_body: 'return user.name;' });
		expect(result.success).toBe(true);
	});

	it('rejects empty script body', () => {
		const result = validateScriptSchema.safeParse({ script_body: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing script body', () => {
		const result = validateScriptSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('dryRunScriptSchema', () => {
	it('accepts valid context', () => {
		const result = dryRunScriptSchema.safeParse({ context: '{"user":{"name":"John"}}' });
		expect(result.success).toBe(true);
	});

	it('rejects empty context', () => {
		const result = dryRunScriptSchema.safeParse({ context: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing context', () => {
		const result = dryRunScriptSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
