import { Accessibility, EmptyFilterSet, useGetAggsQuery } from '@gen3/core';
import { ErrorCard, ReactECharts } from '@gen3/frontend';
import { Card, LoadingOverlay, Text } from '@mantine/core';
import { useMemo } from 'react';

const BAR_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#9a60b4'];

const ProjectSummaryHero = () => {
  const { data, isFetching, isError } = useGetAggsQuery({
    type: 'subject',
    fields: ['project_id'],
    filters: EmptyFilterSet,
    accessibility: Accessibility.ALL,
    filterSelf: true,
  });

  const projectData = useMemo(() => {
    const rows = (data?.project_id ?? []).filter(
      (row): row is { key: string; count: number } =>
        typeof row?.key === 'string' && row.key !== '_missing',
    );

    return {
      project_id: rows,
    };
  }, [data]);

  const totalSubjects = useMemo(
    () => projectData.project_id.reduce((sum, row) => sum + row.count, 0),
    [projectData],
  );

  const chartOption = useMemo(
    () => ({
      grid: { left: 24, right: 24, top: 24, bottom: 16, containLabel: true },
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: {
          type: 'shadow' as const,
        },
      },
      yAxis: {
        type: 'category' as const,
        data: projectData.project_id.map((row) => row.key),
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          width: 180,
          overflow: 'truncate' as const,
        },
      },
      xAxis: {
        type: 'value' as const,
        name: 'Subjects',
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
      },
      series: [
        {
          type: 'bar' as const,
          data: projectData.project_id.map((row, index) => ({
            value: row.count,
            itemStyle: {
              color: BAR_COLORS[index % BAR_COLORS.length],
              borderRadius: [0, 8, 8, 0],
            },
          })),
          barMaxWidth: 72,
          label: {
            show: true,
            position: 'right' as const,
            color: '#374151',
            fontWeight: 700,
          },
        },
      ],
    }),
    [projectData],
  );

  if (isError) {
    return <ErrorCard message="Unable to load project summary chart." />;
  }

  return (
    <Card withBorder shadow="md" radius="md" className="h-full min-h-[420px]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Text fw={700} size="lg" className="text-primary">
            Project Overview
          </Text>
          <Text size="sm" c="dimmed">
            Live distribution of subjects by project.
          </Text>
        </div>
        <div className="rounded bg-secondary-lightest px-4 py-2 text-right">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            Subjects
          </Text>
          <Text size="xl" fw={800}>
            {totalSubjects}
          </Text>
        </div>
      </div>

      <div className="relative">
        <LoadingOverlay visible={isFetching} />
        {projectData.project_id.length > 0 ? (
          <div className="h-[320px]">
            <ReactECharts option={chartOption} />
          </div>
        ) : (
          <div className="flex h-[320px] items-center justify-center">
            <Text c="dimmed">No project summary data available.</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectSummaryHero;
