<script lang="ts">
	import type { MiningJob } from '$lib/api/types';

	interface Props {
		jobs: MiningJob[];
		selectedJobId?: string;
		onSelect?: (jobId: string) => void;
	}

	let { jobs, selectedJobId = '', onSelect }: Props = $props();

	const completedJobs = $derived(jobs.filter(j => j.status === 'completed'));
</script>

<select
	class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
	value={selectedJobId}
	onchange={(e) => {
		const target = e.currentTarget;
		if (target.value && onSelect) onSelect(target.value);
	}}
>
	<option value="">Select a completed job...</option>
	{#each completedJobs as job (job.id)}
		<option value={job.id}>{job.name}</option>
	{/each}
</select>
