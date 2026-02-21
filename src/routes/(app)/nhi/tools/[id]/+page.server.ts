import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import { updateToolSchema, suspendNhiSchema } from '$lib/schemas/nhi';
import {
	getTool,
	updateTool,
	deleteTool,
	activateNhi,
	suspendNhi,
	reactivateNhi,
	deprecateNhi,
	archiveNhi
} from '$lib/api/nhi';
import { ApiError } from '$lib/api/client';
import type { UpdateToolRequest } from '$lib/api/types';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	let nhi;
	try {
		nhi = await getTool(params.id, locals.accessToken!, locals.tenantId!, fetch);
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load tool');
	}

	const form = await superValidate(
		{
			name: nhi.name,
			description: nhi.description ?? undefined,
			category: nhi.tool?.category ?? undefined,
			input_schema: nhi.tool?.input_schema ? JSON.stringify(nhi.tool.input_schema, null, 2) : undefined,
			output_schema: nhi.tool?.output_schema ? JSON.stringify(nhi.tool.output_schema, null, 2) : undefined,
			requires_approval: nhi.tool?.requires_approval ?? false,
			max_calls_per_hour: nhi.tool?.max_calls_per_hour ?? undefined,
			provider: nhi.tool?.provider ?? undefined
		},
		zod(updateToolSchema)
	);

	return { nhi, form };
};

export const actions: Actions = {
	update: async ({ request, params, locals, fetch }) => {
		const form = await superValidate(request, zod(updateToolSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let inputSchema: Record<string, unknown> | undefined;
		if (form.data.input_schema) {
			try {
				inputSchema = JSON.parse(form.data.input_schema) as Record<string, unknown>;
			} catch {
				return message(form, 'Input schema must be valid JSON', { status: 400 as ErrorStatus });
			}
		}

		let outputSchema: Record<string, unknown> | undefined;
		if (form.data.output_schema) {
			try {
				outputSchema = JSON.parse(form.data.output_schema) as Record<string, unknown>;
			} catch {
				return message(form, 'Output schema must be valid JSON', { status: 400 as ErrorStatus });
			}
		}

		const body: UpdateToolRequest = {
			name: form.data.name || undefined,
			description: form.data.description || undefined,
			category: form.data.category || undefined,
			input_schema: inputSchema,
			output_schema: outputSchema,
			requires_approval: form.data.requires_approval,
			max_calls_per_hour: form.data.max_calls_per_hour || undefined,
			provider: form.data.provider || undefined
		};

		try {
			await updateTool(params.id, body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		return message(form, 'Tool updated successfully');
	},

	delete: async ({ params, locals, fetch }) => {
		try {
			await deleteTool(params.id, locals.accessToken!, locals.tenantId!, fetch);
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

};
