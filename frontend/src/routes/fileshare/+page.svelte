<script>
    import { onMount } from 'svelte';
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button, Input, Textarea, Card, Modal, Label } from 'flowbite-svelte';
    import { browser } from '$app/environment';
    import { isUserSignedIn, signOut } from '$lib/auth';
    import { goto } from '$app/navigation';

    const API_URL = import.meta.env.VITE_API_URL;

    let Home;
    let Share;
    let LogOut;
    let FileInput;
    let isSignedIn = false;

    // New variables for authentication
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

    onMount(async () => {
        isSignedIn = await isUserSignedIn();
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
        goto('/'); // Redirect to home page after signing out
    }

    function handleSignIn() {
        goto('/?signin=true');
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
                <NavLi href="#" on:click={openLoginModal}>Sign In</NavLi>
                <NavLi href="#" on:click={openSignupModal}>Sign Up</NavLi>
            {/if}
        </NavUl>
    </Navbar>

    <main class="w-full px-4 py-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Upload or paste your content</h1>

        <div class="flex justify-center">
            <div class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md flex w-full max-w-4xl flex-col sm:p-6 mb-8 p-6">
                <form on:submit|preventDefault={handleUpload} class="flex flex-col gap-4 w-full">
                    <Input type="email" placeholder="Your email (optional)" bind:value={email} class="w-full" />
                    <Input type="text" placeholder="Custom Document link name" bind:value={customDocId} required class="w-full" />
                    <Textarea 
                        placeholder="paste your content here" 
                        bind:value={text} 
                        rows="10" 
                        class="w-full text-lg"
                        disabled={file !== null}
                    />
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
                        {#if file}
                            <Button type="button" on:click={clearFile} class="ml-2 py-3 text-lg bg-red-600 hover:bg-red-700 text-white" size="lg">
                                Clear
                            </Button>
                        {/if}
                    </div>
                    <Button type="submit" class="w-full py-3 text-lg bg-green-600 hover:bg-green-700 text-white" size="lg">Upload</Button>
                </form>
            </div>
        </div>

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

    <!-- Login Modal -->
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
            <Button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white">Login to your account</Button>
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
            <Button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white">Create your account</Button>
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
            <Button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white" disabled={resetEmailButtonDisabled}>
                {resetEmailButtonDisabled ? `Wait ${resetEmailCountdown}s` : 'Send Reset Link'}
            </Button>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                Remember your password? <a href="#" class="text-primary-700 hover:underline dark:text-primary-500" on:click={() => { showForgotPasswordModal = false; showLoginModal = true; }}>Back to Login</a>
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
    :global(.full-width-card) {
        max-width: 100% !important;
    }
</style>