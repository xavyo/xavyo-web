import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadCertificate } from '$lib/api/federation';
import forge from 'node-forge';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

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
	if (typeof body.common_name !== 'string' || body.common_name.length === 0) {
		error(400, 'common_name is required');
	}
	const common_name = body.common_name;
	let organization = 'xavyo';
	if (body.organization !== undefined) {
		if (typeof body.organization !== 'string' || body.organization.length === 0) {
			error(400, 'organization must be a non-empty string');
		}
		organization = body.organization;
	}
	let country = 'FR';
	if (body.country !== undefined) {
		if (typeof body.country !== 'string' || body.country.length === 0) {
			error(400, 'country must be a non-empty string');
		}
		country = body.country;
	}
	let validity_days = 365;
	if (body.validity_days !== undefined) {
		try {
			validity_days = parseBoundedInteger(body.validity_days, 1, 3650, 'validity_days');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}

	// Generate RSA-2048 keypair
	const keypair = forge.pki.rsa.generateKeyPair(2048);

	// Create self-signed X.509 certificate
	const cert = forge.pki.createCertificate();
	cert.publicKey = keypair.publicKey;
	// Random serial number per RFC 5280
	const serialBytes = forge.random.getBytesSync(16);
	cert.serialNumber = forge.util.bytesToHex(serialBytes);

	const now = new Date();
	cert.validity.notBefore = now;
	cert.validity.notAfter = new Date(now.getTime() + validity_days * 24 * 60 * 60 * 1000);

	const attrs = [{ name: 'commonName', value: common_name }];
	if (organization) attrs.push({ name: 'organizationName', value: organization });
	if (country) attrs.push({ name: 'countryName', value: country });

	cert.setSubject(attrs);
	cert.setIssuer(attrs); // self-signed

	// Self-sign with SHA-256
	cert.sign(keypair.privateKey, forge.md.sha256.create());

	// Serialize to PEM
	const certPem = forge.pki.certificateToPem(cert);
	const keyPem = forge.pki.privateKeyToPem(keypair.privateKey);

	// Build DN string
	const dnParts: string[] = [];
	if (country) dnParts.push(`C=${country}`);
	if (organization) dnParts.push(`O=${organization}`);
	dnParts.push(`CN=${common_name}`);
	const dn = dnParts.join(', ');

	// Upload via existing backend API
	const result = await uploadCertificate(
		{
			certificate: certPem,
			private_key: keyPem,
			key_id: common_name,
			subject_dn: dn,
			issuer_dn: dn,
			not_before: cert.validity.notBefore.toISOString(),
			not_after: cert.validity.notAfter.toISOString()
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
