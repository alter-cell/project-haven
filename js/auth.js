export async function hashPin(pin) {
  const bytes = new TextEncoder().encode(`petal-pages:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const isValidPin = (pin) => /^\d{4}$/.test(pin);
export const verifyPin = async (pin, pinHash) => (await hashPin(pin)) === pinHash;
