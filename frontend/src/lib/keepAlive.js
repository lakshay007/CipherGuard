import { browser } from '$app/environment';

const API_URL = import.meta.env.VITE_API_URL;
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes

function setupKeepAlive() {
    if (browser) {
        setInterval(() => {
            fetch(`${API_URL}/keep-alive`)
                .then(response => console.log('Keep-alive response:', response.status))
                .catch(error => console.error('Keep-alive error:', error));
        }, KEEP_ALIVE_INTERVAL);
    }
}

export { setupKeepAlive };