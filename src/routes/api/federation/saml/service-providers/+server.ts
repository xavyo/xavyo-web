import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listServiceProviders, createServiceProvider } from '$lib/api/federation';
import type { CreateServiceProviderRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';
import { applyGroupConfigFields } from '$lib/server/sp-group-fields';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const enabledParam = url.searchParams.get('enabled');
	const enabled = enabledParam !== null ? enabledParam === 'true' : undefined;

	const result = await listServiceProviders(
		{ enabled, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (typeof body.entity_id !== 'string' || body.entity_id.length === 0) {
		error(400, 'entity_id is required');
	}
	if (
		!Array.isArray(body.acs_urls) ||
		body.acs_urls.length === 0 ||
		!body.acs_urls.every((item) => typeof item === 'string')
	) {
		error(400, 'acs_urls is required');
	}
	const data: CreateServiceProviderRequest = {
		name: body.name,
		entity_id: body.entity_id,
		acs_urls: body.acs_urls
	};
	if (body.certificate !== undefined) {
		if (typeof body.certificate !== 'string') {
			error(400, 'certificate must be a string');
		}
		data.certificate = body.certificate;
	}
	if (body.attribute_mapping !== undefined) {
		if (
			!body.attribute_mapping ||
			typeof body.attribute_mapping !== 'object' ||
			Array.isArray(body.attribute_mapping)
		) {
			error(400, 'attribute_mapping must be an object');
		}
		data.attribute_mapping = body.attribute_mapping as Record<string, unknown>;
	}
	if (body.name_id_format !== undefined) {
		if (typeof body.name_id_format !== 'string') {
			error(400, 'name_id_format must be a string');
		}
		data.name_id_format = body.name_id_format;
	}
	if (body.sign_assertions !== undefined) {
		if (typeof body.sign_assertions !== 'boolean') {
			error(400, 'sign_assertions must be a boolean');
		}
		data.sign_assertions = body.sign_assertions;
	}
	if (body.validate_signatures !== undefined) {
		if (typeof body.validate_signatures !== 'boolean') {
			error(400, 'validate_signatures must be a boolean');
		}
		data.validate_signatures = body.validate_signatures;
	}
	if (body.assertion_validity_seconds !== undefined) {
		try {
			data.assertion_validity_seconds = parseBoundedInteger(
				body.assertion_validity_seconds,
				1,
				31_536_000,
				'assertion_validity_seconds'
			);
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.metadata_url !== undefined) {
		if (typeof body.metadata_url !== 'string') {
			error(400, 'metadata_url must be a string');
		}
		data.metadata_url = body.metadata_url;
	}
	if (body.slo_url !== undefined) {
		if (typeof body.slo_url !== 'string') {
			error(400, 'slo_url must be a string');
		}
		data.slo_url = body.slo_url;
	}
	if (body.slo_binding !== undefined) {
		if (typeof body.slo_binding !== 'string') {
			error(400, 'slo_binding must be a string');
		}
		data.slo_binding = body.slo_binding;
	}
	applyGroupConfigFields(body, data);
	const result = await createServiceProvider(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
