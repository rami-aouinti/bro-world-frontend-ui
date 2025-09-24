import { randomFillSync, webcrypto } from 'node:crypto'

type GlobalWithOptionalCrypto = typeof globalThis & { crypto?: Crypto }

const globalScope = globalThis as GlobalWithOptionalCrypto

if (typeof globalScope.crypto?.getRandomValues !== 'function') {
  const fallbackCrypto = {
    getRandomValues<T extends ArrayBufferView | null>(array: T): T {
      if (!array) {
        throw new TypeError('Expected input to be an array')
      }

      randomFillSync(array as ArrayBufferView)
      return array
    },
  }

  const nodeCrypto = webcrypto as Crypto | undefined

  globalScope.crypto =
    nodeCrypto && typeof nodeCrypto.getRandomValues === 'function'
      ? nodeCrypto
      : (fallbackCrypto as unknown as Crypto)
}
