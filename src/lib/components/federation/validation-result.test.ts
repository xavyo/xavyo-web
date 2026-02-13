import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ValidationResult from './validation-result.svelte';
import type { ValidationResult as ValidationResultType } from '$lib/api/types';

function makeResult(overrides: Partial<ValidationResultType> = {}): ValidationResultType {
	return {
		is_valid: true,
		discovered_endpoints: null,
		error: null,
		...overrides
	};
}

describe('ValidationResult', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders nothing when result is null', () => {
		const { container } = render(ValidationResult, { props: { result: null } });
		expect(container.textContent?.trim()).toBe('');
	});

	it('renders success state when is_valid is true', () => {
		render(ValidationResult, { props: { result: makeResult({ is_valid: true }) } });
		expect(screen.getByText('Configuration Valid')).toBeTruthy();
	});

	it('renders failure state when is_valid is false', () => {
		render(ValidationResult, {
			props: { result: makeResult({ is_valid: false }) }
		});
		expect(screen.getByText('Validation Failed')).toBeTruthy();
	});

	it('displays error message when is_valid is false and error is present', () => {
		render(ValidationResult, {
			props: {
				result: makeResult({
					is_valid: false,
					error: 'Unable to reach issuer URL'
				})
			}
		});
		expect(screen.getByText('Unable to reach issuer URL')).toBeTruthy();
	});

	it('does not show error text when is_valid is true even if error is set', () => {
		render(ValidationResult, {
			props: {
				result: makeResult({ is_valid: true, error: 'some error' })
			}
		});
		expect(screen.queryByText('some error')).toBeNull();
	});

	it('displays discovered endpoints', () => {
		render(ValidationResult, {
			props: {
				result: makeResult({
					is_valid: true,
					discovered_endpoints: {
						authorization_endpoint: 'https://idp.example.com/authorize',
						token_endpoint: 'https://idp.example.com/token',
						userinfo_endpoint: 'https://idp.example.com/userinfo',
						jwks_uri: 'https://idp.example.com/.well-known/jwks.json'
					}
				})
			}
		});
		expect(screen.getByText('Discovered Endpoints')).toBeTruthy();
		expect(screen.getByText('Authorization Endpoint')).toBeTruthy();
		expect(screen.getByText('https://idp.example.com/authorize')).toBeTruthy();
		expect(screen.getByText('Token Endpoint')).toBeTruthy();
		expect(screen.getByText('https://idp.example.com/token')).toBeTruthy();
		expect(screen.getByText('UserInfo Endpoint')).toBeTruthy();
		expect(screen.getByText('https://idp.example.com/userinfo')).toBeTruthy();
		expect(screen.getByText('JWKS URI')).toBeTruthy();
		expect(screen.getByText('https://idp.example.com/.well-known/jwks.json')).toBeTruthy();
	});

	it('does not show endpoints section when discovered_endpoints is null', () => {
		render(ValidationResult, {
			props: { result: makeResult({ is_valid: true, discovered_endpoints: null }) }
		});
		expect(screen.queryByText('Discovered Endpoints')).toBeNull();
	});

	it('shows error text when error field is present and is_valid is false', () => {
		render(ValidationResult, {
			props: {
				result: makeResult({
					is_valid: false,
					error: 'Connection timed out'
				})
			}
		});
		expect(screen.getByText('Connection timed out')).toBeTruthy();
		expect(screen.getByText('Validation Failed')).toBeTruthy();
	});
});
