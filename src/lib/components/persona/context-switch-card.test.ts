import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ContextSwitchCard from './context-switch-card.svelte';
import type { CurrentContextResponse } from '$lib/api/types';

function makeContext(overrides: Partial<CurrentContextResponse> = {}): CurrentContextResponse {
	return {
		physical_user_id: 'user-1',
		physical_user_name: 'John Doe',
		is_persona_active: false,
		active_persona: null,
		session_started_at: null,
		session_expires_at: null,
		...overrides
	};
}

describe('ContextSwitchCard', () => {
	afterEach(cleanup);

	it('renders card heading', () => {
		render(ContextSwitchCard, { props: { context: makeContext() } });
		expect(screen.getByText('Current Identity Context')).toBeTruthy();
	});

	it('renders physical user name', () => {
		render(ContextSwitchCard, { props: { context: makeContext() } });
		expect(screen.getByText('John Doe')).toBeTruthy();
	});

	it('renders Physical Identity badge when no persona active', () => {
		render(ContextSwitchCard, { props: { context: makeContext() } });
		expect(screen.getByText('Physical Identity')).toBeTruthy();
	});

	it('renders Persona Active badge when persona is active', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext({
					is_persona_active: true,
					active_persona: { id: 'p-1', name: 'Admin Persona' }
				})
			}
		});
		expect(screen.getByText('Persona Active')).toBeTruthy();
	});

	it('renders active persona name', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext({
					is_persona_active: true,
					active_persona: { id: 'p-1', name: 'Admin Persona' }
				})
			}
		});
		expect(screen.getByText('Admin Persona')).toBeTruthy();
	});

	it('renders switch back button when persona is active', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext({
					is_persona_active: true,
					active_persona: { id: 'p-1', name: 'Admin Persona' }
				}),
				onSwitchBack: vi.fn()
			}
		});
		expect(screen.getByText('Switch Back to Physical Identity')).toBeTruthy();
	});

	it('renders persona selector when no persona active and personas available', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext(),
				personas: [
					{ id: 'p-1', name: 'Admin Persona', status: 'active' },
					{ id: 'p-2', name: 'Dev Persona', status: 'active' }
				],
				onSwitch: vi.fn()
			}
		});
		// "Switch to Persona" appears as both label text and button text
		expect(screen.getAllByText('Switch to Persona').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('Select a persona')).toBeTruthy();
	});

	it('renders no personas message when none available', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext(),
				personas: []
			}
		});
		expect(screen.getByText('No active personas available for switching.')).toBeTruthy();
	});

	it('falls back to physical_user_id when physical_user_name is null', () => {
		render(ContextSwitchCard, {
			props: { context: makeContext({ physical_user_name: null }) }
		});
		expect(screen.getByText('user-1')).toBeTruthy();
	});

	it('renders session started time when available', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext({
					is_persona_active: true,
					active_persona: { id: 'p-1', name: 'Admin' },
					session_started_at: '2026-02-10T10:00:00Z'
				})
			}
		});
		expect(screen.getByText('Session Started')).toBeTruthy();
	});

	it('renders session expires time when available', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext({
					is_persona_active: true,
					active_persona: { id: 'p-1', name: 'Admin' },
					session_expires_at: '2026-02-10T18:00:00Z'
				})
			}
		});
		expect(screen.getByText('Session Expires')).toBeTruthy();
	});

	it('shows Switching... text when switching prop is true', () => {
		render(ContextSwitchCard, {
			props: {
				context: makeContext({
					is_persona_active: true,
					active_persona: { id: 'p-1', name: 'Admin' }
				}),
				switching: true,
				onSwitchBack: vi.fn()
			}
		});
		expect(screen.getByText('Switching...')).toBeTruthy();
	});

	it('filters out non-active personas from selector', () => {
		const { container } = render(ContextSwitchCard, {
			props: {
				context: makeContext(),
				personas: [
					{ id: 'p-1', name: 'Active Persona', status: 'active' },
					{ id: 'p-2', name: 'Suspended Persona', status: 'suspended' }
				],
				onSwitch: vi.fn()
			}
		});
		const options = container.querySelectorAll('option');
		// Should have: disabled placeholder + active persona only
		const optionTexts = Array.from(options).map((o) => o.textContent);
		expect(optionTexts).toContain('Active Persona');
		expect(optionTexts).not.toContain('Suspended Persona');
	});
});
