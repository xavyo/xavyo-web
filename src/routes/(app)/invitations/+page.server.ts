import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listInvitations, resendInvitation, cancelInvitation } from '$lib/api/invitations';
import { resendVerification } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import { currentUserEmailVerified } from '$lib/server/email-verified';

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const status = url.searchParams.get('status') ?? undefined;
	const email = url.searchParams.get('email') ?? undefined;
	const { limit = 20, offset = 0 } = listPagination(url);
	const { emailVerified, email: profileEmail } = await currentUserEmailVerified(locals, fetch);

	if (!emailVerified) {
		return {
			invitations: [],
			total: 0,
			limit,
			offset,
			status,
			email,
			emailVerified: false,
			profileEmail
		};
	}

	try {
		const result = await listInvitations(
			{ status, email, limit, offset },
			locals.accessToken!,
			locals.tenantId!,
			fetch
		);
		return {
			invitations: result.invitations,
			total: result.total,
			limit,
			offset,
			status,
			email,
			emailVerified: true,
			profileEmail
		};
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load invitations');
	}
};

export const actions: Actions = {
	resend: async ({ request, locals, fetch }) => {
		const { emailVerified } = await currentUserEmailVerified(locals, fetch);
		if (!emailVerified) {
			return { success: false, error: 'Confirm your email before inviting others' };
		}

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
	},
	resendVerification: async ({ locals, fetch }) => {
		const email = locals.user?.email;
		if (!email) return { success: false, error: 'Missing email', action: 'resendVerification' };

		try {
			await resendVerification(email, locals.tenantId ?? undefined, fetch);
			return { success: true, action: 'resendVerification' };
		} catch {
			// Same as /check-email: do not leak whether the mail was sent.
			return { success: true, action: 'resendVerification' };
		}
	}
};
