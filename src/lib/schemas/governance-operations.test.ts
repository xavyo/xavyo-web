import { describe, it, expect } from 'vitest';
import {
	createSlaPolicySchema,
	updateSlaPolicySchema,
	createTicketingConfigSchema,
	updateTicketingConfigSchema,
	createBulkActionSchema,
	validateExpressionSchema,
	createBulkOperationSchema,
	TICKETING_TYPES,
	BULK_ACTION_TYPES
} from './governance-operations';

describe('governance-operations schemas', () => {
	// --- 1. createSlaPolicySchema ---

	describe('createSlaPolicySchema', () => {
		it('accepts valid full input', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Access Request SLA',
				description: 'SLA for access requests',
				target_duration_seconds: 172800,
				warning_threshold_percent: 80,
				breach_notification_enabled: true,
				escalation_contacts: '["admin@example.com"]'
			});
			expect(result.success).toBe(true);
		});

		it('accepts valid minimal input (required fields only)', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Minimal SLA',
				target_duration_seconds: 3600
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.warning_threshold_percent).toBe(75);
				expect(result.data.breach_notification_enabled).toBe(true);
			}
		});

		it('rejects empty name', () => {
			const result = createSlaPolicySchema.safeParse({
				name: '',
				target_duration_seconds: 3600
			});
			expect(result.success).toBe(false);
		});

		it('rejects name exceeding 255 characters', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'A'.repeat(256),
				target_duration_seconds: 3600
			});
			expect(result.success).toBe(false);
		});

		it('rejects description exceeding 1000 characters', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Test SLA',
				target_duration_seconds: 3600,
				description: 'A'.repeat(1001)
			});
			expect(result.success).toBe(false);
		});

		it('rejects target_duration_seconds below 60', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Bad SLA',
				target_duration_seconds: 30
			});
			expect(result.success).toBe(false);
		});

		it('rejects target_duration_seconds above 604800', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Bad SLA',
				target_duration_seconds: 604801
			});
			expect(result.success).toBe(false);
		});

		it('rejects warning_threshold_percent below 1', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Bad SLA',
				target_duration_seconds: 3600,
				warning_threshold_percent: 0
			});
			expect(result.success).toBe(false);
		});

		it('rejects warning_threshold_percent above 100', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Bad SLA',
				target_duration_seconds: 3600,
				warning_threshold_percent: 101
			});
			expect(result.success).toBe(false);
		});

		it('coerces string numbers for target_duration_seconds', () => {
			const result = createSlaPolicySchema.safeParse({
				name: 'Coerce Test',
				target_duration_seconds: '7200'
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.target_duration_seconds).toBe(7200);
			}
		});

		it('accepts boundary values for target_duration_seconds', () => {
			const min = createSlaPolicySchema.safeParse({
				name: 'Min SLA',
				target_duration_seconds: 60
			});
			expect(min.success).toBe(true);

			const max = createSlaPolicySchema.safeParse({
				name: 'Max SLA',
				target_duration_seconds: 604800
			});
			expect(max.success).toBe(true);
		});
	});

	// --- 2. updateSlaPolicySchema ---

	describe('updateSlaPolicySchema', () => {
		it('accepts valid partial update', () => {
			const result = updateSlaPolicySchema.safeParse({
				name: 'Updated SLA Name',
				breach_notification_enabled: false
			});
			expect(result.success).toBe(true);
		});

		it('accepts empty object (all optional)', () => {
			const result = updateSlaPolicySchema.safeParse({});
			expect(result.success).toBe(true);
		});

		it('rejects invalid target_duration_seconds', () => {
			const result = updateSlaPolicySchema.safeParse({
				target_duration_seconds: 10
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid warning_threshold_percent', () => {
			const result = updateSlaPolicySchema.safeParse({
				warning_threshold_percent: 150
			});
			expect(result.success).toBe(false);
		});

		it('accepts valid single field update', () => {
			const result = updateSlaPolicySchema.safeParse({
				escalation_contacts: '["ops@example.com"]'
			});
			expect(result.success).toBe(true);
		});
	});

	// --- 3. createTicketingConfigSchema ---

	describe('createTicketingConfigSchema', () => {
		it('accepts valid full service_now input', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'ServiceNow Integration',
				ticketing_type: 'service_now',
				endpoint_url: 'https://myinstance.service-now.com/api/now/table/incident',
				credentials: 'Basic dXNlcjpwYXNz',
				field_mappings: '{"priority":"1"}',
				default_assignee: 'admin',
				default_assignment_group: 'IT Support',
				polling_interval_seconds: 120
			});
			expect(result.success).toBe(true);
		});

		it('accepts valid jira input', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'Jira Integration',
				ticketing_type: 'jira',
				endpoint_url: 'https://myorg.atlassian.net',
				credentials: 'token-abc-123',
				project_key: 'IAM',
				issue_type: 'Task'
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.polling_interval_seconds).toBe(300);
			}
		});

		it('accepts valid webhook input', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'Webhook Integration',
				ticketing_type: 'webhook',
				endpoint_url: 'https://hooks.example.com/webhook',
				credentials: 'secret-key-456'
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid ticketing_type', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'Bad Config',
				ticketing_type: 'github_issues',
				endpoint_url: 'https://example.com',
				credentials: 'cred'
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid URL', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'Bad URL',
				ticketing_type: 'jira',
				endpoint_url: 'not-a-url',
				credentials: 'cred'
			});
			expect(result.success).toBe(false);
		});

		it('rejects empty credentials', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'No Creds',
				ticketing_type: 'service_now',
				endpoint_url: 'https://example.com',
				credentials: ''
			});
			expect(result.success).toBe(false);
		});

		it('accepts all valid ticketing_types', () => {
			for (const ticketingType of TICKETING_TYPES) {
				const result = createTicketingConfigSchema.safeParse({
					name: `Config for ${ticketingType}`,
					ticketing_type: ticketingType,
					endpoint_url: 'https://example.com',
					credentials: 'cred-123'
				});
				expect(result.success).toBe(true);
			}
		});

		it('defaults polling_interval_seconds to 300 when omitted', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'Defaults Test',
				ticketing_type: 'webhook',
				endpoint_url: 'https://hook.example.com',
				credentials: 'secret'
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.polling_interval_seconds).toBe(300);
			}
		});

		it('rejects polling_interval_seconds below 60', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'Bad Interval',
				ticketing_type: 'jira',
				endpoint_url: 'https://example.com',
				credentials: 'cred',
				polling_interval_seconds: 30
			});
			expect(result.success).toBe(false);
		});

		it('rejects polling_interval_seconds above 3600', () => {
			const result = createTicketingConfigSchema.safeParse({
				name: 'Bad Interval',
				ticketing_type: 'jira',
				endpoint_url: 'https://example.com',
				credentials: 'cred',
				polling_interval_seconds: 7200
			});
			expect(result.success).toBe(false);
		});
	});

	// --- 4. updateTicketingConfigSchema ---

	describe('updateTicketingConfigSchema', () => {
		it('accepts valid partial update', () => {
			const result = updateTicketingConfigSchema.safeParse({
				name: 'Updated Config'
			});
			expect(result.success).toBe(true);
		});

		it('accepts empty object (all optional)', () => {
			const result = updateTicketingConfigSchema.safeParse({});
			expect(result.success).toBe(true);
		});

		it('accepts is_active toggle', () => {
			const result = updateTicketingConfigSchema.safeParse({
				is_active: false
			});
			expect(result.success).toBe(true);
		});

		it('accepts valid URL in partial update', () => {
			const result = updateTicketingConfigSchema.safeParse({
				endpoint_url: 'https://updated.example.com'
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid URL in partial update', () => {
			const result = updateTicketingConfigSchema.safeParse({
				endpoint_url: 'not-a-url'
			});
			expect(result.success).toBe(false);
		});

		it('accepts polling_interval_seconds update', () => {
			const result = updateTicketingConfigSchema.safeParse({
				polling_interval_seconds: 600
			});
			expect(result.success).toBe(true);
		});
	});

	// --- 5. createBulkActionSchema ---

	describe('createBulkActionSchema', () => {
		it('accepts valid full input', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: 'users.inactive_days > 90',
				action_type: 'disable',
				action_params: '{"reason":"inactivity"}',
				justification: 'Disabling users inactive for 90+ days per security policy'
			});
			expect(result.success).toBe(true);
		});

		it('rejects missing action_type', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: 'users.status = "active"',
				action_params: '{}',
				justification: 'Some justification text here'
			});
			expect(result.success).toBe(false);
		});

		it('accepts all valid action_types', () => {
			for (const actionType of BULK_ACTION_TYPES) {
				const result = createBulkActionSchema.safeParse({
					filter_expression: 'users.department = "eng"',
					action_type: actionType,
					action_params: '{}',
					justification: 'Bulk action justification text'
				});
				expect(result.success).toBe(true);
			}
		});

		it('rejects empty filter_expression', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: '',
				action_type: 'enable',
				action_params: '{}',
				justification: 'Some justification text here'
			});
			expect(result.success).toBe(false);
		});

		it('rejects filter_expression exceeding 10000 characters', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: 'x'.repeat(10001),
				action_type: 'enable',
				action_params: '{}',
				justification: 'Some justification text here'
			});
			expect(result.success).toBe(false);
		});

		it('rejects action_params shorter than 2 characters', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: 'users.status = "active"',
				action_type: 'assign_role',
				action_params: '',
				justification: 'Some justification text here'
			});
			expect(result.success).toBe(false);
		});

		it('rejects justification shorter than 10 characters', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: 'users.status = "active"',
				action_type: 'revoke_role',
				action_params: '{}',
				justification: 'Too short'
			});
			expect(result.success).toBe(false);
		});

		it('rejects justification exceeding 2000 characters', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: 'users.status = "active"',
				action_type: 'disable',
				action_params: '{}',
				justification: 'J'.repeat(2001)
			});
			expect(result.success).toBe(false);
		});

		it('rejects invalid action_type', () => {
			const result = createBulkActionSchema.safeParse({
				filter_expression: 'users.status = "active"',
				action_type: 'invalid_action',
				action_params: '{}',
				justification: 'Some justification text here'
			});
			expect(result.success).toBe(false);
		});
	});

	// --- 6. validateExpressionSchema ---

	describe('validateExpressionSchema', () => {
		it('accepts valid expression', () => {
			const result = validateExpressionSchema.safeParse({
				expression: 'users.status = "active" AND users.department = "engineering"'
			});
			expect(result.success).toBe(true);
		});

		it('rejects empty expression', () => {
			const result = validateExpressionSchema.safeParse({
				expression: ''
			});
			expect(result.success).toBe(false);
		});

		it('rejects missing expression', () => {
			const result = validateExpressionSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		it('rejects expression exceeding 10000 characters', () => {
			const result = validateExpressionSchema.safeParse({
				expression: 'x'.repeat(10001)
			});
			expect(result.success).toBe(false);
		});
	});

	// --- 7. createBulkOperationSchema ---

	describe('createBulkOperationSchema', () => {
		it('accepts valid input', () => {
			const result = createBulkOperationSchema.safeParse({
				transition_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
				object_ids: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890,b2c3d4e5-f6a7-8901-bcde-f12345678901'
			});
			expect(result.success).toBe(true);
		});

		it('rejects invalid transition_id UUID', () => {
			const result = createBulkOperationSchema.safeParse({
				transition_id: 'not-a-uuid',
				object_ids: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
			});
			expect(result.success).toBe(false);
		});

		it('rejects empty object_ids', () => {
			const result = createBulkOperationSchema.safeParse({
				transition_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
				object_ids: ''
			});
			expect(result.success).toBe(false);
		});

		it('rejects missing fields', () => {
			const result = createBulkOperationSchema.safeParse({});
			expect(result.success).toBe(false);
		});

		it('accepts single object_id', () => {
			const result = createBulkOperationSchema.safeParse({
				transition_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
				object_ids: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
			});
			expect(result.success).toBe(true);
		});
	});
});
