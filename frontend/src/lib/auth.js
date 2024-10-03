export function isTokenPresent() {
    return !!localStorage.getItem('token');
}

export async function isUserSignedIn() {
    if (!isTokenPresent()) return false;

    try {
        const response = await fetch('http://localhost:4000/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            return true;
        } else {
            localStorage.removeItem('token');
            return false;
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
}

export function signOut() {
    localStorage.removeItem('token');
}

export function getToken() {
    return localStorage.getItem('token');
}