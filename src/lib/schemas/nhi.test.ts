import { describe, it, expect } from 'vitest';
import {
	createToolSchema,
	createAgentSchema,
	createServiceAccountSchema,
	updateToolSchema,
	updateAgentSchema,
	updateServiceAccountSchema,
	issueCredentialSchema,
	suspendNhiSchema
} from './nhi';

describe('createToolSchema', () => {
	it('accepts valid input with required fields', () => {
		const result = createToolSchema.safeParse({
			name: 'Weather API',
			input_schema: '{"type": "object"}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createToolSchema.safeParse({
			name: 'Weather API',
			input_schema: '{"type": "object"}',
			description: 'Fetches weather data',
			category: 'external',
			output_schema: '{"type": "object"}',
			requires_approval: true,
			max_calls_per_hour: 100,
			provider: 'openweather'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createToolSchema.safeParse({
			input_schema: '{"type": "object"}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing input_schema', () => {
		const result = createToolSchema.safeParse({
			name: 'Weather API'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars', () => {
		const result = createToolSchema.safeParse({
			name: 'Test',
			input_schema: '{}',
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});

describe('createAgentSchema', () => {
	it('accepts valid input with required fields', () => {
		const result = createAgentSchema.safeParse({
			name: 'Code Assistant',
			agent_type: 'copilot'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createAgentSchema.safeParse({
			agent_type: 'copilot'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing agent_type', () => {
		const result = createAgentSchema.safeParse({
			name: 'Code Assistant'
		});
		expect(result.success).toBe(false);
	});
});

describe('createServiceAccountSchema', () => {
	it('accepts valid input with required fields', () => {
		const result = createServiceAccountSchema.safeParse({
			name: 'CI Pipeline',
			purpose: 'Continuous integration builds'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createServiceAccountSchema.safeParse({
			purpose: 'CI builds'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing purpose', () => {
		const result = createServiceAccountSchema.safeParse({
			name: 'CI Pipeline'
		});
		expect(result.success).toBe(false);
	});
});

describe('updateToolSchema', () => {
	it('accepts valid partial update', () => {
		const result = updateToolSchema.safeParse({
			name: 'Updated Name'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateToolSchema.safeParse({});
		expect(result.success).toBe(true);
	});
});

describe('updateAgentSchema', () => {
	it('accepts valid partial update', () => {
		const result = updateAgentSchema.safeParse({
			model_name: 'claude-4'
		});
		expect(result.success).toBe(true);
	});
});

describe('updateServiceAccountSchema', () => {
	it('accepts valid partial update', () => {
		const result = updateServiceAccountSchema.safeParse({
			environment: 'production'
		});
		expect(result.success).toBe(true);
	});
});

describe('issueCredentialSchema', () => {
	it('accepts valid api_key credential', () => {
		const result = issueCredentialSchema.safeParse({
			credential_type: 'api_key'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid secret credential', () => {
		const result = issueCredentialSchema.safeParse({
			credential_type: 'secret'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid certificate credential', () => {
		const result = issueCredentialSchema.safeParse({
			credential_type: 'certificate',
			valid_days: 365
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing credential_type', () => {
		const result = issueCredentialSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects invalid credential_type', () => {
		const result = issueCredentialSchema.safeParse({
			credential_type: 'password'
		});
		expect(result.success).toBe(false);
	});

	it('rejects valid_days over 3650', () => {
		const result = issueCredentialSchema.safeParse({
			credential_type: 'api_key',
			valid_days: 4000
		});
		expect(result.success).toBe(false);
	});
});

describe('suspendNhiSchema', () => {
	it('accepts valid reason', () => {
		const result = suspendNhiSchema.safeParse({
			reason: 'Security review needed'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (reason is optional)', () => {
		const result = suspendNhiSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('rejects reason over 1000 chars', () => {
		const result = suspendNhiSchema.safeParse({
			reason: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});
