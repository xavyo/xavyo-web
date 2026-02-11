import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { updateAgentSchema, issueCredentialSchema, suspendNhiSchema } from '$lib/schemas/nhi';
import {
	getAgent,
	updateAgent,
	deleteAgent,
	activateNhi,
	suspendNhi,
	reactivateNhi,
	deprecateNhi,
	archiveNhi,
	listCredentials,
	issueCredential,
	rotateCredential,
	revokeCredential
} from '$lib/api/nhi';
import { ApiError } from '$lib/api/client';
import type { UpdateAgentRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	const nhi = await getAgent(params.id, locals.accessToken!, locals.tenantId!, fetch);
	const credentials = await listCredentials(params.id, locals.accessToken!, locals.tenantId!, fetch);

	const form = await superValidate(
		{
			name: nhi.name,
			description: nhi.description ?? undefined,
			agent_type: nhi.agent?.agent_type ?? undefined,
			model_provider: nhi.agent?.model_provider ?? undefined,
			model_name: nhi.agent?.model_name ?? undefined,
			model_version: nhi.agent?.model_version ?? undefined,
			max_token_lifetime_secs: nhi.agent?.max_token_lifetime_secs ?? undefined,
			requires_human_approval: nhi.agent?.requires_human_approval ?? false
		},
		zod(updateAgentSchema)
	);

	return { nhi, credentials, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateAgentSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const body: UpdateAgentRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined,
			agent_type: form.data.agent_type || undefined,
			model_provider: form.data.model_provider || undefined,
			model_name: form.data.model_name || undefined,
			model_version: form.data.model_version || undefined,
			max_token_lifetime_secs: form.data.max_token_lifetime_secs || undefined,
			requires_human_approval: form.data.requires_human_approval
		};

		try {
			await updateAgent(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Agent updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteAgent(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}

		redirect(302, '/nhi');
	},

	activate: async ({ params, locals, fetch }) => {
		try {
			await activateNhi(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'activated' };
	},

	suspend: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const rawReason = formData.get('reason')?.toString() || undefined;
		const parsed = suspendNhiSchema.safeParse({ reason: rawReason });
		if (!parsed.success) {
			return fail(400, { error: 'Invalid reason' });
		}
		const reason = parsed.data.reason;
		try {
			await suspendNhi(params.id, reason, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'suspended' };
	},

	reactivate: async ({ params, locals, fetch }) => {
		try {
			await reactivateNhi(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'reactivated' };
	},

	deprecate: async ({ params, locals, fetch }) => {
		try {
			await deprecateNhi(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'deprecated' };
	},

	archive: async ({ params, locals, fetch }) => {
		try {
			await archiveNhi(params.id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'archived' };
	},

	issueCredential: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const parsed = issueCredentialSchema.safeParse({
			credential_type: formData.get('credential_type')?.toString(),
			valid_days: formData.get('valid_days')?.toString() || undefined
		});
		if (!parsed.success) {
			return fail(400, { error: 'Invalid credential parameters' });
		}

		try {
			const result = await issueCredential(
				params.id,
				parsed.data,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, action: 'credentialIssued', credential: result.credential, secret: result.secret };
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	rotateCredential: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const credential_id = formData.get('credential_id')?.toString()!;
		const grace_str = formData.get('grace_period_hours')?.toString();
		const grace_period_hours = grace_str ? Number(grace_str) : undefined;

		try {
			const result = await rotateCredential(
				params.id,
				credential_id,
				grace_period_hours ? { grace_period_hours } : undefined,
				locals.accessToken!,
				locals.tenantId!,
				fetch
			);
			return { success: true, action: 'credentialRotated', credential: result.credential, secret: result.secret };
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	revokeCredential: async ({ request, params, locals, fetch }) => {
		const formData = await request.formData();
		const credential_id = formData.get('credential_id')?.toString()!;

		try {
			await revokeCredential(params.id, credential_id, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
		return { success: true, action: 'credentialRevoked' };
	}
};
