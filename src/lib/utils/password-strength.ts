export type StrengthLevel = 'weak' | 'fair' | 'strong' | 'very-strong';

export interface PasswordStrengthResult {
	score: number;
	level: StrengthLevel;
	feedback: string[];
}

const COMMON_PASSWORDS = [
	'password', 'password1', '123456', '12345678', 'qwerty', 'abc123',
	'letmein', 'welcome', 'monkey', 'dragon', 'master', 'admin',
	'login', 'princess', 'football', 'shadow', 'sunshine', 'trustno1',
	'iloveyou', 'batman', 'passw0rd', 'hello', 'charlie', 'donald'
];

function hasSequentialChars(password: string): boolean {
	for (let i = 0; i < password.length - 2; i++) {
		const a = password.charCodeAt(i);
		const b = password.charCodeAt(i + 1);
		const c = password.charCodeAt(i + 2);
		if (b === a + 1 && c === b + 1) return true;
		if (b === a - 1 && c === b - 1) return true;
	}
	return false;
}

function hasRepeatedChars(password: string): boolean {
	for (let i = 0; i < password.length - 2; i++) {
		if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
			return true;
		}
	}
	return false;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
	const feedback: string[] = [];

	if (!password) {
		return { score: 0, level: 'weak', feedback: ['Password is required'] };
	}

	// Base score from length
	let score = 0;
	if (password.length >= 16) {
		score = 3;
	} else if (password.length >= 12) {
		score = 2;
	} else if (password.length >= 8) {
		score = 1;
	} else {
		feedback.push('Use at least 8 characters');
	}

	// Character variety bonus
	const hasLower = /[a-z]/.test(password);
	const hasUpper = /[A-Z]/.test(password);
	const hasDigit = /\d/.test(password);
	const hasSymbol = /[^a-zA-Z0-9]/.test(password);

	if (hasLower) score++;
	if (hasUpper) score++;
	if (hasDigit) score++;
	if (hasSymbol) score++;

	if (!hasUpper) feedback.push('Add uppercase letters');
	if (!hasLower) feedback.push('Add lowercase letters');
	if (!hasDigit) feedback.push('Add numbers');
	if (!hasSymbol) feedback.push('Add special characters');

	// Common pattern penalties
	if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
		score -= 3;
		feedback.push('This is a commonly used password');
	}

	if (hasSequentialChars(password)) {
		score -= 2;
		feedback.push('Avoid sequential characters');
	}

	if (hasRepeatedChars(password)) {
		score -= 2;
		feedback.push('Avoid repeated characters');
	}

	// Clamp score
	score = Math.max(0, score);

	// Map score to level
	let level: StrengthLevel;
	if (score >= 7) {
		level = 'very-strong';
	} else if (score >= 5) {
		level = 'strong';
	} else if (score >= 3) {
		level = 'fair';
	} else {
		level = 'weak';
	}

	return { score, level, feedback };
}
