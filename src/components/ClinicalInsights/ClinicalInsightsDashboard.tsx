import React from 'react';
import { useMemo, useState } from 'react';
import {
  EmptyFilterSet,
  selectCohortFilters,
  useCoreSelector,
} from '@gen3/core';
import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { MdClose } from 'react-icons/md';
import { CohortManager, QueryExpression } from '@gen3/frontend';

import ClinicalInsightsCardContainer from './ClinicalInsightsCardContainer';
import ClinicalInsightsControls from './ClinicalInsightsControls';
import type { ClinicalInsightsConfig } from './types';
import { buildDashboardFilterSet, toDisplayLabel } from './utils';

type ClinicalInsightsDashboardProps = {
  config: ClinicalInsightsConfig;
};

const ClinicalInsightsDashboard = ({ config }: ClinicalInsightsDashboardProps) => {
  const [activeFields, setActiveFields] = useState(config.initialFields);
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});

  const allFields = useMemo(
    () =>
      config.tabs.reduce<Record<string, { field: string; label: string; color: string; tab: string }>>(
        (acc, tab) => {
          tab.facets.forEach((facet) => {
            acc[facet.field] = {
              ...facet,
              color: tab.color,
              tab: tab.label,
            };
          });
          return acc;
        },
        {},
      ),
    [config.tabs],
  );

  const cohortFilters = useCoreSelector((state) => selectCohortFilters(state)[config.index] ?? EmptyFilterSet);

  const dashboardFilters = useMemo(() => buildDashboardFilterSet(selectedValues), [selectedValues]);

  const toggleField = (field: string) => {
    setActiveFields((current) =>
      current.includes(field) ? current.filter((item) => item !== field) : [...current, field],
    );
  };

  const removeCard = (field: string) => {
    setActiveFields((current) => current.filter((item) => item !== field));
    setSelectedValues((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const toggleValue = (field: string, value: string) => {
    setSelectedValues((current) => {
      const currentValues = current[field] ?? [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      if (nextValues.length === 0) {
        const next = { ...current };
        delete next[field];
        return next;
      }

      return {
        ...current,
        [field]: nextValues,
      };
    });
  };

  const clearAllSelections = () => setSelectedValues({});

  return (
    <div className="w-full bg-base-lighter">
      <div className="px-4 pt-4">
        <CohortManager />
        <div className="mt-4">
          <QueryExpression index={config.index} />
        </div>
      </div>

      <div className="px-4 pt-4">
        <Card withBorder radius="md" padding="md" className="bg-white">
          <Stack gap="sm">
            <Group justify="space-between">
              <Title order={4}>Clinical Insights Filters</Title>
              <Button size="xs" variant="outline" onClick={clearAllSelections} disabled={Object.keys(selectedValues).length === 0}>
                Clear All
              </Button>
            </Group>
            <Text size="sm" c="dimmed">
              Click a chart bar or table row to apply a shared dashboard filter. All other cards will update from the selected context.
            </Text>
            <Group gap="xs">
              {Object.entries(selectedValues).flatMap(([field, values]) =>
                values.map((value) => (
                  <Badge
                    key={`${field}-${value}`}
                    variant="light"
                    color="blue"
                    rightSection={<MdClose size={12} />}
                    className="cursor-pointer"
                    onClick={() => toggleValue(field, value)}
                  >
                    {allFields[field]?.label ?? field}: {toDisplayLabel(value)}
                  </Badge>
                )),
              )}
              {Object.keys(selectedValues).length === 0 ? (
                <Text size="sm" c="dimmed">
                  No dashboard filters applied.
                </Text>
              ) : null}
            </Group>
          </Stack>
        </Card>
      </div>

      <div className="grid grid-cols-[minmax(0,24rem)_minmax(0,1fr)] gap-4 px-4 py-4">
        <aside>
          <ClinicalInsightsControls
            config={config}
            activeFields={activeFields}
            onToggleField={toggleField}
          />
        </aside>

        <section>
          {activeFields.length === 0 ? (
            <Card withBorder radius="md" padding="lg" className="bg-white">
              <Text>Select one or more fields from the left panel to display dashboard cards.</Text>
            </Card>
          ) : null}

          {activeFields.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
              {activeFields.map((field) => {
                const facet = allFields[field];

                return (
                  <ClinicalInsightsCardContainer
                    key={field}
                    index={config.index}
                    field={field}
                    label={facet?.label ?? field}
                    color={facet?.color ?? '#2081A8'}
                    cohortFilters={cohortFilters}
                    dashboardFilters={dashboardFilters}
                    selectedValues={selectedValues[field] ?? []}
                    onToggleValue={toggleValue}
                    onRemoveCard={removeCard}
                  />
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default ClinicalInsightsDashboard;
