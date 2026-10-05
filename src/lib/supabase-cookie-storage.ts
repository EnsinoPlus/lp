// Storage compartilhado com o gateway da Suite Integrada.
const CHUNK_SIZE = 3000;

function readCookies(): Record<string, string> {
  return document.cookie.split(";").reduce(
    (acc, cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      if (name) acc[name] = rest.join("=");
      return acc;
    },
    {} as Record<string, string>,
  );
}

export const cookieStorage = {
  getItem(key: string) {
    if (typeof document === "undefined") return null;
    const cookies = readCookies();

    if (cookies[key]) {
      try {
        return decodeURIComponent(cookies[key]);
      } catch {
        cookieStorage.removeItem(key);
        return null;
      }
    }

    let result = "";
    let chunkIndex = 0;
    while (cookies[`${key}.${chunkIndex}`]) {
      try {
        result += decodeURIComponent(cookies[`${key}.${chunkIndex}`]);
      } catch {
        cookieStorage.removeItem(key);
        return null;
      }
      chunkIndex++;
    }

    return result || null;
  },

  setItem(key: string, value: string) {
    if (typeof document === "undefined") return;

    const encodedValue = encodeURIComponent(value);
    const cookieOptions =
      "; domain=.ensinoplus.com.br; path=/; max-age=31536000; SameSite=Lax; Secure";

    cookieStorage.removeItem(key);

    if (encodedValue.length <= CHUNK_SIZE) {
      document.cookie = `${key}=${encodedValue}${cookieOptions}`;
      return;
    }

    // Each chunk must decode independently, including accented names.
    let chunk = "";
    let index = 0;
    for (const character of value) {
      const encodedCharacter = encodeURIComponent(character);
      if (chunk.length + encodedCharacter.length > CHUNK_SIZE) {
        document.cookie = `${key}.${index++}=${chunk}${cookieOptions}`;
        chunk = "";
      }
      chunk += encodedCharacter;
    }
    if (chunk) document.cookie = `${key}.${index}=${chunk}${cookieOptions}`;
  },

  removeItem(key: string) {
    if (typeof document === "undefined") return;

    const expireOptions = "; domain=.ensinoplus.com.br; path=/; max-age=0";
    document.cookie = `${key}=${expireOptions}`;
    for (const name of Object.keys(readCookies())) {
      if (name.startsWith(`${key}.`) && /^\d+$/.test(name.slice(key.length + 1))) {
        document.cookie = `${name}=${expireOptions}`;
      }
    }
  },
};

// Fora do dominio ensinoplus.com.br (ex.: localhost em dev) usa o storage
// padrao do SDK, igual os outros apps da suite.
export const isEnsinoPlusDomain =
  typeof window !== "undefined" &&
  (window.location.hostname === "ensinoplus.com.br" ||
    window.location.hostname.endsWith(".ensinoplus.com.br"));
