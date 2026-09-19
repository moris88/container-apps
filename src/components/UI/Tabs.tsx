import React, {
  createContext,
  useContext,
  useId,
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';

/* =========================
   TYPES
   ========================= */

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  onOrderChange?: (itemIds: string[]) => void;
  variant?: 'pill' | 'underline' | 'enclosed';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  /** Abilita il comportamento di scroll con frecce e gradienti (default: true) */
  scrollable?: boolean;
  reorderable?: boolean;
}

/* =========================
   CONTEXT
   ========================= */

interface TabsContextValue {
  activeId: string;
  setActiveId: (id: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
};

/* =========================
   UTILS
   ========================= */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

/* =========================
   SCROLL HOOK
   ========================= */

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

function useHorizontalScroll<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null);
  const [state, setState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    setState({
      canScrollLeft: scrollLeft > 1,
      canScrollRight: scrollLeft < maxScroll - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    update();

    el.addEventListener('scroll', update, { passive: true });

    const ro = new ResizeObserver(update);
    ro.observe(el);

    // Osserva anche i figli per reagire a cambi di contenuto
    Array.from(el.children).forEach((child) => ro.observe(child));

    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update, ...deps]);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.7, 160);
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  return { ref, ...state, scrollBy, update };
}

/* =========================
   ARROW BUTTONS
   ========================= */

const ScrollArrow: React.FC<{
  direction: 'left' | 'right';
  visible: boolean;
  onClick: () => void;
}> = ({ direction, visible, onClick }) => (
  <button
    type="button"
    aria-label={direction === 'left' ? 'Scorri a sinistra' : 'Scorri a destra'}
    tabIndex={-1}
    onClick={onClick}
    className={cx(
      'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center',
      'w-8 h-8 rounded-full',
      'bg-white/90 dark:bg-slate-800/90 backdrop-blur',
      'border border-slate-200 dark:border-slate-700',
      'text-slate-600 dark:text-slate-300',
      'shadow-sm hover:shadow-md hover:scale-105',
      'transition-all duration-200',
      direction === 'left' ? 'left-0' : 'right-0',
      visible
        ? 'opacity-100 pointer-events-auto'
        : 'opacity-0 pointer-events-none',
    )}
  >
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'left' ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  </button>
);

/* =========================
   COMPONENTS
   ========================= */

