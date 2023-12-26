<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import type { PageData } from './$types';

	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	export let data: PageData;
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { load } from './+page';

	//
	let openBreed = false;
	let openSubBreed = false;
	function closeAndFocusTriggerBreed(triggerId: string) {
		openBreed = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
	function closeAndFocusTriggerSubBreed(triggerId: string) {
		openSubBreed = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	let valueBreed = '';
	let valueSubBreed = '';
	$: selectedValueBreed =
		data.breeds.find((f) => f.breed === valueBreed)?.breed ?? 'Select a breed...';
	$: selectedValueSubBreed =
		data.breeds.find((f) => f.breed === valueBreed)?.subBreeds.find((f) => f === valueSubBreed) ??
		'Select a sub breed...';

	async function fetchDogBreedImages(breed: string) {
		const res = await fetch(`https://dog.ceo/api/breed/${breed}/images`);
		if (!res.ok) {
			throw new Error('Failed to fetch dog images');
		}
		const data = await res.json();
		return data.message;
	}
	async function fetchDogSubBreedImages(breed: string, subBreed: string) {
		console.log(breed, subBreed);
		const res = await fetch(`https://dog.ceo/api/breed/${breed}/${subBreed}/images`);
		if (!res.ok) {
			throw new Error('Failed to fetch dog images');
		}
		const data = await res.json();
		return data.message;
	}

	// pegination
	let allImages: string[] = [];
	let pegination = 0;
	let peginationSize = 20;
	$: images = allImages.slice(pegination, pegination + peginationSize);
	function next() {
		if (allImages.length > pegination + peginationSize) {
			pegination += peginationSize;
			images = allImages.slice(pegination, pegination + peginationSize);
		}
	}
	function prev() {
		if (pegination > 0) {
			pegination -= peginationSize;
			images = allImages.slice(pegination, pegination + peginationSize);
		}
	}
	let loading = false;
	//error handling
	async function handleBreedSelect(breed: string) {
		imageErrorCounter = 0;
		selectedValueSubBreed = 'Select a sub breed...';
		valueSubBreed = '';
		loading = true;
		allImages = await fetchDogBreedImages(breed);
		loading = false;
	}
	async function handleSubBreedSelect(breed: string) {
		imageErrorCounter = 0;
		loading = true;
		allImages = await fetchDogSubBreedImages(breed, valueSubBreed);
		loading = false;
	}

	let imageErrorCounter = 0;
</script>

<main class="my-32 flex w-full flex-col items-center justify-center gap-8">
	<div class="flex flex-col items-center">
		<p class="mb-2 font-light text-foreground/80">Welcome to the</p>
		<h1 class="text-center text-4xl">Terrible dog API</h1>
	</div>

	<Popover.Root bind:open={openBreed} let:ids>
		<Popover.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				variant="outline"
				role="combobox"
				aria-expanded={openBreed}
				class="w-[300px] justify-between"
			>
				{selectedValueBreed}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="mt-4 w-[200px] p-0">
			<Command.Root>
				<Command.Input placeholder="Search framework..." />
				<Command.Empty>No framework found.</Command.Empty>
				<Command.Group class="max-h-64 overflow-auto">
					{#each data.breeds as breed}
						<Command.Item
							value={breed.breed}
							onSelect={(currentValue) => {
								valueBreed = currentValue;
								closeAndFocusTriggerBreed(ids.trigger);
								handleBreedSelect(breed.breed);
							}}
						>
							<Check class={cn('mr-2 h-4 w-4', valueBreed !== breed.breed && 'text-transparent')} />
							{breed.breed}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>

	<!-- sub breed -->
	{#if selectedValueBreed !== 'Select a breed...' && data.breeds.find((f) => f.breed === selectedValueBreed)?.subBreeds.length > 0}
		<Popover.Root bind:open={openSubBreed} let:ids>
			<Popover.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					variant="outline"
					role="combobox"
					aria-expanded={openSubBreed}
					class="w-[300px] justify-between"
				>
					{selectedValueSubBreed}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</Popover.Trigger>
			<Popover.Content class="mt-4 w-[200px] p-0">
				<Command.Root>
					<Command.Input placeholder="Search framework..." />
					<Command.Empty>No framework found.</Command.Empty>
					<Command.Group class="max-h-64 overflow-auto">
						{#each data.breeds.find((f) => f.breed === valueBreed)?.subBreeds as subBreed}
							<Command.Item
								value={subBreed}
								onSelect={(currentValue) => {
									valueSubBreed = currentValue;
									closeAndFocusTriggerSubBreed(ids.trigger);
									handleSubBreedSelect(valueBreed); // Use valueBreed instead of subBreed
								}}
							>
								<Check
									class={cn('mr-2 h-4 w-4', valueSubBreed !== subBreed && 'text-transparent')}
								/>
								{subBreed}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	{/if}

	{#if imageErrorCounter > 0}
		<Alert.Root class="w-fit border-destructive bg-destructive/25">
			<Alert.Title>Failed to load {imageErrorCounter} images</Alert.Title>
			<Alert.Description>
				<p>This is do to an error in the api.</p>
			</Alert.Description>
		</Alert.Root>
	{/if}

	{#if images.length > 0 && !loading}
		<ul class="image-gallery container">
			{#key allImages}
				{#each images as image, i}
					<li class="container__item">
						<img
							on:error={(e) => {
								imageErrorCounter++;
								e.target.src = 'https://via.placeholder.com/300x300?text=Failed+to+load+image';
							}}
							src={image}
							alt={selectedValueBreed.toString()}
						/>
					</li>
				{/each}
			{/key}
		</ul>
		<div class="flex items-center gap-8">
			<!-- pegination -->
			<Button on:click={prev} variant="outline" size="icon"><ChevronLeft /></Button>
			<p>
				{pegination + 1} - {pegination + peginationSize > allImages.length
					? allImages.length
					: pegination + peginationSize} of {allImages.length}
			</p>
			<Button on:click={next} variant="outline" size="icon"><ChevronRight /></Button>
		</div>
	{:else if loading}
		<Loader2 class="h-16 w-16 animate-spin text-primary" />
	{/if}
</main>

<style>
	/* .image-gallery {
		display: flex;
		flex-wrap: wrap;
	}

	.image-card {
		height: 40rem;
		flex-grow: 1;
	}

	img {
		min-width: 100%;
		object-fit: cover;
		vertical-align: bottom;
	} */

	ul {
		display: flex;
		flex-wrap: wrap;
		margin: 2vmin;
	}

	li {
		height: 40vh;
		flex-grow: 1;
		margin: 2vmin;
	}

	li:last-child {
		flex-grow: 10;
	}

	img {
		max-height: 100%;
		min-width: 100%;
		object-fit: cover;
		vertical-align: bottom;
		border-radius: 1vmin;
	}

	@media (max-aspect-ratio: 1/1) {
		li {
			height: 30vh;
		}
	}

	@media (max-height: 480px) {
		li {
			height: 80vh;
		}
	}

	@media (max-aspect-ratio: 1/1) and (max-width: 480px) {
		ul {
			flex-direction: row;
		}

		li {
			height: auto;
			width: 100%;
		}
		img {
			width: 100%;
			max-height: 75vh;
			min-width: 0;
		}
	}
</style>
