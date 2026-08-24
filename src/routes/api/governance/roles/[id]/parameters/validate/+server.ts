import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateRoleParameters } from '$lib/api/governance-roles';
import type { ValidateParametersRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	if (!Array.isArray(body.parameters)) {
		error(400, 'parameters is required');
	}
	const parameters: { name: string; value: unknown }[] = [];
	for (const item of body.parameters) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) {
			error(400, 'parameters items must be objects');
		}
		const rec = item as Record<string, unknown>;
		if (typeof rec.name !== 'string' || rec.name.length === 0) {
			error(400, 'parameters name is required');
		}
		parameters.push({ name: rec.name, value: rec.value });
	}
	const data: ValidateParametersRequest = { parameters };
	const result = await validateRoleParameters(
		params.id,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
