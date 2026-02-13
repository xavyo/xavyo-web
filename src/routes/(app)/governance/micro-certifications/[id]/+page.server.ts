import type { Actions, PageServerLoad } from './$types';
import type { CertificationEvent } from '$lib/api/types';
import { error, fail } from '@sveltejs/kit';
import {
	getMicroCertification,
	getMicroCertificationEvents,
	decideMicroCertification,
	delegateMicroCertification,
	skipMicroCertification
} from '$lib/api/micro-certifications';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let certification;
	let events: { items: CertificationEvent[]; total: number } = { items: [], total: 0 };

	try {
		certification = await getMicroCertification(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load certification');
	}

	try {
		events = await getMicroCertificationEvents(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch {
		// Non-critical
	}

	return { certification, events };
};

export const actions: Actions = {
	decide: async ({ params, request, locals, fetch }) => {
		const formData = await request.formData();
		const decision = formData.get('decision') as 'approve' | 'revoke' | 'reduce';
		const comment = formData.get('comment') as string;

		if (!decision || !['approve', 'revoke', 'reduce'].includes(decision)) {
			return fail(400, { error: 'Invalid decision' });
		}

		if (decision === 'revoke' && !comment?.trim()) {
			return fail(400, { error: 'Comment is required for revoke decisions' });
		}

		try {
			await decideMicroCertification(
				params.id,
				{ decision, comment: comment?.trim() || undefined },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to submit decision' });
		}

		return { success: true, action: decision };
	},

	delegate: async ({ params, request, locals, fetch }) => {
		const formData = await request.formData();
		const delegate_to = formData.get('delegate_to') as string;
		const comment = formData.get('comment') as string;

		if (!delegate_to?.trim()) {
			return fail(400, { error: 'Delegate to reviewer ID is required' });
		}

		try {
			await delegateMicroCertification(
				params.id,
				{ delegate_to: delegate_to.trim(), comment: comment?.trim() || undefined },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to delegate certification' });
		}

		return { success: true, action: 'delegated' };
	},

	skip: async ({ params, request, locals, fetch }) => {
		const formData = await request.formData();
		const reason = formData.get('reason') as string;

		if (!reason?.trim() || reason.trim().length < 10) {
			return fail(400, { error: 'Reason must be at least 10 characters' });
		}

		try {
			await skipMicroCertification(
				params.id,
				{ reason: reason.trim() },
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'Failed to skip certification' });
		}

		return { success: true, action: 'skipped' };
	}
};
