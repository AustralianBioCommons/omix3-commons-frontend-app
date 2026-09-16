import React, { useMemo } from 'react';
import {
  Accessibility,
  EmptyFilterSet,
  FilterSet,
  convertFilterSetToGqlFilter,
  useGeneralGQLQuery,
  useGetAggsQuery,
} from '@gen3/core';
import { Alert, Loader } from '@mantine/core';

import ClinicalInsightsCard from './ClinicalInsightsCard';
import {
  mergeWithCohortFilters,
  omitFieldFromFilterSet,
  toDisplayLabel,
} from './utils';

type ClinicalInsightsCardContainerProps = {
  index: string;
  field: string;
  label: string;
  color: string;
  numeric?: boolean;
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
  numeric = false,
  cohortFilters,
  dashboardFilters,
  selectedValues,
  onToggleValue,
  onRemoveCard,
}: ClinicalInsightsCardContainerProps) => {
  const cardFilters = useMemo(
    () =>
      mergeWithCohortFilters(
        cohortFilters,
        omitFieldFromFilterSet(dashboardFilters, field),
      ),
    [cohortFilters, dashboardFilters, field],
  );

  const { data, isFetching, isError } = useGetAggsQuery(
    {
      type: index,
      fields: [field],
      filters: cardFilters ?? EmptyFilterSet,
      accessibility: Accessibility.ALL,
      filterSelf: true,
    },
    { skip: numeric },
  );

  const numericQuery = useMemo(() => {
    const selection = field
      .split('.')
      .reverse()
      .reduce(
        (child, segment) => `${segment} { ${child} }`,
        'histogram: asTextHistogram { key count }',
      );
    return {
      query: `query ClinicalInsightsNumeric($filter: JSON) {
        _aggregation {
          ${index}(filter: $filter, accessibility: all) { ${selection} }
        }
      }`,
      variables: {
        filter: convertFilterSetToGqlFilter(cardFilters ?? EmptyFilterSet),
      },
    };
  }, [field, index, cardFilters]);
  const {
    data: numericData,
    isFetching: isNumericFetching,
    isError: isNumericError,
  } = useGeneralGQLQuery(numericQuery, { skip: !numeric });

  const buckets = useMemo(() => {
    const response = numericData as
      { data?: { _aggregation?: Record<string, unknown> } } | undefined;
    const numericNode = field
      .split('.')
      .reduce<unknown>(
        (node, segment) =>
          (node as Record<string, unknown> | undefined)?.[segment],
        response?.data?._aggregation?.[index],
      ) as
      | {
          histogram?: Array<{ key: string | number | string[]; count: number }>;
        }
      | undefined;
    const rows = numeric ? numericNode?.histogram : data?.[field];
    return (
      (rows as
        | Array<{ key: string | number | string[]; count: number }>
        | undefined) ?? []
    )
      .filter((row) => !Array.isArray(row.key))
      .map((row) => ({
        key: String(row.key ?? '_missing'),
        label: toDisplayLabel(row.key as string | number | null | undefined),
        count: row.count,
      }))
      .sort((left, right) =>
        numeric
          ? Number(left.key) - Number(right.key)
          : right.count - left.count,
      );
  }, [data, numericData, numeric, field, index]);

  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);

  if (numeric ? isNumericError : isError) {
    return (
      <Alert color="red" title={label}>
        Unable to load this field from the server.
      </Alert>
    );
  }
  if (numeric ? isNumericFetching : isFetching) {
    return <Loader aria-label={`Loading ${label}`} />;
  }

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
