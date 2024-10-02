<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { Button, Card } from 'flowbite-svelte';

    let docData = null;
    let error = null;

    onMount(async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/upload/${$page.params.customDocId}`);
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
            const blob = new Blob([atob(docData.content)], { type: docData.contentType });
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
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
    <main class="container mx-auto px-4 max-w-3xl">
        <Card class="mb-8 p-6">
            {#if error}
                <p class="text-red-500">{error}</p>
            {:else if docData}
                <h1 class="text-2xl font-bold mb-4">Shared Document: {docData.filename}</h1>
                {#if docData.contentType.startsWith('text/')}
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
                        <pre class="whitespace-pre-wrap">{atob(docData.content)}</pre>
                    </div>
                {:else}
                    <p class="mb-4">This is a file document. Click the button below to download it.</p>
                {/if}
                <Button on:click={downloadFile}>Download File</Button>
            {:else}
                <p>Loading...</p>
            {/if}
        </Card>
    </main>
</div>