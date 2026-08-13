import { Accessibility, EmptyFilterSet, useGetAggsQuery } from '@gen3/core';
import { ReactECharts } from '@gen3/frontend';
import { Card, LoadingOverlay, Text } from '@mantine/core';
import { useMemo } from 'react';

type AggBucket = {
  key: string;
  count: number;
};

type MetricKey = 'Projects' | 'Samples' | 'Files';

const PALETTE = ['#000F46', '#8085AB', '#29ACAB'];

const normalizeBuckets = (rows: unknown): AggBucket[] =>
  Array.isArray(rows)
    ? rows
        .filter(
          (row): row is { key: string; count: number } =>
            typeof row === 'object' &&
            row !== null &&
            'key' in row &&
            'count' in row &&
            typeof row.key === 'string' &&
            row.key !== '_missing' &&
            typeof row.count === 'number',
        )
        .sort((a, b) => b.count - a.count)
    : [];

const formatCount = (value: number) => value.toLocaleString();
const METRIC_KEYS: Array<MetricKey> = ['Projects', 'Samples', 'Files'];

const ProjectSummaryHero = () => {
  const subjectAggs = useGetAggsQuery({
    type: 'subject',
    fields: ['project_id'],
    filters: EmptyFilterSet,
    accessibility: Accessibility.ALL,
    filterSelf: true,
  });

  const fileAggs = useGetAggsQuery({
    type: 'file',
    fields: ['project_id'],
    filters: EmptyFilterSet,
    accessibility: Accessibility.ALL,
    filterSelf: true,
  });

  const sampleAggs = useGetAggsQuery({
    type: 'sample',
    fields: ['project_id'],
    filters: EmptyFilterSet,
    accessibility: Accessibility.ALL,
    filterSelf: true,
  });

  const subjectRows = useMemo(() => normalizeBuckets(subjectAggs.data?.project_id), [subjectAggs.data?.project_id]);
  const sampleRows = useMemo(() => normalizeBuckets(sampleAggs.data?.project_id), [sampleAggs.data?.project_id]);
  const fileRows = useMemo(() => normalizeBuckets(fileAggs.data?.project_id), [fileAggs.data?.project_id]);

  const projectIds = useMemo(() => {
    const ids = new Set<string>();
    [...subjectRows, ...sampleRows, ...fileRows].forEach((row) => ids.add(row.key));
    return Array.from(ids);
  }, [subjectRows, sampleRows, fileRows]);

  const totals = useMemo(
    () => ({
      Projects: projectIds.length,
      Samples: sampleRows.reduce((sum, row) => sum + row.count, 0),
      Files: fileRows.reduce((sum, row) => sum + row.count, 0),
    }),
    [projectIds, sampleRows, fileRows],
  );

  const countsByMetric = useMemo(() => {
    const samplesMap = new Map(sampleRows.map((row) => [row.key, row.count]));
    const filesMap = new Map(fileRows.map((row) => [row.key, row.count]));

    return projectIds.reduce<Record<string, Record<MetricKey, number>>>((acc, projectId) => {
      acc[projectId] = {
        Projects: 1,
        Samples: samplesMap.get(projectId) ?? 0,
        Files: filesMap.get(projectId) ?? 0,
      };
      return acc;
    }, {});
  }, [projectIds, sampleRows, fileRows]);

  const series = useMemo(
    () =>
      projectIds.map((projectId, index) => ({
        name: projectId,
        type: 'bar' as const,
        stack: 'total',
        barWidth: 38,
        emphasis: {
          focus: 'series' as const,
        },
        itemStyle: {
          color: PALETTE[index % PALETTE.length],
        },
        label: {
          show: false,
        },
        data: METRIC_KEYS.map((metric) => {
          const rawValue = countsByMetric[projectId]?.[metric] ?? 0;
          const total = totals[metric];
          const percent = total > 0 ? Number(((rawValue / total) * 100).toFixed(2)) : 0;

          return {
            value: percent,
          rawValue,
          metric,
            projectId,
          };
        }),
      })),
    [countsByMetric, projectIds, totals],
  );

  const chartOption = useMemo(
    () => ({
      animationDuration: 600,
      animationDurationUpdate: 400,
      color: PALETTE,
      grid: {
        left: 8,
        right: 16,
        top: 24,
        bottom: 36,
        containLabel: true,
      },
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: '#FFFFFF',
        borderColor: '#8085AB',
        textStyle: {
          color: '#000F46',
        },
        formatter: (params: any) => {
          const rawValue = params?.data?.rawValue ?? 0;
          const metric = (params?.data?.metric as MetricKey | undefined) ?? 'Samples';
          const seriesName = params?.seriesName ?? '';
          const value = params?.value ?? 0;
          return `${seriesName}<br/>${metric}: ${formatCount(rawValue)} (${value}%)`;
        },
      },
      xAxis: {
        type: 'value' as const,
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            color: '#8085AB',
          },
        },
        axisTick: {
          lineStyle: {
            color: '#8085AB',
          },
        },
        axisLabel: {
          color: '#5e5e65',
          formatter: '{value}%',
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'category' as const,
        inverse: true,
        data: METRIC_KEYS,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series,
    }),
    [series],
  );

  const stats = [
    { label: 'Projects', value: totals.Projects },
    { label: 'Samples', value: totals.Samples },
    { label: 'Files', value: totals.Files },
  ];

  const isFetching = subjectAggs.isFetching || sampleAggs.isFetching || fileAggs.isFetching;

  return (
    <Card className="relative h-full min-h-[460px] overflow-visible border-0 bg-transparent p-0 shadow-none">
      <LoadingOverlay visible={isFetching} />

      <div className="grid h-full gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="grid h-[400px] grid-rows-[24px_minmax(0,1fr)_32px_56px]">
          <div />
          <div className="grid grid-rows-3 items-center">
            {stats.map((stat) => (
              <div key={stat.label} className="grid grid-cols-[108px_1fr] items-center gap-3">
                <Text
                  fw={800}
                  className="text-right text-lg leading-none lg:text-[1.7rem]"
                  style={{ color: '#8085AB' }}
                >
                  {formatCount(stat.value)}
                </Text>
                <Text fw={700} className="text-sm leading-none lg:text-[1rem]" style={{ color: '#111111' }}>
                  {stat.label}
                </Text>
              </div>
            ))}
          </div>
          <div />
          <div />
        </div>

        <div>
          {projectIds.length > 0 ? (
            <div className="grid h-[400px] grid-rows-[minmax(0,1fr)_56px]">
              <div>
                <ReactECharts option={chartOption} style={{ height: '100%' }} />
              </div>
              <div className="flex flex-nowrap items-center justify-center gap-4 overflow-hidden pt-2">
                {projectIds.map((projectId, index) => (
                  <div key={projectId} className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block h-3 w-6 shrink-0"
                      style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                    />
                    <span
                      className="truncate text-xs leading-none lg:text-sm"
                      style={{ color: '#000F46', maxWidth: '180px' }}
                      title={projectId}
                    >
                      {projectId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded border bg-white">
              <Text c="dimmed">No project summary data available.</Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectSummaryHero;
