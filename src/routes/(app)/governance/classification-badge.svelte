<script lang="ts">
	import type { DataProtectionClassification } from '$lib/api/types';

	let { classification }: { classification: DataProtectionClassification } = $props();

	const styles: Record<DataProtectionClassification, string> = {
		none: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
		personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		sensitive: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
		special_category: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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
