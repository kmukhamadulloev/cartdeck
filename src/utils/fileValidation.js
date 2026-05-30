import { detectRomExtension } from '@/utils/romUtils'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_COVER_BYTES = 2 * 1024 * 1024
const MAX_BACKGROUND_BYTES = 5 * 1024 * 1024
const MAX_ROM_BYTES = 8 * 1024 * 1024

function result(ok, error = '') {
  return { ok, error }
}

function getExtension(filename = '') {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts.at(-1) : ''
}

export function validateRomFile(file) {
  if (!file) {
    return result(false, 'Select a .gb or .gbc file to continue.')
  }

  if (!detectRomExtension(file.name)) {
    return result(false, 'Only .gb and .gbc ROM files are supported in this version.')
  }

  if (file.size <= 0) {
    return result(false, 'This ROM file is empty.')
  }

  if (file.size > MAX_ROM_BYTES) {
    return result(false, 'This ROM is larger than the supported local import size.')
  }

  return result(true)
}

function validateImageFile(file, maxBytes) {
  if (!file) {
    return result(false, 'Choose an image file to continue.')
  }

  const extension = getExtension(file.name)

  if (!IMAGE_EXTENSIONS.includes(extension) || !IMAGE_MIME_TYPES.includes(file.type)) {
    return result(false, 'Use a PNG, JPG, JPEG, or WEBP image.')
  }

  if (file.size > maxBytes) {
    return result(false, 'This image file is too large for local storage.')
  }

  return result(true)
}

export function validateCoverImageFile(file) {
  return validateImageFile(file, MAX_COVER_BYTES)
}

export function validateBackgroundImageFile(file) {
  return validateImageFile(file, MAX_BACKGROUND_BYTES)
}
