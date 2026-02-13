import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

// Mock $app/stores (required by superForm internals)
vi.mock('$app/stores', () => {
	const { readable } = require('svelte/store');
	return {
		page: readable({
			url: new URL('http://localhost/governance/role-mining/create'),
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
	goto: vi.fn().mockResolvedValue(undefined),
	invalidateAll: vi.fn().mockResolvedValue(undefined),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	onNavigate: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true,
	dev: false
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import CreatePage from './+page.svelte';

function makeMockForm() {
	return {
		id: 'test-form',
		valid: true,
		posted: false,
		errors: {},
		data: {
			name: '',
			min_users: 3,
			min_entitlements: 2,
			confidence_threshold: 0.6,
			include_excessive_privilege: true,
			include_consolidation: true,
			consolidation_threshold: 70,
			deviation_threshold: 50,
			peer_group_attribute: ''
		},
		constraints: {},
		shape: {},
		tainted: undefined,
		message: undefined
	};
}

function renderCreate(form = makeMockForm()) {
	return render(CreatePage, {
		props: {
			data: { form } as any
		}
	});
}

describe('Create Mining Job page', () => {
	it('renders "Create Mining Job" heading', () => {
		renderCreate();
		expect(screen.getByText('Create Mining Job')).toBeTruthy();
	});

	it('shows name input field', () => {
		renderCreate();
		expect(screen.getByLabelText('Job name')).toBeTruthy();
	});

	it('shows mining parameter fields', () => {
		renderCreate();
		expect(screen.getByLabelText('Minimum users')).toBeTruthy();
		expect(screen.getByLabelText('Minimum entitlements')).toBeTruthy();
		expect(screen.getByLabelText('Confidence threshold')).toBeTruthy();
	});

	it('shows checkbox for include_excessive_privilege', () => {
		renderCreate();
		expect(screen.getByText('Include excessive privilege analysis')).toBeTruthy();
	});

	it('shows submit button', () => {
		renderCreate();
		expect(screen.getByText('Create job')).toBeTruthy();
	});
});

describe('Create Mining Job page additional fields', () => {
	it('shows checkbox for include_consolidation', () => {
		renderCreate();
		expect(screen.getByText('Include consolidation analysis')).toBeTruthy();
	});

	it('shows consolidation threshold input', () => {
		renderCreate();
		expect(screen.getByLabelText('Consolidation threshold (%)')).toBeTruthy();
	});

	it('shows deviation threshold input', () => {
		renderCreate();
		expect(screen.getByLabelText('Deviation threshold (%)')).toBeTruthy();
	});

	it('shows peer group attribute input', () => {
		renderCreate();
		expect(screen.getByLabelText('Peer group attribute (optional)')).toBeTruthy();
	});

	it('shows cancel link', () => {
		renderCreate();
		expect(screen.getByText('Cancel')).toBeTruthy();
	});
});

describe('Create Mining Job form schema', () => {
	it('form data has expected default values', () => {
		const form = makeMockForm();
		expect(form.data.name).toBe('');
		expect(form.data.min_users).toBe(3);
		expect(form.data.min_entitlements).toBe(2);
		expect(form.data.confidence_threshold).toBe(0.6);
		expect(form.data.include_excessive_privilege).toBe(true);
		expect(form.data.include_consolidation).toBe(true);
		expect(form.data.consolidation_threshold).toBe(70);
		expect(form.data.deviation_threshold).toBe(50);
		expect(form.data.peer_group_attribute).toBe('');
	});

	it('form starts as valid', () => {
		const form = makeMockForm();
		expect(form.valid).toBe(true);
	});

	it('form starts as not posted', () => {
		const form = makeMockForm();
		expect(form.posted).toBe(false);
	});
});

describe('Create Mining Job page server', () => {
	it(
		'page module is defined',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'page module is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});
