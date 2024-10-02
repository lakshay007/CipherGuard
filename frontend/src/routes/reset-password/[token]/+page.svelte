<script>
    import { page } from '$app/stores';
    import { Button, Input, Label } from 'flowbite-svelte';

    let newPassword = '';
    let confirmPassword = '';
    let message = '';

    async function handleResetPassword() {
        if (newPassword !== confirmPassword) {
            message = 'Passwords do not match';
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/auth/reset-password/${$page.params.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                message = 'Password reset successful. You can now login with your new password.';
            } else {
                message = data.message || 'Failed to reset password. Please try again.';
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            message = 'An error occurred. Please try again.';
        }
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Reset Your Password</h1>
        <form on:submit|preventDefault={handleResetPassword} class="space-y-4">
            <Label class="space-y-2">
                <span>New Password</span>
                <Input type="password" bind:value={newPassword} required />
            </Label>
            <Label class="space-y-2">
                <span>Confirm New Password</span>
                <Input type="password" bind:value={confirmPassword} required />
            </Label>
            <Button type="submit" class="w-full">Reset Password</Button>
        </form>
        {#if message}
            <p class="mt-4 text-center {message.includes('successful') ? 'text-green-600' : 'text-red-600'}">
                {message}
            </p>
        {/if}
    </div>
</div>