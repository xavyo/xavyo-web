import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listInvitations, resendInvitation, cancelInvitation } from '$lib/api/invitations';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const status = url.searchParams.get('status') ?? undefined;
	const email = url.searchParams.get('email') ?? undefined;
	const { limit = 20, offset = 0 } = listPagination(url);

	try {
		const result = await listInvitations(
			{ status, email, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return { invitations: result.invitations, total: result.total, limit, offset, status, email };
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load invitations');
	}
};

export const actions: Actions = {
	resend: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return { success: false, error: 'Missing invitation ID' };

		try {
			await resendInvitation(id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'resend' };
		} catch (e) {
			if (e instanceof ApiError) {
				return { success: false, error: e.message };
			}
			return { success: false, error: 'Failed to resend invitation' };
		}
	},
	cancel: async ({ request, locals, fetch }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		if (!id) return { success: false, error: 'Missing invitation ID' };

		try {
			await cancelInvitation(id, locals.accessToken!, locals.tenantId!, fetch);
			return { success: true, action: 'cancel' };
		} catch (e) {
			if (e instanceof ApiError) {
				return { success: false, error: e.message };
			}
			return { success: false, error: 'Failed to cancel invitation' };
		}
	}
};
