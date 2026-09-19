import { Tabs, type TabItem } from '@/components';
import data from '@/data/links.json';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { tabOrder, tabSave } from './atoms';

export default function App() {
  const [tab, setTab] = useAtom(tabSave);
  const [savedOrder, setSavedOrder] = useAtom(tabOrder);
  const orderedLinks = useMemo(() => {
    const savedLinks = savedOrder
      .map((id) => data.links.find((link) => link.id === id))
      .filter((link) => link !== undefined);
    const newLinks = data.links.filter(
      (link) => !savedOrder.includes(link.id),
    );

    return [...savedLinks, ...newLinks];
  }, [savedOrder]);
  const items: TabItem[] = orderedLinks.map((link) => {
    return {
      id: link.id,
      label: link.label,
      content: (
        <iframe src={link.url} className="w-full min-h-[86vh] h-full border-0"></iframe>
      ),
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <section className="min-h-[calc(100vh-4rem)]">
        <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide px-1">
          My Personal Apps
        </h2>
        <Tabs
          items={items}
          variant="enclosed"
          align="start"
          activeId={tab}
          onChange={setTab}
          reorderable
          onOrderChange={setSavedOrder}
        />
      </section>
      <footer className="bg-slate-100 dark:bg-slate-900">
        <p className="text-center text-slate-500 dark:text-slate-400 py-4.5">
          <a href="https://mauriziotolomeo.com" target="_blank" rel="noopener noreferrer">
            &copy;{' '}
            {new Date().getFullYear()}{' '}
            Maurizio Tolomeo
          </a>
        </p>
      </footer>
    </div>
  );
}