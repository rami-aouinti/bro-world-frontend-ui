export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    return;
  }

  const existingCrypto = globalThis.crypto as Crypto | undefined;

  if (!existingCrypto || typeof existingCrypto.getRandomValues !== 'function') {
    const { webcrypto } = await import('node:crypto');

    (globalThis as typeof globalThis & { crypto: Crypto }).crypto = webcrypto as unknown as Crypto;
  }
});
