import { useAtom } from 'jotai'
import {
  ArrowDown,
  ArrowUp,
  Download,
  Plus,
  Settings2,
  Trash2,
  Upload,
} from 'lucide-react'
import { type FormEvent, useRef, useState } from 'react'
import { type TabItem, Tabs } from '@/components'
import {
  type LinkItem,
  parseLinks,
  savedLinks,
  tabOrder,
  tabSave,
} from './atoms'

const actionClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
const inputClass =
  'w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

export default function App() {
  const [tab, setTab] = useAtom(tabSave)
  const [savedOrder, setSavedOrder] = useAtom(tabOrder)
  const [links, setLinks] = useAtom(savedLinks)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const orderedLinks = [
    ...savedOrder
      .map((id) => links.find((link) => link.id === id))
      .filter((link) => link !== undefined),
    ...links.filter((link) => !savedOrder.includes(link.id)),
  ]
  const activeId = orderedLinks.some((link) => link.id === tab)
    ? tab
    : (orderedLinks[0]?.id ?? '')

  function updateLinks(nextLinks: LinkItem[]) {
    setLinks(nextLinks)
    setSavedOrder([])
    if (!nextLinks.some((link) => link.id === activeId)) {
      setTab(nextLinks[0]?.id ?? '')
    }
  }

  function addLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const [link] = parseLinks([{ label, url }])
      updateLinks([...orderedLinks, link])
      setTab(link.id)
      setLabel('')
      setUrl('')
      setMessage('Link aggiunto.')
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Impossibile aggiungere il link.'
      )
    }
  }

  function reorderLinks(ids: string[]) {
    updateLinks(
      ids
        .map((id) => orderedLinks.find((link) => link.id === id))
        .filter((link) => link !== undefined)
    )
  }

  function moveLink(index: number, direction: number) {
    const nextLinks = [...orderedLinks]
    const target = index + direction
    if (target < 0 || target >= nextLinks.length) return
    const [movedLink] = nextLinks.splice(index, 1)
    nextLinks.splice(target, 0, movedLink)
    updateLinks(nextLinks)
  }

  async function importLinks(file: File) {
    setError('')
    setMessage('')
    try {
      const importedLinks = parseLinks(JSON.parse(await file.text()))
      if (
        !window.confirm(
          `Sostituire tutti i link attuali con i ${importedLinks.length} link importati?`
        )
      )
        return
      updateLinks(importedLinks)
      setTab(importedLinks[0]?.id ?? '')
      setMessage(`${importedLinks.length} link importati.`)
    } catch (cause) {
      setError(
        cause instanceof SyntaxError
          ? 'Il file non contiene un JSON valido.'
          : cause instanceof Error
            ? cause.message
            : 'Impossibile importare il file.'
      )
    }
  }

  function exportLinks() {
    const blob = new Blob([JSON.stringify({ links: orderedLinks }, null, 2)], {
      type: 'application/json',
    })
    const downloadUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.download = 'personal-links.json'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
  }

  const items: TabItem[] = orderedLinks.map((link) => {
    return {
      id: link.id,
      label: link.label,
      content: (
        <iframe
          title={link.label}
          src={link.url}
          className="w-full min-h-[86vh] h-full border-0"
        />
      ),
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="min-h-[calc(100vh-4rem)]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h1 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            My Personal Apps
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={actionClass}
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={16} aria-hidden="true" /> Importa JSON
            </button>
            <button type="button" className={actionClass} onClick={exportLinks}>
              <Download size={16} aria-hidden="true" /> Esporta JSON
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              aria-label="Importa link da JSON"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void importLinks(file)
              }}
            />
          </div>
        </header>
        <details className="border-b border-slate-200 dark:border-slate-800">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Settings2 size={16} className="mr-2 inline" aria-hidden="true" />
            Gestisci link ({orderedLinks.length})
          </summary>
          <div className="space-y-4 px-4 pb-4">
            <form
              onSubmit={addLink}
              className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
            >
              <label
                className="grid gap-1 text-sm text-slate-700 dark:text-slate-200"
                htmlFor="link-label"
              >
                Label
                <input
                  id="link-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  required
                  className={inputClass}
                />
              </label>
              <label
                className="grid gap-1 text-sm text-slate-700 dark:text-slate-200"
                htmlFor="link-url"
              >
                URL
                <input
                  id="link-url"
                  type="url"
                  placeholder="https://"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  required
                  className={inputClass}
                />
              </label>
              <button type="submit" className={actionClass}>
                <Plus size={16} aria-hidden="true" /> Aggiungi link
              </button>
            </form>
            <ol className="divide-y divide-slate-200 dark:divide-slate-800">
              {orderedLinks.map((link, index) => (
                <li key={link.id} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="wrap-break-word text-sm font-medium text-slate-800 dark:text-slate-100">
                      {link.label}
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block break-all text-xs text-slate-500 hover:underline"
                    >
                      {link.url}
                    </a>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className={actionClass}
                      title={`Sposta prima: ${link.label}`}
                      aria-label={`Sposta prima: ${link.label}`}
                      disabled={index === 0}
                      onClick={() => moveLink(index, -1)}
                    >
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={actionClass}
                      title={`Sposta dopo: ${link.label}`}
                      aria-label={`Sposta dopo: ${link.label}`}
                      disabled={index === orderedLinks.length - 1}
                      onClick={() => moveLink(index, 1)}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className={actionClass}
                      title={`Elimina: ${link.label}`}
                      aria-label={`Elimina: ${link.label}`}
                      onClick={() => {
                        updateLinks(
                          orderedLinks.filter((item) => item.id !== link.id)
                        )
                        setError('')
                        setMessage('Link eliminato.')
                      }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </details>
        {error && (
          <p
            role="alert"
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
        <div
          role="status"
          className="px-4 text-sm text-slate-600 dark:text-slate-300"
        >
          {message}
        </div>
        {items.length === 0 && (
          <p className="px-4 py-12 text-center text-slate-500">Nessun link.</p>
        )}
        <Tabs
          items={items}
          variant="enclosed"
          align="start"
          activeId={activeId}
          onChange={setTab}
          reorderable
          onOrderChange={reorderLinks}
        />
      </section>
      <footer className="bg-slate-100 dark:bg-slate-900">
        <p className="text-center text-slate-500 dark:text-slate-400 py-4.5">
          <a
            href="https://mauriziotolomeo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            &copy; {new Date().getFullYear()} Maurizio Tolomeo
          </a>
        </p>
      </footer>
    </div>
  )
}
