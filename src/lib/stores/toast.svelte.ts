export interface Toast {
	id: string;
	type: 'success' | 'error' | 'info';
	message: string;
	duration: number;
}

let counter = 0;

export const toasts: Toast[] = $state([]);

export function addToast(
	type: Toast['type'],
	message: string,
	duration?: number
): void {
	const resolvedDuration = duration ?? (type === 'error' ? 0 : 5000);
	const id = `toast-${++counter}`;

	toasts.push({ id, type, message, duration: resolvedDuration });

	if (resolvedDuration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, resolvedDuration);
	}
}

export function removeToast(id: string): void {
	const index = toasts.findIndex((t) => t.id === id);
	if (index !== -1) {
		toasts.splice(index, 1);
	}
}
