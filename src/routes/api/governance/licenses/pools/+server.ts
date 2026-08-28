import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listLicensePools, createLicensePool } from '$lib/api/licenses';
import type {
	CreateLicensePoolRequest,
	LicenseBillingPeriod,
	LicenseExpirationPolicy,
	LicenseType
} from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

const BILLING_PERIODS = ['monthly', 'annual', 'perpetual'] as const;
const LICENSE_TYPES = ['named', 'concurrent'] as const;
const EXPIRATION_POLICIES = ['block_new', 'revoke_all', 'warn_only'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const params: Record<string, string | number> = {};
		const vendor = url.searchParams.get('vendor');
		const license_type = url.searchParams.get('license_type');
		const status = url.searchParams.get('status');
		const { limit, offset } = listPagination(url);

		if (vendor) params.vendor = vendor;
		if (license_type) params.license_type = license_type;
		if (status) params.status = status;
		if (limit != null) params.limit = limit;
		if (offset != null) params.offset = offset;

		const result = await listLicensePools(params, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to list license pools' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
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
		if (typeof body.name !== 'string' || body.name.length === 0) {
			return json({ error: 'name is required' }, { status: 400 });
		}
		if (typeof body.vendor !== 'string' || body.vendor.length === 0) {
			return json({ error: 'vendor is required' }, { status: 400 });
		}
		if (typeof body.total_capacity !== 'number') {
			return json({ error: 'total_capacity is required' }, { status: 400 });
		}
		if (!BILLING_PERIODS.includes(body.billing_period as (typeof BILLING_PERIODS)[number])) {
			return json({ error: 'billing_period is required' }, { status: 400 });
		}
		const data: CreateLicensePoolRequest = {
			name: body.name,
			vendor: body.vendor,
			total_capacity: body.total_capacity,
			billing_period: body.billing_period as LicenseBillingPeriod
		};
		if (body.description !== undefined) {
			if (typeof body.description !== 'string') {
				return json({ error: 'description must be a string' }, { status: 400 });
			}
			data.description = body.description;
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
		if (body.license_type !== undefined) {
			if (!LICENSE_TYPES.includes(body.license_type as (typeof LICENSE_TYPES)[number])) {
				return json({ error: 'license_type is required' }, { status: 400 });
			}
			data.license_type = body.license_type as LicenseType;
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
		const result = await createLicensePool(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Failed to create license pool' }, { status: 500 });
	}
};
