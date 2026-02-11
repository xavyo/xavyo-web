import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, type ErrorStatus } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { createToolSchema } from '$lib/schemas/nhi';
import { createTool } from '$lib/api/nhi';
import { ApiError } from '$lib/api/client';
import type { CreateToolRequest } from '$lib/api/types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(createToolSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const form = await superValidate(request, zod(createToolSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Parse JSON strings for schemas
		let inputSchema: Record<string, unknown>;
		try {
			inputSchema = JSON.parse(form.data.input_schema) as Record<string, unknown>;
		} catch {
			return message(form, 'Input schema must be valid JSON', { status: 400 as ErrorStatus });
		}

		let outputSchema: Record<string, unknown> | undefined;
		if (form.data.output_schema) {
			try {
				outputSchema = JSON.parse(form.data.output_schema) as Record<string, unknown>;
			} catch {
				return message(form, 'Output schema must be valid JSON', { status: 400 as ErrorStatus });
			}
		}

		const body: CreateToolRequest = {
			name: form.data.name,
			input_schema: inputSchema,
			description: form.data.description || undefined,
			category: form.data.category || undefined,
			output_schema: outputSchema,
			requires_approval: form.data.requires_approval || false,
			max_calls_per_hour: form.data.max_calls_per_hour || undefined,
			provider: form.data.provider || undefined
		};

		try {
			await createTool(body, locals.accessToken!, locals.tenantId!, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			return message(form, 'An unexpected error occurred', { status: 500 });
		}

		redirect(302, '/nhi');
	}
};
