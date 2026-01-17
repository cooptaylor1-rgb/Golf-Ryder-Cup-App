/**
 * Cryptographic utilities for secure PIN handling
 *
 * Uses Web Crypto API (SHA-256) for PIN hashing.
 * PINs are never stored in plain text.
 */

/**
 * Hash a PIN using SHA-256
 * @param pin - The plain text PIN to hash
 * @returns The hex-encoded hash
 */
export async function hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a PIN against a stored hash
 * @param pin - The plain text PIN to verify
 * @param hash - The stored hash to compare against
 * @returns True if the PIN matches the hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
    const inputHash = await hashPin(pin);
    return inputHash === hash;
}

/**
 * Check if a stored PIN value is already hashed (64 char hex string)
 * Used for migration from plain text to hashed PINs
 * @param storedValue - The stored PIN/hash value
 * @returns True if already hashed (64 hex chars), false if plain text
 */
export function isHashedPin(storedValue: string): boolean {
    // SHA-256 produces 64 hex characters
    // A plain 4-digit PIN would be 4 characters
    return storedValue.length === 64 && /^[a-f0-9]+$/i.test(storedValue);
}
