import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import CertItemTable from './cert-item-table.svelte';
import type { NhiCertificationItem } from '$lib/api/types';

function makeItem(overrides: Partial<NhiCertificationItem> = {}): NhiCertificationItem {
	return {
		id: 'item-1',
		campaign_id: 'camp-1',
		nhi_id: 'nhi-1',
		nhi_name: 'My Service Account',
		nhi_type: 'service_account',
		reviewer_id: null,
		decision: null,
		decided_at: null,
		decided_by: null,
		comment: null,
		created_at: '2026-02-01T00:00:00Z',
		...overrides
	};
}

describe('CertItemTable', () => {
	afterEach(cleanup);

	it('renders empty state when no items', () => {
		render(CertItemTable, { props: { items: [] } });
		expect(screen.getByText('No certification items')).toBeTruthy();
		expect(screen.getByText('No NHI entities are in scope for this campaign.')).toBeTruthy();
	});

	it('renders table headers when items exist', () => {
		render(CertItemTable, { props: { items: [makeItem()] } });
		expect(screen.getByText('NHI Name')).toBeTruthy();
		expect(screen.getByText('Type')).toBeTruthy();
		expect(screen.getByText('Decision')).toBeTruthy();
		expect(screen.getByText('Decided At')).toBeTruthy();
	});

	it('renders item name', () => {
		render(CertItemTable, { props: { items: [makeItem()] } });
		expect(screen.getByText('My Service Account')).toBeTruthy();
	});

	it('renders item type', () => {
		render(CertItemTable, { props: { items: [makeItem()] } });
		expect(screen.getByText('service_account')).toBeTruthy();
	});

	it('renders Pending for undecided items', () => {
		render(CertItemTable, { props: { items: [makeItem()] } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders decision badge for decided items', () => {
		render(CertItemTable, {
			props: {
				items: [
					makeItem({
						decision: 'certify',
						decided_at: '2026-02-05T10:00:00Z'
					})
				]
			}
		});
		expect(screen.getByText('certify')).toBeTruthy();
	});

	it('renders nhi_id as fallback when nhi_name is null', () => {
		render(CertItemTable, {
			props: { items: [makeItem({ nhi_name: null })] }
		});
		expect(screen.getByText('nhi-1')).toBeTruthy();
	});

	it('renders dash for null nhi_type', () => {
		render(CertItemTable, {
			props: { items: [makeItem({ nhi_type: null })] }
		});
		const dashes = screen.getAllByText('\u2014');
		expect(dashes.length).toBeGreaterThanOrEqual(1);
	});

	it('renders Actions column when campaign is active', () => {
		render(CertItemTable, {
			props: {
				items: [makeItem()],
				campaignStatus: 'active',
				onDecide: vi.fn()
			}
		});
		expect(screen.getByText('Actions')).toBeTruthy();
	});

	it('renders action buttons for undecided items in active campaign', () => {
		render(CertItemTable, {
			props: {
				items: [makeItem()],
				campaignStatus: 'active',
				onDecide: vi.fn()
			}
		});
		expect(screen.getByText('Certify')).toBeTruthy();
		expect(screen.getByText('Revoke')).toBeTruthy();
		expect(screen.getByText('Flag')).toBeTruthy();
	});

	it('does not render action buttons for decided items', () => {
		render(CertItemTable, {
			props: {
				items: [makeItem({ decision: 'certify', decided_at: '2026-02-05T10:00:00Z' })],
				campaignStatus: 'active',
				onDecide: vi.fn()
			}
		});
		expect(screen.queryByText('Certify')).toBeNull();
	});

	it('does not render Actions column when campaign is not active', () => {
		render(CertItemTable, {
			props: {
				items: [makeItem()],
				campaignStatus: 'completed'
			}
		});
		expect(screen.queryByText('Actions')).toBeNull();
	});

	it('renders multiple items', () => {
		const items = [
			makeItem({ id: 'i1', nhi_name: 'Agent Alpha' }),
			makeItem({ id: 'i2', nhi_name: 'Service Beta' }),
			makeItem({ id: 'i3', nhi_name: 'Tool Gamma' })
		];
		render(CertItemTable, { props: { items } });
		expect(screen.getByText('Agent Alpha')).toBeTruthy();
		expect(screen.getByText('Service Beta')).toBeTruthy();
		expect(screen.getByText('Tool Gamma')).toBeTruthy();
	});

	it('renders checkbox column when campaign is active', () => {
		const { container } = render(CertItemTable, {
			props: {
				items: [makeItem()],
				campaignStatus: 'active'
			}
		});
		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		expect(checkboxes.length).toBeGreaterThanOrEqual(1);
	});

	it('shows bulk action bar when items are selected', () => {
		render(CertItemTable, {
			props: {
				items: [makeItem()],
				campaignStatus: 'active',
				onBulkDecide: vi.fn(),
				selectedIds: ['item-1']
			}
		});
		expect(screen.getByText('1 selected')).toBeTruthy();
		expect(screen.getByText('Certify Selected')).toBeTruthy();
		expect(screen.getByText('Revoke Selected')).toBeTruthy();
		expect(screen.getByText('Flag Selected')).toBeTruthy();
	});
});
