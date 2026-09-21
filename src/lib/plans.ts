/**
 * Plan tiers and feature gates — mirrors `PlanFeature` / `PlanTier` in
 * `xavyo-db` (API PR #144). Free is for IAM/OIDC + mail; paid unlocks
 * LDAP, SCIM inbound, SAML IdP, and IGA create.
 */

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export type PlanFeature = 'ldap_connector' | 'scim_inbound' | 'saml_idp' | 'iga';

const TIER_RANK: Record<PlanTier, number> = {
	free: 0,
	starter: 1,
	professional: 2,
	enterprise: 3
};

const FEATURE_MIN_TIER: Record<PlanFeature, PlanTier> = {
	ldap_connector: 'starter',
	scim_inbound: 'professional',
	saml_idp: 'professional',
	iga: 'professional'
};

export function parsePlanTier(raw: unknown): PlanTier {
	if (raw === 'starter' || raw === 'professional' || raw === 'enterprise' || raw === 'free') {
		return raw;
	}
	return 'free';
}

export function planAllows(plan: PlanTier, feature: PlanFeature): boolean {
	return TIER_RANK[plan] >= TIER_RANK[FEATURE_MIN_TIER[feature]];
}

export function minTierFor(feature: PlanFeature): PlanTier {
	return FEATURE_MIN_TIER[feature];
}

export function planDisplayName(plan: PlanTier): string {
	switch (plan) {
		case 'free':
			return 'Free';
		case 'starter':
			return 'Starter';
		case 'professional':
			return 'Professional';
		case 'enterprise':
			return 'Enterprise';
	}
}
