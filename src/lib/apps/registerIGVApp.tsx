import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  createGen3App,
  useGetRawDataAndTotalCountsQuery,
  useLazyGetDownloadQuery,
  useLazyGetIndexObjectQuery,
  useLazyGetIndexdMetdataQuery,
} from '@gen3/core';
import {
  Button,
  Group,
  Loader,
  NativeSelect,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { useRouter } from 'next/router';

type AnnotationTrackConfig = Record<string, any>;

interface IgvReferenceConfiguration {
  id: string;
  name: string;
  fastaURL: string;
  indexURL: string;
  tracks?: AnnotationTrackConfig[];
}

interface SampleBamConfiguration {
  id: string;
  name: string;
  bamUrl: string;
  baiUrl: string;
  locus?: string;
  description?: string;
  genome?: string;
  reference?: IgvReferenceConfiguration;
  track?: AnnotationTrackConfig;
}

export interface IgvBrowserConfiguration {
  locus?: string;
  genome?: string;
  reference?: IgvReferenceConfiguration;
  showDefaultTracks?: boolean;
  track?: AnnotationTrackConfig;
  returnTab?: string;
  samples?: SampleBamConfiguration[];
}

interface BrowserSelection {
  value: string;
  label: string;
  source: 'sample' | 'backend';
  bamId?: string;
  bamUrl?: string;
  baiUrl?: string;
  locus?: string;
  genome?: string;
  reference?: IgvReferenceConfiguration;
  track?: AnnotationTrackConfig;
  description?: string;
}

const IGV_APP_NAME = 'IGVBamViewer';
const IGV_APP_VERSION = '1.0.0';

const getBamFileURL = (
  router: ReturnType<typeof useRouter>,
): { bamId?: string; mode?: string; returnData?: string } => {
  const { bam, mode, returnData } = router.query;
  return {
    bamId: typeof bam === 'object' ? bam[0] : bam,
    mode: typeof mode === 'object' ? mode[0] : mode,
    returnData: typeof returnData === 'object' ? returnData[0] : returnData,
  };
};

const useGetBAMAndBAIFileFromGUID = (bamId?: string) => {
  const [
    fetchBAMData,
    {
      data: bamMetadata,
      isFetching: isFetchingBamMetadata,
      isSuccess: isSuccessBamMetadata,
      isError: isErrorBamMetadata,
      error: bamMetadataError,
    },
  ] = useLazyGetIndexObjectQuery();

  const [
    fetchBAIMetadata,
    {
      data: baiMetadata,
      isFetching: isFetchingBaiMetadata,
      isSuccess: isSuccessBaiMetadata,
      isError: isErrorBaiMetadata,
      error: baiMetadataError,
    },
  ] = useLazyGetIndexdMetdataQuery();

  const [
    fetchBAMDownloadURL,
    {
      data: bamUrl,
      isFetching: isFetchingBAMUrl,
      isSuccess: isSuccessBAMUrl,
      isError: isErrorBAMUrl,
      error: downloadBAMURLError,
    },
  ] = useLazyGetDownloadQuery();

  const [
    fetchBAIDownloadURL,
    {
      data: baiUrl,
      isFetching: isFetchingBAIUrl,
      isSuccess: isSuccessBAIUrl,
      isError: isErrorBAIUrl,
      error: downloadBAIURLError,
    },
  ] = useLazyGetDownloadQuery();

  useEffect(() => {
    if (!bamId) return;
    fetchBAMData(bamId);
  }, [bamId, fetchBAMData]);

  useEffect(() => {
    if (!isSuccessBamMetadata || !bamMetadata?.file_name || !bamId) return;
    const baiFilename = bamMetadata.file_name.replace(/\.bam$/i, '.bai');
    fetchBAIMetadata({
      filters: [{ key: 'file_name', value: baiFilename }],
    });
    fetchBAMDownloadURL(bamId);
  }, [
    bamId,
    isSuccessBamMetadata,
    bamMetadata,
    fetchBAIMetadata,
    fetchBAMDownloadURL,
  ]);

  useEffect(() => {
    const baiId = baiMetadata?.records?.[0]?.baseid;
    if (!isSuccessBaiMetadata || !baiId) return;
    fetchBAIDownloadURL(baiId);
  }, [isSuccessBaiMetadata, baiMetadata, fetchBAIDownloadURL]);

  return {
    bamUrl: isSuccessBAMUrl ? bamUrl?.url : undefined,
    baiUrl: isSuccessBAIUrl ? baiUrl?.url : undefined,
    isFetching:
      isFetchingBamMetadata ||
      isFetchingBaiMetadata ||
      isFetchingBAMUrl ||
      isFetchingBAIUrl,
    isError:
      isErrorBamMetadata ||
      isErrorBaiMetadata ||
      isErrorBAMUrl ||
      isErrorBAIUrl,
    error:
      bamMetadataError ??
      baiMetadataError ??
      downloadBAMURLError ??
      downloadBAIURLError,
  };
};

const IGVBrowser = ({
  bamUrl,
  baiUrl,
  configuration,
}: {
  bamUrl: string;
  baiUrl: string;
  configuration: IgvBrowserConfiguration;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const browserRef = useRef<any>(null);
  const [igvModule, setIgvModule] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import('igv/dist/igv.esm.min.js');
      if (mounted) {
        setIgvModule(mod.default);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!igvModule || !containerRef.current) return;

    let disposed = false;

    const createBrowser = async () => {
      if (!containerRef.current || disposed) return;

      if (browserRef.current) {
        igvModule.removeBrowser(browserRef.current);
        browserRef.current = null;
      }

      const tracks = [];
      if (configuration.track) {
        tracks.push(configuration.track);
      }
      tracks.push({
        name: 'Alignments',
        type: 'alignment',
        format: 'bam',
        url: bamUrl,
        indexURL: baiUrl,
        colorBy: 'strand',
        viewAsPairs: true,
        coverageThreshold: 0.2,
        visibilityWindow: 300000,
      });

      const options: Record<string, any> = {
        locus: configuration.locus,
        showDefaultTracks: configuration.showDefaultTracks ?? true,
        tracks,
      };

      if (configuration.reference) {
        options.reference = configuration.reference;
      } else if (configuration.genome) {
        options.genome = configuration.genome;
      }

      browserRef.current = await igvModule.createBrowser(
        containerRef.current,
        options,
      );
    };

    void createBrowser();

    return () => {
      disposed = true;
      if (browserRef.current) {
        igvModule.removeBrowser(browserRef.current);
        browserRef.current = null;
      }
    };
  }, [bamUrl, baiUrl, configuration, igvModule]);

  return (
    <Stack gap="md" w="100%">
      {!igvModule && (
        <Paper p="md" withBorder>
          <Text c="dimmed">Loading IGV viewer...</Text>
        </Paper>
      )}
      <div
        ref={containerRef}
        style={{ width: '100%', minHeight: '700px', display: 'block' }}
      />
    </Stack>
  );
};

