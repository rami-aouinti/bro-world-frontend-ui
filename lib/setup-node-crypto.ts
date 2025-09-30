import { randomFillSync, webcrypto } from "node:crypto";

type GlobalWithOptionalCrypto = typeof globalThis & { crypto?: Crypto };

const globalScope = globalThis as GlobalWithOptionalCrypto;

function defineGlobalCrypto(cryptoInstance: Crypto) {
  const descriptor = Object.getOwnPropertyDescriptor(globalScope, "crypto");

  if (!descriptor || "value" in descriptor || descriptor.configurable) {
    Object.defineProperty(globalScope, "crypto", {
      configurable: true,
      enumerable: false,
      value: cryptoInstance,
      writable: true,
    });

    return;
  }

  if (descriptor.get || descriptor.set) {
    Object.defineProperty(globalScope, "crypto", {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable ?? false,
      get: () => cryptoInstance,
      set: (value: Crypto) => {
        defineGlobalCrypto(value);
      },
    });
  }
}

function createGetRandomValues() {
  const nodeCrypto = webcrypto as Crypto | undefined;
  const nodeMethod = nodeCrypto?.getRandomValues?.bind(nodeCrypto);

  if (typeof nodeMethod === "function") {
    return nodeMethod;
  }

  return function fallbackGetRandomValues<T extends ArrayBufferView | null>(array: T): T {
    if (!array) {
      throw new TypeError("Expected input to be an array");
    }

    randomFillSync(array as ArrayBufferView);
    return array;
  };
}

const getRandomValues = createGetRandomValues();

function ensureCrypto(): Crypto {
  const existing = globalScope.crypto;

  if (existing && typeof existing === "object") {
    if (existing.getRandomValues !== getRandomValues) {
      Object.defineProperty(existing, "getRandomValues", {
        configurable: true,
        writable: true,
        value: getRandomValues,
      });
    }

    return existing;
  }

  const nodeCrypto = webcrypto as Crypto | undefined;

  if (nodeCrypto) {
    return nodeCrypto;
  }

  const cryptoLike = {
    getRandomValues,
  };

  return cryptoLike as unknown as Crypto;
}

defineGlobalCrypto(ensureCrypto());
