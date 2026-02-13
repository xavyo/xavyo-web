import { describe, it, expect } from 'vitest';
import { createWebhookSubscriptionSchema, updateWebhookSubscriptionSchema } from './webhooks';

describe('createWebhookSubscriptionSchema', () => {
	it('validates with all required fields', () => {
		const result = createWebhookSubscriptionSchema.safeParse({
			name: 'My Webhook',
			url: 'https://example.com/webhook',
			event_types: 'user.created,user.updated'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createWebhookSubscriptionSchema.safeParse({
			url: 'https://example.com/webhook',
			event_types: 'user.created'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createWebhookSubscriptionSchema.safeParse({
			name: '',
			url: 'https://example.com/webhook',
			event_types: 'user.created'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid URL', () => {
		const result = createWebhookSubscriptionSchema.safeParse({
			name: 'My Webhook',
			url: 'not-a-url',
			event_types: 'user.created'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty event_types', () => {
		const result = createWebhookSubscriptionSchema.safeParse({
			name: 'My Webhook',
			url: 'https://example.com/webhook',
			event_types: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('updateWebhookSubscriptionSchema', () => {
	it('validates empty object (all fields optional)', () => {
		const result = updateWebhookSubscriptionSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('validates valid partial update', () => {
		const result = updateWebhookSubscriptionSchema.safeParse({
			name: 'Updated Webhook',
			url: 'https://example.com/new-webhook'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid URL', () => {
		const result = updateWebhookSubscriptionSchema.safeParse({
			url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});
});
