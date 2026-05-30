import { formatBytes } from '@/utils/formatUtils'

export function normalizeStorageEstimate(estimate) {
  return {
    quota: estimate?.quota ?? 0,
    usage: estimate?.usage ?? 0,
    usageText: formatBytes(estimate?.usage ?? 0),
    quotaText: formatBytes(estimate?.quota ?? 0),
  }
}
