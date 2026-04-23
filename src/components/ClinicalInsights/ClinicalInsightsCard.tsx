import React from 'react';
import { useMemo, useRef, useState } from 'react';
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Group,
  Menu,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { ReactECharts } from '@gen3/frontend';
import type { ReactEChartsProps } from '@gen3/frontend';
import { MdBarChart, MdClose, MdDownload } from 'react-icons/md';

import { formatPercent, truncateLabel } from './utils';

type ReactEChartsHandle = NonNullable<
  React.ComponentProps<typeof ReactECharts>['ref']
> extends React.RefObject<infer T>
  ? T
  : never;

type Bucket = {
  key: string;
  label: string;
  count: number;
};

type NamedChartParams = {
  name?: string;
};

type ClinicalInsightsCardProps = {
  field: string;
  label: string;
  color: string;
  buckets: Bucket[];
  selectedValues: string[];
  total: number;
  onToggleValue: (field: string, value: string) => void;
  onRemoveCard: (field: string) => void;
};

const ClinicalInsightsCard = ({
  field,
  label,
  color,
  buckets,
  selectedValues,
  total,
  onToggleValue,
  onRemoveCard,
}: ClinicalInsightsCardProps) => {
  const [displayType, setDisplayType] = useState<'count' | 'percent'>('count');
  const chartRef = useRef<ReactEChartsHandle | null>(null);
  const visibleBuckets = buckets;
  const chartBuckets = buckets;
  const selectableBuckets = visibleBuckets.filter((bucket) => bucket.count > 0);
  const allSelected =
    selectableBuckets.length > 0 &&
    selectableBuckets.every((bucket) => selectedValues.includes(bucket.key));

  const chartData = useMemo(
    () =>
      chartBuckets.map((bucket) => ({
        name: bucket.label,
        value:
          displayType === 'percent'
            ? total === 0
              ? 0
              : Number(((bucket.count / total) * 100).toFixed(2))
            : bucket.count,
        itemStyle: {
          color: selectedValues.includes(bucket.key) ? '#1d4ed8' : color,
        },
        rawKey: bucket.key,
      })),
    [chartBuckets, displayType, total, selectedValues, color],
  );

  const getChartParamName = (params: NamedChartParams | NamedChartParams[]) =>
    Array.isArray(params) ? (params[0]?.name ?? '') : (params.name ?? '');

  const chartOption = useMemo<ReactEChartsProps['option']>(
    () => ({
      grid: { left: 56, right: 16, top: 20, bottom: 80 },
      tooltip: {
        trigger: 'item' as const,
        formatter: (params) => {
          const paramName = getChartParamName(
            params as NamedChartParams | NamedChartParams[],
          );
          const bucket = chartBuckets.find(
            (item) => item.label === paramName || truncateLabel(item.label, 18) === paramName,
          );
          if (!bucket) return paramName;
          return `${bucket.label}<br/>${bucket.count} (${formatPercent(bucket.count, total)})`;
        },
      },
      xAxis: {
        type: 'category' as const,
        data: chartBuckets.map((bucket) => truncateLabel(bucket.label, 18)),
        axisLabel: {
          rotate: 35,
        },
      },
      yAxis: {
        type: 'value' as const,
        name: displayType === 'percent' ? '% of Subjects' : '# of Subjects',
      },
      series: [
        {
          type: 'bar' as const,
          data: chartData,
          barMaxWidth: 72,
        },
      ],
    }),
    [chartBuckets, chartData, displayType, total],
  );

  const downloadRows = [
    [label, '# Subjects', '% Subjects'].join('\t'),
    ...buckets.map((bucket) =>
      [bucket.label, String(bucket.count), formatPercent(bucket.count, total)].join('\t'),
    ),
  ].join('\n');

  const downloadTsv = () => {
    const blob = new Blob([downloadRows], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${label.replaceAll(' ', '-')}.tsv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadChartImage = (type: 'png' | 'svg') => {
    const instance = chartRef.current?.getEchartsInstance?.();
    if (!instance) return;

    const dataUrl = instance.getDataURL({
      type,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${label.replaceAll(' ', '-')}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      selectableBuckets.forEach((bucket) => {
        if (selectedValues.includes(bucket.key)) {
          onToggleValue(field, bucket.key);
        }
      });
      return;
    }

    selectableBuckets.forEach((bucket) => {
      if (!selectedValues.includes(bucket.key)) {
        onToggleValue(field, bucket.key);
      }
    });
  };

  return (
    <Card withBorder radius="md" padding="md" className="h-full">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg">
            {label}
          </Text>
          <Group gap={8}>
            <SegmentedControl
              size="xs"
              value={displayType}
              onChange={(value) => setDisplayType(value as 'count' | 'percent')}
              data={[
                { label: 'Count', value: 'count' },
                { label: 'Percent', value: 'percent' },
              ]}
            />
            <ActionIcon variant="outline" color="gray" aria-label={`Remove ${label}`} onClick={() => onRemoveCard(field)}>
              <MdClose />
            </ActionIcon>
          </Group>
        </Group>

        <div className="h-64">
          <ReactECharts
            ref={chartRef}
            option={chartOption}
            events={{
              click: (params: NamedChartParams) => {
                const rawKey =
                  chartData.find(
                    (item) => item.name === params.name || truncateLabel(item.name, 18) === params.name,
                  )?.rawKey ??
                  chartBuckets.find((item) => truncateLabel(item.label, 18) === params.name)?.key;
                if (rawKey) onToggleValue(field, rawKey);
              },
            }}
          />
        </div>

        <Group justify="space-between">
          <div />
          <Group gap="xs">
            <Tooltip label="Download this table">
              <Button size="xs" variant="outline" leftSection={<MdDownload />} onClick={downloadTsv}>
                TSV
              </Button>
            </Tooltip>
            <Menu shadow="md" width={160}>
              <Menu.Target>
                <Tooltip label="Download chart image">
                  <ActionIcon variant="outline" color="blue" aria-label={`Download ${label} chart image`}>
                    <MdDownload />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => downloadChartImage('png')}>PNG</Menu.Item>
                <Menu.Item onClick={() => downloadChartImage('svg')}>SVG</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <div className="max-h-72 overflow-auto rounded-md border border-base-light">
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={40}>
                  <Checkbox
                    size="xs"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label={`${allSelected ? 'Unselect' : 'Select'} all ${label} rows`}
                    disabled={selectableBuckets.length === 0}
                  />
                </Table.Th>
                <Table.Th>{label}</Table.Th>
                <Table.Th ta="right"># Subjects</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visibleBuckets.map((bucket) => (
                <Table.Tr
                  key={`${field}-${bucket.key}`}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedValues.includes(bucket.key) ? 'rgba(29, 78, 216, 0.08)' : undefined,
                  }}
                >
                  <Table.Td>
                    <Checkbox
                      size="xs"
                      checked={selectedValues.includes(bucket.key)}
                      onChange={() => onToggleValue(field, bucket.key)}
                      aria-label={`Select ${bucket.label}`}
                      disabled={bucket.count === 0}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <MdBarChart color={selectedValues.includes(bucket.key) ? '#1d4ed8' : color} />
                      <Text
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => onToggleValue(field, bucket.key)}
                      >
                        {bucket.label}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">
                      {bucket.count} ({formatPercent(bucket.count, total)})
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </Stack>
    </Card>
  );
};

export default ClinicalInsightsCard;
