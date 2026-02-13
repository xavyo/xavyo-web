import { describe, it, expect } from 'vitest';
import {
	createCategorySchema,
	updateCategorySchema,
	createCatalogItemSchema,
	updateCatalogItemSchema,
	addToCartSchema,
	updateCartItemSchema,
	submitCartSchema
} from './catalog';

describe('createCategorySchema', () => {
	const validInput = {
		name: 'Access Roles',
		description: 'All access-related roles',
		display_order: 1
	};

	it('accepts valid input', () => {
		expect(createCategorySchema.safeParse(validInput).success).toBe(true);
	});

	it('accepts minimal input (name only)', () => {
		expect(createCategorySchema.safeParse({ name: 'Roles' }).success).toBe(true);
	});

	it('accepts valid parent_id UUID', () => {
		const result = createCategorySchema.safeParse({
			...validInput,
			parent_id: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createCategorySchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 characters', () => {
		const result = createCategorySchema.safeParse({ ...validInput, name: 'A'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('accepts name at exactly 255 characters', () => {
		const result = createCategorySchema.safeParse({ ...validInput, name: 'A'.repeat(255) });
		expect(result.success).toBe(true);
	});

	it('rejects invalid parent_id UUID', () => {
		const result = createCategorySchema.safeParse({ ...validInput, parent_id: 'not-a-uuid' });
		expect(result.success).toBe(false);
	});

	it('rejects negative display_order', () => {
		const result = createCategorySchema.safeParse({ ...validInput, display_order: -1 });
		expect(result.success).toBe(false);
	});

	it('coerces display_order from string', () => {
		const result = createCategorySchema.safeParse({ ...validInput, display_order: '5' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.display_order).toBe(5);
		}
	});

	it('defaults display_order to 0', () => {
		const result = createCategorySchema.safeParse({ name: 'Test' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.display_order).toBe(0);
		}
	});

	it('rejects description over 2000 characters', () => {
		const result = createCategorySchema.safeParse({ ...validInput, description: 'A'.repeat(2001) });
		expect(result.success).toBe(false);
	});

	it('accepts icon as optional string', () => {
		const result = createCategorySchema.safeParse({ ...validInput, icon: 'folder' });
		expect(result.success).toBe(true);
	});
});

describe('updateCategorySchema', () => {
	it('accepts empty object (all optional)', () => {
		expect(updateCategorySchema.safeParse({}).success).toBe(true);
	});

	it('accepts partial update with name', () => {
		const result = updateCategorySchema.safeParse({ name: 'Updated Name' });
		expect(result.success).toBe(true);
	});

	it('rejects empty name string', () => {
		const result = updateCategorySchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('accepts nullable description', () => {
		const result = updateCategorySchema.safeParse({ description: null });
		expect(result.success).toBe(true);
	});

	it('accepts nullable parent_id', () => {
		const result = updateCategorySchema.safeParse({ parent_id: null });
		expect(result.success).toBe(true);
	});

	it('rejects invalid parent_id UUID when provided', () => {
		const result = updateCategorySchema.safeParse({ parent_id: 'bad-id' });
		expect(result.success).toBe(false);
	});

	it('accepts nullable icon', () => {
		const result = updateCategorySchema.safeParse({ icon: null });
		expect(result.success).toBe(true);
	});

	it('rejects name over 255 characters', () => {
		const result = updateCategorySchema.safeParse({ name: 'A'.repeat(256) });
		expect(result.success).toBe(false);
	});
});

describe('createCatalogItemSchema', () => {
	const validInput = {
		item_type: 'role' as const,
		name: 'Admin Role',
		description: 'Full admin access',
		tags: 'admin,core'
	};

	it('accepts valid input', () => {
		expect(createCatalogItemSchema.safeParse(validInput).success).toBe(true);
	});

	it('accepts all item types', () => {
		for (const t of ['role', 'entitlement', 'resource'] as const) {
			expect(createCatalogItemSchema.safeParse({ ...validInput, item_type: t }).success).toBe(true);
		}
	});

	it('rejects invalid item_type', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, item_type: 'Permission' });
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 characters', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, name: 'A'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('rejects invalid category_id UUID', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, category_id: 'not-uuid' });
		expect(result.success).toBe(false);
	});

	it('accepts valid category_id UUID', () => {
		const result = createCatalogItemSchema.safeParse({
			...validInput,
			category_id: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts tags as a comma-separated string', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, tags: 'admin,core,security' });
		expect(result.success).toBe(true);
	});

	it('rejects tags as an array (expects string)', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, tags: ['admin', 'core'] });
		expect(result.success).toBe(false);
	});

	it('accepts form_fields with valid field types', () => {
		const result = createCatalogItemSchema.safeParse({
			...validInput,
			form_fields: [
				{ name: 'reason', label: 'Reason', field_type: 'text', required: true },
				{ name: 'count', label: 'Count', field_type: 'number' },
				{ name: 'dept', label: 'Department', field_type: 'select', options: ['IT', 'HR'] },
				{ name: 'notes', label: 'Notes', field_type: 'textarea' }
			]
		});
		expect(result.success).toBe(true);
	});

	it('rejects form_field with invalid field_type', () => {
		const result = createCatalogItemSchema.safeParse({
			...validInput,
			form_fields: [{ name: 'x', label: 'X', field_type: 'radio' }]
		});
		expect(result.success).toBe(false);
	});

	it('rejects form_field with empty name', () => {
		const result = createCatalogItemSchema.safeParse({
			...validInput,
			form_fields: [{ name: '', label: 'Label', field_type: 'text' }]
		});
		expect(result.success).toBe(false);
	});

	it('rejects form_field with empty label', () => {
		const result = createCatalogItemSchema.safeParse({
			...validInput,
			form_fields: [{ name: 'field', label: '', field_type: 'text' }]
		});
		expect(result.success).toBe(false);
	});

	it('accepts requestability_rules', () => {
		const result = createCatalogItemSchema.safeParse({
			...validInput,
			requestability_rules: {
				self_request: true,
				manager_request: false,
				department_restriction: ['Engineering'],
				prerequisite_roles: ['550e8400-e29b-41d4-a716-446655440000']
			}
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID in prerequisite_roles', () => {
		const result = createCatalogItemSchema.safeParse({
			...validInput,
			requestability_rules: {
				prerequisite_roles: ['not-a-uuid']
			}
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid reference_id UUID', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, reference_id: 'bad' });
		expect(result.success).toBe(false);
	});

	it('rejects description over 10000 characters', () => {
		const result = createCatalogItemSchema.safeParse({ ...validInput, description: 'A'.repeat(10001) });
		expect(result.success).toBe(false);
	});

	it('rejects missing item_type', () => {
		const { item_type, ...rest } = validInput;
		const result = createCatalogItemSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const { name, ...rest } = validInput;
		const result = createCatalogItemSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});
});

describe('updateCatalogItemSchema', () => {
	it('accepts empty object (all optional)', () => {
		expect(updateCatalogItemSchema.safeParse({}).success).toBe(true);
	});

	it('accepts partial update with name', () => {
		expect(updateCatalogItemSchema.safeParse({ name: 'Updated' }).success).toBe(true);
	});

	it('rejects empty name', () => {
		expect(updateCatalogItemSchema.safeParse({ name: '' }).success).toBe(false);
	});

	it('accepts nullable category_id', () => {
		expect(updateCatalogItemSchema.safeParse({ category_id: null }).success).toBe(true);
	});

	it('accepts nullable description', () => {
		expect(updateCatalogItemSchema.safeParse({ description: null }).success).toBe(true);
	});

	it('accepts nullable reference_id', () => {
		expect(updateCatalogItemSchema.safeParse({ reference_id: null }).success).toBe(true);
	});

	it('accepts nullable requestability_rules', () => {
		expect(updateCatalogItemSchema.safeParse({ requestability_rules: null }).success).toBe(true);
	});

	it('accepts tags as string', () => {
		expect(updateCatalogItemSchema.safeParse({ tags: 'admin,core' }).success).toBe(true);
	});

	it('rejects tags as array (expects string)', () => {
		const tags = Array.from({ length: 5 }, (_, i) => `t-${i}`);
		expect(updateCatalogItemSchema.safeParse({ tags }).success).toBe(false);
	});
});

describe('addToCartSchema', () => {
	const validUUID = '550e8400-e29b-41d4-a716-446655440000';

	it('accepts valid input', () => {
		const result = addToCartSchema.safeParse({ catalog_item_id: validUUID });
		expect(result.success).toBe(true);
	});

	it('accepts with beneficiary_id', () => {
		const result = addToCartSchema.safeParse({
			catalog_item_id: validUUID,
			beneficiary_id: validUUID
		});
		expect(result.success).toBe(true);
	});

	it('accepts with parameters and form_values', () => {
		const result = addToCartSchema.safeParse({
			catalog_item_id: validUUID,
			parameters: { env: 'production' },
			form_values: { reason: 'Need access' }
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing catalog_item_id', () => {
		const result = addToCartSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects invalid catalog_item_id UUID', () => {
		const result = addToCartSchema.safeParse({ catalog_item_id: 'bad-id' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid beneficiary_id UUID', () => {
		const result = addToCartSchema.safeParse({
			catalog_item_id: validUUID,
			beneficiary_id: 'not-uuid'
		});
		expect(result.success).toBe(false);
	});
});

describe('updateCartItemSchema', () => {
	it('accepts empty object (all optional)', () => {
		expect(updateCartItemSchema.safeParse({}).success).toBe(true);
	});

	it('accepts parameters', () => {
		const result = updateCartItemSchema.safeParse({ parameters: { env: 'staging' } });
		expect(result.success).toBe(true);
	});

	it('accepts form_values', () => {
		const result = updateCartItemSchema.safeParse({ form_values: { reason: 'Updated reason' } });
		expect(result.success).toBe(true);
	});

	it('accepts both parameters and form_values', () => {
		const result = updateCartItemSchema.safeParse({
			parameters: { key: 'value' },
			form_values: { field: 'data' }
		});
		expect(result.success).toBe(true);
	});
});

describe('submitCartSchema', () => {
	const validUUID = '550e8400-e29b-41d4-a716-446655440000';

	it('accepts empty object (all optional)', () => {
		expect(submitCartSchema.safeParse({}).success).toBe(true);
	});

	it('accepts with beneficiary_id', () => {
		const result = submitCartSchema.safeParse({ beneficiary_id: validUUID });
		expect(result.success).toBe(true);
	});

	it('accepts with global_justification', () => {
		const result = submitCartSchema.safeParse({ global_justification: 'Needed for project' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid beneficiary_id UUID', () => {
		const result = submitCartSchema.safeParse({ beneficiary_id: 'bad' });
		expect(result.success).toBe(false);
	});

	it('rejects global_justification over 5000 characters', () => {
		const result = submitCartSchema.safeParse({ global_justification: 'A'.repeat(5001) });
		expect(result.success).toBe(false);
	});

	it('accepts global_justification at exactly 5000 characters', () => {
		const result = submitCartSchema.safeParse({ global_justification: 'A'.repeat(5000) });
		expect(result.success).toBe(true);
	});
});
