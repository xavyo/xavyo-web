export function relativeTime(dateStr: string | null): string {
	if (!dateStr) return 'Never';
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	const diff = now - then;

	if (diff < 0) {
		// Future date
		const absDiff = -diff;
		const minutes = Math.floor(absDiff / 60000);
		if (minutes < 1) return 'now';
		if (minutes < 60) return `in ${minutes}m`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `in ${hours}h`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `in ${days}d`;
		const months = Math.floor(days / 30);
		if (months < 12) return `in ${months}mo`;
		return new Date(dateStr).toLocaleDateString();
	}

	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;
	return new Date(dateStr).toLocaleDateString();
}
