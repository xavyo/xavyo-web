<script lang="ts">
	import { Menu, LogOut, UserCircle, Settings } from 'lucide-svelte';
	import { Avatar } from '$lib/components/ui/avatar';
	import { ThemeToggle } from '$lib/components/ui/theme-toggle';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	interface Props {
		email: string;
		name?: string;
		onToggleSidebar?: () => void;
	}

	let { email, name, onToggleSidebar }: Props = $props();
</script>

<header class="flex h-14 items-center justify-between border-b bg-card px-4">
	<div class="flex items-center gap-3">
		{#if onToggleSidebar}
			<button
				onclick={onToggleSidebar}
				class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground md:hidden"
				aria-label="Toggle sidebar"
			>
				<Menu class="h-5 w-5" />
			</button>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<ThemeToggle />

		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
			>
				<Avatar {name} {email} size="sm" />
				<span class="hidden text-sm font-medium text-foreground sm:inline">{name || email}</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Label>
						<div class="flex flex-col space-y-1">
							{#if name}
								<p class="text-sm font-medium">{name}</p>
							{/if}
							<p class="text-xs text-muted-foreground">{email}</p>
						</div>
					</DropdownMenu.Label>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<a href="/dashboard" class="block">
					<DropdownMenu.Item>
						<UserCircle class="mr-2 h-4 w-4" />
						Profile
					</DropdownMenu.Item>
				</a>
				<a href="/dashboard" class="block">
					<DropdownMenu.Item>
						<Settings class="mr-2 h-4 w-4" />
						Settings
					</DropdownMenu.Item>
				</a>
				<DropdownMenu.Separator />
				<a href="/logout" class="block">
					<DropdownMenu.Item>
						<LogOut class="mr-2 h-4 w-4" />
						Log out
					</DropdownMenu.Item>
				</a>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
