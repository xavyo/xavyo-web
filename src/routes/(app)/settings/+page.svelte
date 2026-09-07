<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { User, Shield, Monitor, Smartphone, Bell, Clock, Link as LinkIcon } from 'lucide-svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import ProfileTab from './profile-tab.svelte';
	import SecurityTab from './security-tab.svelte';
	import SessionsTab from './sessions-tab.svelte';
	import DevicesTab from './devices-tab.svelte';
	import AlertsTab from './alerts-tab.svelte';
	import LoginHistoryTab from './login-history-tab.svelte';
	import SocialConnectionsTab from './social-connections-tab.svelte';

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let unacknowledgedCount = $state(data.unacknowledgedAlertCount ?? 0);

	// Get tab from URL query param, default to 'profile'
	let activeTab = $derived($page.url.searchParams.get('tab') ?? 'profile');

	function handleTabChange(value: string) {
		goto(`/settings?tab=${value}`, { replaceState: true });
	}

	function handleUnacknowledgedCountChange(count: number) {
		unacknowledgedCount = count;
	}
</script>

<PageHeader title="Settings" description="Account, security, and preferences." />

<div class="overflow-x-auto">
<Tabs value={activeTab} onValueChange={handleTabChange}>
	<TabsList class="min-w-max">
		<TabsTrigger value="profile"><User class="mr-2 h-4 w-4" />Profile</TabsTrigger>
		<TabsTrigger value="security"><Shield class="mr-2 h-4 w-4" />Security</TabsTrigger>
		<TabsTrigger value="sessions"><Monitor class="mr-2 h-4 w-4" />Sessions</TabsTrigger>
		<TabsTrigger value="devices"><Smartphone class="mr-2 h-4 w-4" />Devices</TabsTrigger>
		<TabsTrigger value="alerts">
			<Bell class="mr-2 h-4 w-4" />Alerts
			{#if unacknowledgedCount > 0}
				<Badge variant="destructive" class="ml-1.5 h-5 min-w-5 px-1 text-xs">{unacknowledgedCount}</Badge>
			{/if}
		</TabsTrigger>
		<TabsTrigger value="login-history"><Clock class="mr-2 h-4 w-4" />Login history</TabsTrigger>
		<TabsTrigger value="social-connections"><LinkIcon class="mr-2 h-4 w-4" />Social</TabsTrigger>
	</TabsList>
	<TabsContent value="profile" class="mt-6">
		<ProfileTab profile={data.profile} form={data.form} />
	</TabsContent>
	<TabsContent value="security" class="mt-6">
		<SecurityTab securityOverview={data.securityOverview} mfaStatus={data.mfaStatus} />
	</TabsContent>
	<TabsContent value="sessions" class="mt-6">
		<SessionsTab />
	</TabsContent>
	<TabsContent value="devices" class="mt-6">
		<DevicesTab />
	</TabsContent>
	<TabsContent value="alerts" class="mt-6">
		<AlertsTab onUnacknowledgedCountChange={handleUnacknowledgedCountChange} />
	</TabsContent>
	<TabsContent value="login-history" class="mt-6">
		<LoginHistoryTab />
	</TabsContent>
	<TabsContent value="social-connections" class="mt-6">
		<SocialConnectionsTab />
	</TabsContent>
</Tabs>
</div>
