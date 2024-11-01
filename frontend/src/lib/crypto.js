export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    // Export public key to string format
    const publicKeyBuffer = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
    );
    const publicKeyString = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

    // Export private key to string format
    const privateKeyBuffer = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
    );
    const privateKeyString = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

    return {
        publicKey: publicKeyString,
        privateKey: privateKeyString
    };
}

export async function encryptText(text, publicKeyString) {
    // Convert base64 public key back to CryptoKey
    const publicKeyBuffer = Uint8Array.from(atob(publicKeyString), c => c.charCodeAt(0));
    const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );

    // Encrypt the text
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        data
    );

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptText(encryptedText, privateKeyString) {
    // Convert base64 private key back to CryptoKey
    const privateKeyBuffer = Uint8Array.from(atob(privateKeyString), c => c.charCodeAt(0));
    const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );

    // Decrypt the text
    const encryptedData = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
} 