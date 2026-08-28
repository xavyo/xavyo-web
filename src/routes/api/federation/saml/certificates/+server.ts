import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listCertificates, uploadCertificate } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';
import type { UploadCertificateRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listCertificates(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
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
	if (typeof body.certificate !== 'string' || body.certificate.length === 0) {
		error(400, 'certificate is required');
	}
	if (typeof body.private_key !== 'string' || body.private_key.length === 0) {
		error(400, 'private_key is required');
	}
	if (typeof body.key_id !== 'string' || body.key_id.length === 0) {
		error(400, 'key_id is required');
	}
	const data: UploadCertificateRequest = {
		certificate: body.certificate,
		private_key: body.private_key,
		key_id: body.key_id
	};
	if (body.subject_dn !== undefined) {
		if (typeof body.subject_dn !== 'string') {
			error(400, 'subject_dn must be a string');
		}
		data.subject_dn = body.subject_dn;
	}
	if (body.issuer_dn !== undefined) {
		if (typeof body.issuer_dn !== 'string') {
			error(400, 'issuer_dn must be a string');
		}
		data.issuer_dn = body.issuer_dn;
	}
	if (body.not_before !== undefined) {
		if (typeof body.not_before !== 'string') {
			error(400, 'not_before must be a string');
		}
		data.not_before = body.not_before;
	}
	if (body.not_after !== undefined) {
		if (typeof body.not_after !== 'string') {
			error(400, 'not_after must be a string');
		}
		data.not_after = body.not_after;
	}
	const result = await uploadCertificate(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
