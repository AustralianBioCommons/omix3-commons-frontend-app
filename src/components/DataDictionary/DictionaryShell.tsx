'use client';

import { useCallback, useState } from 'react';
import { Tabs } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import TableSearch from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/TableSearch.js';
import ViewSelector from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/ViewSelector.js';
import { useDictionaryContext } from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/DictionaryProvider.js';
import {
  SearchPathToPropertyIdString,
  getPropertyCount,
} from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/utils.js';
import Gen3GraphView from './Gen3GraphView';
import DictionaryCategoryPanel from './DictionaryCategoryPanel';
import dictionaryIcons from '../../../config/icons/dataDictionary.json';

const ICONS = dictionaryIcons.icons as Record<string, { body: string }>;

const normalizeCategory = (value?: string) =>
  (value ?? 'default').trim().toLowerCase().replace(/\s+/g, '-');

const getIconMarkup = (category?: string) => {
  const icon = ICONS[normalizeCategory(category)] ?? ICONS.default;
  return {
    __html: `<svg viewBox="0 0 ${dictionaryIcons.width} ${dictionaryIcons.height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${icon.body}</svg>`,
  };
};

const CATEGORY_STYLES: Record<string, { badge: string; icon: string }> = {
  administrative: { badge: '#ede9fe', icon: '#8b5cf6' },
  analysis: { badge: '#fce7f3', icon: '#ec4899' },
  clinical: { badge: '#e0f2fe', icon: '#0ea5e9' },
  'experimental-methods': { badge: '#ffedd5', icon: '#ea580c' },
  'data-file': { badge: '#ecfccb', icon: '#65a30d' },
  biospecimen: { badge: '#d1fae5', icon: '#10b981' },
  default: { badge: '#e2e8f0', icon: '#64748b' },
};

const getCategoryStyle = (category?: string) =>
  CATEGORY_STYLES[normalizeCategory(category)] ?? CATEGORY_STYLES.default;

const DictionaryShell = () => {
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState<'table' | 'graph'>('graph');
  const [graphStructure, setGraphStructure] = useState<
    Array<{ id: string; title: string; category?: string; isActive: boolean }>
  >([]);
  const { dictionary, categories, visibleCategories, config } = useDictionaryContext();
  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<HTMLElement>({ offset: 60 });

  const scrollTo = useCallback((item: { node: string; category: string; property: string }) => {
    setSelectedId(SearchPathToPropertyIdString(item));
    setView('table');
  }, []);

  const scrollToSelection = useCallback(
    (itemRef: HTMLElement) => {
      (targetRef as { current: HTMLElement | null }).current = itemRef;
      scrollIntoView();
    },
    [scrollIntoView, targetRef],
  );

  const categoryPanelTable =
    Object.keys(categories).length > 0
      ? Object.keys(categories).map((category) => (
          <DictionaryCategoryPanel
            key={category}
            category={category}
            selectedId={selectedId}
            scrollToSelection={scrollToSelection}
          />
        ))
      : null;

  return (
    <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-[320px_minmax(0,1fr)]">
      <aside className="overflow-auto border-r border-base-light bg-white">
        <div className="sticky top-0 z-20 border-b border-base-light bg-white/95 p-6 backdrop-blur">
          {config?.showGraph ? <ViewSelector view={view} setView={setView} /> : null}
          <div className="mt-5 rounded-[24px] border border-sky-100 bg-[linear-gradient(160deg,#0f172a_0%,#172554_55%,#0f766e_100%)] px-5 py-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/75">
              Dictionary Overview
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/75">
                  Nodes
                </p>
                <p className="mt-2 text-3xl font-bold leading-none text-white">
                  {visibleCategories.length}
                </p>
                <p className="mt-2 text-xs leading-5 text-sky-50/80">
                  currently visible in the commons schema
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/80">
                  Properties
                </p>
                <p className="mt-2 text-3xl font-bold leading-none text-emerald-200">
                  {getPropertyCount(visibleCategories, dictionary)}
                </p>
                <p className="mt-2 text-xs leading-5 text-sky-50/80">
                  indexed across all visible nodes
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-sky-50/85">
              Use Graph View to inspect relationships and Table View to inspect field-level details.
            </div>
          </div>
          <div className="mt-5">
            <TableSearch selectItem={scrollTo} />
          </div>
        </div>
        {view === 'graph' && graphStructure.length > 0 ? (
          <div className="border-b border-base-light bg-white px-6 py-6">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Data Model Structure
            </p>
            <div className="mt-5 space-y-2">
              {graphStructure.map((node) => {
                const style = getCategoryStyle(node.category);
                return (
                  <div
                    key={node.id}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
                      node.isActive ? 'bg-sky-50' : ''
                    }`}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: style.badge, color: style.icon }}
                    >
                      <span
                        className="h-5 w-5"
                        dangerouslySetInnerHTML={getIconMarkup(node.category)}
                      />
                    </span>
                    <span
                      className={`text-[18px] font-semibold ${
                        node.isActive ? 'text-sky-600' : 'text-slate-800'
                      }`}
                    >
                      {node.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </aside>

      <section className="h-full w-full min-w-0 overflow-hidden bg-base-lighter" ref={scrollableRef as any}>
        {config?.showGraph ? (
          <Tabs value={view} keepMounted={false} className="h-full">
            <Tabs.Panel value="table" className="h-full overflow-auto bg-white px-0 py-3">
              {categoryPanelTable}
            </Tabs.Panel>
            <Tabs.Panel value="graph" className="h-full">
              <Gen3GraphView
                dictionary={dictionary}
                selectedId={selectedId}
                onStructureChange={setGraphStructure}
              />
            </Tabs.Panel>
          </Tabs>
        ) : (
          <div className="h-full overflow-auto p-4">{categoryPanelTable}</div>
        )}
      </section>
    </div>
  );
};

export default DictionaryShell;
