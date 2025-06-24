export function extractFileExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || ''
}
