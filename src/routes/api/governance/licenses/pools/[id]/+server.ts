import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLicensePool, updateLicensePool, deleteLicensePool } from '$lib/api/licenses';
import type {
	LicenseBillingPeriod,
	LicenseExpirationPolicy,
	UpdateLicensePoolRequest
} from '$lib/api/types';
import { ApiError } from '$lib/api/client';

const BILLING_PERIODS = ['monthly', 'annual', 'perpetual'] as const;
const EXPIRATION_POLICIES = ['block_new', 'revoke_all', 'warn_only'] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await getLicensePool(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to get license pool' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		let parsed: unknown;
		try {
			parsed = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}
		const body = parsed as Record<string, unknown>;
		const data: UpdateLicensePoolRequest = {};
		if (body.name !== undefined) {
			if (typeof body.name !== 'string' || body.name.length === 0) {
				return json({ error: 'name must be a non-empty string' }, { status: 400 });
			}
			data.name = body.name;
		}
		if (body.vendor !== undefined) {
			if (typeof body.vendor !== 'string' || body.vendor.length === 0) {
				return json({ error: 'vendor must be a non-empty string' }, { status: 400 });
			}
			data.vendor = body.vendor;
		}
		if (body.description !== undefined) {
			if (typeof body.description !== 'string') {
				return json({ error: 'description must be a string' }, { status: 400 });
			}
			data.description = body.description;
		}
		if (body.total_capacity !== undefined) {
			if (typeof body.total_capacity !== 'number') {
				return json({ error: 'total_capacity must be a number' }, { status: 400 });
			}
			data.total_capacity = body.total_capacity;
		}
		if (body.cost_per_license !== undefined) {
			if (typeof body.cost_per_license !== 'number') {
				return json({ error: 'cost_per_license must be a number' }, { status: 400 });
			}
			data.cost_per_license = body.cost_per_license;
		}
		if (body.currency !== undefined) {
			if (typeof body.currency !== 'string') {
				return json({ error: 'currency must be a string' }, { status: 400 });
			}
			data.currency = body.currency;
		}
		if (body.billing_period !== undefined) {
			if (!BILLING_PERIODS.includes(body.billing_period as (typeof BILLING_PERIODS)[number])) {
				return json({ error: 'billing_period is required' }, { status: 400 });
			}
			data.billing_period = body.billing_period as LicenseBillingPeriod;
		}
		if (body.expiration_date !== undefined) {
			if (typeof body.expiration_date !== 'string') {
				return json({ error: 'expiration_date must be a string' }, { status: 400 });
			}
			data.expiration_date = body.expiration_date;
		}
		if (body.expiration_policy !== undefined) {
			if (
				!EXPIRATION_POLICIES.includes(body.expiration_policy as (typeof EXPIRATION_POLICIES)[number])
			) {
				return json({ error: 'expiration_policy is required' }, { status: 400 });
			}
			data.expiration_policy = body.expiration_policy as LicenseExpirationPolicy;
		}
		if (body.warning_days !== undefined) {
			if (typeof body.warning_days !== 'number') {
				return json({ error: 'warning_days must be a number' }, { status: 400 });
			}
			data.warning_days = body.warning_days;
		}
		const result = await updateLicensePool(
			params.id,
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to update license pool' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		await deleteLicensePool(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to delete license pool' }, { status: 500 });
	}
};
