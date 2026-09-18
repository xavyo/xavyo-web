import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(process.cwd(), 'src/routes/(app)/groups');

function read(rel: string): string {
	return readFileSync(resolve(dir, rel), 'utf-8');
}

describe('groups list navigation', () => {
	const listPage = read('+page.svelte');

	it('renders a clickable link to the group detail in the Name column', () => {
		// Regression: rows were not clickable; the only detail links lived in an
		// sr-only (visually hidden) block, so an admin could not open a group.
		expect(listPage).toContain('GroupNameLink');
		expect(listPage).toContain('/groups/${info.row.original.id}');
	});

	it('no longer hides detail links in an sr-only block', () => {
		expect(listPage).not.toContain('sr-only');
	});
});

describe('group detail member management', () => {
	const detailPage = read('[id]/+page.svelte');

	it('uses a user search picker instead of a raw UUID input', () => {
		// Regression: adding members required pasting raw user UUIDs.
		expect(detailPage).toContain('MemberPicker');
		expect(detailPage).not.toContain('User IDs (comma-separated)');
	});

	it('member picker still submits member_ids to the existing add action', () => {
		const picker = read('[id]/member-picker.svelte');
		expect(picker).toContain('name="member_ids"');
		expect(picker).toContain('/api/users?');
	});
});
