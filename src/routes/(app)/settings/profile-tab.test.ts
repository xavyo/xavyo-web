import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { updateProfileSchema } from '$lib/schemas/settings';
import type { UserProfile } from '$lib/api/types';

// Mock $app/stores (required by superForm internals)
vi.mock('$app/stores', () => {
	const { readable, writable } = require('svelte/store');
	return {
		page: readable({
			url: new URL('http://localhost/settings'),
			params: {},
			status: 200,
			error: null,
			data: {},
			form: null
		}),
		navigating: readable(null),
		updated: { ...readable(false), check: vi.fn() }
	};
});

// Mock $app/navigation (superForm calls beforeNavigate, onNavigate, afterNavigate)
vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined),
	goto: vi.fn().mockResolvedValue(undefined),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	onNavigate: vi.fn()
}));

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true,
	dev: true
}));

// Mock toast store
vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import ProfileTab from './profile-tab.svelte';

const baseProfile: UserProfile = {
	id: 'usr_abc123',
	email: 'john@example.com',
	email_verified: true,
	display_name: 'John Doe',
	first_name: 'John',
	last_name: 'Doe',
	avatar_url: null,
	created_at: '2025-01-15T10:00:00Z'
};

async function createMockForm(data?: Partial<{
	display_name: string;
	first_name: string;
	last_name: string;
	avatar_url: string;
}>) {
	return await superValidate(
		{
			display_name: data?.display_name ?? 'John Doe',
			first_name: data?.first_name ?? 'John',
			last_name: data?.last_name ?? 'Doe',
			avatar_url: data?.avatar_url ?? ''
		},
		zod(updateProfileSchema)
	);
}

describe('ProfileTab', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders email address from profile', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		expect(screen.getByText('john@example.com')).toBeTruthy();
	});

	it('shows "Verified" when email is verified', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		expect(screen.getByText('Verified')).toBeTruthy();
	});

	it('shows "Not verified" when email is not verified', async () => {
		const form = await createMockForm();
		const unverifiedProfile = { ...baseProfile, email_verified: false };
		render(ProfileTab, { props: { profile: unverifiedProfile, form } });
		expect(screen.getByText('Not verified')).toBeTruthy();
	});

	it('renders the Email Address section heading', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		expect(screen.getByText('Email Address')).toBeTruthy();
	});

	it('renders the Profile Information section heading', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		expect(screen.getByText('Profile Information')).toBeTruthy();
	});

	it('renders display name input field', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		const input = screen.getByLabelText('Display name') as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.value).toBe('John Doe');
	});

	it('renders first name input field', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		const input = screen.getByLabelText('First name') as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.value).toBe('John');
	});

	it('renders last name input field', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		const input = screen.getByLabelText('Last name') as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.value).toBe('Doe');
	});

	it('renders avatar URL input field', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		const input = screen.getByLabelText('Avatar URL') as HTMLInputElement;
		expect(input).toBeTruthy();
		expect(input.value).toBe('');
	});

	it('shows "Change email" button', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		const button = screen.getByText('Change email');
		expect(button).toBeTruthy();
		expect((button as HTMLButtonElement).disabled).toBe(false);
	});

	it('shows "Save changes" button', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		expect(screen.getByText('Save changes')).toBeTruthy();
	});

	it('renders Account Information section', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		expect(screen.getByText('Account Information')).toBeTruthy();
	});

	it('displays user ID in account info', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		expect(screen.getByText('usr_abc123')).toBeTruthy();
	});

	it('displays member since date', async () => {
		const form = await createMockForm();
		render(ProfileTab, { props: { profile: baseProfile, form } });
		const expectedDate = new Date('2025-01-15T10:00:00Z').toLocaleDateString();
		expect(screen.getByText(expectedDate)).toBeTruthy();
	});

	it('pre-fills form with profile data', async () => {
		const form = await createMockForm({
			display_name: 'Jane Smith',
			first_name: 'Jane',
			last_name: 'Smith',
			avatar_url: ''
		});
		const profile = {
			...baseProfile,
			display_name: 'Jane Smith',
			first_name: 'Jane',
			last_name: 'Smith'
		};
		render(ProfileTab, { props: { profile, form } });

		expect((screen.getByLabelText('Display name') as HTMLInputElement).value).toBe('Jane Smith');
		expect((screen.getByLabelText('First name') as HTMLInputElement).value).toBe('Jane');
		expect((screen.getByLabelText('Last name') as HTMLInputElement).value).toBe('Smith');
	});
});
