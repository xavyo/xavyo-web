import { describe, it, expect } from 'vitest';
import { evaluatePasswordStrength } from './password-strength';

describe('evaluatePasswordStrength', () => {
	it('returns weak for empty string', () => {
		const result = evaluatePasswordStrength('');
		expect(result.level).toBe('weak');
		expect(result.score).toBe(0);
	});

	it('returns weak for short passwords', () => {
		const result = evaluatePasswordStrength('abc');
		expect(result.level).toBe('weak');
	});

	it('returns weak for common passwords', () => {
		const result = evaluatePasswordStrength('password');
		expect(result.level).toBe('weak');
		expect(result.feedback).toContain('This is a commonly used password');
	});

	it('returns fair for medium-strength passwords', () => {
		const result = evaluatePasswordStrength('Br1ghtDay');
		expect(result.level).toBe('fair');
	});

	it('returns strong for good passwords', () => {
		const result = evaluatePasswordStrength('MyP@ssw0rd12');
		expect(result.level).toBe('strong');
	});

	it('returns very-strong for excellent passwords', () => {
		const result = evaluatePasswordStrength('C0mpl3x!P@ss#2026long');
		expect(result.level).toBe('very-strong');
	});

	it('penalizes sequential characters', () => {
		const result = evaluatePasswordStrength('abcdefgh');
		expect(result.feedback).toContain('Avoid sequential characters');
	});

	it('penalizes repeated characters', () => {
		const result = evaluatePasswordStrength('aaabbbccc');
		expect(result.feedback).toContain('Avoid repeated characters');
	});

	it('provides feedback for missing character classes', () => {
		const result = evaluatePasswordStrength('alllowercase');
		expect(result.feedback).toContain('Add uppercase letters');
		expect(result.feedback).toContain('Add numbers');
		expect(result.feedback).toContain('Add special characters');
	});

	it('gives bonus for length >= 16', () => {
		const longSimple = evaluatePasswordStrength('abcdefghijklmnop');
		const shortSimple = evaluatePasswordStrength('abcdefgh');
		expect(longSimple.score).toBeGreaterThan(shortSimple.score);
	});

	it('handles single character', () => {
		const result = evaluatePasswordStrength('a');
		expect(result.level).toBe('weak');
		expect(result.feedback).toContain('Use at least 8 characters');
	});

	it('handles all same character', () => {
		const result = evaluatePasswordStrength('aaaaaaaaa');
		expect(result.feedback).toContain('Avoid repeated characters');
	});
});
