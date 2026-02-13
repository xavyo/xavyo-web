import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ValidationResult from './validation-result.svelte';
import type { ScriptValidationResult } from '$lib/api/types';

describe('ValidationResult', () => {
	afterEach(cleanup);

	it('renders nothing when result is null', () => {
		const { container } = render(ValidationResult, { props: { result: null } });
		expect(container.textContent?.trim()).toBe('');
	});

	it('renders success message when valid is true', () => {
		const result: ScriptValidationResult = { valid: true, errors: [] };
		render(ValidationResult, { props: { result } });
		expect(screen.getByText('Script is valid. No errors found.')).toBeTruthy();
	});

	it('renders error count for single error', () => {
		const result: ScriptValidationResult = {
			valid: false,
			errors: [{ line: 5, column: 10, message: 'Unexpected token' }]
		};
		render(ValidationResult, { props: { result } });
		expect(screen.getByText(/Validation failed with 1 error:/)).toBeTruthy();
	});

	it('renders pluralized error count for multiple errors', () => {
		const result: ScriptValidationResult = {
			valid: false,
			errors: [
				{ line: 1, column: null, message: 'Missing semicolon' },
				{ line: 3, column: 5, message: 'Undefined variable' }
			]
		};
		render(ValidationResult, { props: { result } });
		expect(screen.getByText(/Validation failed with 2 errors:/)).toBeTruthy();
	});

	it('renders error messages in a list', () => {
		const result: ScriptValidationResult = {
			valid: false,
			errors: [
				{ line: null, column: null, message: 'Missing semicolon' },
				{ line: null, column: null, message: 'Undefined variable' }
			]
		};
		render(ValidationResult, { props: { result } });
		expect(screen.getByText('Missing semicolon')).toBeTruthy();
		expect(screen.getByText('Undefined variable')).toBeTruthy();
	});

	it('renders line number for errors with line info', () => {
		const result: ScriptValidationResult = {
			valid: false,
			errors: [{ line: 10, column: null, message: 'Syntax error' }]
		};
		render(ValidationResult, { props: { result } });
		expect(screen.getByText('Line 10')).toBeTruthy();
	});

	it('renders line and column for errors with both', () => {
		const result: ScriptValidationResult = {
			valid: false,
			errors: [{ line: 10, column: 15, message: 'Syntax error' }]
		};
		render(ValidationResult, { props: { result } });
		expect(screen.getByText('Line 10:15')).toBeTruthy();
	});

	it('does not render line info when line is null', () => {
		const result: ScriptValidationResult = {
			valid: false,
			errors: [{ line: null, column: null, message: 'General error' }]
		};
		render(ValidationResult, { props: { result } });
		expect(screen.getByText('General error')).toBeTruthy();
		expect(screen.queryByText(/Line/)).toBeFalsy();
	});
});
