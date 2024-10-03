<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { Modal, Label, Input } from 'flowbite-svelte';
    import { Button as FlowbiteButton } from 'flowbite-svelte';
    import { goto } from '$app/navigation';
  
    const API_URL = import.meta.env.VITE_API_URL;
  
    let showContent = false;
    let showLoginModal = false;
    let showSignupModal = false; 
    let showForgotPasswordModal = false;
    let loginUsername = '';
    let loginPassword = '';
    let signupName = ''; 
    let signupUsername = ''; 
    let signupEmail = ''; 
    let signupPassword = ''; 
    let resetEmail = '';
    let message = '';
    let resetEmailButtonDisabled = false;
    let resetEmailCountdown = 0;
  
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
  
    function openForgotPasswordModal() {
      showLoginModal = false;
      showForgotPasswordModal = true;
    }
  
    function openSignupFromLogin() {
      showLoginModal = false;
      showSignupModal = true;
    }
  
    async function handleForgotPassword() {
      if (resetEmailButtonDisabled) return;
  
      try {
        resetEmailButtonDisabled = true;
        resetEmailCountdown = 60;
  
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: resetEmail }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          message = 'Password reset email sent. Please check your inbox.';
        } else {
          message = 'Failed to send reset email: ' + data.message;
        }
  
        const countdownInterval = setInterval(() => {
          resetEmailCountdown--;
          if (resetEmailCountdown <= 0) {
            clearInterval(countdownInterval);
            resetEmailButtonDisabled = false;
          }
        }, 1000);
  
      } catch (error) {
        console.error('Error:', error);
        message = 'An error occurred. Please try again.';
        resetEmailButtonDisabled = false;
      }
    }
  
    async function handleLogin() {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Store the token in localStorage
          localStorage.setItem('token', data.token);
          // Redirect to file share page
          goto('/fileshare');
        } else {
          message = data.message || 'Login failed';
        }
      } catch (error) {
        console.error('Login error:', error);
        message = 'An error occurred during login';
      }
    }
  
    async function handleSignup() {
      try {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: signupName, username: signupUsername, email: signupEmail, password: signupPassword }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Store the token in localStorage
          localStorage.setItem('token', data.token);
          // Redirect to file share page
          goto('/fileshare');
        } else {
          message = data.message || 'Signup failed';
        }
      } catch (error) {
        console.error('Signup error:', error);
        message = 'An error occurred during signup';
      }
    }
  
    function goToFileShare() {
        goto('/fileshare');
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
            <FlowbiteButton color="none" class="text-gray-300 hover:text-primary-400 transition duration-300 p-0" on:click={openLoginModal}>
              Login
            </FlowbiteButton>
          </li>
          <li>
            <FlowbiteButton color="none" class="text-gray-300 hover:text-primary-400 transition duration-300 p-0" on:click={openSignupModal}>
              Sign Up
            </FlowbiteButton>
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
            <button on:click={goToFileShare} class="bg-primary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition duration-300 inline-block transform hover:scale-105">Get Started</button>
          </div>
        </section>
  
        <section id="features" class="py-20 bg-gray-800 bg-opacity-50" in:fly="{{ y: 50, duration: 1000, delay: 200 }}">
          <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-primary-400">Our Features</h2>
            <div class="grid md:grid-cols-2 gap-12">
              <div class="bg-gray-700 p-8 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
                <div class="text-primary-400 text-4xl mb-6"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  </div>
                <h3 class="text-2xl font-semibold mb-4">Link Scanner</h3>
                <p class="text-gray-300 mb-6">Protect yourself from malicious websites with our advanced link scanning technology. Stay safe while browsing the web.</p>
                <ul class="space-y-2 text-gray-300">
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Real-time threat detection</li>
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Comprehensive malware database</li>
                  <li class="flex items-center"><span class="text-primary-400 mr-2">✓</span> Instant results and recommendations</li>
                </ul>
              </div>
              <div class="bg-gray-700 p-8 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
                <div class="text-primary-400 text-4xl mb-6"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  </div>
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
            <button on:click={goToFileShare} class="bg-primary-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-600 transition duration-300 inline-block transform hover:scale-105">Get Started Now</button>
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
    <FlowbiteButton type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white">Login to your account</FlowbiteButton>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      Not registered? <a href="#" on:click={openSignupFromLogin} class="text-primary-700 hover:underline dark:text-primary-500">Create account</a>
    </div>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      <a href="#" on:click={openForgotPasswordModal} class="text-primary-700 hover:underline dark:text-primary-500">Forgot Password?</a>
    </div>
    {#if message}
      <div class="text-red-500">{message}</div>
    {/if}
  </form>
</Modal>

<!-- Signup Modal -->
<Modal bind:open={showSignupModal} size="xs">
  <form class="flex flex-col space-y-6" on:submit|preventDefault={handleSignup}>
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Create an Account</h3>
    <Label class="space-y-2">
      <span>Name</span>
      <Input type="text" bind:value={signupName} placeholder="Enter your name" required />
    </Label>
    <Label class="space-y-2">
      <span>Username</span>
      <Input type="text" bind:value={signupUsername} placeholder="Choose a username" required />
    </Label>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" bind:value={signupEmail} placeholder="Enter your email" required />
    </Label>
    <Label class="space-y-2">
      <span>Password</span>
      <Input type="password" bind:value={signupPassword} placeholder="•••••••••" required />
    </Label>
    <FlowbiteButton type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white">Create your account</FlowbiteButton>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      Already have an account? <a href="#" class="text-primary-700 hover:underline dark:text-primary-500" on:click={closeSignupModal}>Login</a>
    </div>
    {#if message}
      <div class="text-red-500">{message}</div>
    {/if}
  </form>
</Modal>

<!-- Forgot Password Modal -->
<Modal bind:open={showForgotPasswordModal} size="xs">
  <form class="flex flex-col space-y-6" on:submit|preventDefault={handleForgotPassword}>
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Reset Your Password</h3>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" bind:value={resetEmail} placeholder="Enter your email" required />
    </Label>
    <FlowbiteButton type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white" disabled={resetEmailButtonDisabled}>
      {resetEmailButtonDisabled ? `Wait ${resetEmailCountdown}s` : 'Send Reset Link'}
    </FlowbiteButton>
    <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
      Remember your password? <a href="#" class="text-primary-700 hover:underline dark:text-primary-500" on:click={() => { showForgotPasswordModal = false; showLoginModal = true; }}>Back to Login</a>
    </div>
    {#if message}
      <div class="text-green-500">{message}</div>
    {/if}
  </form>
</Modal>

  
  <style>
    :global(body) {
      font-family: 'Inter', sans-serif;
    }

    /* Add these styles for the buttons */
    :global(.flowbite-button) {
      background-color: #10B981;
      color: white;
      transition: background-color 0.3s ease;
    }

    :global(.flowbite-button:hover) {
      background-color: #059669;
    }

    :global(.flowbite-button:disabled) {
      background-color: #6B7280;
      cursor: not-allowed;
    }
  </style>