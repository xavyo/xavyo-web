export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordCheck {
	label: string;
	met: boolean;
}

export interface PasswordStrength {
	score: PasswordScore;
	label: string;
	checks: PasswordCheck[];
}

const SCORE_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const;

/**
 * Lightweight, dependency-free password strength heuristic for signup/reset UX.
 * Mirrors the backend minimum (>= 8 chars) and nudges toward stronger secrets.
 */
export function evaluatePassword(password: string): PasswordStrength {
	const checks: PasswordCheck[] = [
		{ label: 'At least 8 characters', met: password.length >= 8 },
		{ label: 'Upper & lowercase letters', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
		{ label: 'At least one number', met: /\d/.test(password) },
		{ label: 'At least one symbol', met: /[^A-Za-z0-9]/.test(password) }
	];

	if (password.length === 0) {
		return { score: 0, label: SCORE_LABELS[0], checks };
	}

	const met = checks.filter((c) => c.met).length;
	const bonus = password.length >= 12 ? 1 : 0;
	const score = Math.max(1, Math.min(4, met + bonus - 1)) as PasswordScore;
	return { score, label: SCORE_LABELS[score], checks };
}
