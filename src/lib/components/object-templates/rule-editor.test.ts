import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import RuleEditor from './rule-editor.svelte';

describe('RuleEditor', () => {
	afterEach(cleanup);

	it('renders all form fields', () => {
		render(RuleEditor);
		expect(screen.getByLabelText('Rule Type')).toBeTruthy();
		expect(screen.getByLabelText('Target Attribute')).toBeTruthy();
		expect(screen.getByLabelText('Expression')).toBeTruthy();
		expect(screen.getByLabelText('Strength')).toBeTruthy();
		expect(screen.getByLabelText('Priority')).toBeTruthy();
		expect(screen.getByLabelText('Condition (optional)')).toBeTruthy();
		expect(screen.getByLabelText('Error Message (optional)')).toBeTruthy();
	});

	it('renders checkbox fields', () => {
		render(RuleEditor);
		expect(screen.getByText('Authoritative')).toBeTruthy();
		expect(screen.getByText('Exclusive')).toBeTruthy();
	});

	it('renders default submit button text', () => {
		render(RuleEditor);
		expect(screen.getByText('Add Rule')).toBeTruthy();
	});

	it('renders custom submit label', () => {
		render(RuleEditor, { props: { submitLabel: 'Update Rule' } });
		expect(screen.getByText('Update Rule')).toBeTruthy();
	});

	it('renders cancel button when oncancel provided', () => {
		render(RuleEditor, { props: { oncancel: vi.fn() } });
		expect(screen.getByText('Cancel')).toBeTruthy();
	});

	it('does not render cancel button by default', () => {
		render(RuleEditor);
		expect(screen.queryByText('Cancel')).toBeNull();
	});

	it('pre-fills with provided values', () => {
		render(RuleEditor, {
			props: {
				ruleType: 'validation',
				targetAttribute: 'department',
				expression: "'Engineering'",
				strength: 'strong',
				priority: 50,
				condition: "source.type == 'hr'",
				errorMessage: 'Invalid dept'
			}
		});
		expect((screen.getByLabelText('Target Attribute') as HTMLInputElement).value).toBe('department');
		expect((screen.getByLabelText('Expression') as HTMLTextAreaElement).value).toBe("'Engineering'");
		expect((screen.getByLabelText('Condition (optional)') as HTMLInputElement).value).toBe("source.type == 'hr'");
		expect((screen.getByLabelText('Error Message (optional)') as HTMLInputElement).value).toBe('Invalid dept');
	});

	it('calls oncancel when cancel clicked', async () => {
		const oncancel = vi.fn();
		render(RuleEditor, { props: { oncancel } });
		await fireEvent.click(screen.getByText('Cancel'));
		expect(oncancel).toHaveBeenCalled();
	});

	it('calls onsubmit with rule data when submitted', async () => {
		const onsubmit = vi.fn();
		render(RuleEditor, {
			props: {
				targetAttribute: 'department',
				expression: "'Engineering'",
				onsubmit
			}
		});
		await fireEvent.click(screen.getByText('Add Rule'));
		expect(onsubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				rule_type: 'default',
				target_attribute: 'department',
				expression: "'Engineering'",
				strength: 'normal',
				priority: 100,
				authoritative: true,
				exclusive: false
			})
		);
	});

	it('does not call onsubmit when target_attribute is empty', async () => {
		const onsubmit = vi.fn();
		render(RuleEditor, {
			props: {
				targetAttribute: '',
				expression: "'Eng'",
				onsubmit
			}
		});
		await fireEvent.click(screen.getByText('Add Rule'));
		expect(onsubmit).not.toHaveBeenCalled();
	});

	it('does not call onsubmit when expression is empty', async () => {
		const onsubmit = vi.fn();
		render(RuleEditor, {
			props: {
				targetAttribute: 'dept',
				expression: '',
				onsubmit
			}
		});
		await fireEvent.click(screen.getByText('Add Rule'));
		expect(onsubmit).not.toHaveBeenCalled();
	});

	it('includes condition in submitted data when provided', async () => {
		const onsubmit = vi.fn();
		render(RuleEditor, {
			props: {
				targetAttribute: 'dept',
				expression: "'Eng'",
				condition: "source.type == 'hr'",
				onsubmit
			}
		});
		await fireEvent.click(screen.getByText('Add Rule'));
		expect(onsubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				condition: "source.type == 'hr'"
			})
		);
	});

	it('includes error_message in submitted data when provided', async () => {
		const onsubmit = vi.fn();
		render(RuleEditor, {
			props: {
				targetAttribute: 'dept',
				expression: "'Eng'",
				errorMessage: 'Bad value',
				onsubmit
			}
		});
		await fireEvent.click(screen.getByText('Add Rule'));
		expect(onsubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				error_message: 'Bad value'
			})
		);
	});

	it('defaults authoritative to true', () => {
		render(RuleEditor);
		const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
		const authCheckbox = checkboxes.find((cb) => cb.closest('label')?.textContent?.includes('Authoritative'));
		expect(authCheckbox?.checked).toBe(true);
	});

	it('defaults exclusive to false', () => {
		render(RuleEditor);
		const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
		const exclusiveCheckbox = checkboxes.find((cb) => cb.closest('label')?.textContent?.includes('Exclusive'));
		expect(exclusiveCheckbox?.checked).toBe(false);
	});
});
