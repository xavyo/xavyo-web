<script lang="ts">
	import type { DataProtectionClassification } from '$lib/api/types';

	let { classification }: { classification: DataProtectionClassification } = $props();

	const styles: Record<DataProtectionClassification, string> = {
		none: 'bg-muted text-muted-foreground ',
		personal: 'bg-info/15 text-info',
		sensitive: 'bg-warning/15 text-warning',
		special_category: 'bg-destructive/15 text-destructive'
	};

	const labels: Record<DataProtectionClassification, string> = {
		none: 'None',
		personal: 'Personal',
		sensitive: 'Sensitive',
		special_category: 'Special Category'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {styles[classification]}"
	>{labels[classification]}</span
>
