import { error } from '@sveltejs/kit';
import type { SpGroupConfig } from '$lib/api/types';

export type GroupConfigFields = {
	group_config?: SpGroupConfig;
	group_attribute_name?: string;
	group_value_format?: string;
	group_filter?: Record<string, unknown>;
	include_groups?: boolean;
	omit_empty_groups?: boolean;
	group_dn_base?: string;
};

const GROUP_VALUE_FORMATS = new Set(['name', 'id', 'dn']);

function requireObject(value: unknown, field: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		error(400, `${field} must be an object`);
	}
	return value as Record<string, unknown>;
}

function parseGroupConfig(value: unknown): SpGroupConfig {
	const obj = requireObject(value, 'group_config');
	if (typeof obj.attribute_name !== 'string' || obj.attribute_name.length === 0) {
		error(400, 'group_config.attribute_name must be a non-empty string');
	}
	if (typeof obj.value_format !== 'string' || !GROUP_VALUE_FORMATS.has(obj.value_format)) {
		error(400, 'group_config.value_format must be one of: name, id, dn');
	}
	if (typeof obj.include_groups !== 'boolean') {
		error(400, 'group_config.include_groups must be a boolean');
	}
	if (typeof obj.omit_empty_groups !== 'boolean') {
		error(400, 'group_config.omit_empty_groups must be a boolean');
	}
	if (obj.dn_base !== undefined && obj.dn_base !== null && typeof obj.dn_base !== 'string') {
		error(400, 'group_config.dn_base must be a string');
	}
	let filter: SpGroupConfig['filter'];
	if (obj.filter === undefined || obj.filter === null) {
		filter = obj.filter ?? null;
	} else {
		filter = requireObject(obj.filter, 'group_config.filter') as SpGroupConfig['filter'];
	}
	return {
		attribute_name: obj.attribute_name,
		value_format: obj.value_format,
		include_groups: obj.include_groups,
		omit_empty_groups: obj.omit_empty_groups,
		dn_base: typeof obj.dn_base === 'string' ? obj.dn_base : obj.dn_base ?? null,
		filter
	};
}

/** Copy advertised F-039 group-config fields from a BFF JSON body. */
export function applyGroupConfigFields(
	body: Record<string, unknown>,
	data: GroupConfigFields
): void {
	if (body.group_config !== undefined) {
		data.group_config = parseGroupConfig(body.group_config);
	}
	if (body.group_attribute_name !== undefined) {
		if (typeof body.group_attribute_name !== 'string') {
			error(400, 'group_attribute_name must be a string');
		}
		data.group_attribute_name = body.group_attribute_name;
	}
	if (body.group_value_format !== undefined) {
		if (
			typeof body.group_value_format !== 'string' ||
			!GROUP_VALUE_FORMATS.has(body.group_value_format)
		) {
			error(400, 'group_value_format must be one of: name, id, dn');
		}
		data.group_value_format = body.group_value_format;
	}
	if (body.group_filter !== undefined) {
		if (body.group_filter === null) {
			error(400, 'group_filter must be an object');
		}
		data.group_filter = requireObject(body.group_filter, 'group_filter');
	}
	if (body.include_groups !== undefined) {
		if (typeof body.include_groups !== 'boolean') {
			error(400, 'include_groups must be a boolean');
		}
		data.include_groups = body.include_groups;
	}
	if (body.omit_empty_groups !== undefined) {
		if (typeof body.omit_empty_groups !== 'boolean') {
			error(400, 'omit_empty_groups must be a boolean');
		}
		data.omit_empty_groups = body.omit_empty_groups;
	}
	if (body.group_dn_base !== undefined) {
		if (typeof body.group_dn_base !== 'string') {
			error(400, 'group_dn_base must be a string');
		}
		data.group_dn_base = body.group_dn_base;
	}
}
