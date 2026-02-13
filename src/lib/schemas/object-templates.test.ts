import { describe, it, expect } from 'vitest';
import {
	createObjectTemplateSchema,
	updateObjectTemplateSchema,
	createTemplateRuleSchema,
	updateTemplateRuleSchema,
	createTemplateScopeSchema,
	createMergePolicySchema,
	simulateTemplateSchema
} from './object-templates';

describe('createObjectTemplateSchema', () => {
	const validInput = {
		name: 'Default User Template',
		description: 'Sets default values for new users',
		object_type: 'user' as const,
		priority: 100
	};

	it('accepts valid input', () => {
		const result = createObjectTemplateSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts minimal input with defaults', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Min Template',
			object_type: 'role'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(100);
		}
	});

	it('rejects empty name', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: '',
			object_type: 'user'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createObjectTemplateSchema.safeParse({
			object_type: 'user'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid object_type', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'invalid'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid object types', () => {
		for (const t of ['user', 'role', 'entitlement', 'application']) {
			const result = createObjectTemplateSchema.safeParse({ name: 'Test', object_type: t });
			expect(result.success).toBe(true);
		}
	});

	it('coerces string priority to number', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			priority: '5'
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.priority).toBe(5);
	});

	it('rejects priority below 1', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			priority: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects priority over 1000', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			priority: 1001
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid UUID for parent_template_id', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			parent_template_id: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty string for parent_template_id', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			parent_template_id: ''
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID for parent_template_id', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			parent_template_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
	});

	it('accepts optional description', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			description: 'A long description'
		});
		expect(result.success).toBe(true);
	});

	it('rejects description over 2000 chars', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			description: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});

	it('accepts name up to 255 chars', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'x'.repeat(255),
			object_type: 'user'
		});
		expect(result.success).toBe(true);
	});

	it('accepts optional rules and scopes arrays', () => {
		const result = createObjectTemplateSchema.safeParse({
			name: 'Test',
			object_type: 'user',
			rules: [
				{
					rule_type: 'default',
					target_attribute: 'dept',
					expression: "'Eng'",
					strength: 'normal',
					authoritative: true,
					priority: 100,
					exclusive: false
				}
			],
			scopes: [{ scope_type: 'global' }]
		});
		expect(result.success).toBe(true);
	});
});

describe('updateObjectTemplateSchema', () => {
	it('accepts valid update with all fields', () => {
		const result = updateObjectTemplateSchema.safeParse({
			name: 'Updated Name',
			description: 'Updated description',
			priority: 50,
			parent_template_id: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateObjectTemplateSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update', () => {
		const result = updateObjectTemplateSchema.safeParse({ name: 'New Name' });
		expect(result.success).toBe(true);
	});

	it('rejects empty name when provided', () => {
		const result = updateObjectTemplateSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('accepts empty parent_template_id to clear it', () => {
		const result = updateObjectTemplateSchema.safeParse({ parent_template_id: '' });
		expect(result.success).toBe(true);
	});
});

describe('createTemplateRuleSchema', () => {
	const validInput = {
		rule_type: 'default' as const,
		target_attribute: 'department',
		expression: "'Engineering'",
		strength: 'normal' as const,
		authoritative: true,
		priority: 100,
		exclusive: false
	};

	it('accepts valid rule', () => {
		const result = createTemplateRuleSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('applies defaults for optional fields', () => {
		const result = createTemplateRuleSchema.safeParse({
			rule_type: 'computed',
			target_attribute: 'full_name',
			expression: 'first_name + " " + last_name'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.strength).toBe('normal');
			expect(result.data.authoritative).toBe(true);
			expect(result.data.priority).toBe(100);
			expect(result.data.exclusive).toBe(false);
		}
	});

	it('rejects empty target_attribute', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			target_attribute: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty expression', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			expression: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid rule_type', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			rule_type: 'invalid'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid rule types', () => {
		for (const rt of ['default', 'computed', 'validation', 'normalization']) {
			const result = createTemplateRuleSchema.safeParse({
				...validInput,
				rule_type: rt
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid strength values', () => {
		for (const s of ['strong', 'normal', 'weak']) {
			const result = createTemplateRuleSchema.safeParse({
				...validInput,
				strength: s
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid strength', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			strength: 'medium'
		});
		expect(result.success).toBe(false);
	});

	it('coerces string priority to number', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			priority: '50'
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.priority).toBe(50);
	});

	it('rejects priority below 1', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			priority: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects priority above 1000', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			priority: 1001
		});
		expect(result.success).toBe(false);
	});

	it('accepts optional condition', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			condition: "source.type == 'hr'"
		});
		expect(result.success).toBe(true);
	});

	it('accepts optional error_message', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			error_message: 'Invalid department value'
		});
		expect(result.success).toBe(true);
	});

	it('rejects error_message over 500 chars', () => {
		const result = createTemplateRuleSchema.safeParse({
			...validInput,
			error_message: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});
});

