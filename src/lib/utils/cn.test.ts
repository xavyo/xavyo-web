import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
	it('merges multiple class strings', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	it('resolves conflicting Tailwind classes (last wins)', () => {
		expect(cn('px-4', 'px-2')).toBe('px-2');
	});

	it('resolves conflicting padding classes', () => {
		expect(cn('py-2 px-4', 'px-2')).toBe('py-2 px-2');
	});

	it('ignores falsy values', () => {
		expect(cn('base', false && 'hidden', 'flex')).toBe('base flex');
	});

	it('ignores undefined values', () => {
		expect(cn('base', undefined, 'flex')).toBe('base flex');
	});

	it('ignores null values', () => {
		expect(cn('base', null, 'flex')).toBe('base flex');
	});

	it('handles empty string input', () => {
		expect(cn('')).toBe('');
	});

	it('handles no arguments', () => {
		expect(cn()).toBe('');
	});

	it('handles conditional classes', () => {
		const isActive = true;
		const isDisabled = false;
		expect(cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')).toBe(
			'btn btn-active'
		);
	});

	it('resolves complex Tailwind conflicts', () => {
		expect(cn('bg-red-500 text-white', 'bg-blue-500')).toBe('text-white bg-blue-500');
	});
});
