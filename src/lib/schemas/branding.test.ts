import { describe, it, expect } from 'vitest';
import { updateBrandingSchema } from './branding';

describe('updateBrandingSchema', () => {
	it('accepts valid complete branding config', () => {
		const result = updateBrandingSchema.safeParse({
			logo_url: 'https://example.com/logo.png',
			logo_dark_url: 'https://example.com/logo-dark.png',
			favicon_url: 'https://example.com/favicon.ico',
			email_logo_url: 'https://example.com/email-logo.png',
			primary_color: '#FF0000',
			secondary_color: '#00FF00',
			accent_color: '#0000FF',
			background_color: '#FFFFFF',
			text_color: '#000000',
			font_family: 'Inter, sans-serif',
			custom_css: '.login-page { background: #000; }',
			login_page_title: 'Welcome to Acme Corp',
			login_page_subtitle: 'Sign in to your account',
			login_page_background_url: 'https://example.com/bg.jpg',
			footer_text: '2026 Acme Corp. All rights reserved.',
			privacy_policy_url: 'https://example.com/privacy',
			terms_of_service_url: 'https://example.com/terms',
			support_url: 'https://example.com/support'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update (only primary_color)', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '#FF0000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty object (all fields optional)', () => {
		const result = updateBrandingSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts short hex color (#FFF)', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '#FFF'
		});
		expect(result.success).toBe(true);
	});

	it('accepts full hex color (#FF0000)', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '#FF0000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts lowercase hex color (#ff0000)', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '#ff0000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts mixed case hex color (#Ff00aB)', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '#Ff00aB'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid hex color (not-a-color)', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: 'not-a-color'
		});
		expect(result.success).toBe(false);
	});

	it('rejects hex color without hash', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: 'FF0000'
		});
		expect(result.success).toBe(false);
	});

	it('rejects hex color with 4 digits', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '#FFFF'
		});
		expect(result.success).toBe(false);
	});

	it('rejects hex color with invalid characters', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '#GGGGGG'
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty string for hex color fields', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: '',
			secondary_color: ''
		});
		expect(result.success).toBe(true);
	});

	it('accepts null for hex color fields', () => {
		const result = updateBrandingSchema.safeParse({
			primary_color: null,
			secondary_color: null
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid URL for logo_url', () => {
		const result = updateBrandingSchema.safeParse({
			logo_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid URL for privacy_policy_url', () => {
		const result = updateBrandingSchema.safeParse({
			privacy_policy_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid URL for terms_of_service_url', () => {
		const result = updateBrandingSchema.safeParse({
			terms_of_service_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid URL for support_url', () => {
		const result = updateBrandingSchema.safeParse({
			support_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid URL for login_page_background_url', () => {
		const result = updateBrandingSchema.safeParse({
			login_page_background_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty string for URL fields', () => {
		const result = updateBrandingSchema.safeParse({
			logo_url: '',
			favicon_url: '',
			privacy_policy_url: ''
		});
		expect(result.success).toBe(true);
	});

	it('accepts null for URL fields', () => {
		const result = updateBrandingSchema.safeParse({
			logo_url: null,
			favicon_url: null,
			support_url: null
		});
		expect(result.success).toBe(true);
	});

	it('rejects custom_css exceeding 10KB (10240 chars)', () => {
		const result = updateBrandingSchema.safeParse({
			custom_css: 'x'.repeat(10241)
		});
		expect(result.success).toBe(false);
	});

	it('accepts custom_css at exactly 10240 chars', () => {
		const result = updateBrandingSchema.safeParse({
			custom_css: 'x'.repeat(10240)
		});
		expect(result.success).toBe(true);
	});

	it('rejects font_family over 255 chars', () => {
		const result = updateBrandingSchema.safeParse({
			font_family: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('accepts font_family at 255 chars', () => {
		const result = updateBrandingSchema.safeParse({
			font_family: 'x'.repeat(255)
		});
		expect(result.success).toBe(true);
	});

	it('rejects login_page_title over 255 chars', () => {
		const result = updateBrandingSchema.safeParse({
			login_page_title: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects login_page_subtitle over 500 chars', () => {
		const result = updateBrandingSchema.safeParse({
			login_page_subtitle: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});

	it('rejects footer_text over 500 chars', () => {
		const result = updateBrandingSchema.safeParse({
			footer_text: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});

	it('accepts null for string fields', () => {
		const result = updateBrandingSchema.safeParse({
			font_family: null,
			custom_css: null,
			login_page_title: null,
			login_page_subtitle: null,
			footer_text: null
		});
		expect(result.success).toBe(true);
	});
});
