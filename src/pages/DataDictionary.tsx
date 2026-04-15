import {
  DictionaryPageGetServerSideProps as getServerSideProps,
  NavPageLayout,
} from '@gen3/frontend';

import DictionaryWithContext from '@/components/DataDictionary/DictionaryWithContext';

type DataDictionaryPageProps = {
  headerProps: unknown;
  footerProps: unknown;
  config: Record<string, unknown>;
};

const DataDictionaryPage = ({
  headerProps,
  footerProps,
  config,
}: DataDictionaryPageProps) => (
  <NavPageLayout
    headerProps={headerProps as any}
    footerProps={footerProps as any}
    mainProps={{ fixed: true }}
    headerMetadata={{
      title: 'Gen3 DataDictionary Page',
      content: 'Data Dictionary',
      key: 'gen3-data-dictionary-page',
      ...((config?.headerMetadata as Record<string, unknown> | undefined) ?? {}),
    }}
  >
    <DictionaryWithContext config={config as any} />
  </NavPageLayout>
);

export default DataDictionaryPage;

export { getServerSideProps };
