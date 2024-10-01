<script>
    import { onMount } from 'svelte';

    let user = null;

    onMount(() => {
        // Check if the user is logged in by checking for a token
        const token = localStorage.getItem('token');
        if (!token) {
            // If no token, redirect to the login page
            window.location.href = '/';
        } else {
            // Optionally, decode the token to get user information
            // You can use a library like jwt-decode to decode the token
            // const decoded = jwt_decode(token);
            // user = decoded; // Set user information if needed
        }
    });
</script>

<svelte:head>
    <title>Dashboard - Cipherguard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-inter">
    <header class="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg fixed w-full z-10">
        <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
            <div class="text-2xl font-bold text-primary-400">Cipherguard Dashboard</div>
            <ul class="flex space-x-6 items-center">
                <li><a href="/" class="text-gray-300 hover:text-primary-400 transition duration-300">Home</a></li>
                <li><a href="/logout" class="text-gray-300 hover:text-primary-400 transition duration-300">Logout</a></li>
            </ul>
        </nav>
    </header>

    <main class="pt-32 pb-20">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">Welcome to Your Dashboard</h1>
            <p class="text-xl mb-10 text-gray-300">Here you can manage your account and access all features.</p>
            <!-- Add more dashboard content here -->
        </div>
    </main>
</div>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
    }
</style>