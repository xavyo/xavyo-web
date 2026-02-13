<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	let { systemType }: { systemType: string } = $props();

	const variants: Record<string, string> = {
		ServiceNow: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		servicenow: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		service_now: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		Jira: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
		jira: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
		Webhook: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
		webhook: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
		custom_webhook: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
	};

	const labels: Record<string, string> = {
		ServiceNow: 'ServiceNow',
		servicenow: 'ServiceNow',
		service_now: 'ServiceNow',
		Jira: 'Jira',
		jira: 'Jira',
		Webhook: 'Webhook',
		webhook: 'Webhook',
		custom_webhook: 'Custom Webhook'
	};
</script>

<Badge class={variants[systemType] ?? variants.service_now}>
	{labels[systemType] ?? systemType}
</Badge>
