import type { Actions, PageServerLoad } from './$types';
import { getNhiRequest, approveNhiRequest, rejectNhiRequest, cancelNhiRequest } from '$lib/api/nhi-requests';
import { hasAdminRole } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import { isRedirect, isHttpError } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ locals, params, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) throw error(401, 'Unauthorized');
	try {
		const request = await getNhiRequest(params.id, locals.accessToken, locals.tenantId, fetch);
		return {
			request,
			isAdmin: hasAdminRole(locals.user?.roles),
			currentUserId: locals.user?.id
		};
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.message);
		throw error(500, 'Failed to load request');
	}
};

export const actions: Actions = {
	approve: async ({ locals, params, request, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) throw error(401);
		if (!hasAdminRole(locals.user?.roles)) throw error(403);
		try {
			const formData = await request.formData();
			const comments = formData.get('comments')?.toString() || undefined;
			await approveNhiRequest(params.id, { comments }, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/nhi/requests/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) throw error(e.status, e.message);
			throw error(500, 'Failed to approve');
		}
	},
	reject: async ({ locals, params, request, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) throw error(401);
		if (!hasAdminRole(locals.user?.roles)) throw error(403);
		try {
			const formData = await request.formData();
			const reason = formData.get('reason')?.toString() || '';
			await rejectNhiRequest(params.id, { reason }, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/nhi/requests/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) throw error(e.status, e.message);
			throw error(500, 'Failed to reject');
		}
	},
	cancel: async ({ locals, params, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) throw error(401);
		try {
			await cancelNhiRequest(params.id, locals.accessToken, locals.tenantId, fetch);
			redirect(303, `/nhi/requests/${params.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) throw error(e.status, e.message);
			throw error(500, 'Failed to cancel');
		}
	}
};
