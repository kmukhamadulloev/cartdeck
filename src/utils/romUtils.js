const TITLE_START = 0x0134
const TITLE_END = 0x0143

export function readRomTitle(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length <= TITLE_END) {
    return null
  }

  const titleBytes = bytes.slice(TITLE_START, TITLE_END + 1)
  const title = new TextDecoder('ascii')
    .decode(titleBytes)
    .split('\0')
    .join('')
    .trim()

  return title || null
}

export function cleanFilename(filename = '') {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function detectRomExtension(filename = '') {
  const normalized = filename.toLowerCase()

  if (normalized.endsWith('.gbc')) {
    return 'gbc'
  }

  if (normalized.endsWith('.gb')) {
    return 'gb'
  }

  return null
}

export function getRomType(filename, bytes) {
  const extension = detectRomExtension(filename)

  if (extension === 'gbc') {
    return 'GBC'
  }

  if (extension === 'gb') {
    return 'GB'
  }

  if (bytes instanceof Uint8Array && bytes[0x0143] === 0x80) {
    return 'GBC'
  }

  return 'GB'
}

export function getDisplayTitle(rom) {
  return rom?.customTitle || rom?.title || cleanFilename(rom?.filename || '') || 'Untitled Cartridge'
}