const TabsList: React.FC<{
  children: React.ReactNode;
  variant: NonNullable<TabsProps['variant']>;
  align: NonNullable<TabsProps['align']>;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  scrollable: boolean;
}> = ({ children, variant, align, className, onKeyDown, scrollable }) => {
  const { ref, canScrollLeft, canScrollRight, scrollBy } =
    useHorizontalScroll<HTMLDivElement>([]);

  const alignClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    stretch: 'justify-stretch',
  }[align];

  const variantClass = {
    pill: 'gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60',
    underline:
      'gap-6 border-b border-slate-200 dark:border-slate-700 rounded-none p-0',
    enclosed:
      'gap-0 border-b border-slate-200 dark:border-slate-700 rounded-none p-0',
  }[variant];

  return (
    <div className={cx('relative', className)}>
      {/* Fade sinistro */}
      {scrollable && (
        <div
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-5',
            'bg-linear-to-r from-white dark:from-slate-950 to-transparent',
            'transition-opacity duration-200',
            canScrollLeft ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      {/* Fade destro */}
      {scrollable && (
        <div
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-5',
            'bg-linear-to-l from-white dark:from-slate-950 to-transparent',
            'transition-opacity duration-200',
            canScrollRight ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      {/* Frecce */}
      {scrollable && (
        <>
          <ScrollArrow
            direction="left"
            visible={canScrollLeft}
            onClick={() => scrollBy('left')}
          />
          <ScrollArrow
            direction="right"
            visible={canScrollRight}
            onClick={() => scrollBy('right')}
          />
        </>
      )}

      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className={cx(
          'flex items-center overflow-x-auto',
          // Nasconde la scrollbar su tutti i browser
          'scrollbar-none [-ms-overflow-style:none]',
          '[&::-webkit-scrollbar]:hidden',
          // Scroll fluido su iOS
          '[-webkit-overflow-scrolling:touch]',
          // Padding laterale per non far toccare gli estremi contro i fade
          scrollable && 'px-1',
          alignClass,
          variantClass,
        )}
      >
        {children}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  item: TabItem;
  variant: NonNullable<TabsProps['variant']>;
  index: number;
  reorderable: boolean;
  isDragging: boolean;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  onDrop: (event: React.DragEvent<HTMLButtonElement>) => void;
}> = ({
  item,
  variant,
  index,
  reorderable,
  isDragging,
  onDragStart,
  onDragEnd,
  onDrop,
}) => {
    const { activeId, setActiveId, baseId } = useTabs();
    const isActive = activeId === item.id;
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    // Porta automaticamente in vista il tab attivo quando cambia
    useEffect(() => {
      if (!isActive) return;
      buttonRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }, [isActive]);

    const baseClasses =
      'relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed';

    const variantClasses = {
      pill: cx(
        'px-4 py-2 rounded-lg',
        isActive
          ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/40',
      ),
      underline: cx(
        'px-1 pb-3 -mb-px border-b-2',
        isActive
          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
          : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600',
      ),
      enclosed: cx(
        'px-4 py-2 -mb-px border border-transparent rounded-t-lg',
        isActive
          ? 'bg-white border-slate-200 border-b-white text-indigo-600 dark:bg-slate-900 dark:border-slate-700 dark:border-b-slate-900 dark:text-indigo-400'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50',
      ),
    }[variant];

    const handleClick = () => {
      if (item.disabled) return;
      setActiveId(item.id);
    };

    return (
      <button
        ref={buttonRef}
        id={`${baseId}-tab-${item.id}`}
        role="tab"
        type="button"
        aria-selected={isActive}
        aria-controls={`${baseId}-panel-${item.id}`}
        tabIndex={isActive ? 0 : -1}
        data-index={index}
        disabled={item.disabled}
        onClick={handleClick}
        draggable={reorderable && !item.disabled}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={(event) => {
          if (reorderable) event.preventDefault();
        }}
        onDrop={onDrop}
        className={cx(baseClasses, variantClasses)}
        style={{ opacity: isDragging ? 0.5 : undefined }}
      >
        {item.icon && (
          <span className="shrink-0" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span>{item.label}</span>
        {item.badge !== undefined && (
          <span
            className={cx(
              'ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold leading-none',
              isActive
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
            )}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

const TabPanel: React.FC<{
  item: TabItem;
  children: React.ReactNode;
}> = ({ item, children }) => {
  const { activeId, baseId } = useTabs();
  const isActive = activeId === item.id;

  if (!isActive) return null;

  return (
    <div
      id={`${baseId}-panel-${item.id}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${item.id}`}
      tabIndex={0}
      className="animate-fade-in focus:outline-none"
    >
      {children}
    </div>
  );
};

/* =========================
   MAIN COMPONENT
   ========================= */

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId: controlledActiveId,
  defaultActiveId,
  onChange,
  onOrderChange,
  variant = 'pill',
  align = 'start',
  className,
  scrollable = true,
  reorderable = false,
}) => {
  const baseId = useId();

  const initialId = useMemo(() => {
    if (defaultActiveId) return defaultActiveId;
    return items.find((i) => !i.disabled)?.id ?? items[0]?.id ?? '';
  }, [defaultActiveId, items]);

  const [activeId, setActiveIdState] = useState<string>(initialId);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const isControlled = controlledActiveId !== undefined;
  const selectedActiveId = isControlled ? controlledActiveId : activeId;

  const setActiveId = useCallback(
    (id: string) => {
      if (!isControlled) {
        setActiveIdState(id);
      }
      onChange?.(id);
    },
    [isControlled, onChange],
  );

  const moveItem = useCallback(
    (sourceItemId: string, targetItemId: string) => {
      if (sourceItemId === targetItemId) return;

      const sourceIndex = items.findIndex((item) => item.id === sourceItemId);
      const targetIndex = items.findIndex((item) => item.id === targetItemId);
      if (sourceIndex === -1 || targetIndex === -1) return;

      const orderedItems = [...items];
      const [movedItem] = orderedItems.splice(sourceIndex, 1);
      orderedItems.splice(targetIndex, 0, movedItem);
      onOrderChange?.(orderedItems.map((item) => item.id));
    },
    [items, onOrderChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const enabledItems = items.filter((i) => !i.disabled);
    if (enabledItems.length === 0) return;

    const currentIndex = enabledItems.findIndex((i) => i.id === selectedActiveId);
    let nextIndex: number;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % enabledItems.length;
        break;
      case 'ArrowLeft':
        nextIndex =
          (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabledItems.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const nextId = enabledItems[nextIndex].id;
    setActiveId(nextId);
    const el = document.getElementById(
      `${baseId}-tab-${nextId}`,
    ) as HTMLButtonElement | null;
    el?.focus();
  };

  return (
    <TabsContext.Provider value={{ activeId: selectedActiveId, setActiveId, baseId }}>
      <div className={cx('w-full', className)}>
        <TabsList
          variant={variant}
          align={align}
          onKeyDown={handleKeyDown}
          scrollable={scrollable}
        >
          {items.map((item, index) => (
            <TabButton
              key={item.id}
              item={item}
              variant={variant}
              index={index}
              reorderable={reorderable}
              isDragging={draggedItemId === item.id}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', item.id);
                setDraggedItemId(item.id);
              }}
              onDragEnd={() => setDraggedItemId(null)}
              onDrop={(event) => {
                event.preventDefault();
                const sourceItemId =
                  event.dataTransfer.getData('text/plain') || draggedItemId;
                if (sourceItemId) moveItem(sourceItemId, item.id);
                setDraggedItemId(null);
              }}
            />
          ))}
        </TabsList>

        {items.map((item) => (
          <TabPanel key={item.id} item={item}>
            {item.content}
          </TabPanel>
        ))}
      </div>
    </TabsContext.Provider>
  );
};

export default Tabs;