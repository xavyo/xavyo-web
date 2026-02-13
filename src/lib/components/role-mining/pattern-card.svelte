<script lang="ts">
	import type { AccessPattern } from '$lib/api/types';
	import { Shield, Users, Hash } from 'lucide-svelte';

	interface Props {
		pattern: AccessPattern;
	}

	let { pattern }: Props = $props();
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
	<div class="mb-3 flex items-center gap-4 text-sm">
		<span class="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
			<Shield class="h-4 w-4" />
			<span class="font-medium text-gray-900 dark:text-gray-100">{pattern.entitlement_ids.length}</span>
			entitlements
		</span>
		<span class="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
			<Hash class="h-4 w-4" />
			<span class="font-medium text-gray-900 dark:text-gray-100">{pattern.frequency}</span>
			frequency
		</span>
	</div>

	<div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
		<span class="inline-flex items-center gap-1.5">
			<Users class="h-4 w-4" />
			<span class="font-medium text-gray-900 dark:text-gray-100">{pattern.user_count}</span>
			users
		</span>
		<span class="text-xs text-gray-500 dark:text-gray-500">
			{pattern.sample_user_ids.length} sample users
		</span>
	</div>
</div>
