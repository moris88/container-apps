import { atomWithStorage } from 'jotai/utils'
import data from './data/links.json'

export interface LinkItem {
  id: string
  label: string
  url: string
}

export function parseLinks(value: unknown): LinkItem[] {
  const entries =
    typeof value === 'object' && value !== null && 'links' in value
      ? value.links
      : value

  if (!Array.isArray(entries)) {
    throw new Error(
      'Il JSON deve contenere un array di link o un oggetto con "links".'
    )
  }

  const ids = new Set<string>()
  return entries.map((entry: unknown, index) => {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      !('label' in entry) ||
      typeof entry.label !== 'string' ||
      !entry.label.trim() ||
      !('url' in entry) ||
      typeof entry.url !== 'string'
    ) {
      throw new Error(`Link ${index + 1}: label e URL sono obbligatori.`)
    }

    let url: URL
    try {
      url = new URL(entry.url.trim())
    } catch {
      throw new Error(`Link ${index + 1}: URL non valido.`)
    }
    if (!['https:', 'http:'].includes(url.protocol)) {
      throw new Error(`Link ${index + 1}: usa un URL HTTP o HTTPS.`)
    }

    const id = 'id' in entry ? entry.id : crypto.randomUUID()
    if (typeof id !== 'string' || !id.trim() || ids.has(id)) {
      throw new Error(`Link ${index + 1}: ID vuoto, non valido o duplicato.`)
    }
    ids.add(id)
    return { id, label: entry.label.trim(), url: url.href }
  })
}

const tabSave = atomWithStorage('tabSave', 'todo-list', undefined, {
  getOnInit: true,
})
const tabOrder = atomWithStorage<string[]>('tabOrder', [], undefined, {
  getOnInit: true,
})
const savedLinks = atomWithStorage<LinkItem[]>(
  'personalLinks',
  data.links,
  undefined,
  { getOnInit: true }
)

export { savedLinks, tabOrder, tabSave }