describe('updateTemplateRuleSchema', () => {
	it('accepts valid update', () => {
		const result = updateTemplateRuleSchema.safeParse({
			expression: 'source.title',
			strength: 'strong',
			priority: 200
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all optional)', () => {
		const result = updateTemplateRuleSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update', () => {
		const result = updateTemplateRuleSchema.safeParse({ exclusive: true });
		expect(result.success).toBe(true);
	});

	it('rejects empty expression when provided', () => {
		const result = updateTemplateRuleSchema.safeParse({ expression: '' });
		expect(result.success).toBe(false);
	});
});

describe('createTemplateScopeSchema', () => {
	it('accepts global scope without value', () => {
		const result = createTemplateScopeSchema.safeParse({
			scope_type: 'global'
		});
		expect(result.success).toBe(true);
	});

	it('accepts organization scope with value', () => {
		const result = createTemplateScopeSchema.safeParse({
			scope_type: 'organization',
			scope_value: 'Engineering'
		});
		expect(result.success).toBe(true);
	});

	it('accepts category scope with value', () => {
		const result = createTemplateScopeSchema.safeParse({
			scope_type: 'category',
			scope_value: 'internal'
		});
		expect(result.success).toBe(true);
	});

	it('accepts condition scope with condition', () => {
		const result = createTemplateScopeSchema.safeParse({
			scope_type: 'condition',
			condition: "type == 'admin'"
		});
		expect(result.success).toBe(true);
	});

	it('accepts all valid scope types', () => {
		for (const s of ['global', 'organization', 'category', 'condition']) {
			const result = createTemplateScopeSchema.safeParse({ scope_type: s });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid scope type', () => {
		const result = createTemplateScopeSchema.safeParse({ scope_type: 'department' });
		expect(result.success).toBe(false);
	});

	it('rejects scope_value over 500 chars', () => {
		const result = createTemplateScopeSchema.safeParse({
			scope_type: 'organization',
			scope_value: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});
});

describe('createMergePolicySchema', () => {
	const validInput = {
		attribute: 'department',
		strategy: 'source_precedence' as const,
		null_handling: 'merge' as const
	};

	it('accepts valid merge policy', () => {
		const result = createMergePolicySchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('accepts all valid strategies', () => {
		for (const s of ['source_precedence', 'timestamp_wins', 'concatenate_unique', 'first_wins', 'manual_only']) {
			const result = createMergePolicySchema.safeParse({ ...validInput, strategy: s });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid strategy', () => {
		const result = createMergePolicySchema.safeParse({ ...validInput, strategy: 'invalid' });
		expect(result.success).toBe(false);
	});

	it('rejects empty attribute', () => {
		const result = createMergePolicySchema.safeParse({ ...validInput, attribute: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing attribute', () => {
		const result = createMergePolicySchema.safeParse({ strategy: 'source_precedence' });
		expect(result.success).toBe(false);
	});

	it('accepts optional source_precedence array', () => {
		const result = createMergePolicySchema.safeParse({
			...validInput,
			source_precedence: ['hr', 'ldap', 'manual']
		});
		expect(result.success).toBe(true);
	});

	it('defaults null_handling to merge', () => {
		const result = createMergePolicySchema.safeParse({
			attribute: 'dept',
			strategy: 'first_wins'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.null_handling).toBe('merge');
		}
	});

	it('accepts preserve_empty null_handling', () => {
		const result = createMergePolicySchema.safeParse({
			...validInput,
			null_handling: 'preserve_empty'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid null_handling', () => {
		const result = createMergePolicySchema.safeParse({
			...validInput,
			null_handling: 'ignore'
		});
		expect(result.success).toBe(false);
	});

	it('rejects attribute over 255 chars', () => {
		const result = createMergePolicySchema.safeParse({
			...validInput,
			attribute: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});
});

describe('simulateTemplateSchema', () => {
	it('accepts valid sample object JSON string', () => {
		const result = simulateTemplateSchema.safeParse({
			sample_object: '{"department": "", "title": "Engineer"}'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty sample_object', () => {
		const result = simulateTemplateSchema.safeParse({ sample_object: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing sample_object', () => {
		const result = simulateTemplateSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('accepts optional limit', () => {
		const result = simulateTemplateSchema.safeParse({
			sample_object: '{"name": "Test"}',
			limit: 50
		});
		expect(result.success).toBe(true);
	});

	it('coerces string limit to number', () => {
		const result = simulateTemplateSchema.safeParse({
			sample_object: '{"name": "Test"}',
			limit: '10'
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.limit).toBe(10);
	});

	it('accepts sample_object without limit', () => {
		const result = simulateTemplateSchema.safeParse({
			sample_object: '{"department": "Eng"}'
		});
		expect(result.success).toBe(true);
	});
});
