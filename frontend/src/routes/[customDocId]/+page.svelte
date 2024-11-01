<script>
    import { decryptText } from '$lib/crypto';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
    import { isUserSignedIn, signOut, getUserEmail } from '$lib/auth';
    import { goto } from '$app/navigation';
    
    const API_URL = import.meta.env.VITE_API_URL;
    let docData;
    let decryptedContent = '';
    let isLoading = true;
    let isSignedIn = false;
    let userEmail = '';
    
    onMount(async () => {
        isSignedIn = await isUserSignedIn();
        userEmail = getUserEmail();
        console.log('User Email:', userEmail);
        
        try {
            // Fetch document data
            const response = await fetch(`${API_URL}/api/upload/${$page.params.customDocId}`);
            if (!response.ok) {
                throw new Error('Document not found');
            }
            docData = await response.json();
            
            // If document exists and has content
            if (docData && docData.content) {
                if (docData.isEncrypted) {
                    const privateKey = localStorage.getItem('privateKey');
                    console.log('Private Key:', privateKey);
                    console.log('User Email:', userEmail);
                    console.log('Intended Recipient:', docData.intendedRecipient);
                    if (privateKey && docData.intendedRecipient === userEmail) {
                        try {
                            console.log('Decrypting content');
                            decryptedContent = await decryptText(docData.content, privateKey);
                        } catch (error) {
                            console.error('Decryption failed:', error);
                            decryptedContent = 'Unable to decrypt content';
                        }
                    } else {
                        decryptedContent = 'This content is encrypted and can only be viewed by the intended recipient.';
                    }
                } else {
                    decryptedContent = docData.content;
                }
            } else {
                decryptedContent = 'Document not found or empty';
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            decryptedContent = 'Error loading document';
        } finally {
            isLoading = false;
        }
    });

    function copyToClipboard() {
        if (docData && docData.contentType === 'text/plain') {
            navigator.clipboard.writeText(decryptedContent)
                .then(() => alert('Content copied to clipboard!'))
                .catch(err => console.error('Failed to copy: ', err));
        }
    }

    function handleSignOut() {
        signOut();
        goto('/'); 
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
            {:else}
                <NavLi href="/">Sign In</NavLi>
            {/if}
        </NavUl>
    </Navbar>

    <main class="container mx-auto px-4 py-8 max-w-4xl">
        {#if isLoading}
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        {:else}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {#if docData}
                    <div class="mb-4 flex justify-between items-center">
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                            {docData.filename || 'Shared Document'}
                        </h1>
                        {#if docData.contentType === 'text/plain'}
                            <button 
                                on:click={copyToClipboard}
                                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Copy to Clipboard
                            </button>
                        {/if}
                    </div>
                    <div class="prose dark:prose-invert max-w-none">
                        <pre class="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                            {decryptedContent}
                        </pre>
                    </div>
                    {#if docData.uploadDate}
                        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            Uploaded on: {new Date(docData.uploadDate).toLocaleString()}
                        </div>
                    {/if}
                {:else}
                    <p class="text-red-600 dark:text-red-400">Document not found</p>
                {/if}
            </div>
        {/if}
    </main>
</div>

<style>
    pre {
        font-family: 'Courier New', Courier, monospace;
    }
</style>