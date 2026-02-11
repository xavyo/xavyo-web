import { describe, it, expect } from 'vitest';
import {
	createA2aTaskSchema,
	mcpInvokeSchema,
	grantToolPermissionSchema,
	grantNhiPermissionSchema,
	grantUserPermissionSchema
} from './nhi-protocols';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('createA2aTaskSchema', () => {
	it('accepts valid task data', () => {
		const result = createA2aTaskSchema.safeParse({
			target_agent_id: validUuid,
			task_type: 'process_data',
			input: '{"key": "value"}'
		});
		expect(result.success).toBe(true);
	});

	it('accepts optional callback_url', () => {
		const result = createA2aTaskSchema.safeParse({
			target_agent_id: validUuid,
			task_type: 'test',
			input: '{}',
			callback_url: 'https://example.com/callback'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty callback_url', () => {
		const result = createA2aTaskSchema.safeParse({
			target_agent_id: validUuid,
			task_type: 'test',
			input: '{}',
			callback_url: ''
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing target_agent_id', () => {
		const result = createA2aTaskSchema.safeParse({
			task_type: 'test',
			input: '{}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid uuid for target_agent_id', () => {
		const result = createA2aTaskSchema.safeParse({
			target_agent_id: 'not-a-uuid',
			task_type: 'test',
			input: '{}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty task_type', () => {
		const result = createA2aTaskSchema.safeParse({
			target_agent_id: validUuid,
			task_type: '',
			input: '{}'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty input', () => {
		const result = createA2aTaskSchema.safeParse({
			target_agent_id: validUuid,
			task_type: 'test',
			input: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('mcpInvokeSchema', () => {
	it('accepts valid parameters JSON', () => {
		const result = mcpInvokeSchema.safeParse({ parameters: '{"arg": 1}' });
		expect(result.success).toBe(true);
	});

	it('rejects empty parameters', () => {
		const result = mcpInvokeSchema.safeParse({ parameters: '' });
		expect(result.success).toBe(false);
	});

	it('rejects single char parameters', () => {
		const result = mcpInvokeSchema.safeParse({ parameters: '{' });
		expect(result.success).toBe(false);
	});
});

describe('grantToolPermissionSchema', () => {
	it('accepts valid tool_id', () => {
		const result = grantToolPermissionSchema.safeParse({ tool_id: validUuid });
		expect(result.success).toBe(true);
	});

	it('accepts optional expires_at', () => {
		const result = grantToolPermissionSchema.safeParse({
			tool_id: validUuid,
			expires_at: '2026-12-31T00:00:00Z'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty expires_at', () => {
		const result = grantToolPermissionSchema.safeParse({
			tool_id: validUuid,
			expires_at: ''
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid uuid for tool_id', () => {
		const result = grantToolPermissionSchema.safeParse({ tool_id: 'bad' });
		expect(result.success).toBe(false);
	});
});

describe('grantNhiPermissionSchema', () => {
	it('accepts valid permission data', () => {
		const result = grantNhiPermissionSchema.safeParse({
			target_id: validUuid,
			permission_type: 'invoke'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all optional fields', () => {
		const result = grantNhiPermissionSchema.safeParse({
			target_id: validUuid,
			permission_type: 'invoke',
			allowed_actions: '{"read": true}',
			max_calls_per_hour: 100,
			expires_at: '2026-12-31T00:00:00Z'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing permission_type', () => {
		const result = grantNhiPermissionSchema.safeParse({
			target_id: validUuid,
			permission_type: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid target_id', () => {
		const result = grantNhiPermissionSchema.safeParse({
			target_id: 'bad',
			permission_type: 'invoke'
		});
		expect(result.success).toBe(false);
	});
});

describe('grantUserPermissionSchema', () => {
	it('accepts valid user_id', () => {
		const result = grantUserPermissionSchema.safeParse({ user_id: validUuid });
		expect(result.success).toBe(true);
	});

	it('rejects invalid uuid for user_id', () => {
		const result = grantUserPermissionSchema.safeParse({ user_id: 'bad' });
		expect(result.success).toBe(false);
	});

	it('rejects missing user_id', () => {
		const result = grantUserPermissionSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
