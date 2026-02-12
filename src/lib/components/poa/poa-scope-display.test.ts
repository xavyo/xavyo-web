import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PoaScopeDisplay from './poa-scope-display.svelte';

describe('PoaScopeDisplay', () => {
	it('renders "All applications" when no app IDs', () => {
		render(PoaScopeDisplay, { props: { scope: { application_ids: [], workflow_types: [] } } });
		expect(screen.getByText('All applications')).toBeTruthy();
		expect(screen.getByText('All workflow types')).toBeTruthy();
	});

	it('renders application IDs as badges', () => {
		render(PoaScopeDisplay, { props: { scope: { application_ids: ['app-1', 'app-2'], workflow_types: [] } } });
		expect(screen.getByText('app-1')).toBeTruthy();
		expect(screen.getByText('app-2')).toBeTruthy();
	});

	it('renders workflow types as badges', () => {
		render(PoaScopeDisplay, { props: { scope: { application_ids: [], workflow_types: ['approval', 'certification'] } } });
		expect(screen.getByText('approval')).toBeTruthy();
		expect(screen.getByText('certification')).toBeTruthy();
	});

	it('renders both apps and workflows', () => {
		render(PoaScopeDisplay, { props: { scope: { application_ids: ['app-1'], workflow_types: ['approval'] } } });
		expect(screen.getByText('app-1')).toBeTruthy();
		expect(screen.getByText('approval')).toBeTruthy();
	});
});
