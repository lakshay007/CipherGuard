<script>
    import { onMount } from 'svelte';
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Input, Textarea, Card } from 'flowbite-svelte';
    import { browser } from '$app/environment';

    let Home;
    let Share;
    let LogOut;
    let FileInput;

    if (browser) {
        import('svelte-bootstrap-icons').then(module => {
            Home = module.Home;
            Share = module.Share;
            LogOut = module.LogOut;
        });
        import('flowbite-svelte').then(module => {
            FileInput = module.FileInput;
        });
    }

    let text = '';
    let file = null;
    let email = '';
    let customDocId = '';
    let uploadStatus = '';
    let fileInputRef;
    let uploadedLink = '';

    function openFileDialog() {
        if (fileInputRef) {
            fileInputRef.click();
        }
    }

    function handleFileChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            file = files[0];
        }
    }

    async function handleUpload() {
        if (!customDocId) {
            uploadStatus = 'Please provide a custom document ID.';
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('customDocId', customDocId);

        if (text) {
            formData.append('text', text);
        } else if (file) {
            formData.append('file', file);
        } else {
            uploadStatus = 'Please provide either text or a file to upload.';
            return;
        }

        try {
            // First, check if the custom ID is unique
            const checkResponse = await fetch(`http://localhost:4000/api/upload/check-id/${customDocId}`);
            const checkResult = await checkResponse.json();

            if (!checkResult.isUnique) {
                uploadStatus = 'This document ID is already in use. Please choose a different one.';
                return;
            }

            // If the ID is unique, proceed with the upload
            const response = await fetch('http://localhost:4000/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                uploadStatus = `Upload successful! Document ID: ${result.id}`;
                uploadedLink = `http://localhost:5173/${result.id}`; // Update this when you deploy
                text = '';
                file = null;
                customDocId = '';
                if (fileInputRef) {
                    fileInputRef.value = '';
                }
            } else {
                uploadStatus = 'Upload failed. Please try again.';
                uploadedLink = '';
            }
        } catch (error) {
            console.error('Error uploading:', error);
            uploadStatus = 'An error occurred during upload.';
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
            <NavLi href="/dashboard">
                {#if Home}
                    <Home class="mr-2" />
                {/if}
                Dashboard
            </NavLi>
            <NavLi href="/fileshare">
                {#if Share}
                    <Share class="mr-2" />
                {/if}
                File Share
            </NavLi>
            <NavLi href="/" on:click={handleSignOut}>
                {#if LogOut}
                    <LogOut class="mr-2" />
                {/if}
                Sign Out
            </NavLi>
        </NavUl>
    </Navbar>

    <main class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">File Sharing</h1>

        <Card class="mb-8 p-6">
            <form on:submit|preventDefault={handleUpload} class="flex flex-col gap-4">
                <Input type="email" placeholder="Your email" bind:value={email} required />
                <Input type="text" placeholder="Custom Document ID" bind:value={customDocId} required />
                <Textarea placeholder="Enter text to share" bind:value={text} rows="4" />
                <p class="text-center text-gray-500 dark:text-gray-400">OR</p>
                <div class="flex items-center justify-center w-full">
                    <input
                        type="file"
                        id="file-upload"
                        class="hidden"
                        bind:this={fileInputRef}
                        on:change={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                    />
                    <Button type="button" on:click={openFileDialog} class="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                        {file ? file.name : 'Choose File'}
                    </Button>
                </div>
                <Button type="submit" class="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white" size="lg">Upload</Button>
            </form>
        </Card>

        {#if uploadStatus}
            <p class="text-center text-lg {uploadStatus.includes('successful') ? 'text-green-600' : 'text-red-600'}">
                {uploadStatus}
            </p>
            {#if uploadedLink}
                <p class="text-center mt-4">
                    Your document is now available at: <a href={uploadedLink} class="text-blue-600 hover:underline">{uploadedLink}</a>
                </p>
            {/if}
        {/if}
    </main>
</div>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
    }
</style>