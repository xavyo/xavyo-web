/**
 * Resolve a post-login redirect target to a same-origin path.
 * Rejects protocol-relative URLs (`//evil.example`) and off-origin values.
 */
export function safeInternalPath(
	redirectTo: string | null | undefined,
	origin: string
): string | null {
	if (!redirectTo) return null;
	const trimmed = redirectTo.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith('//') || trimmed.startsWith('\\')) return null;

	try {
		const target = new URL(trimmed, origin);
		if (target.origin !== origin) return null;
		if (!target.pathname.startsWith('/') || target.pathname.startsWith('//')) return null;
		return `${target.pathname}${target.search}${target.hash}`;
	} catch {
		return null;
	}
}
