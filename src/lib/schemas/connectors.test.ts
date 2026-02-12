import { describe, it, expect } from 'vitest';
import { createConnectorSchema, editConnectorSchema } from './connectors';

describe('createConnectorSchema', () => {
	it('validates with required fields', () => {
		const result = createConnectorSchema.safeParse({ name: 'My LDAP', connector_type: 'ldap' });
		expect(result.success).toBe(true);
	});

	it('validates with all fields', () => {
		const result = createConnectorSchema.safeParse({
			name: 'My LDAP',
			description: 'Main directory',
			connector_type: 'database'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createConnectorSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createConnectorSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('editConnectorSchema', () => {
	it('validates with required fields', () => {
		const result = editConnectorSchema.safeParse({ name: 'Updated LDAP' });
		expect(result.success).toBe(true);
	});

	it('validates with description', () => {
		const result = editConnectorSchema.safeParse({
			name: 'Updated',
			description: 'New desc'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = editConnectorSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});
});
