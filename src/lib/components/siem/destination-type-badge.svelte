<script lang="ts">
	import type { DestinationType } from '$lib/api/types';

	let { type }: { type: DestinationType } = $props();

	const labels: Record<string, string> = {
		syslog_tcp_tls: 'Syslog TLS',
		syslog_udp: 'Syslog UDP',
		webhook: 'Webhook',
		splunk_hec: 'Splunk HEC'
	};

	const colors: Record<string, string> = {
		syslog_tcp_tls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
		syslog_udp: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
		webhook: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
		splunk_hec: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
	};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colors[type] ?? 'bg-gray-100 text-gray-800'}">
	{labels[type] ?? type}
</span>
