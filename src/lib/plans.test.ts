import { describe, it, expect } from 'vitest';
import { parsePlanTier, planAllows, minTierFor, planDisplayName } from './plans';

describe('plans', () => {
	it('defaults unknown plan strings to free', () => {
		expect(parsePlanTier(undefined)).toBe('free');
		expect(parsePlanTier('hobby')).toBe('free');
		expect(parsePlanTier('professional')).toBe('professional');
	});

	it('gates LDAP at starter+', () => {
		expect(planAllows('free', 'ldap_connector')).toBe(false);
		expect(planAllows('starter', 'ldap_connector')).toBe(true);
		expect(minTierFor('ldap_connector')).toBe('starter');
	});

	it('gates SCIM / SAML / IGA at professional+', () => {
		expect(planAllows('starter', 'scim_inbound')).toBe(false);
		expect(planAllows('professional', 'scim_inbound')).toBe(true);
		expect(planAllows('free', 'saml_idp')).toBe(false);
		expect(planAllows('enterprise', 'iga')).toBe(true);
	});

	it('labels tiers for UI', () => {
		expect(planDisplayName('free')).toBe('Free');
		expect(planDisplayName('enterprise')).toBe('Enterprise');
	});
});
