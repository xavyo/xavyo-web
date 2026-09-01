import { JsonObjectError } from './json-record';
import type { ClaimMappingConfig, ClaimMappingEntry, NameIdConfig } from '$lib/api/types';

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseEntry(value: unknown): ClaimMappingEntry {
	if (!isRecord(value) || typeof value.source !== 'string' || typeof value.target !== 'string') {
		throw new JsonObjectError('claim_mapping mappings must be {source, target} objects');
	}
	if (value.source.length === 0 || value.target.length === 0) {
		throw new JsonObjectError('claim_mapping source and target cannot be empty');
	}
	const entry: ClaimMappingEntry = { source: value.source, target: value.target };
	if (typeof value.required === 'boolean') entry.required = value.required;
	if (typeof value.default === 'string') entry.default = value.default;
	if (typeof value.transform === 'string') entry.transform = value.transform;
	if (isRecord(value.group_mapping)) {
		const group_mapping: Record<string, string> = {};
		for (const [k, v] of Object.entries(value.group_mapping)) {
			if (typeof v !== 'string') {
				throw new JsonObjectError('claim_mapping group_mapping values must be strings');
			}
			group_mapping[k] = v;
		}
		entry.group_mapping = group_mapping;
	}
	return entry;
}

function parseNameId(value: unknown): NameIdConfig | undefined {
	if (value == null) return undefined;
	if (!isRecord(value) || typeof value.source !== 'string' || value.source.length === 0) {
		throw new JsonObjectError('claim_mapping name_id must be {source, format?}');
	}
	const name_id: NameIdConfig = { source: value.source };
	if (typeof value.format === 'string') name_id.format = value.format;
	return name_id;
}

/**
 * Parse advertised claim mapping: canonical `{mappings:[{source,target}]}`
 * or the admin-form flat map `{email:"email", given_name:"first_name"}`.
 */
export function parseClaimMapping(value: unknown): ClaimMappingConfig {
	if (!isRecord(value)) {
		throw new JsonObjectError('claim_mapping must be a JSON object');
	}
	if (Array.isArray(value.mappings)) {
		const mappings = value.mappings.map(parseEntry);
		const name_id = parseNameId(value.name_id);
		return name_id ? { mappings, name_id } : { mappings };
	}
	const mappings: ClaimMappingEntry[] = [];
	for (const [source, target] of Object.entries(value)) {
		if (typeof target !== 'string') {
			throw new JsonObjectError(`claim_mapping value for '${source}' must be a string`);
		}
		if (source.length === 0 || target.length === 0) {
			throw new JsonObjectError('claim_mapping source and target cannot be empty');
		}
		mappings.push({ source, target });
	}
	return { mappings };
}

/** Parse claim mapping JSON from the IdP form textarea. */
export function parseClaimMappingJson(text: string): ClaimMappingConfig {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new JsonObjectError('claim_mapping must be valid JSON');
	}
	return parseClaimMapping(parsed);
}
