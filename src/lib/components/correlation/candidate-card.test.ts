import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import CandidateCard from './candidate-card.svelte';
import type { CorrelationCandidate } from '$lib/api/types';

function makeCandidate(overrides: Partial<CorrelationCandidate> = {}): CorrelationCandidate {
	return {
		id: 'cand-1',
		identity_id: 'identity-abc',
		identity_display_name: 'John Doe',
		identity_attributes: { email: 'john@example.com' },
		aggregate_confidence: 0.85,
		per_attribute_scores: { email: 0.95, name: 0.75 },
		is_deactivated: false,
		is_definitive_match: false,
		...overrides
	};
}

describe('CandidateCard', () => {
	afterEach(cleanup);

	it('renders candidate display name', () => {
		render(CandidateCard, { props: { candidate: makeCandidate() } });
		expect(screen.getByText('John Doe')).toBeTruthy();
	});

	it('renders candidate identity ID', () => {
		render(CandidateCard, { props: { candidate: makeCandidate() } });
		expect(screen.getByText('ID: identity-abc')).toBeTruthy();
	});

	it('renders aggregate confidence as percentage', () => {
		render(CandidateCard, { props: { candidate: makeCandidate({ aggregate_confidence: 0.85 }) } });
		expect(screen.getByText('85%')).toBeTruthy();
		expect(screen.getByText('Aggregate Confidence')).toBeTruthy();
	});

	it('renders per-attribute scores', () => {
		render(CandidateCard, {
			props: {
				candidate: makeCandidate({
					per_attribute_scores: { email: 0.95, name: 0.75 }
				})
			}
		});
		expect(screen.getByText('email')).toBeTruthy();
		expect(screen.getByText('95%')).toBeTruthy();
		expect(screen.getByText('name')).toBeTruthy();
		expect(screen.getByText('75%')).toBeTruthy();
	});

	it('shows "Attribute Scores" heading when scores exist', () => {
		render(CandidateCard, { props: { candidate: makeCandidate() } });
		expect(screen.getByText('Attribute Scores')).toBeTruthy();
	});

	it('does not show "Attribute Scores" when no per-attribute scores', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate({ per_attribute_scores: {} }) }
		});
		expect(screen.queryByText('Attribute Scores')).toBeFalsy();
	});

	it('rounds confidence percentage correctly', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate({ aggregate_confidence: 0.8749 }) }
		});
		expect(screen.getByText('87%')).toBeTruthy();
	});

	it('shows Definitive Match badge when is_definitive_match is true', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate({ is_definitive_match: true }) }
		});
		expect(screen.getByText('Definitive Match')).toBeTruthy();
	});

	it('does not show Definitive Match badge when is_definitive_match is false', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate({ is_definitive_match: false }) }
		});
		expect(screen.queryByText('Definitive Match')).toBeFalsy();
	});

	it('shows Deactivated badge when is_deactivated is true', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate({ is_deactivated: true }) }
		});
		expect(screen.getByText('Deactivated')).toBeTruthy();
	});

	it('does not show Deactivated badge when is_deactivated is false', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate({ is_deactivated: false }) }
		});
		expect(screen.queryByText('Deactivated')).toBeFalsy();
	});

	it('calls onSelect with candidate id when clicked', async () => {
		const onSelect = vi.fn();
		render(CandidateCard, {
			props: { candidate: makeCandidate(), onSelect }
		});

		const button = screen.getByRole('button');
		await fireEvent.click(button);
		expect(onSelect).toHaveBeenCalledWith('cand-1');
	});

	it('has aria-pressed=false when not selected', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate(), isSelected: false }
		});
		const button = screen.getByRole('button');
		expect(button.getAttribute('aria-pressed')).toBe('false');
	});

	it('has aria-pressed=true when selected', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate(), isSelected: true }
		});
		const button = screen.getByRole('button');
		expect(button.getAttribute('aria-pressed')).toBe('true');
	});

	it('applies selected styling when isSelected is true', () => {
		render(CandidateCard, {
			props: { candidate: makeCandidate(), isSelected: true }
		});
		const button = screen.getByRole('button');
		expect(button.className).toContain('border-primary');
	});

	it('renders high confidence (>= 80%) with green bar', () => {
		const { container } = render(CandidateCard, {
			props: { candidate: makeCandidate({ aggregate_confidence: 0.85 }) }
		});
		const bars = container.querySelectorAll('.bg-green-500');
		expect(bars.length).toBeGreaterThanOrEqual(1);
	});

	it('renders medium confidence (50-79%) with yellow bar', () => {
		const { container } = render(CandidateCard, {
			props: { candidate: makeCandidate({ aggregate_confidence: 0.65 }) }
		});
		const bars = container.querySelectorAll('.bg-yellow-500');
		expect(bars.length).toBeGreaterThanOrEqual(1);
	});

	it('renders low confidence (< 50%) with red bar', () => {
		const { container } = render(CandidateCard, {
			props: { candidate: makeCandidate({ aggregate_confidence: 0.35 }) }
		});
		const bars = container.querySelectorAll('.bg-red-500');
		expect(bars.length).toBeGreaterThanOrEqual(1);
	});

	it('renders per-attribute scores with appropriate colors', () => {
		const { container } = render(CandidateCard, {
			props: {
				candidate: makeCandidate({
					aggregate_confidence: 0.5,
					per_attribute_scores: { email: 0.95, name: 0.30 }
				})
			}
		});
		// email (95%) should be green, name (30%) should be red
		const greenBars = container.querySelectorAll('.bg-green-500');
		const redBars = container.querySelectorAll('.bg-red-500');
		expect(greenBars.length).toBeGreaterThanOrEqual(1);
		expect(redBars.length).toBeGreaterThanOrEqual(1);
	});
});
