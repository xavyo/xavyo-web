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

<PageHeader title="Settings" description="Manage your account settings and preferences" />

<Tabs value={activeTab} onValueChange={handleTabChange}>
	<TabsList>
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
		<TabsTrigger value="login-history"><Clock class="mr-2 h-4 w-4" />Login History</TabsTrigger>
		<TabsTrigger value="social-connections"><LinkIcon class="mr-2 h-4 w-4" />Social Connections</TabsTrigger>
	</TabsList>
	<TabsContent value="profile">
		<ProfileTab profile={data.profile} form={data.form} />
	</TabsContent>
	<TabsContent value="security">
		<SecurityTab securityOverview={data.securityOverview} mfaStatus={data.mfaStatus} />
	</TabsContent>
	<TabsContent value="sessions">
		<SessionsTab />
	</TabsContent>
	<TabsContent value="devices">
		<DevicesTab />
	</TabsContent>
	<TabsContent value="alerts">
		<AlertsTab onUnacknowledgedCountChange={handleUnacknowledgedCountChange} />
	</TabsContent>
	<TabsContent value="login-history">
		<LoginHistoryTab />
	</TabsContent>
	<TabsContent value="social-connections">
		<SocialConnectionsTab />
	</TabsContent>
</Tabs>
