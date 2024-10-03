<script>
    import { onMount } from 'svelte';
    import { setupKeepAlive } from '$lib/keepAlive';
    import "../app.css";

    onMount(() => {
        setupKeepAlive();
    });
</script>

<slot />