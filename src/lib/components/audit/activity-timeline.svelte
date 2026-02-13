<script lang="ts">
	import LoginAttemptList from './login-attempt-list.svelte';

	interface Props {
		userId: string;
		maxItems?: number;
		viewAllUrl?: string;
	}

	let { userId, maxItems = 10, viewAllUrl }: Props = $props();
</script>

<LoginAttemptList
	fetchUrl="/api/audit/admin/login-attempts"
	extraParams={{ user_id: userId }}
	showFilters={false}
	{maxItems}
	{viewAllUrl}
/>
