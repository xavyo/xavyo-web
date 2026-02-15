import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { uploadCertificate } from '$lib/api/federation';
import forge from 'node-forge';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const body = await request.json();
	const {
		common_name,
		organization = 'xavyo',
		country = 'FR',
		validity_days = 365
	} = body as {
		common_name: string;
		organization?: string;
		country?: string;
		validity_days?: number;
	};

	if (!common_name) {
		error(400, 'common_name is required');
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
