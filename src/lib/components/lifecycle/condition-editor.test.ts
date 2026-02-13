import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ConditionEditor from './condition-editor.svelte';

// Mock lifecycle-client
vi.mock('$lib/api/lifecycle-client', () => ({
	saveConditions: vi.fn(),
	evaluateConditions: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

describe('ConditionEditor', () => {
	const baseProps = {
		configId: 'cfg-1',
		transitionId: 'trans-1'
	};

	it('renders with no conditions', () => {
		render(ConditionEditor, { props: baseProps });
		expect(screen.getByText('No conditions. Transition is always allowed.')).toBeDefined();
	});

	it('renders initial conditions', () => {
		render(ConditionEditor, {
			props: {
				...baseProps,
				initialConditions: [
					{ condition_type: 'attribute_check', attribute_path: 'user.dept', expression: "!= 'Exec'" }
				]
			}
		});
		// Should not show "no conditions" message
		expect(screen.queryByText('No conditions. Transition is always allowed.')).toBeNull();
	});

	it('renders Add Condition button', () => {
		render(ConditionEditor, { props: baseProps });
		expect(screen.getByText('Add Condition')).toBeDefined();
	});

	it('renders Save Conditions button', () => {
		render(ConditionEditor, { props: baseProps });
		expect(screen.getByText('Save Conditions')).toBeDefined();
	});

	it('renders Evaluate button', () => {
		render(ConditionEditor, { props: baseProps });
		expect(screen.getByText('Evaluate')).toBeDefined();
	});
});
