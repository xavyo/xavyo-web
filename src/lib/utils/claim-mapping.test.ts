import { describe, it, expect } from 'vitest';
import { parseClaimMapping, parseClaimMappingJson } from './claim-mapping';
import { JsonObjectError } from './json-record';

describe('parseClaimMapping', () => {
	it('accepts the advertised flat source→target map', () => {
		const mapping = parseClaimMapping({
			email: 'email',
			given_name: 'first_name',
			family_name: 'last_name',
			picture: 'avatar_url'
		});
		expect(mapping.mappings).toEqual(
			expect.arrayContaining([
				{ source: 'email', target: 'email' },
				{ source: 'given_name', target: 'first_name' },
				{ source: 'family_name', target: 'last_name' },
				{ source: 'picture', target: 'avatar_url' }
			])
		);
	});

	it('accepts canonical {mappings:[{source,target}]} from the API', () => {
		const mapping = parseClaimMapping({
			mappings: [
				{ source: 'email', target: 'email', required: true },
				{ source: 'name', target: 'display_name' }
			],
			name_id: { source: 'sub', format: 'persistent' }
		});
		expect(mapping.mappings).toHaveLength(2);
		expect(mapping.mappings[0]).toMatchObject({
			source: 'email',
			target: 'email',
			required: true
		});
		expect(mapping.name_id).toEqual({ source: 'sub', format: 'persistent' });
	});

	it('rejects arrays and non-objects', () => {
		expect(() => parseClaimMapping([])).toThrow(JsonObjectError);
		expect(() => parseClaimMapping('email')).toThrow(JsonObjectError);
		expect(() => parseClaimMapping(null)).toThrow(JsonObjectError);
	});
});

describe('parseClaimMappingJson', () => {
	it('round-trips the GET IdP claim_mapping payload', () => {
		const json = JSON.stringify(
			{
				mappings: [{ source: 'given_name', target: 'first_name' }],
				name_id: { source: 'sub' }
			},
			null,
			2
		);
		const mapping = parseClaimMappingJson(json);
		expect(mapping.mappings).toEqual([{ source: 'given_name', target: 'first_name' }]);
		expect(mapping.name_id).toEqual({ source: 'sub' });
	});

	it('parses the admin form placeholder JSON', () => {
		const mapping = parseClaimMappingJson(
			'{"email":"email","name":"display_name","given_name":"first_name","family_name":"last_name","picture":"avatar_url"}'
		);
		expect(mapping.mappings.map((m) => m.source).sort()).toEqual([
			'email',
			'family_name',
			'given_name',
			'name',
			'picture'
		]);
	});
});
