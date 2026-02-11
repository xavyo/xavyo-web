import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import JsonDisplay from './json-display.svelte';

describe('JsonDisplay', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders formatted JSON for an object', () => {
		render(JsonDisplay, { props: { data: { key: 'value' } } });
		const pre = document.querySelector('pre');
		expect(pre).toBeTruthy();
		expect(pre?.textContent).toContain('"key"');
		expect(pre?.textContent).toContain('"value"');
	});

	it('renders em-dash for null data', () => {
		render(JsonDisplay, { props: { data: null } });
		const span = document.querySelector('span');
		expect(span).toBeTruthy();
		expect(span?.textContent).toBe('\u2014');
		expect(document.querySelector('pre')).toBeNull();
	});

	it('renders em-dash for undefined data', () => {
		render(JsonDisplay, { props: { data: undefined } });
		const span = document.querySelector('span');
		expect(span).toBeTruthy();
		expect(span?.textContent).toBe('\u2014');
		expect(document.querySelector('pre')).toBeNull();
	});

	it('shows label when provided', () => {
		render(JsonDisplay, { props: { data: { a: 1 }, label: 'My Label' } });
		expect(screen.getByText('My Label')).toBeTruthy();
	});

	it('has copy button', () => {
		render(JsonDisplay, { props: { data: { a: 1 } } });
		expect(screen.getByText('Copy')).toBeTruthy();
	});

	it('renders in collapsible mode with details/summary element', () => {
		render(JsonDisplay, { props: { data: { x: 1 }, collapsible: true } });
		const details = document.querySelector('details');
		expect(details).toBeTruthy();
		const summary = document.querySelector('summary');
		expect(summary).toBeTruthy();
	});

	it('uses label text in collapsible summary', () => {
		render(JsonDisplay, { props: { data: { x: 1 }, collapsible: true, label: 'Schema' } });
		const summary = document.querySelector('summary');
		expect(summary?.textContent).toBe('Schema');
	});

	it('defaults collapsible summary to "JSON" when no label', () => {
		render(JsonDisplay, { props: { data: { x: 1 }, collapsible: true } });
		const summary = document.querySelector('summary');
		expect(summary?.textContent).toBe('JSON');
	});

	it('does not render details/summary in non-collapsible mode', () => {
		render(JsonDisplay, { props: { data: { a: 1 } } });
		expect(document.querySelector('details')).toBeNull();
		expect(document.querySelector('summary')).toBeNull();
	});
});
