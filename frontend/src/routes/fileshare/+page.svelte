<script>
    import { onMount } from 'svelte';
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Input, Textarea, Card, Modal, Label, Range } from 'flowbite-svelte';
    import { browser } from '$app/environment';
    import { isUserSignedIn, signOut } from '$lib/auth';
    import { goto } from '$app/navigation';
    import { Moon, Sun, Menu, X } from 'lucide-svelte';
    const API_URL = import.meta.env.VITE_API_URL;

    let Home;
    let Share;
    let LogOut;
    let FileInput;
    let isSignedIn = false;

    
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
    let isDarkMode = false; // Changed to false for default light mode
  let isMenuOpen = false;

  let textSize = 16;
  let textColor = '#000000';
  let isBold = false;
  let text = '';

  $: formattedText = {
      fontSize: `${textSize}px`,
      color: textColor,
      fontWeight: isBold ? 'bold' : 'normal'
  };

  function applyBold() {
      isBold = !isBold;
  }

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

    onMount(async () => {
        isSignedIn = await isUserSignedIn();
        
        document.documentElement.classList.remove('dark');
    });

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

    let email = '';
    let customDocId = '';
    let uploadStatus = '';
    let fileInputRef;
    let uploadedLink = '';
    let file = null;

    function openFileDialog() {
        if (fileInputRef) {
            fileInputRef.click();
        }
    }

    function handleFileChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            file = files[0];
            text = ''; // Clear text when a file is selected
        } else {
            file = null;
        }
    }

    function clearFile() {
        file = null;
        if (fileInputRef) {
            fileInputRef.value = '';
        }
    }

    async function handleUpload() {
        if (!customDocId) {
            uploadStatus = 'Please provide a custom document ID.';
            return;
        }

        const formData = new FormData();
        formData.append('customDocId', customDocId);

        if (email) {
            formData.append('email', email);
        }

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
            const checkResponse = await fetch(`${API_URL}/api/upload/check-id/${customDocId}`);
            const checkResult = await checkResponse.json();

            if (!checkResult.isUnique) {
                uploadStatus = 'This document ID is already in use. Please choose a different one.';
                return;
            }

            // If the ID is unique, proceed with the upload
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                uploadStatus = `Upload successful! Document ID: ${result.id}`;
                uploadedLink = `https://pasteit.live/${result.id}`; 
                text = '';
                file = null;
                customDocId = '';
                email = ''; // Clear email field after successful upload
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

    function openLoginModal() {
        showLoginModal = true;
    }

    function closeLoginModal() {
        showLoginModal = false;
    }

    function openSignupModal() {
        showSignupModal = true;
    }

    function closeSignupModal() {
        showSignupModal = false;
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
                localStorage.setItem('token', data.token);
                isSignedIn = true;
                showLoginModal = false;
                message = 'Login successful!';
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
                localStorage.setItem('token', data.token);
                isSignedIn = true;
                showSignupModal = false;
                message = 'Signup successful!';
            } else {
                message = data.message || 'Signup failed';
            }
        } catch (error) {
            console.error('Signup error:', error);
            message = 'An error occurred during signup';
        }
    }

    async function handleSignOut() {
        signOut();
        isSignedIn = false;
        goto('/'); 
    }

    function handleSignIn() {
        goto('/?signin=true');
    }
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
    <nav class="bg-white dark:bg-gray-800 shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center">
              <a href="/" class="flex-shrink-0">
                <img src="/images/cipherguard-logo.svg" class="h-8 w-auto" alt="Cipherguard Logo" />
              </a>
              <div class="hidden md:block">
                <div class="ml-10 flex items-baseline space-x-4">
                  <a href="/fileshare" class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">File Share</a>
                  <a href="/urlscanner" class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">URL Scanner</a>
                </div>
              </div>
            </div>
            <div class="hidden md:block">
              <div class="ml-4 flex items-center md:ml-6">
                <button on:click={toggleDarkMode} class="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  {#if isDarkMode}
                    <Sun size={20} />
                  {:else}
                    <Moon size={20} />
                  {/if}
                </button>
                {#if isSignedIn}
                  <button on:click={handleSignOut} class="ml-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Sign Out</button>
                {:else}
                  <button on:click={openLoginModal} class="ml-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Sign In</button>
                  <button on:click={openSignupModal} class="ml-3 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">Sign Up</button>
                {/if}
              </div>
            </div>
            <div class="flex md:hidden">
              <button on:click={toggleDarkMode} class="p-1 mr-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                {#if isDarkMode}
                  <Sun size={20} />
                {:else}
                  <Moon size={20} />
                {/if}
              </button>
              <button on:click={toggleMenu} type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                {#if isMenuOpen}
                  <X size={24} />
                {:else}
                  <Menu size={24} />
                {/if}
              </button>
            </div>
          </div>
        </div>
      
        <div class="md:hidden" class:hidden={!isMenuOpen} id="mobile-menu">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/fileshare" class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">File Share</a>
            <a href="/urlscanner" class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">URL Scanner</a>
            {#if isSignedIn}
              <button on:click={handleSignOut} class="w-full text-left text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">Sign Out</button>
            {:else}
              <button on:click={openLoginModal} class="w-full text-left text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium">Sign In</button>
              <button on:click={openSignupModal} class="w-full text-left bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium">Sign Up</button>
            {/if}
          </div>
        </div>
      </nav>
  
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-4xl font-bold mb-8 text-center">Upload or paste your content</h1>
  
      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <form on:submit|preventDefault={handleUpload} class="p-6 space-y-6">
          <Input type="email" placeholder="Your email (optional)" bind:value={email} class="w-full" />
          <Input type="text" placeholder="Custom Document link name" bind:value={customDocId} required class="w-full" />
          
          <!-- Text Formatting Toolbar (commented out) -->
          <!--
          <div class="flex items-center space-x-4 mb-2">
              <Button on:click={applyBold} class="p-2" color={isBold ? "blue" : "light"}>
                  <Bold size={20} />
              </Button>
              <div class="flex items-center space-x-2">
                  <Type size={20} />
                  <Range bind:value={textSize} min={8} max={32} step={1} />
              </div>
              <div class="flex items-center space-x-2">
                  <Palette size={20} />
                  <input type="color" bind:value={textColor} class="w-8 h-8 rounded-full overflow-hidden" />
              </div>
          </div>
          -->

          <Textarea 
              id="content-textarea"
              placeholder="paste your content here" 
              bind:value={text} 
              rows="10" 
              class="w-full text-lg resize-none"
              disabled={file !== null}
          />
          <div class="flex items-center">
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span class="flex-shrink mx-4 text-gray-500 dark:text-gray-400">OR</span>
            <div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>
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
            {#if file}
              <Button type="button" on:click={clearFile} class="ml-2 py-3 text-lg bg-red-600 hover:bg-red-700 text-white" size="lg">
                Clear
              </Button>
            {/if}
          </div>
          <Button type="submit" class="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white" size="lg">Upload</Button>
        </form>
      </div>
  
      {#if uploadStatus}
        <div class="mt-8 text-center">
          <p class="text-lg {uploadStatus.includes('successful') ? 'text-green-600' : 'text-red-600'}">
            {uploadStatus}
          </p>
          {#if uploadedLink}
            <p class="mt-4">
              Your document is now available at: <a href={uploadedLink} class="text-blue-600 hover:underline">{uploadedLink}</a>
            </p>
          {/if}
        </div>
      {/if}
    </main>
  
    <Modal bind:open={showLoginModal} size="xs">
      <form class="space-y-6" on:submit|preventDefault={handleLogin}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Sign in to CipherGuard</h3>
        <div>
          <Label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
          <Input type="text" id="username" bind:value={loginUsername} placeholder="Enter your username" required class="mt-1" />
        </div>
        <div>
          <Label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
          <Input type="password" id="password" bind:value={loginPassword} placeholder="•••••••••" required class="mt-1" />
        </div>
        <Button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white">Login to your account</Button>
        <div class="text-sm">
          <a href="#" on:click={openSignupModal} class="font-medium text-blue-600 hover:text-blue-500">Not registered? Create account</a>
        </div>
        <div class="text-sm">
          <a href="#" on:click={openForgotPasswordModal} class="font-medium text-blue-600 hover:text-blue-500">Forgot Password?</a>
        </div>
        {#if message}
          <div class="text-red-500">{message}</div>
        {/if}
      </form>
    </Modal>
  
    <Modal bind:open={showSignupModal} size="xs">
      <form class="space-y-6" on:submit|preventDefault={handleSignup}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Create an Account</h3>
        <div>
          <Label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
          <Input type="text" id="name" bind:value={signupName} placeholder="Enter your name" required class="mt-1" />
        </div>
        <div>
          <Label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
          <Input type="text" id="username" bind:value={signupUsername} placeholder="Choose a username" required class="mt-1" />
        </div>
        <div>
          <Label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
          <Input type="email" id="email" bind:value={signupEmail} placeholder="Enter your email" required class="mt-1" />
        </div>
        <div>
          <Label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
          <Input type="password" id="password" bind:value={signupPassword} placeholder="•••••••••" required class="mt-1" />
        </div>
        <Button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white">Create your account</Button>
        <div class="text-sm">
          <a href="#" on:click={openLoginModal} class="font-medium text-blue-600 hover:text-blue-500">Already have an account? Login</a>
        </div>
        {#if message}
          <div class="text-red-500">{message}</div>
        {/if}
      </form>
    </Modal>
  
    <Modal bind:open={showForgotPasswordModal} size="xs">
      <form class="space-y-6" on:submit|preventDefault={handleForgotPassword}>
        <h3 class="text-xl font-medium text-gray-900 dark:text-white">Reset Your Password</h3>
        <div>
          <Label for="reset-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
          <Input type="email" id="reset-email" bind:value={resetEmail} placeholder="Enter your email" required class="mt-1" />
        </div>
        <Button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={resetEmailButtonDisabled}>
          {resetEmailButtonDisabled ? `Wait ${resetEmailCountdown}s` : 'Send Reset Link'}
        </Button>
        <div class="text-sm">
          <a href="#" on:click={openLoginModal} class="font-medium text-blue-600 hover:text-blue-500">Remember your password? Back to Login</a>
        </div>
        {#if message}
          <div class="text-green-500">{message}</div>
        {/if}
      </form>
    </Modal>
  </div>
  
  <style>
    :global(body) {
      font-family: 'Inter', sans-serif;
    }
    :global(.dark) {
      color-scheme: dark;
    }
    /* Commented out color input styles */
    /*
    input[type="color"] {
        -webkit-appearance: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }
    input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
    }
    input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 50%;
    }
    */
  </style>