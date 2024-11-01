<script>
    import { onMount } from 'svelte';
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Input, Spinner, Card, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
    import { browser } from '$app/environment';
    import { isUserSignedIn, signOut } from '$lib/auth';
    import { goto } from '$app/navigation';

    let Home;
    let Share;
    let LogOut;

    if (browser) {
        import('svelte-bootstrap-icons').then(module => {
            Home = module.Home;
            Share = module.Share;
            LogOut = module.LogOut;
        });
    }

    let searchUrl = '';
    let searchResult = null;
    let isLoading = false;

    let isSignedIn = false;

    onMount(async () => {
        isSignedIn = await isUserSignedIn();
    });

    async function handleSearch() {
        if (!searchUrl) return;

        isLoading = true;
        try {
            const response = await fetch('https://cguardurlapi.onrender.com/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: searchUrl }),
            });
            searchResult = await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            searchResult = { error: 'Failed to fetch data. Please try again.' };
        } finally {
            isLoading = false;
        }
    }

    async function handleSignOut() {
        signOut();
        goto('/'); // Redirect to home page after signing out
    }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <Navbar let:hidden let:toggle rounded color="primary">
        <NavBrand href="/">
            <img src="/images/cipherguard-logo.svg" class="mr-3 h-6 sm:h-9" alt="Cipherguard Logo" />
            <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                Cipherguard
            </span>
        </NavBrand>
        <NavHamburger on:click={toggle} />
        <NavUl {hidden}>
            <NavLi href="/fileshare">File Share</NavLi>
            <NavLi href="/urlscanner">URL Scanner</NavLi>
            {#if isSignedIn}
                <NavLi href="/" on:click={handleSignOut}>Sign Out</NavLi>
            {/if}
        </NavUl>
    </Navbar>

    <main class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">URL Scanner</h1>

        <div class="flex justify-center">
            <Card class="mb-8 p-6 w-full max-w-4xl">
                <form on:submit|preventDefault={handleSearch} class="flex flex-col gap-4">
                    <Input
                        type="url"
                        placeholder="Paste a link to scan"
                        required
                        bind:value={searchUrl}
                        class="text-lg py-3"
                        size="lg"
                    />
                    <Button type="submit" disabled={isLoading} class="w-full py-3 text-lg btn-primary" size="lg">
                        {#if isLoading}
                            <Spinner size="sm" class="mr-2" />
                            Scanning...
                        {:else}
                            Scan Link
                        {/if}
                    </Button>
                </form>
            </Card>
        </div>

        {#if searchResult}
            <Card class="overflow-hidden w-full max-w-4xl mx-auto mt-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scan Results</h2>
                {#if searchResult.error}
                    <p class="text-red-500 p-4 bg-red-100 dark:bg-red-900 rounded">{searchResult.error}</p>
                {:else if searchResult.prediction}
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        {#if 'SCORE' in searchResult.prediction}
                            {@const score = searchResult.prediction.SCORE}
                            {@const safetyClass = score >= 160 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                                  score >= 100 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                                  'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}
                            {@const safetyText = score >= 160 ? 'Safe' :
                                                 score >= 100 ? 'Potentially Harmful' :
                                                 'Harmful - Do Not Visit'}
                            <div class="mb-6 p-4 rounded-lg {safetyClass}">
                                <h3 class="text-2xl font-bold mb-2">Safety Rating: {safetyText}</h3>
                                <p class="text-lg">Score: {score}/180</p>
                            </div>
                        {/if}
                        <h3 class="text-xl font-semibold mb-4">Prediction Details</h3>
                        <div class="grid grid-cols-2 gap-4">
                            {#each Object.entries(searchResult.prediction) as [key, value]}
                                {#if key !== 'SCORE'}
                                    <div class="col-span-2 sm:col-span-1">
                                        <p class="font-medium text-gray-700 dark:text-gray-300">{key}:</p>
                                        {#if typeof value === 'object' && value !== null}
                                            <pre class="mt-1 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                                                {JSON.stringify(value, null, 2)}
                                            </pre>
                                        {:else if typeof value === 'boolean'}
                                            <p class="mt-1 text-sm {value ? 'text-green-600' : 'text-red-600'}">
                                                {value ? 'Yes' : 'No'}
                                            </p>
                                        {:else}
                                            <p class="mt-1 text-sm">{value}</p>
                                        {/if}
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {:else}
                    <p class="text-gray-500">No prediction data available.</p>
                {/if}
            </Card>
        {/if}
    </main>
</div>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
    }

    :global(.btn-primary) {
        background-color: #10B981;
        color: white;
        transition: background-color 0.3s ease;
    }

    :global(.btn-primary:hover) {
        background-color: #059669;
    }

    :global(.btn-primary:disabled) {
        background-color: #6B7280;
        cursor: not-allowed;
    }
</style>
