<script lang="ts">
	import LoginAttemptList from '$lib/components/audit/login-attempt-list.svelte';
</script>

<LoginAttemptList fetchUrl="/api/audit/login-history" />
