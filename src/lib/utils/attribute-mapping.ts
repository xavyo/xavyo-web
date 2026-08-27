export interface AttributeRow {
	source: string;
	target_name: string;
	target_friendly_name: string;
	format: string;
	multi_value: boolean;
}

export interface AttributeMapping {
	name_id_source: string;
	attributes: AttributeRow[];
}

export const AVAILABLE_SOURCES = ['email', 'user_id', 'display_name', 'tenant_id', 'groups'] as const;
export const NAME_ID_SOURCES = ['email', 'user_id', 'display_name'] as const;

function isNameIdSource(value: unknown): value is (typeof NAME_ID_SOURCES)[number] {
	return typeof value === 'string' && (NAME_ID_SOURCES as readonly string[]).includes(value);
}

function parseAttributes(value: unknown): AttributeRow[] | null {
	if (value === undefined) return [];
	if (!Array.isArray(value)) return null;
	return value as AttributeRow[];
}

export function parseMapping(json: string): AttributeMapping | null {
	if (!json || json.trim() === '') return null;
	try {
		const parsed = JSON.parse(json);
		if (!parsed || typeof parsed !== 'object' || !('name_id_source' in parsed)) {
			return null;
		}
		if (!isNameIdSource(parsed.name_id_source)) return null;
		const attributes = parseAttributes(parsed.attributes);
		if (attributes === null) return null;
		return {
			name_id_source: parsed.name_id_source,
			attributes
		};
	} catch {
		return null;
	}
}

/**
 * Parse an already-deserialized attribute mapping object (e.g. from the backend API).
 * Returns null if the shape doesn't match.
 */
export function parseMappingObject(raw: unknown): AttributeMapping | null {
	if (!raw || typeof raw !== 'object') return null;
	const obj = raw as Record<string, unknown>;
	if (!isNameIdSource(obj.name_id_source)) return null;
	const attributes = parseAttributes(obj.attributes);
	if (attributes === null) return null;
	return {
		name_id_source: obj.name_id_source,
		attributes
	};
}

export function toMappingJson(mapping: AttributeMapping): string {
	return JSON.stringify(mapping, null, 2);
}

export function createDefaultRow(): AttributeRow {
	return { source: 'email', target_name: '', target_friendly_name: '', format: '', multi_value: false };
}

export function createEmptyMapping(): AttributeMapping {
	return { name_id_source: 'email', attributes: [] };
}
