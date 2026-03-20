'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, Button, Group } from '@mantine/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { MdDownload as DownloadIcon } from 'react-icons/md';
import CategoryHeader from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/CategoryHeader.js';
import CategoryAccordionLabel from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/CategoryAccordionLabel.js';
import PropertiesTable from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/PropertiesTable.js';
import { useDictionaryContext } from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/DictionaryProvider.js';
import { ACCORDION_TRANSITION_DURATION } from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/constants.js';
import {
  PropertyIdStringToSearchPath,
  toNodeCategory,
} from '../../../node_modules/@gen3/frontend/dist/dts/features/Dictionary/utils.js';

type DictionaryCategoryPanelProps = {
  category: string;
  selectedId: string;
  scrollToSelection: (itemRef: HTMLElement) => void;
};

type DictionaryProperty = {
  description?: string;
  term?: { description?: string };
  type?: string;
  anyOf?: Array<{ type?: string }>;
  oneOf?: Array<{ type?: string }>;
  enum?: string[];
};

const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatPropertyTypes = (row: DictionaryProperty) => {
  if (row.anyOf?.length) return row.anyOf.map(({ type }) => type ?? '').filter(Boolean);
  if (row.oneOf?.length) return row.oneOf.map(({ type }) => type ?? '').filter(Boolean);
  if (row.enum?.length) return row.enum;
  return row.type ? [row.type] : [];
};

const buildTsv = (properties: Record<string, DictionaryProperty>, required: string[] = []) => {
  const rows = Object.entries(properties).map(([property, definition]) => {
    const description =
      definition.description ?? definition.term?.description ?? 'No Description';
    const types = formatPropertyTypes(definition).join(', ');
    return [property, types, required.includes(property) ? 'Required' : 'No', description]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join('\t');
  });

  return ['Property\tType\tRequired\tDescription', ...rows].join('\n');
};

const DictionaryCategoryPanel = ({
  category,
  selectedId,
  scrollToSelection,
}: DictionaryCategoryPanelProps) => {
  const { dictionary, categories, config } = useDictionaryContext();
  const categoryInfo = categories[category];
  const [value, setValue] = useState<string | null>(selectedId);
  const selectedItems = PropertyIdStringToSearchPath(selectedId);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});

  const appendRef = (id: string, el: HTMLElement | null) => {
    itemRefs.current[id] = el;
  };

  useEffect(() => {
    const scrollToItem = (id: string) => {
      const element = itemRefs.current[id];
      if (element) scrollToSelection(element);
    };

    if (
      value !== null &&
      value === toNodeCategory(selectedItems) &&
      selectedItems.property.length > 0
    ) {
      const timer = setTimeout(() => {
        scrollToItem(selectedId);
      }, 5);
      return () => clearTimeout(timer);
    }
  }, [scrollToSelection, selectedId, selectedItems, value]);

  useDeepCompareEffect(() => {
    if (category === selectedItems.node) setValue(`${selectedItems.node}-${selectedItems.category}`);
    else setValue(null);
  }, [selectedItems, category]);

  const items = useMemo(() => categoryInfo ?? [], [categoryInfo]);

  return (
    <div className="mt-3 w-full px-3 first:mt-0">
      <CategoryHeader category={category} />
      <Accordion
        chevronPosition="left"
        value={value}
        onChange={setValue}
        variant="contained"
        transitionDuration={ACCORDION_TRANSITION_DURATION}
        className="w-full"
        styles={{
          chevron: {
            transform: 'rotate(-90deg)',
            '&[dataRotate]': {
              transform: 'rotate(0deg)',
            },
          },
        }}
      >
        {items.map(({ title, description, id }) => {
          const node = dictionary[id];
          const properties = (node?.properties as Record<string, DictionaryProperty>) ?? {};
          const required = node?.required ?? [];
          const jsonFilename = `${id}.json`;
          const tsvFilename = `${id}.tsv`;

          return (
            <Accordion.Item
              key={`${category}-${id}`}
              value={`${category}-${id}`}
              className="w-full overflow-hidden odd:bg-base-lightest even:bg-base-max"
            >
              <div
                className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 ${
                  `${category}-${id}` === value ? 'border-accent border-l-4' : ''
                }`}
              >
                <Accordion.Control className="min-w-0 w-full">
                  <CategoryAccordionLabel label={title} description={description} />
                </Accordion.Control>
                {config?.showDownloads ? (
                  <Group wrap="nowrap" gap="xs" className="relative z-10 ml-auto shrink-0 pr-3">
                    <Button
                      leftSection={<DownloadIcon />}
                      size="sm"
                      color="dark"
                      className="shrink-0"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        triggerDownload(
                          buildTsv(properties, required),
                          tsvFilename,
                          'text/tab-separated-values;charset=utf-8',
                        );
                      }}
                    >
                      TSV
                    </Button>
                    <Button
                      leftSection={<DownloadIcon />}
                      size="sm"
                      color="dark"
                      className="shrink-0"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        triggerDownload(
                          JSON.stringify(node, null, 2),
                          jsonFilename,
                          'application/json;charset=utf-8',
                        );
                      }}
                    >
                      JSON
                    </Button>
                  </Group>
                ) : null}
              </div>
              <Accordion.Panel>
                <div className="mt-2 overflow-x-auto">
                  <div className="flex w-full min-w-0 flex-col">
                    <PropertiesTable
                      properties={properties}
                      required={required}
                      category={category}
                      subCategory={id}
                      selectedProperty={selectedItems.property}
                      appendRef={appendRef}
                    />
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};

export default React.memo(DictionaryCategoryPanel);
