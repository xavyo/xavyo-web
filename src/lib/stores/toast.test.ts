import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toasts, addToast, removeToast } from './toast.svelte';

describe('toast store', () => {
	beforeEach(() => {
		// Clear all toasts between tests
		while (toasts.length > 0) {
			removeToast(toasts[0].id);
		}
	});

	it('starts with empty toast array', () => {
		expect(toasts.length).toBe(0);
	});

	it('adds a toast to the array', () => {
		addToast('success', 'Test message');
		expect(toasts.length).toBe(1);
		expect(toasts[0].message).toBe('Test message');
		expect(toasts[0].type).toBe('success');
	});

	it('generates unique IDs for each toast', () => {
		addToast('success', 'First');
		addToast('info', 'Second');
		expect(toasts[0].id).not.toBe(toasts[1].id);
	});

	it('removes a toast by ID', () => {
		addToast('success', 'To remove');
		const id = toasts[0].id;
		removeToast(id);
		expect(toasts.length).toBe(0);
	});

	it('sets default duration of 5000ms for success toasts', () => {
		addToast('success', 'Success message');
		expect(toasts[0].duration).toBe(5000);
	});

	it('sets default duration of 5000ms for info toasts', () => {
		addToast('info', 'Info message');
		expect(toasts[0].duration).toBe(5000);
	});

	it('sets duration of 0 for error toasts (manual dismiss)', () => {
		addToast('error', 'Error message');
		expect(toasts[0].duration).toBe(0);
	});

	it('allows custom duration override', () => {
		addToast('success', 'Custom duration', 10000);
		expect(toasts[0].duration).toBe(10000);
	});

	it('stacks multiple toasts', () => {
		addToast('success', 'First');
		addToast('error', 'Second');
		addToast('info', 'Third');
		expect(toasts.length).toBe(3);
	});

	it('auto-removes toast after duration via setTimeout', () => {
		vi.useFakeTimers();
		addToast('success', 'Auto dismiss', 3000);
		expect(toasts.length).toBe(1);
		vi.advanceTimersByTime(3000);
		expect(toasts.length).toBe(0);
		vi.useRealTimers();
	});

	it('does not auto-remove toast with duration 0', () => {
		vi.useFakeTimers();
		addToast('error', 'Manual dismiss');
		expect(toasts.length).toBe(1);
		vi.advanceTimersByTime(10000);
		expect(toasts.length).toBe(1);
		vi.useRealTimers();
	});
});
