<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		open: boolean;
		recoveryCodes: string[];
		onClose: () => void;
	}

	let { open, recoveryCodes, onClose }: Props = $props();

	let acknowledged = $state(false);
	let copyFeedback = $state(false);

	async function copyAll() {
		try {
			await navigator.clipboard.writeText(recoveryCodes.join('\n'));
			copyFeedback = true;
			setTimeout(() => {
				copyFeedback = false;
			}, 2000);
		} catch {
			// Clipboard API may fail in some contexts
		}
	}

	function downloadCodes() {
		const content = [
			'Xavyo Recovery Codes',
			'====================',
			'',
			'Save these codes in a secure place.',
			'Each code can only be used once.',
			'',
			...recoveryCodes
		].join('\n');

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'recovery-codes.txt';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	function handleClose() {
		acknowledged = false;
		onClose();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Recovery codes</Dialog.Title>
			<Dialog.Description>
				Save these recovery codes in a secure place. Each code can only be used once to regain
				access to your account if you lose your authenticator.
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<div class="grid grid-cols-2 gap-2 rounded-md border bg-muted p-4">
				{#each recoveryCodes as code}
					<code class="text-center font-mono text-sm">{code}</code>
				{/each}
			</div>

			<div class="mt-4 flex gap-2">
				<Button variant="outline" size="sm" onclick={copyAll}>
					{#if copyFeedback}
						Copied!
					{:else}
						Copy all
					{/if}
				</Button>
				<Button variant="outline" size="sm" onclick={downloadCodes}>
					Download
				</Button>
			</div>

			<label class="mt-4 flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					bind:checked={acknowledged}
					class="h-4 w-4 rounded border-input"
				/>
				I have saved my recovery codes
			</label>
		</div>

		<Dialog.Footer>
			<Button disabled={!acknowledged} onclick={handleClose}>
				Done
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
