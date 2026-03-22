import { NavPageLayout, DictionaryPageGetServerSideProps as getServerSideProps } from '@gen3/frontend';
import type { DictionaryConfig, NavPageLayoutProps } from '@gen3/frontend';
import DictionaryWithContext from '@/components/DataDictionary/DictionaryWithContext';

type DataDictionaryPageProps = NavPageLayoutProps & {
  config: DictionaryConfig;
};

const DataDictionaryPage = ({ headerProps, footerProps, config }: DataDictionaryPageProps) => {
  return (
    <NavPageLayout
      headerProps={headerProps}
      footerProps={footerProps}
      mainProps={{ fixed: true }}
      headerMetadata={{
        title: 'Gen3 DataDictionary Page',
        content: 'Data Dictionary',
        key: 'gen3-data-dictionary-page',
        ...(config?.headerMetadata ? config.headerMetadata : {}),
      }}
    >
      <DictionaryWithContext config={config} />
    </NavPageLayout>
  );
};

export default DataDictionaryPage;

export { getServerSideProps };
