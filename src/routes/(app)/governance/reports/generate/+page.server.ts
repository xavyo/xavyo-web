import type { PageServerLoad, Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { generateReportSchema } from '$lib/schemas/governance-reporting';
import { generateReport } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ErrorStatus } from 'sveltekit-superforms';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!hasAdminRole(locals.user?.roles)) {
		redirect(302, '/dashboard');
	}

	const templateId = url.searchParams.get('template_id') ?? '';

	const form = await superValidate(
		{ template_id: templateId, output_format: 'json' as const },
		zod(generateReportSchema)
	);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		if (!locals.accessToken || !locals.tenantId) {
			error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(generateReportSchema));
		if (!form.valid) return message(form, 'Please fix the errors', { status: 400 as ErrorStatus });

		try {
			const params = form.data.parameters
				? (JSON.parse(form.data.parameters) as Record<string, unknown>)
				: undefined;

			await generateReport(
				{
					template_id: form.data.template_id,
					name: form.data.name || undefined,
					parameters: params,
					output_format: form.data.output_format
				},
				locals.accessToken,
				locals.tenantId,
				fetch
			);

			redirect(303, '/governance/reports');
		} catch (e) {
			if (e instanceof SyntaxError) {
				return message(form, 'Invalid JSON in parameters', { status: 400 as ErrorStatus });
			}
			if (e instanceof ApiError) {
				return message(form, e.message, { status: e.status as ErrorStatus });
			}
			throw e;
		}
	}
};
