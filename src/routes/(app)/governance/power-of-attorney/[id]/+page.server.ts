import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { revokePoaSchema, extendPoaSchema } from '$lib/schemas/power-of-attorney';
import {
	getPoa,
	revokePoa,
	extendPoa,
	assumeIdentity,
	getPoaAudit
} from '$lib/api/power-of-attorney';
import { listUsers } from '$lib/api/users';
import { ApiError } from '$lib/api/client';
import type { PoaGrant, PoaAuditListResponse } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let poa: PoaGrant;
	try {
		poa = await getPoa(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load Power of Attorney');
	}

	let audit: PoaAuditListResponse = { items: [], total: 0, limit: 20, offset: 0 };
	let userNameMap: Record<string, string> = {};
	try {
		const [auditResult, usersResult] = await Promise.all([
			getPoaAudit(params.id, { limit: 50 }, locals.accessToken!, locals.tenantId!, fetch),
			listUsers({ limit: 200, offset: 0 }, locals.accessToken!, locals.tenantId!, fetch)
		]);
		audit = auditResult;
		for (const u of usersResult.users ?? []) {
			userNameMap[u.id] = (u as any).display_name ?? u.email;
		}
	} catch {
		// Audit/users may fail — non-critical
	}

	const revokeForm = await superValidate(zod(revokePoaSchema));
	const extendForm = await superValidate(
		{ new_ends_at: '' },
		zod(extendPoaSchema),
		{ id: 'extend' }
	);

	const currentUserId = locals.user?.id;
	const isGrantor = poa.donor_id === currentUserId;
	const isGrantee = poa.attorney_id === currentUserId;

	return { poa, audit, revokeForm, extendForm, isGrantor, isGrantee, currentUserId, userNameMap };
};

export const actions: Actions = {
	revoke: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(revokePoaSchema));
		if (!form.valid) return fail(400, { revokeForm: form });

		try {
			await revokePoa(params.id, { reason: form.data.reason }, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to revoke', { status: 500 });
		}

		redirect(302, '/governance/power-of-attorney');
	},

	extend: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(extendPoaSchema), { id: 'extend' });
		if (!form.valid) return fail(400, { extendForm: form });

		try {
			await extendPoa(
				params.id,
				{ new_ends_at: new Date(form.data.new_ends_at).toISOString() },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'Failed to extend', { status: 500 });
		}

		redirect(302, `/governance/power-of-attorney/${params.id}`);
	},

	assume: async ({ params, locals, fetch, cookies }) => {
		try {
			const result = await assumeIdentity(params.id, locals.accessToken!, locals.tenantId!, fetch);
			// Store original token for restoration on drop
			cookies.set('original_access_token', locals.accessToken!, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 4 // 4 hours max
			});
			// Swap to assumed identity token
			cookies.set('access_token', result.access_token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 4
			});
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to assume identity' });
		}

		redirect(302, '/dashboard');
	}
};