const BackendBamViewer = ({
  bamId,
  configuration,
}: {
  bamId: string;
  configuration: IgvBrowserConfiguration;
}) => {
  const { bamUrl, baiUrl, isFetching, isError } =
    useGetBAMAndBAIFileFromGUID(bamId);

  if (isError) {
    return <div className="w-full m-10">Error fetching BAM/BAI URLs</div>;
  }

  if (isFetching || !bamUrl || !baiUrl) {
    return (
      <div className="w-full m-10">
        <Loader />
      </div>
    );
  }

  return (
    <IGVBrowser
      bamUrl={bamUrl}
      baiUrl={baiUrl}
      configuration={configuration}
    />
  );
};

const SampleBamViewer = ({
  selection,
  fallbackConfiguration,
}: {
  selection: BrowserSelection;
  fallbackConfiguration: IgvBrowserConfiguration;
}) => {
  if (!selection.bamUrl || !selection.baiUrl) return null;

  return (
    <IGVBrowser
      bamUrl={selection.bamUrl}
      baiUrl={selection.baiUrl}
      configuration={{
        ...fallbackConfiguration,
        genome: selection.genome ?? fallbackConfiguration.genome,
        reference: selection.reference ?? fallbackConfiguration.reference,
        locus: selection.locus ?? fallbackConfiguration.locus,
        track: selection.track ?? fallbackConfiguration.track,
      }}
    />
  );
};

