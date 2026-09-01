import { describe, it, expect } from 'vitest';
import { applyGroupConfigFields, type GroupConfigFields } from './sp-group-fields';

describe('applyGroupConfigFields', () => {
	it('copies flat group config fields', () => {
		const data: GroupConfigFields = {};
		applyGroupConfigFields(
			{
				group_attribute_name: 'Roles',
				group_value_format: 'id',
				include_groups: false,
				omit_empty_groups: false,
				group_dn_base: 'ou=Groups,dc=example,dc=com',
				group_filter: { filter_type: 'allowlist', allowlist: ['admins'] }
			},
			data
		);
		expect(data).toEqual({
			group_attribute_name: 'Roles',
			group_value_format: 'id',
			include_groups: false,
			omit_empty_groups: false,
			group_dn_base: 'ou=Groups,dc=example,dc=com',
			group_filter: { filter_type: 'allowlist', allowlist: ['admins'] }
		});
	});

	it('copies nested group_config', () => {
		const data: GroupConfigFields = {};
		applyGroupConfigFields(
			{
				group_config: {
					attribute_name: 'memberOf',
					value_format: 'dn',
					include_groups: true,
					omit_empty_groups: true,
					dn_base: 'ou=Groups,dc=example,dc=com',
					filter: { filter_type: 'pattern', patterns: ['app-*'] }
				}
			},
			data
		);
		expect(data.group_config?.attribute_name).toBe('memberOf');
		expect(data.group_config?.value_format).toBe('dn');
		expect(data.group_config?.filter).toEqual({
			filter_type: 'pattern',
			patterns: ['app-*']
		});
	});

	it('rejects unknown group_value_format', () => {
		expect(() => applyGroupConfigFields({ group_value_format: 'uuid' }, {})).toThrow();
	});
});
