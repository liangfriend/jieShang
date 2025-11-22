export function getResourceUrl(fileName: string): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(fileName)}`
}
