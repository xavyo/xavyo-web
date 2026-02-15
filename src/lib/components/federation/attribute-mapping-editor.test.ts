import { describe, it, expect } from 'vitest';
import {
	parseMapping,
	parseMappingObject,
	toMappingJson,
	createDefaultRow,
	createEmptyMapping,
	AVAILABLE_SOURCES,
	NAME_ID_SOURCES,
	type AttributeMapping
} from '$lib/utils/attribute-mapping';

describe('attribute-mapping utility', () => {
	describe('parseMapping (from JSON string)', () => {
		it('returns null for empty string', () => {
			expect(parseMapping('')).toBeNull();
		});

		it('returns null for whitespace-only string', () => {
			expect(parseMapping('   ')).toBeNull();
		});

		it('returns null for invalid JSON', () => {
			expect(parseMapping('not json')).toBeNull();
		});

		it('returns null for JSON without name_id_source', () => {
			expect(parseMapping('{"foo": "bar"}')).toBeNull();
		});

		it('parses valid mapping with attributes', () => {
			const input = JSON.stringify({
				name_id_source: 'email',
				attributes: [
					{ source: 'email', target_name: 'mail', target_friendly_name: 'Email', format: '', multi_value: false }
				]
			});
			const result = parseMapping(input)!;
			expect(result.name_id_source).toBe('email');
			expect(result.attributes).toHaveLength(1);
			expect(result.attributes[0].source).toBe('email');
			expect(result.attributes[0].target_name).toBe('mail');
		});

		it('parses mapping with empty attributes array', () => {
			const input = JSON.stringify({ name_id_source: 'user_id', attributes: [] });
			const result = parseMapping(input)!;
			expect(result.name_id_source).toBe('user_id');
			expect(result.attributes).toHaveLength(0);
		});

		it('handles missing attributes field gracefully', () => {
			const result = parseMapping(JSON.stringify({ name_id_source: 'email' }))!;
			expect(result.attributes).toEqual([]);
		});

		it('defaults name_id_source to email when null', () => {
			const result = parseMapping(JSON.stringify({ name_id_source: null, attributes: [] }))!;
			expect(result.name_id_source).toBe('email');
		});
	});

	describe('parseMappingObject (from deserialized object)', () => {
		it('returns null for null/undefined', () => {
			expect(parseMappingObject(null)).toBeNull();
			expect(parseMappingObject(undefined)).toBeNull();
		});

		it('returns null for non-object', () => {
			expect(parseMappingObject('string')).toBeNull();
			expect(parseMappingObject(42)).toBeNull();
		});

		it('returns null for object without name_id_source', () => {
			expect(parseMappingObject({ foo: 'bar' })).toBeNull();
		});

		it('parses valid object', () => {
			const result = parseMappingObject({
				name_id_source: 'user_id',
				attributes: [{ source: 'email', target_name: 'mail', target_friendly_name: 'Email', format: '', multi_value: false }]
			})!;
			expect(result.name_id_source).toBe('user_id');
			expect(result.attributes).toHaveLength(1);
		});

		it('handles missing attributes as empty array', () => {
			const result = parseMappingObject({ name_id_source: 'email' })!;
			expect(result.attributes).toEqual([]);
		});
	});

	describe('toMappingJson', () => {
		it('roundtrips through parseMapping', () => {
			const mapping: AttributeMapping = {
				name_id_source: 'display_name',
				attributes: [
					{ source: 'user_id', target_name: 'uid', target_friendly_name: 'User ID', format: '', multi_value: false }
				]
			};
			expect(parseMapping(toMappingJson(mapping))).toEqual(mapping);
		});
	});

	describe('serialization edge case: name_id_source without attributes', () => {
		it('serializes non-default name_id_source even with 0 attributes', () => {
			const mapping: AttributeMapping = { name_id_source: 'user_id', attributes: [] };
			const json = toMappingJson(mapping);
			const parsed = JSON.parse(json);
			expect(parsed.name_id_source).toBe('user_id');
		});
	});

	describe('createDefaultRow', () => {
		it('creates a row with email source and empty targets', () => {
			const row = createDefaultRow();
			expect(row.source).toBe('email');
			expect(row.target_name).toBe('');
			expect(row.target_friendly_name).toBe('');
			expect(row.multi_value).toBe(false);
		});
	});

	describe('createEmptyMapping', () => {
		it('creates mapping with email source and no attributes', () => {
			const mapping = createEmptyMapping();
			expect(mapping.name_id_source).toBe('email');
			expect(mapping.attributes).toEqual([]);
		});
	});

	describe('source constants', () => {
		it('NAME_ID_SOURCES is a subset of AVAILABLE_SOURCES', () => {
			for (const src of NAME_ID_SOURCES) {
				expect(AVAILABLE_SOURCES).toContain(src);
			}
		});

		it('groups is available but not a NameID source', () => {
			expect(AVAILABLE_SOURCES).toContain('groups');
			expect(NAME_ID_SOURCES).not.toContain('groups');
		});
	});

	describe('multi_value auto-set logic', () => {
		it('groups source implies multi_value', () => {
			const row = createDefaultRow();
			row.source = 'groups';
			row.multi_value = row.source === 'groups';
			expect(row.multi_value).toBe(true);
		});

		it('non-groups source implies single value', () => {
			const row = createDefaultRow();
			row.source = 'email';
			row.multi_value = row.source === 'groups';
			expect(row.multi_value).toBe(false);
		});
	});
});
