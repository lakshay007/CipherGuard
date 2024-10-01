<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { Button, Modal, Label, Input } from 'flowbite-svelte';
  
    let showContent = false;
    let showLoginModal = false;
    let showSignupModal = false; // New state for signup modal
    let loginUsername = '';
    let loginPassword = '';
    let signupName = ''; // New state for signup name
    let signupUsername = ''; // New state for signup username
    let signupEmail = ''; // New state for signup email
    let signupPassword = ''; // New state for signup password
    let message = '';
  
    onMount(() => {
      showContent = true;
    });
  
    function openLoginModal() {
      showLoginModal = true;
    }
  
    function closeLoginModal() {
      showLoginModal = false;
    }
  
    function openSignupModal() {
      showSignupModal = true; // Open signup modal
    }
  
    function closeSignupModal() {
      showSignupModal = false; // Close signup modal
    }
  
    async function handleLogin(event) {
      event.preventDefault();
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
  
      const data = await response.json();
      if (response.ok) {
        message = 'Login successful! Token: ' + data.token;
      
         localStorage.setItem('token', data.token);
        closeLoginModal();
        window.location.href = '/dashboard';
      } else {
        message = 'Login failed: ' + data.message;
      }
    }
  
    async function handleSignup(event) {
      event.preventDefault();
      const response = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: signupName, username: signupUsername, email: signupEmail, password: signupPassword }),
      });
  
      const data = await response.json();
      if (response.ok) {
        message = 'Signup successful! Token: ' + data.token;
        localStorage.setItem('token', data.token);
        closeSignupModal();
        window.location.href = '/dashboard';
      } else {
        message = 'Signup failed: ' + data.message;
      }
    }
  </script>

  
  <svelte:head>
    <title>Cipherguard - Secure Link Scanner & File Sharing</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  </svelte:head>
  
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-inter">
    <header class="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg fixed w-full z-10">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="text-2xl font-bold text-primary-400">Cipherguard</div>
        <ul class="flex space-x-6 items-center">
          <li><a href="#features" class="text-gray-300 hover:text-primary-400 transition duration-300">Features</a></li>
          <li><a href="#cta" class="text-gray-300 hover:text-primary-400 transition duration-300">Get Started</a></li>
          <li>
            <Button color="none" class="text-gray-300 hover:text-primary-400 transition duration-300 p-0" on:click={openLoginModal}>
              Login
            </Button>
          </li>
          <li>
            <Button color="none" class="text-gray-300 hover:text-primary-400 transition duration-300 p-0" on:click={openSignupModal}>
              Sign Up
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  
    <main>
      {#if showContent}
        <section class="pt-32 pb-20" in:fade="{{ duration: 1000 }}">
          <div class="container mx-auto px-4 text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">Secure Your Online Experience with Cipherguard</h1>
            <p class="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">Scan links for malicious content and share files securely - all in one place. Experience the future of online safety.</p>
            <a href="#cta" class="bg-primary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition duration-300 inline-block transform hover:scale-105">Get Started</a>
          </div>
        </section>
  
        <section id="features" class="py-20 bg-gray-800 bg-opacity-50" in:fly="{{ y: 50, duration: 1000, delay: 200 }}">
          <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-primary-400">Our Features</h2>
            <div class="grid md:grid-cols-2 gap-12">
              <div class="bg-gray-700 p-8 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
                <div class="text-primary-400 text-4xl mb-6">🔒</div>
                <h3 class="text-2xl font-semibold mb-4">Link Scanner</h3>
                <p class="text-gray-300 mb-6">Protect yourself from malicious websites with our advanced link scanning technology. Stay safe while browsing the web.</p>
                <ul class="space-y-2 text-gray-300">
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Real-time threat detection</li>
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Comprehensive malware database</li>
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Instant results and recommendations</li>
                </ul>
              </div>
              <div class="bg-gray-700 p-8 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
                <div class="text-primary-400 text-4xl mb-6">🖼️</div>
                <h3 class="text-2xl font-semibold mb-4">Free File Sharing</h3>
                <p class="text-gray-300 mb-6">Share your photos and files securely with friends, family, or colleagues. Fast, easy, and free!</p>
                <ul class="space-y-2 text-gray-300">
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> End-to-end encryption</li>
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Large file support</li>
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Easy-to-use interface</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
  
        <section id="cta" class="py-20" in:fly="{{ y: 50, duration: 1000, delay: 400 }}">
          <div class="container mx-auto px-4 text-center">
            <h2 class="text-4xl font-bold mb-6 text-primary-400">Ready to Secure Your Online Experience?</h2>
            <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join Cipherguard today and enjoy safe browsing and secure file sharing. Take control of your digital life.</p>
            <a href="/signup" class="bg-primary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition duration-300 inline-block transform hover:scale-105">Sign Up Now</a>
          </div>
        </section>
      {/if}
    </main>
  
    <footer class="bg-gray-800 text-gray-300 py-12">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2024 Cipherguard. All rights reserved.</p>
        <div class="mt-6 space-x-4">
          <a href="/privacy" class="text-gray-400 hover:text-primary-400 transition duration-300">Privacy Policy</a>
          <a href="/terms" class="text-gray-400 hover:text-primary-400 transition duration-300">Terms of Service</a>
        </div>
      </div>
    </footer>
  </div>
  
  <Modal bind:open={showLoginModal} size="xs">
  <form class="flex flex-col space-y-6" on:submit|preventDefault={handleLogin}>
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in to CipherGuard</h3>
    <Label class="space-y-2">
      <span>Username</span>
      <Input type="text" bind:value={loginUsername} placeholder="Enter your username" required />
    </Label>
    <Label class="space-y-2">
      <span>Password</span>
      <Input type="password" bind:value={loginPassword} placeholder="•••••••••" required />
    </Label>
    <Button type="submit" class="w-full">Login to your account</Button>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      Not registered? <a href="/signup" class="text-primary-700 hover:underline dark:text-primary-500">Create account</a>
    </div>
    {#if message}
      <div class="text-red-500">{message}</div>
    {/if}
  </form>
</Modal>

<!-- Signup Modal -->
<Modal bind:open={showSignupModal} size="xs">
  <form class="flex flex-col space-y-6" on:submit|preventDefault={handleSignup}>
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign up for CipherGuard</h3>
    <Label class="space-y-2">
      <span>Name</span>
      <Input type="text" bind:value={signupName} placeholder="Enter your name" required />
    </Label>
    <Label class="space-y-2">
      <span>Username</span>
      <Input type="text" bind:value={signupUsername} placeholder="Enter your username" required />
    </Label>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" bind:value={signupEmail} placeholder="Enter your email" required />
    </Label>
    <Label class="space-y-2">
      <span>Password</span>
      <Input type="password" bind:value={signupPassword} placeholder="•••••••••" required />
    </Label>
    <Button type="submit" class="w-full">Create your account</Button>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      Already have an account? <a href="#" class="text-primary-700 hover:underline dark:text-primary-500" on:click={closeSignupModal}>Login</a>
    </div>
    {#if message}
      <div class="text-red-500">{message}</div>
    {/if}
  </form>
</Modal>

  
  <style>
    :global(body) {
      font-family: 'Inter', sans-serif;
    }
  </style>