const IGVExplorerViewer = ({
  bamId,
  returnData,
  configuration,
}: {
  bamId: string;
  returnData: string;
  configuration: IgvBrowserConfiguration;
}) => {
  const router = useRouter();

  return (
    <div className="w-full m-10">
      <Stack>
        <Group justify="flex-start">
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/Explorer?activeTab=${returnData}`)}
          >
            Return To Data Files
          </Button>
        </Group>
        <BackendBamViewer bamId={bamId} configuration={configuration} />
      </Stack>
    </div>
  );
};

const IGVApp = (configuration: IgvBrowserConfiguration) => {
  const router = useRouter();
  const { bamId, mode, returnData } = getBamFileURL(router);

  const { data, isFetching, isError } = useGetRawDataAndTotalCountsQuery(
    {
      type: 'file',
      filters: {
        mode: 'and',
        root: {
          data_types: {
            operator: 'in',
            field: 'data_format',
            operands: ['BAM'],
          },
        },
      },
      fields: ['object_id', 'file_name'],
      size: 200,
    },
    { skip: mode !== 'app' },
  );

  const sampleOptions = useMemo<BrowserSelection[]>(
    () =>
      (configuration.samples ?? []).map((sample) => ({
        value: `sample:${sample.id}`,
        label: `[Sample] ${sample.name}`,
        source: 'sample',
        bamUrl: sample.bamUrl,
        baiUrl: sample.baiUrl,
        locus: sample.locus,
        genome: sample.genome,
        reference: sample.reference,
        track: sample.track,
        description: sample.description,
      })),
    [configuration.samples],
  );

  const backendOptions = useMemo<BrowserSelection[]>(() => {
    const files = data?.data?.file ?? [];
    return files.map((file: { object_id: string; file_name: string }) => ({
      value: `backend:${file.object_id}`,
      label: `[Commons] ${file.file_name}`,
      source: 'backend',
      bamId: file.object_id,
      description: file.file_name,
    }));
  }, [data]);

  const allOptions = useMemo(
    () => [...sampleOptions, ...backendOptions],
    [sampleOptions, backendOptions],
  );

  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  useEffect(() => {
    if (allOptions.length === 0) {
      setSelectedValue(null);
      return;
    }

    if (selectedValue && !allOptions.some((x) => x.value === selectedValue)) {
      setSelectedValue(null);
    }
  }, [allOptions, selectedValue]);

  const selected = allOptions.find((x) => x.value === selectedValue);

  if (mode === 'explorer' && bamId) {
    return (
      <IGVExplorerViewer
        bamId={bamId}
        configuration={configuration}
        returnData={returnData ?? ''}
      />
    );
  }

  if (mode !== 'app') return null;

  return (
    <div className="w-full m-10">
      <Stack gap="md">
        <Group align="flex-end">
          <NativeSelect
            label="BAM source"
            description="Select a BAM file to open it in IGV. If nothing is selected, the viewer stays empty."
            data={[
              { value: '', label: 'Select a BAM file' },
              ...allOptions.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
            value={selectedValue ?? ''}
            onChange={(event) =>
              setSelectedValue(event.currentTarget.value || null)
            }
          />
        </Group>

        {selected?.description && (
          <Text c="dimmed" size="sm">
            {selected.description}
          </Text>
        )}

        {selected?.source === 'sample' && (
          <SampleBamViewer
            selection={selected}
            fallbackConfiguration={configuration}
          />
        )}

        {selected?.source === 'backend' && selected.bamId && (
          <BackendBamViewer
            bamId={selected.bamId}
            configuration={configuration}
          />
        )}

        {!selected && isFetching && (
          <div className="w-full m-10">
            <Loader />
          </div>
        )}

        {!selected && !isFetching && !isError && (
          <Paper p="md" withBorder>
            <Text>Select a BAM file from the dropdown to display it in IGV.</Text>
          </Paper>
        )}

        {isError && backendOptions.length === 0 && (
          <Paper p="md" withBorder>
            <Text c="red">Error loading BAM files from the commons API.</Text>
          </Paper>
        )}
      </Stack>
    </div>
  );
};

export const registerIGVApp = () =>
  createGen3App({
    App: IGVApp,
    name: IGV_APP_NAME,
    version: IGV_APP_VERSION,
    requiredEntityTypes: [],
  });

export const IGVAppName = IGV_APP_NAME;
