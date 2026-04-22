import React, { useMemo } from 'react';
import { Accessibility, EmptyFilterSet, FilterSet, useGetAggsQuery } from '@gen3/core';

import ClinicalInsightsCard from './ClinicalInsightsCard';
import { mergeWithCohortFilters, omitFieldFromFilterSet, toDisplayLabel } from './utils';

type ClinicalInsightsCardContainerProps = {
  index: string;
  field: string;
  label: string;
  color: string;
  cohortFilters: FilterSet | undefined;
  dashboardFilters: FilterSet;
  selectedValues: string[];
  onToggleValue: (field: string, value: string) => void;
  onRemoveCard: (field: string) => void;
};

const ClinicalInsightsCardContainer = ({
  index,
  field,
  label,
  color,
  cohortFilters,
  dashboardFilters,
  selectedValues,
  onToggleValue,
  onRemoveCard,
}: ClinicalInsightsCardContainerProps) => {
  const cardFilters = useMemo(
    () => mergeWithCohortFilters(cohortFilters, omitFieldFromFilterSet(dashboardFilters, field)),
    [cohortFilters, dashboardFilters, field],
  );

  const { data } = useGetAggsQuery({
    type: index,
    fields: [field],
    filters: cardFilters ?? EmptyFilterSet,
    accessibility: Accessibility.ALL,
    filterSelf: true,
  });

  const buckets = useMemo(
    () =>
      (((data?.[field] as Array<{ key: string | number | string[]; count: number }> | undefined) ?? [])
        .filter((row) => !Array.isArray(row.key))
        .map((row) => ({
          key: String(row.key ?? '_missing'),
          label: toDisplayLabel(row.key as string | number | null | undefined),
          count: row.count,
        }))
        .sort((a, b) => b.count - a.count)),
    [data, field],
  );

  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <ClinicalInsightsCard
      field={field}
      label={label}
      color={color}
      buckets={buckets}
      selectedValues={selectedValues}
      total={total}
      onToggleValue={onToggleValue}
      onRemoveCard={onRemoveCard}
    />
  );
};

export default ClinicalInsightsCardContainer;
