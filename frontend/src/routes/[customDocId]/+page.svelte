<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { Button, Card, Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
    import { ClipboardSolid } from 'flowbite-svelte-icons';
    import { isUserSignedIn, signOut } from '$lib/auth';
    import { goto } from '$app/navigation';

    const API_URL = import.meta.env.VITE_API_URL;

    let docData = null;
    let error = null;
    let isSignedIn = false;

    onMount(async () => {
        isSignedIn = isUserSignedIn();
        try {
            const response = await fetch(`${API_URL}/api/upload/${$page.params.customDocId}`);
            if (response.ok) {
                docData = await response.json();
            } else {
                error = 'Document not found';
            }
        } catch (err) {
            console.error('Error fetching document:', err);
            error = 'Error fetching document';
        }
    });

    function downloadFile() {
        if (docData) {
            let content = docData.content;
            if (docData.contentType !== 'text/plain') {
                // For non-text files, convert base64 to Uint8Array
                const binaryString = atob(docData.content);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                content = bytes;
            }
            const blob = new Blob([content], { type: docData.contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    function copyToClipboard() {
        if (docData && docData.contentType === 'text/plain') {
            navigator.clipboard.writeText(docData.content)
                .then(() => alert('Content copied to clipboard!'))
                .catch(err => console.error('Failed to copy: ', err));
        }
    }

    function handleSignOut() {
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

    <main class="container mx-auto px-4 py-8">
        <Card class="mb-8 p-6 w-full max-w-none" padding="none"> <!-- Added max-w-none and padding="none" -->
            <div class="p-6 w-full"> <!-- Added a wrapper div with padding -->
                {#if error}
                    <p class="text-red-500">{error}</p>
                {:else if docData}
                    <h1 class="text-2xl font-bold mb-4">Shared Document: {docData.filename}</h1>
                    {#if docData.contentType === 'text/plain'}
                        <div class="relative mb-4 h-[calc(100vh-200px)] w-full">
                            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg overflow-auto h-full w-full">
                                <pre class="whitespace-pre-wrap text-lg break-words">{docData.content}</pre>
                            </div>
                            <Button class="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white" on:click={copyToClipboard}>
                                <ClipboardSolid class="mr-2 h-5 w-5" />
                                Copy
                            </Button>
                        </div>
                    {:else}
                        <p class="mb-4">This is a file document. Click the button below to download it.</p>
                    {/if}
                    <Button class="bg-green-600 hover:bg-green-700 text-white" on:click={downloadFile}>Download File</Button>
                {:else}
                    <p>Loading...</p>
                {/if}
            </div>
        </Card>
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        width: 100%;
    }

    pre {
        max-width: 100%;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
</style>