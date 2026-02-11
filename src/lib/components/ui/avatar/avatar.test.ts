import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Avatar from './avatar.svelte';

afterEach(() => cleanup());

describe('Avatar', () => {
	it('renders initials from name', () => {
		const { container } = render(Avatar, { props: { name: 'John Doe' } });
		expect(container.textContent).toContain('J');
	});

	it('falls back to email initial when no name', () => {
		const { container } = render(Avatar, { props: { email: 'alice@example.com' } });
		expect(container.textContent).toContain('A');
	});

	it('renders User icon when no name and no email', () => {
		const { container } = render(Avatar);
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
	});

	it('applies default size classes', () => {
		const { container } = render(Avatar, { props: { name: 'Test' } });
		const div = container.firstElementChild as HTMLElement;
		expect(div.className).toContain('h-9');
		expect(div.className).toContain('w-9');
	});

	it('applies sm size classes', () => {
		const { container } = render(Avatar, { props: { name: 'Test', size: 'sm' } });
		const div = container.firstElementChild as HTMLElement;
		expect(div.className).toContain('h-8');
		expect(div.className).toContain('w-8');
	});

	it('applies lg size classes', () => {
		const { container } = render(Avatar, { props: { name: 'Test', size: 'lg' } });
		const div = container.firstElementChild as HTMLElement;
		expect(div.className).toContain('h-10');
		expect(div.className).toContain('w-10');
	});

	it('generates consistent color for same email', () => {
		const { container: c1 } = render(Avatar, { props: { email: 'test@example.com' } });
		const className1 = (c1.firstElementChild as HTMLElement).className;
		cleanup();
		const { container: c2 } = render(Avatar, { props: { email: 'test@example.com' } });
		const className2 = (c2.firstElementChild as HTMLElement).className;
		expect(className1).toBe(className2);
	});

	it('accepts additional className', () => {
		const { container } = render(Avatar, { props: { name: 'Test', class: 'extra' } });
		const div = container.firstElementChild as HTMLElement;
		expect(div.className).toContain('extra');
	});
});
