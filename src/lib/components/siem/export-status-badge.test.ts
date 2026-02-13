import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ExportStatusBadge from './export-status-badge.svelte';

describe('ExportStatusBadge', () => {
	it('renders "Pending" with gray styling', () => {
		const { container } = render(ExportStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('gray');
	});

	it('renders "Processing" with blue styling', () => {
		const { container } = render(ExportStatusBadge, { props: { status: 'processing' } });
		expect(screen.getByText('Processing')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('blue');
	});

	it('renders "Completed" with green styling', () => {
		const { container } = render(ExportStatusBadge, { props: { status: 'completed' } });
		expect(screen.getByText('Completed')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('green');
	});

	it('renders "Failed" with red styling', () => {
		const { container } = render(ExportStatusBadge, { props: { status: 'failed' } });
		expect(screen.getByText('Failed')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('red');
	});

	it('handles unknown status gracefully', () => {
		const { container } = render(ExportStatusBadge, {
			props: { status: 'unknown_status' as any }
		});
		expect(screen.getByText('unknown_status')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('gray');
	});
});
