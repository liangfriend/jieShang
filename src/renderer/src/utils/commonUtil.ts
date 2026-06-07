export function parseAndFormatDimension(dimension: string | number): { unit: string; value: number } {
  if (typeof dimension === 'number') {
    return { value: dimension, unit: 'px' }
  }
  const match = dimension.match(/^([0-9.]+)([a-zA-Z%]*)$/)
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2] || 'px' }
  }
  throw new Error(`Invalid dimension format: ${dimension}`)
}
