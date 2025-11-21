export function getNumericUUID() {
  return Number.parseInt(crypto.randomUUID().replace(/-/g, '').slice(0, 12), 16)
}
