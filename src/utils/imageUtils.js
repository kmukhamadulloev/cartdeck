export function createObjectUrl(blob) {
  if (!blob) {
    return null
  }

  return URL.createObjectURL(blob)
}

export function revokeObjectUrl(url) {
  if (url) {
    URL.revokeObjectURL(url)
  }
}
