import {
  buildNestedFilterForOperation,
  EmptyFilterSet,
  FilterSet,
  Operation,
  joinFilters,
} from '@gen3/core';

export const truncateLabel = (value: string, length = 22) => {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
};

export const toDisplayLabel = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'No data';
  return String(value);
};

export const formatPercent = (count: number, total: number) => {
  if (total === 0) return '0.00%';
  return (count / total).toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const buildDashboardFilterSet = (selectedValues: Record<string, string[]>): FilterSet => {
  const root = Object.entries(selectedValues).reduce<FilterSet['root']>((acc, [field, values]) => {
    if (values.length === 0) return acc;

    acc[field] = buildNestedFilterForOperation(field, {
      operator: 'in',
      field,
      operands: values,
    });

    return acc;
  }, {});

  return {
    mode: 'and' as const,
    root,
  };
};

export const omitFieldFromFilterSet = (
  filterSet: FilterSet | undefined,
  field: string,
): FilterSet => {
  const source = filterSet ?? EmptyFilterSet;
  const nextRoot = Object.entries(source.root).reduce<Record<string, Operation>>(
    (acc, [key, value]) => {
      if (key !== field) acc[key] = value;
      return acc;
    },
    {},
  );

  return {
    mode: source.mode,
    root: nextRoot,
  };
};

export const mergeWithCohortFilters = (
  cohortFilters: FilterSet | undefined,
  dashboardFilters: FilterSet | undefined,
) => {
  const left = (cohortFilters ?? EmptyFilterSet) as FilterSet;
  const right = (dashboardFilters ?? EmptyFilterSet) as FilterSet;
  return joinFilters(left, right);
};
