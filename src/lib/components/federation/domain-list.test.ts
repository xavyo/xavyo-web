import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import DomainList from './domain-list.svelte';
import type { IdentityProviderDomain } from '$lib/api/types';

function makeDomain(overrides: Partial<IdentityProviderDomain> = {}): IdentityProviderDomain {
	return {
		id: 'domain-1',
		domain: 'example.com',
		priority: 10,
		created_at: '2024-06-15T12:00:00Z',
		...overrides
	};
}

describe('DomainList', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({})
			})
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders list of domains', () => {
		const domains = [
			makeDomain({ id: 'd1', domain: 'acme.com' }),
			makeDomain({ id: 'd2', domain: 'corp.io' })
		];
		render(DomainList, { props: { idpId: 'idp-1', domains } });
		expect(screen.getByText('acme.com')).toBeTruthy();
		expect(screen.getByText('corp.io')).toBeTruthy();
	});

	it('shows domain priority badge', () => {
		const domains = [makeDomain({ priority: 5 })];
		render(DomainList, { props: { idpId: 'idp-1', domains } });
		expect(screen.getByText('priority: 5')).toBeTruthy();
	});

	it('renders empty state when no domains', () => {
		render(DomainList, { props: { idpId: 'idp-1', domains: [] } });
		expect(
			screen.getByText('No domains configured. Add a domain for Home Realm Discovery routing.')
		).toBeTruthy();
	});

	it('shows add domain form with inputs and button', () => {
		render(DomainList, { props: { idpId: 'idp-1', domains: [] } });
		expect(screen.getByLabelText('Domain')).toBeTruthy();
		expect(screen.getByLabelText('Priority')).toBeTruthy();
		expect(screen.getByText('Add Domain')).toBeTruthy();
	});

	it('renders remove button for each domain', () => {
		const domains = [
			makeDomain({ id: 'd1', domain: 'acme.com' }),
			makeDomain({ id: 'd2', domain: 'corp.io' })
		];
		render(DomainList, { props: { idpId: 'idp-1', domains } });
		const removeButtons = screen.getAllByText('Remove domain');
		expect(removeButtons.length).toBe(2);
	});

	it('calls fetch to remove domain on remove button click', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({})
		});
		vi.stubGlobal('fetch', mockFetch);

		const domains = [makeDomain({ id: 'domain-42', domain: 'test.com' })];
		render(DomainList, { props: { idpId: 'idp-1', domains } });
		const removeBtn = screen.getByText('Remove domain');
		await fireEvent.click(removeBtn);

		expect(mockFetch).toHaveBeenCalledWith(
			'/api/federation/identity-providers/idp-1/domains/domain-42',
			{ method: 'DELETE' }
		);
	});

	it('renders section heading', () => {
		render(DomainList, { props: { idpId: 'idp-1', domains: [] } });
		expect(screen.getByText('Home Realm Discovery Domains')).toBeTruthy();
	});
});
