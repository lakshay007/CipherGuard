<script>
    import { onMount } from 'svelte';
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Input, Spinner, Card, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
    import { browser } from '$app/environment';

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

    async function handleSearch() {
        if (!searchUrl) return;

        isLoading = true;
        try {
            const response = await fetch('http://localhost:8000/predict', {
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

    function handleSignOut() {
        // Implement sign out logic here
        console.log('Signing out...');
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
            <NavLi href="/">
                {#if Home}
                    <Home class="mr-2" />
                {/if}
                Home
            </NavLi>
            <NavLi href="/share">
                {#if Share}
                    <Share class="mr-2" />
                {/if}
                Share Files
            </NavLi>
            <NavLi href="/" on:click={handleSignOut}>
                {#if LogOut}
                    <LogOut class="mr-2" />
                {/if}
                Sign Out
            </NavLi>
            <NavLi href="/fileshare">
                {#if Share}
                    <Share class="mr-2" />
                {/if}
                File Share
            </NavLi>
        </NavUl>
    </Navbar>

    <main class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Link Scanner Dashboard</h1>

        <Card class="mb-8 p-6">
            <form on:submit|preventDefault={handleSearch} class="flex flex-col gap-4">
                <Input
                    type="url"
                    placeholder="Paste a link to scan"
                    required
                    bind:value={searchUrl}
                    class="text-lg py-3"
                    size="lg"
                />
                <Button type="submit" disabled={isLoading} class="w-full py-3 text-lg" size="lg">
                    {#if isLoading}
                        <Spinner size="sm" class="mr-2" />
                        Scanning...
                    {:else}
                        Scan Link
                    {/if}
                </Button>
            </form>
        </Card>

        {#if searchResult}
            <Card class="overflow-hidden">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scan Results</h2>
                {#if searchResult.error}
                    <p class="text-red-500 p-4 bg-red-100 dark:bg-red-900 rounded">{searchResult.error}</p>
                {:else}
                    <Table striped={true}>
                        <TableHead>
                            <TableHeadCell>Property</TableHeadCell>
                            <TableHeadCell>Value</TableHeadCell>
                        </TableHead>
                        <TableBody>
                            {#each Object.entries(searchResult) as [key, value]}
                                <TableBodyRow>
                                    <TableBodyCell>{key}</TableBodyCell>
                                    <TableBodyCell>
                                        {#if typeof value === 'object'}
                                            <pre class="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                        {:else}
                                            {value}
                                        {/if}
                                    </TableBodyCell>
                                </TableBodyRow>
                            {/each}
                        </TableBody>
                    </Table>
                {/if}
            </Card>
        {/if}
    </main>
</div>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
    }
</style>